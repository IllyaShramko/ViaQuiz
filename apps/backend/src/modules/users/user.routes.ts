import { Router } from "express";
import { UserController } from "./user.controller";
import {
	checkUniqueSchema,
	sendCodeSchema,
	registerSchema,
	loginSchema,
} from "./user.schema";
import { validateBody } from "../../middlewares/validateMiddleware";
import { authenticate } from "../../middlewares/authMiddleware";
import { paginationMiddleware } from "../../middlewares/paginationMiddleware";

export const userRouter: Router = Router();

userRouter.post(
	"/check-unique",
	validateBody(checkUniqueSchema),
	UserController.checkUnique,
);
userRouter.post(
	"/send-code",
	validateBody(sendCodeSchema),
	UserController.sendCode,
);
userRouter.post(
	"/register",
	validateBody(registerSchema),
	UserController.register,
);
userRouter.post("/login", validateBody(loginSchema), UserController.login);
userRouter.get("/me", authenticate, UserController.me);
userRouter.get(
	"/",
	authenticate,
	paginationMiddleware,
	UserController.getUsers,
);
