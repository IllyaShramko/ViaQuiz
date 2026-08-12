export interface AuthPayload {
	userId: string;
	email: string;
	role?: string;
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	message?: string;
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
	};
}
