import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import scrapeRouter from "./scrape.js";
import auditRouter from "./audit.js";
import agentRouter from "./agent.js";
import emailRouter from "./email.js";
import intelRouter from "./intel.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/scrape", scrapeRouter);
router.use("/audit", auditRouter);
router.use("/agent", agentRouter);
router.use("/email", emailRouter);
router.use("/intel", intelRouter);

export default router;
