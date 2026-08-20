import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { validateBody } from "../../middlewares/validateMiddleware";
import { StudentController } from "./student.controller";
import { studentLoginSchema } from "./student.schema";

export const studentRouter: Router = Router();

// Public student login
studentRouter.post(
	"/login",
	validateBody(studentLoginSchema),
	StudentController.login,
);

// Protected student routes
studentRouter.get("/me", authenticate, StudentController.getMe);
studentRouter.get("/dashboard", authenticate, StudentController.getDashboard);
studentRouter.get("/results", authenticate, StudentController.getResults);
studentRouter.get("/courses", authenticate, StudentController.getCourses);
