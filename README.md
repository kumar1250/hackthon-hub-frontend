# Hackathon Registration — Frontend

React + Vite + Tailwind CSS v4.

## Setup

```bash
npm install
npm run dev
```

Runs on http://127.0.0.1:5173 and proxies `/api/*` to the Django backend on
http://127.0.0.1:8000 (see `vite.config.js`).

## Edit event details

Open `src/lib/constants.js` to set the event name, date, venue, and the
list of tracks shown on the landing page and registration form.

## Build for production

```bash
npm run build
```

Outputs static files to `dist/` — serve with any static host (Nginx,
Netlify, Vercel, etc). Point it at your deployed backend by editing the
API base URL logic in `src/lib/api.js` (or keep the `/api` proxy pattern
if serving frontend and backend from the same domain via a reverse proxy).
