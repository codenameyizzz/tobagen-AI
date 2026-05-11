import { createItineraryResponse } from '../server/httpHandlers.js';

type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  status: (statusCode: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      sendJson(res, 405, { error: 'Method not allowed.' });
      return;
    }

    const response = await createItineraryResponse(parseBody(req.body));
    sendJson(res, response.status, response.body);
  } catch (error) {
    console.error('Unhandled Vercel itinerary function error:', error);
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Unhandled itinerary function error.',
    });
  }
}

function parseBody(body: unknown): unknown {
  if (typeof body !== 'string') {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function sendJson(res: ApiResponse, status: number, body: unknown) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}
