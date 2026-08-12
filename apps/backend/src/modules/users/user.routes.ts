import { Router } from "express";
import { UserController } from "./user.controller";
import { registerSchema, loginSchema } from "./user.schema";
import { validateBody } from "../../middlewares/validateMiddleware";
import { authenticate } from "../../middlewares/authMiddleware";
import { paginationMiddleware } from "../../middlewares/paginationMiddleware";

const router: Router = Router();

router.post("/register", validateBody(registerSchema), UserController.register);
router.post("/login", validateBody(loginSchema), UserController.login);
router.get("/me", authenticate, UserController.me);
router.get("/", authenticate, paginationMiddleware, UserController.getUsers);

export const userRoutes: Router = router;
