import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { isRecommendationRequest, isTobaItinerary, type TobaItinerary } from '../shared/itinerary';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

loadEnvironment(rootDir);

const app = express();
const port = resolvePort(process.env.PORT);
const apiKey = process.env.GEMINI_API_KEY?.trim();
const primaryModel = process.env.GEMINI_PRIMARY_MODEL?.trim() || process.env.GEMINI_MODEL?.trim() || 'gemini-3-flash-preview';
const fallbackModel = process.env.GEMINI_FALLBACK_MODEL?.trim() || 'gemini-3.1-flash-lite';
const distDir = path.join(rootDir, 'dist');

const itinerarySchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    days: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'number' },
          title: { type: 'string' },
          activities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                time: { type: 'string' },
                activity: { type: 'string' },
                location: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['time', 'activity', 'location', 'description'],
            },
          },
        },
        required: ['day', 'title', 'activities'],
      },
    },
    recommendedPlaces: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          location: {
            type: 'object',
            properties: {
              lat: { type: 'number' },
              lng: { type: 'number' },
            },
            required: ['lat', 'lng'],
          },
          category: { type: 'string' },
          bestTime: { type: 'string' },
        },
        required: ['name', 'description', 'location', 'category', 'bestTime'],
      },
    },
    travelTips: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['title', 'summary', 'days', 'recommendedPlaces', 'travelTips'],
} as const;

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    port,
    configured: Boolean(apiKey),
    models: {
      primary: primaryModel,
      fallback: fallbackModel,
    },
  });
});

app.post('/api/itinerary', async (req, res) => {
  if (!apiKey) {
    res.status(500).json({
      error: 'Server is missing GEMINI_API_KEY. Add it to .env.local or .env before generating itineraries.',
    });
    return;
  }

  const mode = req.body?.mode;
  const payload = req.body?.payload;

  if (mode !== 'form' && mode !== 'chat') {
    res.status(400).json({ error: 'Invalid request mode.' });
    return;
  }

  if (mode === 'form' && !isRecommendationRequest(payload)) {
    res.status(400).json({ error: 'Invalid recommendation payload.' });
    return;
  }

  if (mode === 'chat' && typeof payload !== 'string') {
    res.status(400).json({ error: 'Invalid chat payload.' });
    return;
  }

  try {
    const response = await generateItineraryResponse(buildPrompt(mode, payload));
    const itinerary = parseItinerary(response.text);
    res.json(itinerary);
  } catch (error) {
    console.error('Itinerary generation failed:', error);
    const modelError = getModelConfigurationError(error);

    res.status(502).json({
      error: modelError || 'Failed to generate your Toba itinerary. Please try again in a moment.',
    });
  }
});

if (process.env.NODE_ENV === 'production' || process.argv.includes('--serve-dist')) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Toba Discovery server listening on http://localhost:${port}`);
  console.log(`Primary Gemini model: ${primaryModel}`);
  console.log(`Fallback Gemini model: ${fallbackModel}`);
  console.log(`Gemini API key configured: ${apiKey ? 'yes' : 'no'}`);
});

function loadEnvironment(projectRoot: string) {
  const envPaths = [
    path.join(projectRoot, '.env'),
    path.join(projectRoot, '.env.local'),
  ];

  const mergedEnv = envPaths.reduce<Record<string, string>>((accumulator, envPath) => {
    const result = dotenv.config({ path: envPath });
    if (!result.parsed) {
      return accumulator;
    }

    return {
      ...accumulator,
      ...result.parsed,
    };
  }, {});

  for (const [key, value] of Object.entries(mergedEnv)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function resolvePort(portValue: string | undefined): number {
  const parsedPort = Number(portValue);
  if (Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65535) {
    return parsedPort;
  }

  return 3001;
}

function buildPrompt(mode: 'form' | 'chat', payload: unknown): string {
  const instructions = [
    'You are an expert travel planner for Lake Toba (Danau Toba), Indonesia.',
    'Produce a realistic, creative, and localized itinerary.',
    'Focus on Lake Toba, Samosir Island, Parapat, Tongging, Balige, and surrounding Batak cultural areas.',
    'Return only structured data that matches the requested schema.',
    'Travel tips should be practical and concise.',
  ];

  if (mode === 'chat') {
    return [
      ...instructions,
      `User request: ${payload}`,
    ].join('\n');
  }

  const request = payload;
  if (!isRecommendationRequest(request)) {
    throw new Error('Unexpected invalid form payload.');
  }

  return [
    ...instructions,
    'Traveler preferences:',
    `- Duration: ${request.duration}`,
    `- Travelers: ${request.travelers}`,
    `- Interests: ${request.interests.join(', ') || 'No specific interests selected'}`,
    `- Vibe: ${request.vibe}`,
  ].join('\n');
}

function parseItinerary(responseText: string | undefined): TobaItinerary {
  if (!responseText) {
    throw new Error('Gemini returned an empty response.');
  }

  const parsed: unknown = JSON.parse(responseText);
  if (!isTobaItinerary(parsed)) {
    throw new Error('Gemini returned an invalid itinerary shape.');
  }

  return parsed;
}

async function generateItineraryResponse(prompt: string) {
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY.');
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    return await ai.models.generateContent({
      model: primaryModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: itinerarySchema,
        temperature: 0.8,
      },
    });
  } catch (error) {
    const fallbackReason = getFallbackReason(error);
    if (!fallbackReason) {
      throw error;
    }

    console.warn(`Primary model ${primaryModel} hit a fallback condition: ${fallbackReason}. Falling back to ${fallbackModel}.`);

    return ai.models.generateContent({
      model: fallbackModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: itinerarySchema,
        temperature: 0.8,
      },
    });
  }
}

function getFallbackReason(error: unknown): string | null {
  if (!fallbackModel || fallbackModel === primaryModel) {
    return null;
  }

  const errorSignal = extractErrorSignal(error);
  if (errorSignal.statusCode === 429) {
    return 'HTTP 429 from primary model';
  }

  const quotaPatterns = [
    'resource_exhausted',
    'quota',
    'rate limit',
    'rate_limit',
    'too many requests',
    'requests per day',
    'daily limit',
    'per day',
    'rpd',
    'exceeded',
  ];

  const matchedPattern = quotaPatterns.find((pattern) => errorSignal.message.includes(pattern));
  return matchedPattern ? `matched quota pattern "${matchedPattern}"` : null;
}

function getModelConfigurationError(error: unknown): string | null {
  const message = extractErrorMessage(error);
  if (!message.includes('NOT_FOUND') && !message.includes('not found')) {
    return null;
  }

  return `Gemini model is not available for generateContent. Current primary model: ${primaryModel}. Current fallback model: ${fallbackModel}.`;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return '';
  }
}

function extractErrorSignal(error: unknown) {
  const statusCode = getNumericProperty(error, 'status') ?? getNumericProperty(error, 'code');
  const message = extractErrorMessage(error).toLowerCase();

  return {
    statusCode,
    message,
  };
}

function getNumericProperty(error: unknown, key: string): number | null {
  if (typeof error !== 'object' || error === null) {
    return null;
  }

  const value = Reflect.get(error, key);
  return typeof value === 'number' ? value : null;
}
