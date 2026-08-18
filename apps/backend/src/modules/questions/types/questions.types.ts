import type { Question, Variant } from "../../../generated/prisma";

export type QuestionType =
	"ONE_ANSWER" | "MANY_ANSWERS" | "TYPE_ANSWER_V1" | "TYPE_ANSWER_V2";

export type VariantType = "TEXT" | "IMAGE";

export type QuestionWithVariants = Question & {
	variants: Variant[];
};

export interface VariantDTO {
	id?: number | undefined;
	text?: string | null | undefined;
	media?: string | null | undefined;
	type?: VariantType | undefined;
	isCorrect: boolean;
	order: number;
}

export interface CreateQuestionDTO {
	type?: QuestionType | undefined;
	text?: string | undefined;
	media?: string | null | undefined;
	timeLimit?: number | undefined;
	points?: number | undefined;
	variants?: VariantDTO[] | undefined;
}

export interface UpdateQuestionDTO {
	text?: string | undefined;
	media?: string | null | undefined;
	type?: QuestionType | undefined;
	timeLimit?: number | undefined;
	points?: number | undefined;
	variants?: VariantDTO[] | undefined;
}

export interface ReorderQuestionsDTO {
	questionIds: number[];
}
