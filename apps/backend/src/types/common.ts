export interface AuthPayload {
	userId: string;
	email: string;
	role?: string | undefined;
}

export interface PaginationParams {
	page: number;
	limit: number;
	skip: number;
	sortBy?: string | undefined;
	sortOrder: "asc" | "desc";
	search?: string | undefined;
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	message?: string | undefined;
	data?: T;
	error?: {
		code: string;
		details?: unknown;
	};
	timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	};
}
