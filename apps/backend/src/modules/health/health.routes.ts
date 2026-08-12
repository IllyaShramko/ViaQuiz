import { Router } from "express";
import { HealthController } from "./health.controller.js";

const router: Router = Router();
const controller = new HealthController();

router.get("/health", controller.getStatus);

export const healthRoutes: Router = router;
