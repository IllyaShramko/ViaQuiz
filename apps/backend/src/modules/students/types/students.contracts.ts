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
	): Promise<RawParticipantResult[]>;
	countStudentResults(studentId: number): Promise<number>;
	findStudentCourses(studentId: number): Promise<StudentCourse[]>;
}

export interface StudentServiceContract {
	login(credentials: StudentLoginDTO): Promise<StudentLoginResponse>;
	getMe(studentId: number): Promise<StudentMe>;
	getDashboard(studentId: number): Promise<StudentDashboardResponse>;
	getResults(
		studentId: number,
		take?: number,
		skip?: number,
	): Promise<StudentResultsResponse>;
	getCourses(studentId: number): Promise<StudentCourse[]>;
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
}
