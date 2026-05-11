import { createItineraryResponse } from '../server/httpHandlers';

export default {
  async fetch(request: Request) {
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
  },
};
