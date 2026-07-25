import { Router, type IRouter } from "express";
import { z } from "zod";

const router: IRouter = Router();

// Mirrors @workspace/api-zod's generated HealthCheckResponse. Defined inline
// (rather than imported from the workspace package) because Vercel's
// @vercel/node transpiles the function per-file and resolves
// @workspace/api-zod to its raw TypeScript source (./src/index.ts), which
// Node cannot load at runtime. `zod` ships compiled JS, so it loads fine.
const HealthCheckResponse = z.object({
  status: z.string(),
});

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
