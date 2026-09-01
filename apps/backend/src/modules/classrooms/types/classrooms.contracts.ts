import type { Request, Response, NextFunction } from "express";
import type { Classroom, Course, Student } from "../../../generated/prisma";
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
} from "./classrooms.types";

export interface ClassroomRepositoryContract {
	findTeacherClassrooms(
		teacherId: number,
	): Promise<TeacherClassroomSummary[]>;
	countActiveTeacherClassrooms(teacherId: number): Promise<number>;
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
}
