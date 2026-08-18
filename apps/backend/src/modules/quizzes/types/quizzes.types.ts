import type {
	Quiz,
	Question,
	Variant,
	Keyword,
} from "../../../generated/prisma";

export type QuestionWithVariants = Question & {
	variants: Variant[];
};

export type FullQuiz = Quiz & {
	questions: QuestionWithVariants[];
	keywords: Keyword[];
};

export interface PublicAuthor {
	id: number;
	uuid: string;
	login: string;
	firstName: string | null;
	lastName: string | null;
}

export type QuizSummary = Quiz & {
	keywords: Keyword[];
	_count?: {
		questions: number;
	};
};

export type PublicQuizSummary = Quiz & {
	author: PublicAuthor;
	keywords: Keyword[];
	_count?: {
		questions: number;
	};
};

export type PublicFullQuiz = Quiz & {
	author: PublicAuthor;
	questions: QuestionWithVariants[];
	keywords: Keyword[];
};

export interface CreateQuizDTO {
	name?: string | undefined;
	description?: string | undefined;
	coverImg?: string | undefined;
	keywords?: string[] | undefined;
}

export interface UpdateQuizDTO {
	name?: string | undefined;
	description?: string | null | undefined;
	coverImg?: string | null | undefined;
	keywords?: string[] | undefined;
}

export interface QuizValidationError {
	questionIndex: number;
	questionId?: number | undefined;
	field?: string | undefined;
	message: string;
}

export interface PublishQuizResult {
	quiz: FullQuiz;
	errors?: QuizValidationError[] | undefined;
}
