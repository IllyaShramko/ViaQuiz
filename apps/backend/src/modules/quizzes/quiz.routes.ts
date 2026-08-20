import { Router } from "express";
import { QuizController } from "./quiz.controller";
import { createQuizSchema, updateQuizSchema } from "./quiz.schema";
import {
	authenticate,
	optionalAuthenticate,
} from "../../middlewares/authMiddleware";
import { validateBody } from "../../middlewares/validateMiddleware";
import { paginationMiddleware } from "../../middlewares/paginationMiddleware";

export const quizRouter: Router = Router();

// Create new quiz draft: POST /api/quizzes
quizRouter.post(
	"/",
	authenticate,
	validateBody(createQuizSchema),
	QuizController.create,
);

// Public catalog (main page): GET /api/quizzes?page=1&limit=10&search=biology
quizRouter.get("/", paginationMiddleware, QuizController.getAllPublished);

// User's own quizzes: GET /api/quizzes/my?isDraft=true
quizRouter.get(
	"/my",
	authenticate,
	paginationMiddleware,
	QuizController.getMyQuizzes,
);

// User's liked quizzes: GET /api/quizzes/my/liked
quizRouter.get(
	"/my/liked",
	authenticate,
	paginationMiddleware,
	QuizController.getLikedQuizzes,
);

// Public/shared quiz by UUID: GET /api/quizzes/uuid/:uuid
quizRouter.get("/uuid/:uuid", optionalAuthenticate, QuizController.getByUuid);

// Toggle like by UUID: POST /api/quizzes/uuid/:uuid/like
quizRouter.post("/uuid/:uuid/like", authenticate, QuizController.toggleLike);

// Record view by UUID: POST /api/quizzes/uuid/:uuid/view
quizRouter.post("/uuid/:uuid/view", authenticate, QuizController.recordView);

// Toggle like by ID: POST /api/quizzes/:id/like
quizRouter.post("/:id/like", authenticate, QuizController.toggleLike);

// Record view by ID: POST /api/quizzes/:id/view
quizRouter.post("/:id/view", authenticate, QuizController.recordView);

// Get quiz by ID (or editor fetch): GET /api/quizzes/:id
quizRouter.get("/:id", authenticate, QuizController.getOne);

// Update quiz metadata: PATCH /api/quizzes/:id
quizRouter.patch(
	"/:id",
	authenticate,
	validateBody(updateQuizSchema),
	QuizController.update,
);

// Publish quiz: POST /api/quizzes/:id/publish
quizRouter.post("/:id/publish", authenticate, QuizController.publish);

// Delete quiz: DELETE /api/quizzes/:id
quizRouter.delete("/:id", authenticate, QuizController.delete);
