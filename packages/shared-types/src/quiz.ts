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
