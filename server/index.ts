import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHealthResponse, createItineraryResponse } from './httpHandlers.js';
import { getRuntimeConfig, loadEnvironment } from './config.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
loadEnvironment(rootDir);

const config = getRuntimeConfig();
const app = express();
const distDir = path.join(rootDir, 'dist');

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  const response = createHealthResponse(config);
  res.status(response.status).json(response.body);
});

app.post('/api/itinerary', async (req, res) => {
  const response = await createItineraryResponse(req.body, config);
  res.status(response.status).json(response.body);
});

if (process.env.NODE_ENV === 'production' || process.argv.includes('--serve-dist')) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(config.port, () => {
  console.log(`Toba Discovery server listening on http://localhost:${config.port}`);
  console.log(`Primary Gemini model: ${config.primaryModel}`);
  console.log(`Fallback Gemini model: ${config.fallbackModel}`);
  console.log(`Gemini API key configured: ${config.apiKey ? 'yes' : 'no'}`);
});
