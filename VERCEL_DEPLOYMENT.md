# Deploying to Vercel

This repository is a **pnpm monorepo** containing a Vite/React frontend
(`artifacts/lead-launch`) and an Express API (`artifacts/api-server`). The
root [`vercel.json`](./vercel.json) wires both into a **single Vercel project**:

- the frontend is built with Vite and served as static files, and
- the Express API is served by a single serverless function at
  [`api/index.ts`](./api/index.ts), which re-exports the Express app.

## One-time project setup

1. Import the GitHub repository into Vercel (**Add New → Project**).
2. **Root Directory:** leave it as the repository root (`./`). Do **not** point
   it at `artifacts/lead-launch` or `artifacts/api-server` — the root
   `vercel.json` builds and routes everything.
3. **Framework Preset:** `Other` (Vercel picks this up automatically; the build
   and output settings come from `vercel.json`).
4. Deploy.

That's it — no manual build/install/output settings are needed because they are
all declared in `vercel.json`:

| Setting          | Value                                             |
| ---------------- | ------------------------------------------------- |
| Install Command  | `pnpm install --frozen-lockfile`                  |
| Build Command    | `pnpm --filter @workspace/lead-launch run build`  |
| Output Directory | `artifacts/lead-launch/dist/public`               |

## How routing works

The `rewrites` in `vercel.json`:

1. `"/api/(.*)" → "/api"` sends every `/api/*` request to the serverless
   function. Vercel forwards the original path (e.g. `/api/healthz`), and the
   Express app — which mounts its router at `/api` — handles it unchanged.
2. `"/(.*)" → "/index.html"` is the SPA fallback so client-side routes such as
   `/app` and `/how-it-works` load correctly on refresh or direct navigation.
   Real static assets (`/assets/*`, `/favicon.svg`, …) are served from the
   filesystem before this rule applies.

The frontend calls the API with same-origin relative URLs (`/api/...`), so no
API base URL or CORS configuration is required in production.

## Environment variables (optional)

The app **deploys and runs without any environment variables**. The following
are only needed to enable specific features, and each endpoint fails gracefully
until its variable is set:

| Variable                                          | Enables                          |
| ------------------------------------------------- | -------------------------------- |
| `OPENAI_API_KEY`                                  | `/api/agent` (AI lead agent)     |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | `/api/email/*` (outreach email)  |

Add them under **Project → Settings → Environment Variables**, then redeploy.
(`SMTP_*` can also be provided at runtime through the app's outreach UI.)

`NODE_ENV=production` is set automatically by Vercel; the API uses it to disable
the local `pino-pretty` log transport (which relies on a worker thread that is
unnecessary in a serverless environment).
