import { ForbiddenError, NotFoundError } from "../../errors/customErrors";
import { QuizRepository } from "../quizzes/quiz.repository";
import { QuestionRepository } from "./question.repository";
import type { QuestionServiceContract } from "./types/questions.contracts";

export const QuestionService: QuestionServiceContract = {
	async createQuestion(quizId, userId, data) {
		const quiz = await QuizRepository.findById(quizId);
		if (quiz.authorId !== userId) {
			throw new ForbiddenError(
				"You are not authorized to add questions to this quiz",
			);
		}

		return await QuestionRepository.create(quizId, data);
	},

	async updateQuestion(id, userId, data) {
		const question = await QuestionRepository.findById(id);
		if (question.quiz.authorId !== userId) {
			throw new ForbiddenError(
				"You are not authorized to edit this question",
			);
		}

		return await QuestionRepository.update(id, data);
	},

	async reorderQuestions(quizId, userId, questionIds) {
		const quiz = await QuizRepository.findById(quizId);
		if (quiz.authorId !== userId) {
			throw new ForbiddenError(
				"You are not authorized to reorder questions in this quiz",
			);
		}

		return await QuestionRepository.reorder(quizId, questionIds);
	},

	async deleteQuestion(id, userId) {
		const question = await QuestionRepository.findById(id);
		if (question.quiz.authorId !== userId) {
			throw new ForbiddenError(
				"You are not authorized to delete this question",
			);
		}

		return await QuestionRepository.delete(id);
	},

	async duplicateQuestion(id, userId) {
		const question = await QuestionRepository.findById(id);
		if (question.quiz.authorId !== userId) {
			throw new ForbiddenError(
				"You are not authorized to duplicate this question",
			);
		}

		return await QuestionRepository.duplicate(id);
	},
};
