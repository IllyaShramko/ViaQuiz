import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { validateBody } from "../../middlewares/validateMiddleware";
import { ClassroomController } from "./classroom.controller";
import {
	createClassroomSchema,
	createCourseInvitationSchema,
	createCourseSchema,
	createStudentSchema,
	enrollCourseStudentsSchema,
	updateClassroomSchema,
	updateCourseSchema,
} from "./classroom.schema";

export const classroomRouter: Router = Router();

// Public route for verifying invitation token
classroomRouter.get(
	"/invitations/verify/:token",
	ClassroomController.verifyInvitationToken,
);

// Apply auth to all subsequent classroom routes (Teacher access)
classroomRouter.use(authenticate);

// Global teacher invitations routes
classroomRouter.get(
	"/invitations/me",
	ClassroomController.getMyPendingInvitations,
);
classroomRouter.post(
	"/invitations/:token/accept",
	ClassroomController.acceptInvitation,
);
classroomRouter.post(
	"/invitations/:token/reject",
	ClassroomController.rejectInvitation,
);

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
classroomRouter.get(
	"/:classUuid/courses/:courseUuid",
	ClassroomController.getCourse,
);
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
classroomRouter.post(
	"/:classUuid/courses/:courseUuid/students",
	validateBody(enrollCourseStudentsSchema),
	ClassroomController.enrollStudentsToCourse,
);
classroomRouter.delete(
	"/:classUuid/courses/:courseUuid/students/:studentUuid",
	ClassroomController.unenrollStudentFromCourse,
);
classroomRouter.delete(
	"/:classUuid/courses/:courseUuid",
	ClassroomController.deleteCourse,
);

// Course teacher delegation & invitations
classroomRouter.get(
	"/:classUuid/courses/:courseUuid/invitations",
	ClassroomController.getCourseInvitations,
);
classroomRouter.post(
	"/:classUuid/courses/:courseUuid/invitations",
	validateBody(createCourseInvitationSchema),
	ClassroomController.inviteTeacher,
);
classroomRouter.delete(
	"/:classUuid/courses/:courseUuid/invitations/:inviteUuid",
	ClassroomController.cancelInvitation,
);
classroomRouter.post(
	"/:classUuid/courses/:courseUuid/leave",
	ClassroomController.leaveCourse,
);
