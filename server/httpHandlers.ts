import { getRuntimeConfig, type RuntimeConfig } from './config.js';
import {
  createHealthPayload,
  generateItinerary,
  getUserFacingGenerationError,
  validateItineraryRequest,
} from './itineraryCore.js';

export function createHealthResponse(config: RuntimeConfig = getRuntimeConfig()) {
  return {
    status: 200,
    body: createHealthPayload(config),
  };
}

export async function createItineraryResponse(
  body: unknown,
  config: RuntimeConfig = getRuntimeConfig(),
) {
  if (!config.apiKey) {
    return {
      status: 500,
      body: {
        error: 'Server is missing GEMINI_API_KEY. Add it to the Vercel project environment variables or your local .env.local file before generating itineraries.',
      },
    };
  }

  const validation = validateItineraryRequest(body);
  if (!validation.ok) {
    return {
      status: 400,
      body: {
        error: validation.error,
      },
    };
  }

  try {
    const itinerary = await generateItinerary(config, validation.value);
    return {
      status: 200,
      body: itinerary,
    };
  } catch (error) {
    console.error('Itinerary generation failed:', error);

    return {
      status: 502,
      body: {
        error: getUserFacingGenerationError(error, config),
      },
    };
  }
}
