import { Router } from "express";
import { UserController } from "./user.controller";
import {
	checkUniqueSchema,
	sendCodeSchema,
	registerSchema,
	loginSchema,
	updateProfileSchema,
	sendEmailChangeCodeSchema,
	changeEmailSchema,
	sendPasswordChangeCodeSchema,
	changePasswordSchema,
} from "./user.schema";
import { validateBody } from "../../middlewares/validateMiddleware";
import {
	authenticate,
	authorizeRoles,
} from "../../middlewares/authMiddleware";
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
userRouter.patch(
	"/me",
	authenticate,
	authorizeRoles("TEACHER", "ADMIN"),
	validateBody(updateProfileSchema),
	UserController.updateProfile,
);
userRouter.post(
	"/me/email/send-code",
	authenticate,
	authorizeRoles("TEACHER", "ADMIN"),
	validateBody(sendEmailChangeCodeSchema),
	UserController.sendEmailChangeCode,
);
userRouter.patch(
	"/me/email",
	authenticate,
	authorizeRoles("TEACHER", "ADMIN"),
	validateBody(changeEmailSchema),
	UserController.changeEmail,
);
userRouter.post(
	"/me/password/send-code",
	authenticate,
	authorizeRoles("TEACHER", "ADMIN"),
	validateBody(sendPasswordChangeCodeSchema),
	UserController.sendPasswordChangeCode,
);
userRouter.patch(
	"/me/password",
	authenticate,
	authorizeRoles("TEACHER", "ADMIN"),
	validateBody(changePasswordSchema),
	UserController.changePassword,
);
userRouter.get("/profile/stats", authenticate, UserController.getProfileStats);
userRouter.get("/public/:uuid", UserController.getPublicProfile);
userRouter.get(
	"/",
	authenticate,
	paginationMiddleware,
	UserController.getUsers,
);
