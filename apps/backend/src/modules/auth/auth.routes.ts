import { Router } from "express";
import { AuthController } from "./auth.controller.js";

const router: Router = Router();
const controller = new AuthController();

router.post("/login", controller.login);

export const authRoutes: Router = router;
