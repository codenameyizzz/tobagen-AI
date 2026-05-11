import { GoogleGenAI } from '@google/genai';
import {
  isRecommendationRequest,
  isTobaItinerary,
  type RecommendationRequest,
  type TobaItinerary,
} from '../shared/itinerary';
import type { RuntimeConfig } from './config';

type ValidatedPayload =
  | { mode: 'form'; payload: RecommendationRequest }
  | { mode: 'chat'; payload: string };

export const itinerarySchema = {
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

export function createHealthPayload(config: RuntimeConfig) {
  return {
    ok: true,
    port: config.port,
    configured: Boolean(config.apiKey),
    models: {
      primary: config.primaryModel,
      fallback: config.fallbackModel,
    },
  };
}

export function validateItineraryRequest(body: unknown):
  | { ok: true; value: ValidatedPayload }
  | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Invalid request body.' };
  }

  const mode = Reflect.get(body, 'mode');
  const payload = Reflect.get(body, 'payload');

  if (mode !== 'form' && mode !== 'chat') {
    return { ok: false, error: 'Invalid request mode.' };
  }

  if (mode === 'form') {
    if (!isRecommendationRequest(payload)) {
      return { ok: false, error: 'Invalid recommendation payload.' };
    }

    return {
      ok: true,
      value: {
        mode,
        payload,
      },
    };
  }

  if (typeof payload !== 'string') {
    return { ok: false, error: 'Invalid chat payload.' };
  }

  return {
    ok: true,
    value: {
      mode,
      payload,
    },
  };
}

export async function generateItinerary(config: RuntimeConfig, input: ValidatedPayload): Promise<TobaItinerary> {
  if (!config.apiKey) {
    throw new Error('Missing GEMINI_API_KEY.');
  }

  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  const prompt = buildPrompt(input);

  try {
    const response = await ai.models.generateContent({
      model: config.primaryModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: itinerarySchema,
        temperature: 0.8,
      },
    });

    return parseItinerary(response.text);
  } catch (error) {
    const fallbackReason = getFallbackReason(error, config);
    if (!fallbackReason) {
      throw error;
    }

    console.warn(
      `Primary model ${config.primaryModel} hit a fallback condition: ${fallbackReason}. Falling back to ${config.fallbackModel}.`,
    );

    const response = await ai.models.generateContent({
      model: config.fallbackModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: itinerarySchema,
        temperature: 0.8,
      },
    });

    return parseItinerary(response.text);
  }
}

export function getUserFacingGenerationError(error: unknown, config: RuntimeConfig): string {
  const modelError = getModelConfigurationError(error, config);
  if (modelError) {
    return modelError;
  }

  return 'Failed to generate your Toba itinerary. Please try again in a moment.';
}

function buildPrompt(input: ValidatedPayload): string {
  const instructions = [
    'You are an expert travel planner for Lake Toba (Danau Toba), Indonesia.',
    'Produce a realistic, creative, and localized itinerary.',
    'Focus on Lake Toba, Samosir Island, Parapat, Tongging, Balige, and surrounding Batak cultural areas.',
    'Return only structured data that matches the requested schema.',
    'Travel tips should be practical and concise.',
  ];

  if (input.mode === 'chat') {
    return [
      ...instructions,
      `User request: ${input.payload}`,
    ].join('\n');
  }

  return [
    ...instructions,
    'Traveler preferences:',
    `- Duration: ${input.payload.duration}`,
    `- Travelers: ${input.payload.travelers}`,
    `- Interests: ${input.payload.interests.join(', ') || 'No specific interests selected'}`,
    `- Vibe: ${input.payload.vibe}`,
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

function getFallbackReason(error: unknown, config: RuntimeConfig): string | null {
  if (!config.fallbackModel || config.fallbackModel === config.primaryModel) {
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

function getModelConfigurationError(error: unknown, config: RuntimeConfig): string | null {
  const message = extractErrorMessage(error);
  if (!message.includes('NOT_FOUND') && !message.includes('not found')) {
    return null;
  }

  return `Gemini model is not available for generateContent. Current primary model: ${config.primaryModel}. Current fallback model: ${config.fallbackModel}.`;
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
