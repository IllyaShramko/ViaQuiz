import type { GameSessionsControllerContract } from "./types/game-sessions.contracts";
import { GameSessionsService } from "./game-sessions.service";

export const GameSessionsController: GameSessionsControllerContract = {
	async createRoom(req, res, next) {
		try {
			const hostId = res.locals.userId;
			const room = await GameSessionsService.createRoom(hostId, req.body);
			res.status(201).json(room);
		} catch (error) {
			next(error);
		}
	},

	async validateCode(req, res, next) {
		try {
			const { joinCode } = req.body;
			const room = await GameSessionsService.validateJoinCode(joinCode);
			res.status(200).json({
				valid: true,
				roomUuid: room.uuid,
				requiresAuth: !!room.courseId,
				status: room.status,
			});
		} catch (error) {
			next(error);
		}
	},

	async join(req, res, next) {
		try {
			const result = await GameSessionsService.joinRoom(req.body, {
				studentId: res.locals.studentId,
				userId: res.locals.userId,
			});
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	},

	async getByUuid(req, res, next) {
		try {
			const { uuid } = req.params;
			const currentUserId = res.locals.studentId ?? res.locals.userId;
			const room = await GameSessionsService.getRoomByUuid(
				uuid as string,
				currentUserId,
			);
			res.status(200).json(room);
		} catch (error) {
			next(error);
		}
	},

	async getResultReport(req, res, next) {
		try {
			const { uuid } = req.params;
			const report = await GameSessionsService.getResultReport(uuid as string);
			res.status(200).json(report);
		} catch (error) {
			next(error);
		}
	},
};
