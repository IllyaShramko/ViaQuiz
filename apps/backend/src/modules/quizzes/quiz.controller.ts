import type { QuizControllerContract } from "./types/quizzes.contracts";
import type {
	SortOrder,
	UserQuizSortBy,
	LikedQuizSortBy,
	PublishedQuizSortBy,
} from "@viaquiz/shared-types";
import { QuizService } from "./quiz.service";
import { BadRequestError } from "../../errors/customErrors";

export const QuizController: QuizControllerContract = {
	async create(req, res, next) {
		try {
			const quiz = await QuizService.createQuiz(
				res.locals.userId,
				req.body,
			);
			res.status(201).json(quiz);
		} catch (error) {
			next(error);
		}
	},

	async getOne(req, res, next) {
		try {
			const idOrUuid = req.params.id;
			const quiz = await QuizService.getQuizById(
				idOrUuid as string,
				res.locals.userId,
			);
			res.status(200).json(quiz);
		} catch (error) {
			next(error);
		}
	},

	async getByUuid(req, res, next) {
		try {
			const uuid = req.params.uuid;
			const quiz = await QuizService.getQuizByUuid(
				uuid as string,
				res.locals.userId,
			);
			res.status(200).json(quiz);
		} catch (error) {
			next(error);
		}
	},

	async getAllPublished(req, res, next) {
		try {
			const search = req.query.search
				? String(req.query.search)
				: undefined;
			const sortBy = req.query.sortBy
				? (String(req.query.sortBy) as PublishedQuizSortBy)
				: undefined;
			const sortOrder: SortOrder =
				req.query.sortOrder === "asc" ? "asc" : "desc";

			const params: {
				search?: string;
				skip: number;
				take: number;
				sortBy?: PublishedQuizSortBy | string;
				sortOrder?: SortOrder;
			} = {
				skip: res.locals.skip,
				take: res.locals.take,
				sortOrder,
			};

			if (search !== undefined) params.search = search;
			if (sortBy !== undefined) params.sortBy = sortBy;

			const result = await QuizService.getPublishedQuizzes(params);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	},

	async getMyQuizzes(req, res, next) {
		try {
			const isDraftQuery = req.query.isDraft as string | undefined;
			let isDraft: boolean | undefined;
			if (isDraftQuery === "true") isDraft = true;
			if (isDraftQuery === "false") isDraft = false;

			const search = req.query.search
				? String(req.query.search)
				: undefined;
			const sortBy = req.query.sortBy as UserQuizSortBy | undefined;
			const sortOrder = req.query.sortOrder as SortOrder | undefined;

			const params: {
				isDraft?: boolean;
				search?: string;
				skip: number;
				take: number;
				sortBy?: UserQuizSortBy;
				sortOrder?: SortOrder;
			} = {
				skip: res.locals.skip,
				take: res.locals.take,
			};

			if (isDraft !== undefined) params.isDraft = isDraft;
			if (search !== undefined) params.search = search;
			if (sortBy !== undefined) params.sortBy = sortBy;
			if (sortOrder !== undefined) params.sortOrder = sortOrder;

			const result = await QuizService.getUserQuizzes(
				res.locals.userId,
				params,
			);

			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	},

	async getLikedQuizzes(req, res, next) {
		try {
			const search = req.query.search
				? String(req.query.search)
				: undefined;
			const sortBy = req.query.sortBy as LikedQuizSortBy | undefined;
			const sortOrder = req.query.sortOrder as SortOrder | undefined;

			const params: {
				search?: string;
				skip: number;
				take: number;
				sortBy?: LikedQuizSortBy;
				sortOrder?: SortOrder;
			} = {
				skip: res.locals.skip,
				take: res.locals.take,
			};

			if (search !== undefined) params.search = search;
			if (sortBy !== undefined) params.sortBy = sortBy;
			if (sortOrder !== undefined) params.sortOrder = sortOrder;

			const result = await QuizService.getLikedQuizzes(
				res.locals.userId,
				params,
			);

			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	},

	async toggleLike(req, res, next) {
		try {
			const idOrUuid = req.params.uuid || req.params.id;
			if (!idOrUuid) {
				throw new BadRequestError("Quiz ID or UUID is required");
			}
			const result = await QuizService.toggleLike(
				res.locals.userId,
				idOrUuid,
			);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	},

	async recordView(req, res, next) {
		try {
			const idOrUuid = req.params.uuid || req.params.id;
			if (!idOrUuid) {
				throw new BadRequestError("Quiz ID or UUID is required");
			}
			await QuizService.recordView(res.locals.userId, idOrUuid);
			res.status(200).json({ success: true });
		} catch (error) {
			next(error);
		}
	},

	async update(req, res, next) {
		try {
			const id = Number(req.params.id);
			const quiz = await QuizService.updateQuiz(
				id,
				res.locals.userId,
				req.body,
			);
			res.status(200).json(quiz);
		} catch (error) {
			next(error);
		}
	},

	async publish(req, res, next) {
		try {
			const id = Number(req.params.id);
			const quiz = await QuizService.publishQuiz(id, res.locals.userId);
			res.status(200).json(quiz);
		} catch (error) {
			next(error);
		}
	},

	async delete(req, res, next) {
		try {
			const id = Number(req.params.id);
			await QuizService.deleteQuiz(id, res.locals.userId);
			res.status(200).json({
				success: true,
				message: "Quiz deleted successfully",
			});
		} catch (error) {
			next(error);
		}
	},
};
