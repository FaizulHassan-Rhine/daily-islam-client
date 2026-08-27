# Daily Islam — client

Next.js (App Router) frontend. This folder is a **standalone** app: its own `package.json`, `.gitignore`, and `node_modules`.

## Local

```bash
copy .env.example .env.local
npm install
npm run dev
```

App: http://localhost:3000

For local API proxy, keep:

```
NEXT_PUBLIC_API_URL=/api/v1
API_PROXY_TARGET=http://localhost:5000
```

Run the server folder separately on port 5000.

## Vercel

1. New Vercel project → import **this `client` folder** as the repository root (or set Root Directory to `client` if the parent still contains both folders).
2. Framework preset: Next.js
3. Environment variables from `.env.example`
4. Set `NEXT_PUBLIC_API_URL` to your deployed API, for example:

```
https://your-api.vercel.app/api/v1
```

Do **not** set `API_PROXY_TARGET` on Vercel.

Build command: `npm run build`  
Output: Next.js default
