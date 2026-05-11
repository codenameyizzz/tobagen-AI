import { createHealthResponse } from '../server/httpHandlers';

export default {
  async fetch() {
    const response = createHealthResponse();
    return Response.json(response.body, {
      status: response.status,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  },
};
