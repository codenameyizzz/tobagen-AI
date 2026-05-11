# TobaGen AI Discovery

TobaGen AI Discovery adalah aplikasi web untuk membuat itinerary perjalanan Danau Toba berbasis Gemini. Project ini mendukung development lokal dengan Vite + Express, deployment gratis di Vercel Hobby, penyimpanan itinerary di browser, export PDF, serta preview lokasi rekomendasi melalui Google Maps embed.

## Tech Stack

- React 19 untuk UI.
- TypeScript untuk type safety di frontend, server, dan shared schema.
- Vite 6 sebagai frontend dev server dan production bundler.
- Tailwind CSS 4 untuk styling utility-first.
- Motion untuk animasi UI.
- Lucide React untuk icon system.
- Express untuk API server lokal.
- Vercel Serverless Functions untuk API production.
- `@google/genai` untuk integrasi Gemini.
- jsPDF untuk export itinerary ke PDF.
- Browser `localStorage` dan cookie fallback untuk saved plans.

## Fitur Utama

- Generate itinerary Danau Toba dari form preference atau chat prompt.
- Fallback model Gemini otomatis ketika model utama terkena quota/rate-limit.
- Saved plans di browser user.
- Page khusus `/saved-plans` untuk melihat dan membuka itinerary tersimpan.
- Export itinerary ke PDF dengan layout card, watermark, footer, dan link Google Maps.
- Preview Google Maps embed untuk tempat rekomendasi.
- Link asli Google Maps untuk setiap recommended place.
- Vercel-ready tanpa server Express persistent di production.

## Struktur Directory

```text
.
|-- api/
|   |-- health.ts              # Vercel function untuk health check
|   `-- itinerary.ts           # Vercel function untuk generate itinerary
|-- scripts/
|   `-- dev.mjs                # Runner lokal: memilih port frontend/backend otomatis
|-- server/
|   |-- config.ts              # Runtime config dan env loading
|   |-- httpHandlers.ts        # Handler shared untuk Express dan Vercel
|   |-- index.ts               # Express server lokal dan production-style serve
|   `-- itineraryCore.ts       # Validasi payload, Gemini call, fallback, error mapping
|-- shared/
|   `-- itinerary.ts           # Shared TypeScript types dan runtime guards
|-- src/
|   |-- components/            # Komponen UI
|   |-- services/              # Client API service
|   |-- utils/                 # PDF export, saved plans, Google Maps helpers
|   |-- App.tsx                # App shell, routing ringan, state utama
|   |-- constants.ts           # Nav items, hero images, form options
|   |-- index.css              # Tailwind theme dan reusable component classes
|   `-- main.tsx               # React entrypoint
|-- vercel.json                # Build, functions, dan SPA rewrite untuk Vercel
|-- vite.config.ts             # Vite plugins dan proxy API lokal
`-- package.json               # Scripts dan dependencies
```

## Arsitektur Code

Project ini memakai pemisahan lapisan sederhana:

- `src/` adalah frontend React.
- `server/` adalah business logic server yang dapat dipakai ulang oleh Express lokal dan Vercel Functions.
- `api/` hanya adapter tipis untuk Vercel Serverless Functions.
- `shared/` berisi kontrak data yang dipakai frontend dan backend.

Pendekatan ini menghindari duplikasi logic antara lokal dan production. Endpoint `/api/itinerary` di Express dan Vercel sama-sama memanggil `createItineraryResponse()` dari `server/httpHandlers.ts`, lalu logic Gemini sebenarnya berada di `server/itineraryCore.ts`.

## Flow Generate Itinerary

1. User mengisi form atau menulis prompt chat di UI.
2. Frontend memanggil `generateTobaRecommendations()` atau `generateChatRecommendation()` di `src/services/itineraryService.ts`.
3. Service mengirim `POST /api/itinerary` dengan bentuk `{ mode, payload }`.
4. API handler memvalidasi payload memakai guard dari `shared/itinerary.ts`.
5. Server membuat prompt dan memanggil Gemini dengan model utama.
6. Jika model utama terkena quota/rate-limit, server mencoba model fallback.
7. Respons Gemini dipaksa berbentuk JSON sesuai schema itinerary.
8. Server memvalidasi shape respons sebelum dikirim ke frontend.
9. UI menampilkan itinerary, recommended places, Google Maps preview, tombol save, dan export PDF.

## Flow Saved Plans

Saved plans dikelola di `src/utils/savedPlansStorage.ts`.

- Data utama disimpan di `localStorage`.
- Cookie dipakai sebagai backup terbatas.
- Maksimum saved plans dibatasi 20 item.
- Data divalidasi kembali dengan `isTobaItinerary()` saat dibaca.
- Page khusus tersedia di `/saved-plans`.
- Tombol `Open Saved Plan` akan membuka itinerary di halaman utama tanpa generate ulang.

Karena saved plans berada di browser user, data tidak tersimpan di database server atau Vercel.

## Flow Google Maps

Google Maps integration berada di `src/utils/googleMaps.ts`.

- `getGoogleMapsUrl()` membuat link asli Google Maps.
- `getGoogleMapsEmbedUrl()` membuat preview embed.
- `formatCoordinates()` menjaga format koordinat konsisten di UI dan PDF.

Integrasi ini tidak memakai Google Maps API key tambahan. Link dibuat dari nama tempat dan koordinat hasil Gemini. Jika butuh akurasi berbasis `place_id`, project perlu integrasi Google Places API secara terpisah.

## Flow Export PDF

PDF export berada di `src/utils/exportItineraryPdf.ts`.

Fitur PDF:

- Header card dengan nama produk.
- Watermark `TobaGen AI Discovery`.
- Footer per halaman.
- Section overview, itinerary harian, recommended places, dan travel tips.
- Link klik ke Google Maps untuk recommended places.

PDF dibuat sepenuhnya di browser menggunakan jsPDF, jadi tidak membutuhkan server-side rendering.

## Routing Frontend

Project belum memakai `react-router`. Routing dibuat ringan di `src/App.tsx` menggunakan `window.history.pushState` dan `popstate`.

Rute utama:

- `/` untuk plan builder dan hasil itinerary.
- `/saved-plans` untuk saved plans page.

Vercel rewrite di `vercel.json` mengarahkan semua non-API path ke `index.html`, sehingga refresh langsung di `/saved-plans` tetap berjalan.

## Environment Variables

Buat `.env.local` untuk development lokal.

```env
PORT=3001
GEMINI_API_KEY=your_real_gemini_key
GEMINI_PRIMARY_MODEL=gemini-3-flash-preview
GEMINI_FALLBACK_MODEL=gemini-3.1-flash-lite
```

Catatan:

- `.env*` sudah masuk `.gitignore`.
- Jangan commit API key.
- Jika Google menandai key sebagai leaked, key harus di-revoke dan diganti. Fallback model tidak akan membantu karena semua model tetap memakai API key yang sama.
- `PORT` tidak diperlukan di Vercel.

## Local Development

Install dependencies:

```bash
npm install
```

Jalankan development:

```bash
npm run dev
```

Script ini menjalankan:

- Express API mulai dari port `3001`.
- Vite frontend mulai dari port `3000`.
- Pemilihan port otomatis jika port sudah dipakai.
- Proxy `/api/*` dari Vite ke backend Express.

Contoh output:

```text
[dev] Backend API will run on http://localhost:3001
[dev] Frontend will run on http://localhost:3000
```

Health check lokal:

```text
http://localhost:<backend-port>/api/health
```

## Production-Style Local Run

Build frontend:

```bash
npm run build
```

Serve build dengan Express:

```bash
npm run start
```

Mode ini berguna untuk mengecek static `dist` dan API lokal dalam satu server.

## Scripts

```bash
npm run dev       # Jalankan frontend dan backend lokal
npm run lint      # TypeScript type-check tanpa emit
npm run build     # Build production frontend
npm run start     # Serve dist + API dengan Express
npm run preview   # Alias ke npm run start
npm run clean     # Hapus folder dist
```

## Vercel Deployment

Project sudah disiapkan untuk Vercel Hobby.

Konfigurasi penting di `vercel.json`:

- `framework: "vite"`
- `buildCommand: "npm run build"`
- `outputDirectory: "dist"`
- `api/*.ts` sebagai serverless functions
- SPA rewrite untuk path seperti `/saved-plans`

Environment variables yang wajib diset di Vercel:

```env
GEMINI_API_KEY=your_real_gemini_key
GEMINI_PRIMARY_MODEL=gemini-3-flash-preview
GEMINI_FALLBACK_MODEL=gemini-3.1-flash-lite
```

Set minimal untuk `Production`. Jika memakai preview deployment, set juga untuk `Preview`.

## Deployment Checklist

1. Pastikan `.env.local` tidak ikut commit.
2. Jalankan `npm run lint`.
3. Jalankan `npm run build`.
4. Push ke repository.
5. Import repository ke Vercel.
6. Set environment variables Gemini di Vercel.
7. Deploy.
8. Cek `/api/health`.
9. Generate itinerary dari deployment.
10. Cek save plan, `/saved-plans`, PDF export, dan Google Maps link.

## Error Handling Penting

Beberapa kondisi yang sudah ditangani:

- Missing `GEMINI_API_KEY` memberi pesan konfigurasi.
- Model tidak ditemukan memberi pesan model config.
- Quota/rate-limit model utama memicu fallback model.
- API key leaked atau invalid memberi pesan agar key diganti.
- Respons Gemini yang tidak sesuai schema ditolak sebelum masuk UI.
- Respons API non-JSON diubah menjadi error message aman di frontend.

## Best Practice yang Dipakai

- Shared runtime validation untuk data lintas server/client.
- Server handler reusable agar logic lokal dan Vercel konsisten.
- Import ESM server memakai ekstensi `.js` supaya kompatibel dengan Vercel Node runtime.
- API key hanya dibaca di server, bukan di frontend.
- PDF export lazy-loaded agar bundle utama lebih ringan.
- Saved plans divalidasi ulang sebelum dipakai.
- Google Maps link dibuat client-side dari data itinerary tanpa menyimpan data tambahan.

## Catatan Keamanan

- Jangan pernah hardcode Gemini API key di source.
- Jika key pernah dikirim di chat, issue tracker, commit, atau log publik, segera revoke.
- Gunakan Vercel Environment Variables untuk deployment.
- Periksa `/api/health`; field `configured: true` hanya menandakan key ada, bukan key valid.

## Troubleshooting

Jika generate gagal dengan `Your API key was reported as leaked`, buat API key baru dan update `GEMINI_API_KEY` di Vercel.

Jika Vercel menampilkan `FUNCTION_INVOCATION_FAILED`, cek function logs. Error import ESM biasanya terkait import relatif tanpa ekstensi `.js`.

Jika lokal gagal karena port dipakai, gunakan `npm run dev`; script akan memilih port tersedia otomatis.

Jika build lokal gagal `spawn EPERM` di environment sandbox, itu biasanya batas izin proses, bukan error source code. Jalankan build di terminal lokal normal.
