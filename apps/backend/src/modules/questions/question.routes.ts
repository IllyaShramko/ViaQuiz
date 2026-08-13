import { Router } from "express";
import { QuestionController } from "./question.controller";
import {
	createQuestionSchema,
	updateQuestionSchema,
	reorderQuestionsSchema,
} from "./question.schema";
import { authenticate } from "../../middlewares/authMiddleware";
import { validateBody } from "../../middlewares/validateMiddleware";

export const questionRouter: Router = Router();

// Create new question for quiz: POST /api/questions/quiz/:quizId
questionRouter.post(
	"/quiz/:quizId",
	authenticate,
	validateBody(createQuestionSchema),
	QuestionController.create,
);

// Reorder questions in quiz: PATCH /api/questions/quiz/:quizId/order
questionRouter.patch(
	"/quiz/:quizId/order",
	authenticate,
	validateBody(reorderQuestionsSchema),
	QuestionController.reorder,
);

// Update question + atomic sync of variants: PUT /api/questions/:id
questionRouter.put(
	"/:id",
	authenticate,
	validateBody(updateQuestionSchema),
	QuestionController.update,
);

// Duplicate question: POST /api/questions/:id/duplicate
questionRouter.post("/:id/duplicate", authenticate, QuestionController.duplicate);

// Delete question: DELETE /api/questions/:id
questionRouter.delete("/:id", authenticate, QuestionController.delete);
