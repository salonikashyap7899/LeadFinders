# Lead → Launch

A full-stack lead generation tool for web developers and agencies. Find local businesses worldwide that need a website, audit their web presence, rank prospects by conversion score, generate a website prompt, and draft outreach — all in one 5-step pipeline.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/lead-launch run dev` — run the frontend (port auto-assigned)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, shadcn/ui, Sonner toasts, Leaflet map
- API: Express 5 (artifacts/api-server)
- Data: OpenStreetMap via Overpass API (free, worldwide) + optional Apify Google Maps
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/lead-launch/src/` — React frontend
  - `components/Phase1Scrape.tsx` — worldwide business search via OSM
  - `components/Phase2Audit.tsx` — website audit (PageSpeed + heuristics)
  - `components/Phase3Rank.tsx` — scoring and ranking
  - `components/Phase4Build.tsx` — AI prompt generator + live preview
  - `components/Phase5Outreach.tsx` — WhatsApp/email/Instagram drafts
  - `lib/types.ts` — shared types
  - `lib/scoring.ts` — lead scoring algorithm
- `artifacts/api-server/src/routes/scrape.ts` — worldwide search (OSM + optional Apify)
- `artifacts/api-server/src/routes/audit.ts` — website audit (PageSpeed API + heuristics)

## Architecture decisions

- Frontend is a pure Vite + React SPA (no Next.js, no SSR); converted from the imported Next.js project
- Search uses OpenStreetMap/Overpass API for free worldwide real data — no API key needed
- Apify token (APIFY_TOKEN) enables Google Maps data when set; falls back to OSM gracefully
- Google PageSpeed key (GOOGLE_PAGESPEED_KEY) enables real Lighthouse scores; falls back to heuristic estimates
- Lead scoring is entirely client-side for instant re-ranking without server round-trips

## Product

5-phase pipeline for finding and pitching web development clients:
1. **Scrape** — search any niche + city worldwide using real OpenStreetMap data
2. **Audit** — check website quality, speed, mobile friendliness, gaps
3. **Rank** — conversion score (0–100) based on site quality, reviews, reachability
4. **Build** — AI prompt generator (Lovable / Bolt / Claude Code / Codex) + live iframe preview
5. **Outreach** — WhatsApp, email, and Instagram messages in English or Hinglish

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Leaflet CSS must be imported in `LeadMap.tsx` (not in global CSS) to avoid SSR issues
- The Overpass API has rate limits; large counts (>20) may be slower
- `APIFY_TOKEN` env var enables Google Maps crawler for richer data (rating, reviews)
- `GOOGLE_PAGESPEED_KEY` env var enables real PageSpeed scores
- Remove `postcss.config.mjs` from root — conflicts with Tailwind v4 `@tailwindcss/vite`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
