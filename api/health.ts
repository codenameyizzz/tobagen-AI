import { createHealthResponse } from '../server/httpHandlers';

type ApiResponse = {
  status: (statusCode: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
};

export default function handler(_req: unknown, res: ApiResponse) {
  try {
    const response = createHealthResponse();
    sendJson(res, response.status, response.body);
  } catch (error) {
    console.error('Unhandled Vercel health function error:', error);
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Unhandled health function error.',
    });
  }
}

function sendJson(res: ApiResponse, status: number, body: unknown) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}
