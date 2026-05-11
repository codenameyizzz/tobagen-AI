import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createItineraryResponse } from '../server/httpHandlers';
import { loadEnvironment } from '../server/config';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
loadEnvironment(rootDir);

export default {
  async fetch(request: Request) {
    try {
      if (request.method !== 'POST') {
        return Response.json(
          { error: 'Method not allowed.' },
          {
            status: 405,
            headers: {
              Allow: 'POST',
            },
          },
        );
      }

      const body = await request.json().catch(() => null);
      const response = await createItineraryResponse(body);

      return Response.json(response.body, {
        status: response.status,
        headers: {
          'Cache-Control': 'no-store',
        },
      });
    } catch (error) {
      console.error('Unhandled Vercel itinerary function error:', error);

      return Response.json(
        {
          error: error instanceof Error ? error.message : 'Unhandled itinerary function error.',
        },
        {
          status: 500,
          headers: {
            'Cache-Control': 'no-store',
          },
        },
      );
    }
  },
};
