# Toba Discovery

Toba Discovery is a Vite + React + TypeScript application for generating Lake Toba travel itineraries with Gemini. The frontend now talks to a local Express backend so the Gemini API key stays on the server instead of being exposed in browser code.

## Tech Stack

- React 19
- Vite 6
- TypeScript
- Tailwind CSS 4
- Express
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

Environment loading order on the backend:

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

Then start the backend:

```bash
npm run start
```

## Project Notes

- Gemini calls are handled in [server/index.ts](server/index.ts) to avoid shipping secrets to the browser.
- The server tries the primary model first and falls back to the secondary model when Gemini returns quota or rate-limit style errors.
- Shared itinerary types and runtime guards live in [shared/itinerary.ts](shared/itinerary.ts).
- Browser-side API access lives in [src/services/itineraryService.ts](src/services/itineraryService.ts).
