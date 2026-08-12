import { Router } from "express";
import { healthRoutes } from "./health/health.routes.js";
import { userRoutes } from "./users/user.routes.js";
import { authRoutes } from "./auth/auth.routes.js";

const apiRouter: Router = Router();

apiRouter.use("/", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);

export { apiRouter };
