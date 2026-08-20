export type SortOrder = "asc" | "desc";

export interface PaginationQueryParams {
	page?: number;
	limit?: number;
	search?: string;
}

export interface SortQueryParams<TSortBy extends string = string> {
	sortBy?: TSortBy;
	sortOrder?: SortOrder;
}
