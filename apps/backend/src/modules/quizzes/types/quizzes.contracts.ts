import type { Request, Response, NextFunction } from "express";
import type { Quiz } from "../../../generated/prisma";
import type {
	CreateQuizDTO,
	UpdateQuizDTO,
	FullQuiz,
	QuizSummary,
	PublicQuizSummary,
	PublicFullQuiz,
} from "./quizzes.types";

export interface QuizRepositoryContract {
	create(data: {
		authorId: number;
		name?: string;
		description?: string;
		coverImg?: string;
		keywords?: string[];
	}): Promise<FullQuiz>;

	findById(idOrUuid: string | number): Promise<FullQuiz>;

	findByUuid(uuid: string): Promise<PublicFullQuiz>;

	findPublishedQuizzes(params: {
		search?: string;
		skip: number;
		take: number;
		sortBy?: string;
		sortOrder?: "asc" | "desc";
	}): Promise<PublicQuizSummary[]>;

	countPublishedQuizzes(params: {
		search?: string;
	}): Promise<number>;

	findUserQuizzes(params: {
		authorId: number;
		isDraft?: boolean;
		search?: string;
		skip: number;
		take: number;
	}): Promise<QuizSummary[]>;

	countUserQuizzes(params: {
		authorId: number;
		isDraft?: boolean;
		search?: string;
	}): Promise<number>;

	update(id: number, data: UpdateQuizDTO): Promise<FullQuiz>;

	publish(id: number): Promise<FullQuiz>;

	delete(id: number): Promise<Quiz>;
}

export interface QuizServiceContract {
	createQuiz(authorId: number, data: CreateQuizDTO): Promise<FullQuiz>;
	getQuizById(idOrUuid: string | number, currentUserId?: number): Promise<FullQuiz>;
	getQuizByUuid(uuid: string, currentUserId?: number): Promise<PublicFullQuiz>;
	getPublishedQuizzes(params: {
		search?: string;
		skip: number;
		take: number;
		sortBy?: string;
		sortOrder?: "asc" | "desc";
	}): Promise<{ quizzes: PublicQuizSummary[]; total: number }>;
	getUserQuizzes(
		authorId: number,
		params: { isDraft?: boolean; search?: string; skip: number; take: number },
	): Promise<{ quizzes: QuizSummary[]; total: number }>;
	updateQuiz(id: number, authorId: number, data: UpdateQuizDTO): Promise<FullQuiz>;
	publishQuiz(id: number, authorId: number): Promise<FullQuiz>;
	deleteQuiz(id: number, authorId: number): Promise<Quiz>;
}

export interface QuizControllerContract {
	create(req: Request, res: Response, next: NextFunction): Promise<void>;
	getOne(req: Request, res: Response, next: NextFunction): Promise<void>;
	getByUuid(req: Request, res: Response, next: NextFunction): Promise<void>;
	getAllPublished(req: Request, res: Response, next: NextFunction): Promise<void>;
	getMyQuizzes(req: Request, res: Response, next: NextFunction): Promise<void>;
	update(req: Request, res: Response, next: NextFunction): Promise<void>;
	publish(req: Request, res: Response, next: NextFunction): Promise<void>;
	delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
