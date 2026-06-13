import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scrapeRouter from "./scrape";
import auditRouter from "./audit";
import agentRouter from "./agent";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/scrape", scrapeRouter);
router.use("/audit", auditRouter);
router.use("/agent", agentRouter);

export default router;
