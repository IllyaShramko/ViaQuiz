import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { validateBody } from "../../middlewares/validateMiddleware";
import { ClassroomController } from "./classroom.controller";
import {
	createClassroomSchema,
	createCourseSchema,
	createStudentSchema,
	updateClassroomSchema,
	updateCourseSchema,
} from "./classroom.schema";

export const classroomRouter: Router = Router();

// Apply auth to all classroom routes (Teacher access)
classroomRouter.use(authenticate);

// Classroom routes
classroomRouter.get("/", ClassroomController.getClassrooms);
classroomRouter.post(
	"/",
	validateBody(createClassroomSchema),
	ClassroomController.createClassroom,
);
classroomRouter.get("/:uuid", ClassroomController.getClassroom);
classroomRouter.put(
	"/:uuid",
	validateBody(updateClassroomSchema),
	ClassroomController.updateClassroom,
);
classroomRouter.delete("/:uuid", ClassroomController.deleteClassroom);

// Student management inside classroom
classroomRouter.post(
	"/:uuid/students",
	validateBody(createStudentSchema),
	ClassroomController.addStudent,
);
classroomRouter.post(
	"/:classUuid/students/:studentUuid/reset-password",
	ClassroomController.resetStudentPassword,
);
classroomRouter.delete(
	"/:classUuid/students/:studentUuid",
	ClassroomController.deleteStudent,
);
classroomRouter.get(
	"/:classUuid/students/:studentUuid",
	ClassroomController.getStudentAnalytics,
);

// Course management inside classroom
classroomRouter.post(
	"/:uuid/courses",
	validateBody(createCourseSchema),
	ClassroomController.createCourse,
);
classroomRouter.put(
	"/:classUuid/courses/:courseUuid",
	validateBody(updateCourseSchema),
	ClassroomController.updateCourse,
);
classroomRouter.delete(
	"/:classUuid/courses/:courseUuid",
	ClassroomController.deleteCourse,
);
