import type { Request, Response, NextFunction } from "express";
import type { ReportsControllerContract } from "./types/reports.contracts";
import { ReportsService } from "./reports.service";

export const ReportsController: ReportsControllerContract = {
	getSessions: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const userId = res.locals.userId;
			const page = parseInt(req.query.page as string) || 1;
			const pageSize = parseInt(req.query.pageSize as string) || 10;
			const search = req.query.search as string | undefined;
			const classUuid = req.query.classUuid as string | undefined;

			const result = await ReportsService.getTeacherSessions(userId, page, pageSize, search, classUuid);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	},

	getSessionReport: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const userId = res.locals.userId;
			const { roomUuid } = req.params;

			const result = await ReportsService.getSessionReport(roomUuid as string, userId);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	},

	getParticipantReport: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const userId = res.locals.userId;
			const { roomUuid, participantId } = req.params;

			const result = await ReportsService.getParticipantReport(
				roomUuid as string,
				parseInt(participantId as string, 10),
				userId
			);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	}
};
