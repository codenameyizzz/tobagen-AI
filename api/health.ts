import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHealthResponse } from '../server/httpHandlers';
import { loadEnvironment } from '../server/config';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
loadEnvironment(rootDir);

export default {
  async fetch() {
    try {
      const response = createHealthResponse();
      return Response.json(response.body, {
        status: response.status,
        headers: {
          'Cache-Control': 'no-store',
        },
      });
    } catch (error) {
      console.error('Unhandled Vercel health function error:', error);

      return Response.json(
        {
          error: error instanceof Error ? error.message : 'Unhandled health function error.',
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
