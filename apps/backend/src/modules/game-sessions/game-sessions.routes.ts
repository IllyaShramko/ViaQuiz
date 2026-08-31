import { Router } from "express";
import { GameSessionsController } from "./game-sessions.controller";
import {
	createRoomSchema,
	joinRoomSchema,
	validateJoinCodeSchema,
} from "./game-sessions.schema";
import {
	authenticate,
	optionalAuthenticate,
} from "../../middlewares/authMiddleware";
import { validateBody } from "../../middlewares/validateMiddleware";

export const gameSessionRouter: Router = Router();

// Create new game room (Teacher only): POST /api/game-sessions/rooms
gameSessionRouter.post(
	"/rooms",
	authenticate,
	validateBody(createRoomSchema),
	GameSessionsController.createRoom,
);

// Validate 6-digit PIN code: POST /api/game-sessions/validate-code
gameSessionRouter.post(
	"/validate-code",
	validateBody(validateJoinCodeSchema),
	GameSessionsController.validateCode,
);

// Join room by code (Student or Anonymous): POST /api/game-sessions/join
gameSessionRouter.post(
	"/join",
	optionalAuthenticate,
	validateBody(joinRoomSchema),
	GameSessionsController.join,
);

// Get room details by UUID: GET /api/game-sessions/rooms/:uuid
gameSessionRouter.get(
	"/rooms/:uuid",
	optionalAuthenticate,
	GameSessionsController.getByUuid,
);

// Get student result report by UUID: GET /api/game-sessions/results/:uuid
gameSessionRouter.get(
	"/results/:uuid",
	optionalAuthenticate,
	GameSessionsController.getResultReport,
);

