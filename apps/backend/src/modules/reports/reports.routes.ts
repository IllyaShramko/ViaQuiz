import { Router } from "express";
import { ReportsController } from "./reports.controller";
import { authenticate } from "../../middlewares/authMiddleware";

export const reportsRouter: Router = Router();

// All routes require authentication
reportsRouter.get("/sessions", authenticate, ReportsController.getSessions);
reportsRouter.get("/sessions/:roomUuid", authenticate, ReportsController.getSessionReport);
reportsRouter.get("/sessions/:roomUuid/participants/:participantId", authenticate, ReportsController.getParticipantReport);
