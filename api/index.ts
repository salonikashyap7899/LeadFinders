// Vercel Serverless Function entry point for the Lead → Launch API.
//
// Vercel automatically turns files in the root `api/` directory into
// serverless functions. We re-export the Express application defined in the
// `@workspace/api-server` artifact so the whole `/api/*` surface is served by
// a single function. The Express app mounts its router at `/api`, and Vercel
// forwards the original request path (e.g. `/api/healthz`) to this handler, so
// the existing route definitions keep working unchanged.
//
// `src/index.ts` (which calls `app.listen`) is only used for long-running
// environments like Replit; on Vercel the exported app acts as the request
// handler instead.
import app from "../artifacts/api-server/src/app";

export default app;
