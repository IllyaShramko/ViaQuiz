import {
	BadRequestError,
	ForbiddenError,
	NotFoundError,
} from "../../errors/customErrors";
import { QuizRepository } from "./quiz.repository";
import type { QuizServiceContract } from "./types/quizzes.contracts";
import type { QuizValidationError } from "./types/quizzes.types";

export const QuizService: QuizServiceContract = {
	async createQuiz(authorId, data) {
		const draftCount = await QuizRepository.countUserQuizzes({
			authorId,
			isDraft: true,
		});

		if (draftCount >= 3) {
			throw new BadRequestError(
				"Досягнуто ліміт у 3 чернетки. Опублікуйте або видаліть існуючу чернетку перед створенням нової.",
			);
		}

		const createPayload: {
			authorId: number;
			name?: string;
			description?: string;
			coverImg?: string;
			keywords?: string[];
		} = { authorId };

		if (data.name !== undefined) createPayload.name = data.name;
		if (data.description !== undefined)
			createPayload.description = data.description;
		if (data.coverImg !== undefined) createPayload.coverImg = data.coverImg;
		if (data.keywords !== undefined) createPayload.keywords = data.keywords;

		return await QuizRepository.create(createPayload);
	},

	async getQuizById(idOrUuid, currentUserId) {
		const quiz = await QuizRepository.findById(idOrUuid, currentUserId);

		// If quiz is a draft, only the author can access it
		if (quiz.isDraft && currentUserId && quiz.authorId !== currentUserId) {
			throw new ForbiddenError(
				"You do not have access to this draft quiz",
			);
		}

		return quiz;
	},

	async getQuizByUuid(uuid, currentUserId) {
		const quiz = await QuizRepository.findByUuid(uuid, currentUserId);

		// If quiz is a draft, only the author can access it
		if (
			quiz.isDraft &&
			(!currentUserId || quiz.authorId !== currentUserId)
		) {
			throw new ForbiddenError(
				"Цей квіз є чернеткою і наразі недоступний для перегляду",
			);
		}

		return quiz;
	},

	async getPublishedQuizzes(params) {
		const [quizzes, total] = await Promise.all([
			QuizRepository.findPublishedQuizzes(params),
			QuizRepository.countPublishedQuizzes(params),
		]);

		return { quizzes, total };
	},

	async getUserQuizzes(authorId, params) {
		const [quizzes, total] = await Promise.all([
			QuizRepository.findUserQuizzes({ authorId, ...params }),
			QuizRepository.countUserQuizzes({ authorId, ...params }),
		]);

		return { quizzes, total };
	},

	async getLikedQuizzes(userId, params) {
		const [quizzes, total] = await Promise.all([
			QuizRepository.findLikedQuizzes({ userId, ...params }),
			QuizRepository.countLikedQuizzes({ userId, ...params }),
		]);

		return { quizzes, total };
	},

	async toggleLike(userId, idOrUuid) {
		const quiz =
			typeof idOrUuid === "number" || (!isNaN(Number(idOrUuid)) && !String(idOrUuid).includes("-"))
				? await QuizRepository.findById(Number(idOrUuid))
				: await QuizRepository.findByUuid(String(idOrUuid));

		if (!quiz) {
			throw new NotFoundError("Quiz not found");
		}

		return await QuizRepository.toggleLike(userId, quiz.id);
	},

	async recordView(userId, idOrUuid) {
		const quiz =
			typeof idOrUuid === "number" || (!isNaN(Number(idOrUuid)) && !String(idOrUuid).includes("-"))
				? await QuizRepository.findById(Number(idOrUuid))
				: await QuizRepository.findByUuid(String(idOrUuid));

		if (!quiz) {
			throw new NotFoundError("Quiz not found");
		}

		await QuizRepository.recordView(userId, quiz.id);
	},

	async updateQuiz(id, authorId, data) {
		const existing = await QuizRepository.findById(id);
		if (existing.authorId !== authorId) {
			throw new ForbiddenError(
				"You are not authorized to edit this quiz",
			);
		}

		return await QuizRepository.update(id, data);
	},

	async publishQuiz(id, authorId) {
		const quiz = await QuizRepository.findById(id);
		if (quiz.authorId !== authorId) {
			throw new ForbiddenError(
				"You are not authorized to publish this quiz",
			);
		}

		const errors: QuizValidationError[] = [];

		if (!quiz.name || quiz.name.trim().length === 0) {
			errors.push({
				questionIndex: 0,
				field: "name",
				message: "Назва квізу не може бути порожньою",
			});
		}

		if (!quiz.questions || quiz.questions.length === 0) {
			errors.push({
				questionIndex: 0,
				field: "questions",
				message: "Квіз повинен містити щонайменше одне запитання",
			});
		} else {
			quiz.questions.forEach((q, index) => {
				const qIndex = index + 1;

				if (!q.text || q.text.trim().length === 0) {
					errors.push({
						questionIndex: qIndex,
						questionId: q.id,
						field: "text",
						message: `Питання #${qIndex}: текст запитання не може бути порожнім`,
					});
				}

				const filledVariants = (q.variants || []).filter(
					(v) => v.text && v.text.trim().length > 0,
				);
				const correctVariants = (q.variants || []).filter(
					(v) => v.isCorrect && v.text && v.text.trim().length > 0,
				);

				if (q.type === "ONE_ANSWER") {
					if (filledVariants.length < 2) {
						errors.push({
							questionIndex: qIndex,
							questionId: q.id,
							field: "variants",
							message: `Питання #${qIndex}: додайте щонайменше 2 заповнені варіанти відповідей`,
						});
					}
					if (correctVariants.length !== 1) {
						errors.push({
							questionIndex: qIndex,
							questionId: q.id,
							field: "isCorrect",
							message: `Питання #${qIndex}: позначте рівно 1 правильний варіант відповіді`,
						});
					}
				} else if (q.type === "MANY_ANSWERS") {
					if (filledVariants.length < 2) {
						errors.push({
							questionIndex: qIndex,
							questionId: q.id,
							field: "variants",
							message: `Питання #${qIndex}: додайте щонайменше 2 заповнені варіанти відповідей`,
						});
					}
					if (correctVariants.length < 1) {
						errors.push({
							questionIndex: qIndex,
							questionId: q.id,
							field: "isCorrect",
							message: `Питання #${qIndex}: позначте хоча б один правильний варіант відповіді`,
						});
					}
				} else if (
					q.type === "TYPE_ANSWER_V1" ||
					q.type === "TYPE_ANSWER_V2"
				) {
					if (
						correctVariants.length === 0 &&
						filledVariants.length === 0
					) {
						errors.push({
							questionIndex: qIndex,
							questionId: q.id,
							field: "variants",
							message: `Питання #${qIndex}: вкажіть правильну відповідь`,
						});
					}
				}
			});
		}

		if (errors.length > 0) {
			throw new BadRequestError(
				"Квіз не пройшов перевірку перед публікацією",
				{
					errors,
				},
			);
		}

		return await QuizRepository.publish(id);
	},

	async deleteQuiz(id, authorId) {
		const existing = await QuizRepository.findById(id);
		if (existing.authorId !== authorId) {
			throw new ForbiddenError(
				"You are not authorized to delete this quiz",
			);
		}

		return await QuizRepository.delete(id);
	},
};
