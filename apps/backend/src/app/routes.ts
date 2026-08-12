import { Router } from "express";
import { healthRoutes } from "../modules/health/health.routes";
import { userRoutes } from "../modules/users/user.routes";

const apiRouter: Router = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/users", userRoutes);

export { apiRouter };
