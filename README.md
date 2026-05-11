# Toba Discovery

Toba Discovery is a Vite + React + TypeScript application for generating Lake Toba travel itineraries with Gemini. It is now set up for both:

- local development with Vite + Express
- Vercel Hobby deployment with Vite static output + Vercel Serverless Functions

## Tech Stack

- React 19
- Vite 6
- TypeScript
- Tailwind CSS 4
- Express for local development
- Vercel Functions for production deployment
- Gemini via `@google/genai`

## Local Setup

### 1. Prerequisites

- Node.js 20 or newer
- An active Gemini API key

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Update `.env.local` or `.env` with your real values:

```env
PORT=3001
GEMINI_API_KEY=your_real_key
GEMINI_PRIMARY_MODEL=gemini-3-flash-preview
GEMINI_FALLBACK_MODEL=gemini-3.1-flash-lite
```

Environment loading order for local development:

- `.env`
- `.env.local` overrides `.env`

### 4. Run in development

```bash
npm run dev
```

This starts:

- Vite frontend at the first available port starting from `3000`
- Express API at the first available port starting from `3001`

The frontend proxies `/api/*` requests to the backend automatically.
If port `3001` is already occupied, the dev runner automatically chooses the next open backend port and points Vite to it.
You can verify the backend runtime with `http://localhost:<backend-port>/api/health`, using the backend port printed in the terminal.

## Vercel Deployment

The project is already prepared for Vercel Hobby:

- frontend output is built to `dist`
- server routes are exposed through `api/health.ts` and `api/itinerary.ts`
- SPA routing is handled in [vercel.json](vercel.json)

### Required Environment Variables in Vercel

Add these in the Vercel project settings for Production, Preview, and Development if needed:

```env
GEMINI_API_KEY=your_real_key
GEMINI_PRIMARY_MODEL=gemini-3-flash-preview
GEMINI_FALLBACK_MODEL=gemini-3.1-flash-lite
```

`PORT` is not required on Vercel.

### Deploy from Git

1. Push this project to GitHub, GitLab, or Bitbucket.
2. Import the repository into Vercel.
3. Keep the detected framework as `Vite`.
4. Add the three Gemini environment variables above.
5. Deploy.

### Deploy with Vercel CLI

```bash
npm i -g vercel
vercel
```

For production:

```bash
vercel --prod
```

### Post-Deploy Checks

After deployment, verify:

- `/api/health` returns `configured: true`
- generating an itinerary succeeds
- saved plans still persist in the browser
- PDF export works from the deployed URL

## Verification

```bash
npm run lint
npm run build
```

## Production-Style Local Run

Build the frontend first:

```bash
npm run build
```

Then start the local Express server:

```bash
npm run start
```

## Project Notes

- Local API logic and Vercel API logic share the same Gemini generation path.
- Gemini calls fall back from the primary model to the secondary model when the primary model hits quota or rate-limit style errors.
- Shared itinerary types and runtime guards live in [shared/itinerary.ts](shared/itinerary.ts).
- Browser-side API access lives in [src/services/itineraryService.ts](src/services/itineraryService.ts).
