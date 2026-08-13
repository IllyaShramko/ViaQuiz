import type { QuestionControllerContract } from "./types/questions.contracts";
import { QuestionService } from "./question.service";

export const QuestionController: QuestionControllerContract = {
	async create(req, res, next) {
		try {
			const quizId = Number(req.params.quizId);
			const question = await QuestionService.createQuestion(
				quizId,
				res.locals.userId,
				req.body,
			);
			res.status(201).json(question);
		} catch (error) {
			next(error);
		}
	},

	async update(req, res, next) {
		try {
			const id = Number(req.params.id);
			const question = await QuestionService.updateQuestion(
				id,
				res.locals.userId,
				req.body,
			);
			res.status(200).json(question);
		} catch (error) {
			next(error);
		}
	},

	async reorder(req, res, next) {
		try {
			const quizId = Number(req.params.quizId);
			const questions = await QuestionService.reorderQuestions(
				quizId,
				res.locals.userId,
				req.body.questionIds,
			);
			res.status(200).json(questions);
		} catch (error) {
			next(error);
		}
	},

	async delete(req, res, next) {
		try {
			const id = Number(req.params.id);
			await QuestionService.deleteQuestion(id, res.locals.userId);
			res.status(200).json({
				success: true,
				message: "Question deleted successfully",
			});
		} catch (error) {
			next(error);
		}
	},

	async duplicate(req, res, next) {
		try {
			const id = Number(req.params.id);
			const question = await QuestionService.duplicateQuestion(
				id,
				res.locals.userId,
			);
			res.status(201).json(question);
		} catch (error) {
			next(error);
		}
	},
};
