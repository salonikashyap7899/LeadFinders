import app from "../src/app.js";

// Vercel serverless entry: the Express app is exported as the request
// handler instead of listening on a port (src/index.ts does that for
// long-running environments like Replit).
export default app;
