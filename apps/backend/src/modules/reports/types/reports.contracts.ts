import type { Request, Response, NextFunction } from "express";
import type { TeacherSessionsListDto, TeacherSessionReportDto, StudentResultReportDto } from "@viaquiz/shared-types";

export interface ReportsRepositoryContract {
	findFinishedSessionsByHost(
		userId: number,
		page: number,
		pageSize: number,
		search?: string,
		classUuid?: string,
		courseUuid?: string,
	): Promise<{ rooms: any[]; total: number }>;

	findSessionReportData(roomUuid: string, userId: number): Promise<any | null>;

	findParticipantReportData(roomUuid: string, participantId: number, userId: number): Promise<any | null>;
}

export interface ReportsServiceContract {
	getTeacherSessions(
		userId: number,
		page: number,
		pageSize: number,
		search?: string,
		classUuid?: string,
		courseUuid?: string,
	): Promise<TeacherSessionsListDto>;

	getSessionReport(roomUuid: string, userId: number): Promise<TeacherSessionReportDto>;

	getParticipantReport(roomUuid: string, participantId: number, userId: number): Promise<StudentResultReportDto>;
}

export interface ReportsControllerContract {
	getSessions(req: Request, res: Response, next: NextFunction): Promise<void>;
	getSessionReport(req: Request, res: Response, next: NextFunction): Promise<void>;
	getParticipantReport(req: Request, res: Response, next: NextFunction): Promise<void>;
}
