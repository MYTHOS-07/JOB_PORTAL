# Elevate Workforce website

Next.js 16 App Router on **port 3001**. Uses cookies against `NEXT_PUBLIC_API_URL`.

All page URLs and how to start Docker + API + seed are in the **root [README.md](../README.md)**.

## Start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Windows: `copy .env.example .env.local`

Open http://localhost:3001

Do not commit `.env.local`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on :3001 |
| `npm run build` | Production build |
| `npm test` | Vitest |
| `npm run lint` | ESLint |
