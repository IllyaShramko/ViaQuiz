import type { SortOrder } from '@viaquiz/shared-types';

export interface ApiErrorResponse {
  message?: string;
  statusCode?: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
