import type { Request, Response, NextFunction } from "express";
import type { Classroom, Course, Student, CourseInvitation, CourseInvitationStatus } from "../../../generated/prisma";
import type {
	CreateClassroomDTO,
	UpdateClassroomDTO,
	CreateStudentDTO,
	CreateCourseDTO,
	UpdateCourseDTO,
	DateFilterDTO,
	TeacherClassroomSummary,
	ClassroomDetail,
	StudentWithGlobalClassroom,
	StudentWithDetails,
	SafeStudent,
	CourseWithDetails,
	CourseWithStudents,
	RawStudentQuizResult,
	GetClassroomsResponse,
	CreatedStudentWithCredentials,
	ResetStudentPasswordResult,
	StudentAnalyticsResponse,
	AssignedCourseSummary,
	CourseInvitationWithDetails,
	VerifyInvitationResponse,
} from "./classrooms.types";

export interface ClassroomRepositoryContract {
	findTeacherClassrooms(
		teacherId: number,
	): Promise<TeacherClassroomSummary[]>;
	findAssignedCoursesForTeacher(
		teacherId: number,
	): Promise<AssignedCourseSummary[]>;
	countActiveTeacherClassrooms(teacherId: number): Promise<number>;
	countPendingInvitationsForTeacher(teacherId: number): Promise<number>;
	findClassroomByUuid(
		uuid: string,
		teacherId?: number,
	): Promise<ClassroomDetail>;
	createClassroom(data: {
		name: string;
		code: string;
		teacherId: number;
	}): Promise<Classroom>;
	updateClassroom(id: number, data: UpdateClassroomDTO): Promise<Classroom>;
	deleteClassroom(id: number): Promise<Classroom>;
	countStudentsInClassroom(classroomId: number): Promise<number>;
	findStudentByLoginInClassroom(
		classroomId: number,
		login: string,
	): Promise<Student | null>;
	findStudentByGlobalLogin(
		login: string,
	): Promise<StudentWithGlobalClassroom | null>;
	findStudentByUuid(uuid: string): Promise<StudentWithDetails>;
	createStudent(data: {
		firstName: string;
		lastName: string;
		login: string;
		password: string;
		classroomId: number;
	}): Promise<SafeStudent>;
	updateStudentPassword(
		studentId: number,
		hashedPassword: string,
	): Promise<SafeStudent>;
	deleteStudent(studentId: number): Promise<Student>;
	countTeacherActiveCourses(teacherId: number): Promise<number>;
	countClassroomCourses(classroomId: number): Promise<number>;
	findCourseByUuid(uuid: string): Promise<CourseWithDetails>;
	createCourse(data: {
		name: string;
		classroomId: number;
		creatorId: number;
		teacherId: number;
		studentIds?: number[];
	}): Promise<CourseWithStudents>;
	updateCourse(
		courseId: number,
		data: {
			name?: string | undefined;
			isActive?: boolean | undefined;
			isArchived?: boolean | undefined;
			studentIds?: number[] | undefined;
		},
	): Promise<CourseWithStudents>;
	updateCourseTeacher(
		courseId: number,
		teacherId: number,
	): Promise<Course>;
	enrollStudentsToCourse(
		courseId: number,
		studentIds: number[],
	): Promise<CourseWithDetails>;
	unenrollStudentFromCourse(
		courseId: number,
		studentId: number,
	): Promise<CourseWithDetails>;
	deleteCourse(courseId: number): Promise<Course>;
	findStudentQuizResults(
		studentId: number,
		fromDate?: Date,
		toDate?: Date,
	): Promise<RawStudentQuizResult[]>;
	findUserByLoginOrEmail(
		search: string,
	): Promise<{ id: number; uuid: string; firstName: string | null; lastName: string | null; login: string; email: string } | null>;
	createCourseInvitation(data: {
		courseId: number;
		senderId: number;
		receiverId?: number | null;
		invitedEmail?: string | null;
		invitedLogin?: string | null;
		expiresAt: Date;
	}): Promise<CourseInvitation>;
	findPendingInvitationByCourse(
		courseId: number,
	): Promise<CourseInvitationWithDetails | null>;
	findCourseInvitations(
		courseId: number,
	): Promise<CourseInvitationWithDetails[]>;
	findInvitationByToken(
		token: string,
	): Promise<CourseInvitationWithDetails | null>;
	findInvitationByUuid(
		uuid: string,
	): Promise<CourseInvitationWithDetails | null>;
	findPendingInvitationsForTeacher(
		teacherId: number,
		email?: string,
		login?: string,
	): Promise<CourseInvitationWithDetails[]>;
	updateInvitationStatus(
		id: number,
		status: CourseInvitationStatus,
		receiverId?: number,
	): Promise<CourseInvitation>;
}

export interface ClassroomServiceContract {
	getClassrooms(teacherId: number): Promise<GetClassroomsResponse>;
	createClassroom(
		teacherId: number,
		data: CreateClassroomDTO,
	): Promise<Classroom>;
	getClassroom(uuid: string, teacherId: number): Promise<ClassroomDetail>;
	updateClassroom(
		uuid: string,
		teacherId: number,
		data: UpdateClassroomDTO,
	): Promise<Classroom>;
	deleteClassroom(uuid: string, teacherId: number): Promise<Classroom>;
	addStudent(
		classUuid: string,
		teacherId: number,
		data: CreateStudentDTO,
	): Promise<CreatedStudentWithCredentials>;
	resetStudentPassword(
		classUuid: string,
		studentUuid: string,
		teacherId: number,
	): Promise<ResetStudentPasswordResult>;
	deleteStudent(
		classUuid: string,
		studentUuid: string,
		teacherId: number,
	): Promise<Student>;
	getStudentAnalytics(
		classUuid: string,
		studentUuid: string,
		teacherId: number,
		filter?: DateFilterDTO,
	): Promise<StudentAnalyticsResponse>;
	getCourse(
		classUuid: string,
		courseUuid: string,
		teacherId: number,
	): Promise<CourseWithDetails>;
	createCourse(
		classUuid: string,
		teacherId: number,
		data: CreateCourseDTO,
	): Promise<CourseWithStudents>;
	updateCourse(
		classUuid: string,
		courseUuid: string,
		teacherId: number,
		data: UpdateCourseDTO,
	): Promise<CourseWithStudents>;
	enrollStudents(
		classUuid: string,
		courseUuid: string,
		teacherId: number,
		studentUuids: string[],
	): Promise<CourseWithDetails>;
	unenrollStudent(
		classUuid: string,
		courseUuid: string,
		studentUuid: string,
		teacherId: number,
	): Promise<{ message: string }>;
	deleteCourse(
		classUuid: string,
		courseUuid: string,
		teacherId: number,
	): Promise<Course>;
	inviteTeacher(
		classUuid: string,
		courseUuid: string,
		creatorId: number,
		search: string,
	): Promise<{ message: string; invitation: CourseInvitation }>;
	cancelInvitation(
		classUuid: string,
		courseUuid: string,
		creatorId: number,
		inviteUuid: string,
	): Promise<{ message: string }>;
	getCourseInvitations(
		classUuid: string,
		courseUuid: string,
		userId: number,
	): Promise<CourseInvitationWithDetails[]>;
	getMyPendingInvitations(
		userId: number,
	): Promise<CourseInvitationWithDetails[]>;
	acceptInvitation(
		token: string,
		userId: number,
	): Promise<{ message: string; course: { uuid: string; name: string; classUuid: string } }>;
	rejectInvitation(
		token: string,
		userId: number,
	): Promise<{ message: string }>;
	leaveCourse(
		classUuid: string,
		courseUuid: string,
		teacherId: number,
	): Promise<{ message: string }>;
	verifyInvitationToken(
		token: string,
	): Promise<VerifyInvitationResponse>;
}

export interface ClassroomControllerContract {
	getClassrooms(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	createClassroom(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	getClassroom(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	updateClassroom(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	deleteClassroom(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	addStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
	resetStudentPassword(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	deleteStudent(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	getStudentAnalytics(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	getCourse(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	createCourse(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	updateCourse(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	enrollStudentsToCourse(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	unenrollStudentFromCourse(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	deleteCourse(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	inviteTeacher(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	cancelInvitation(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	getCourseInvitations(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	getMyPendingInvitations(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	acceptInvitation(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	rejectInvitation(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	leaveCourse(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	verifyInvitationToken(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
}
