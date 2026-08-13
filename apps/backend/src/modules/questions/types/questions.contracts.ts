import type { Request, Response, NextFunction } from "express";
import type { Question } from "../../../generated/prisma";
import type {
	CreateQuestionDTO,
	UpdateQuestionDTO,
	QuestionWithVariants,
} from "./questions.types";

export interface QuestionRepositoryContract {
	create(quizId: number, data: CreateQuestionDTO): Promise<QuestionWithVariants>;
	findById(id: number): Promise<QuestionWithVariants & { quiz: { authorId: number } }>;
	update(id: number, data: UpdateQuestionDTO): Promise<QuestionWithVariants>;
	reorder(quizId: number, questionIds: number[]): Promise<QuestionWithVariants[]>;
	delete(id: number): Promise<Question>;
	duplicate(id: number): Promise<QuestionWithVariants>;
}

export interface QuestionServiceContract {
	createQuestion(
		quizId: number,
		userId: number,
		data: CreateQuestionDTO,
	): Promise<QuestionWithVariants>;
	updateQuestion(
		id: number,
		userId: number,
		data: UpdateQuestionDTO,
	): Promise<QuestionWithVariants>;
	reorderQuestions(
		quizId: number,
		userId: number,
		questionIds: number[],
	): Promise<QuestionWithVariants[]>;
	deleteQuestion(id: number, userId: number): Promise<Question>;
	duplicateQuestion(id: number, userId: number): Promise<QuestionWithVariants>;
}

export interface QuestionControllerContract {
	create(req: Request, res: Response, next: NextFunction): Promise<void>;
	update(req: Request, res: Response, next: NextFunction): Promise<void>;
	reorder(req: Request, res: Response, next: NextFunction): Promise<void>;
	delete(req: Request, res: Response, next: NextFunction): Promise<void>;
	duplicate(req: Request, res: Response, next: NextFunction): Promise<void>;
}
