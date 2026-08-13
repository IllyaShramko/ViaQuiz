import { Router } from "express";
import { healthRoutes } from "../modules/health/health.routes";
import { userRouter } from "../modules/users/user.routes";

export const apiRouter: Router = Router();

apiRouter.use("/health", healthRoutes);

apiRouter.use("/users", userRouter);

