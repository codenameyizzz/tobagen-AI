import { isTobaItinerary, type RecommendationRequest, type TobaItinerary } from '../../shared/itinerary';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';
const ITINERARY_ENDPOINT = `${API_BASE_URL}/api/itinerary`;

export type { RecommendationRequest, TobaItinerary } from '../../shared/itinerary';

export async function generateTobaRecommendations(req: RecommendationRequest): Promise<TobaItinerary> {
  return requestItinerary('form', req);
}

export async function generateChatRecommendation(query: string): Promise<TobaItinerary> {
  return requestItinerary('chat', query);
}

async function requestItinerary(mode: 'form' | 'chat', payload: RecommendationRequest | string): Promise<TobaItinerary> {
  const response = await fetch(ITINERARY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mode, payload }),
  });

  const data = (await response.json().catch(() => null)) as { error?: string } | TobaItinerary | null;

  if (!response.ok) {
    throw new Error(
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'The itinerary service is currently unavailable.',
    );
  }

  if (!isTobaItinerary(data)) {
    throw new Error('The itinerary service returned an invalid response.');
  }

  return data;
}
