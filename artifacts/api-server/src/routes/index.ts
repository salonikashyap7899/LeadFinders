import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scrapeRouter from "./scrape";
import auditRouter from "./audit";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/scrape", scrapeRouter);
router.use("/audit", auditRouter);

export default router;
