import type { PaginationQueryParams, SortQueryParams } from "./common";

export type PublishedQuizSortBy = "createdAt" | "name";
export type UserQuizSortBy = "updatedAt" | "createdAt" | "name";
export type LikedQuizSortBy = "likedAt" | "createdAt" | "name";

export type QuizSortBy = UserQuizSortBy | LikedQuizSortBy | PublishedQuizSortBy;

export interface GetPublishedQuizzesParams
	extends PaginationQueryParams,
		SortQueryParams<PublishedQuizSortBy> {}

export interface GetUserQuizzesParams
	extends PaginationQueryParams,
		SortQueryParams<UserQuizSortBy> {
	isDraft?: boolean;
}

export interface GetLikedQuizzesParams
	extends PaginationQueryParams,
		SortQueryParams<LikedQuizSortBy> {}

export const MIN_QUESTION_VARIANTS = 2;
export const MAX_QUESTION_VARIANTS = 6;

export const QUESTION_TYPES = [
	"ONE_ANSWER",
	"MANY_ANSWERS",
	"TYPE_ANSWER_V1",
	"TYPE_ANSWER_V2",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const VARIANT_TYPES = ["TEXT", "IMAGE"] as const;

export type VariantType = (typeof VARIANT_TYPES)[number];

export const QUESTION_LIMITS = {
	MIN_VARIANTS: MIN_QUESTION_VARIANTS,
	MAX_VARIANTS: MAX_QUESTION_VARIANTS,
	DEFAULT_TIME_LIMIT_MS: 30000,
	MIN_TIME_LIMIT_MS: 1000,
	MAX_TIME_LIMIT_MS: 600000,
	DEFAULT_POINTS: 1000,
	MIN_POINTS: 0,
	MAX_POINTS: 5000,
	MAX_TEXT_LENGTH: 1000,
	MAX_VARIANT_TEXT_LENGTH: 300,
} as const;

