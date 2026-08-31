import type { Request, Response, NextFunction } from "express";
import type { TeacherSessionsListDto, TeacherSessionReportDto, StudentResultReportDto } from "@viaquiz/shared-types";

export interface ReportsRepositoryContract {
	findFinishedSessionsByHost(
		hostId: number,
		page: number,
		pageSize: number,
		search?: string
	): Promise<{ rooms: any[]; total: number }>;

	findSessionReportData(roomUuid: string, hostId: number): Promise<any | null>;

	findParticipantReportData(roomUuid: string, participantId: number, hostId: number): Promise<any | null>;
}

export interface ReportsServiceContract {
	getTeacherSessions(
		hostId: number,
		page: number,
		pageSize: number,
		search?: string
	): Promise<TeacherSessionsListDto>;

	getSessionReport(roomUuid: string, hostId: number): Promise<TeacherSessionReportDto>;

	getParticipantReport(roomUuid: string, participantId: number, hostId: number): Promise<StudentResultReportDto>;
}

export interface ReportsControllerContract {
	getSessions(req: Request, res: Response, next: NextFunction): Promise<void>;
	getSessionReport(req: Request, res: Response, next: NextFunction): Promise<void>;
	getParticipantReport(req: Request, res: Response, next: NextFunction): Promise<void>;
}
