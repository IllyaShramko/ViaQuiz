import type { Request, Response, NextFunction } from "express";
import type {
	StudentLoginDTO,
	StudentLoginResponse,
	StudentMe,
	StudentWithClassroom,
	StudentDashboardResponse,
	StudentResultsResponse,
	StudentCourse,
	RawParticipantResult,
	StudentClassroomDetailsDto,
	ClassmateProfileDto,
} from "./students.types";

export interface StudentRepositoryContract {
	findByLogin(
		login: string,
		classCode?: string,
	): Promise<StudentWithClassroom | null | undefined>;
	findById(id: number): Promise<StudentMe>;
	findStudentResults(
		studentId: number,
		take?: number,
		skip?: number,
		fromDate?: Date,
		toDate?: Date,
	): Promise<RawParticipantResult[]>;
	countStudentResults(
		studentId: number,
		fromDate?: Date,
		toDate?: Date,
	): Promise<number>;
	findStudentCourses(studentId: number): Promise<StudentCourse[]>;
	findClassroomDetails(studentId: number): Promise<StudentClassroomDetailsDto>;
	findClassmateProfile(
		studentId: number,
		classmateUuid: string,
	): Promise<ClassmateProfileDto>;
}

export interface StudentServiceContract {
	login(credentials: StudentLoginDTO): Promise<StudentLoginResponse>;
	getMe(studentId: number): Promise<StudentMe>;
	getDashboard(studentId: number): Promise<StudentDashboardResponse>;
	getResults(
		studentId: number,
		take?: number,
		skip?: number,
		from?: string,
		to?: string,
	): Promise<StudentResultsResponse>;
	getCourses(studentId: number): Promise<StudentCourse[]>;
	getClassroom(studentId: number): Promise<StudentClassroomDetailsDto>;
	getClassmateProfile(
		studentId: number,
		classmateUuid: string,
	): Promise<ClassmateProfileDto>;
}

export interface StudentControllerContract {
	login(req: Request, res: Response, next: NextFunction): Promise<void>;
	getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
	getDashboard(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	getResults(req: Request, res: Response, next: NextFunction): Promise<void>;
	getCourses(req: Request, res: Response, next: NextFunction): Promise<void>;
	getClassroom(req: Request, res: Response, next: NextFunction): Promise<void>;
	getClassmateProfile(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
}
