import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors/customErrors";
import type { PaginatedResponse, PaginationParams } from "../types/common";

export type PaginationLocals = PaginationParams & {
	take: number;
	buildMeta: (total: number) => PaginatedResponse<unknown>["meta"];
};

const MAX_LIMIT = 100;

function getSingleQueryParam(val: unknown): string | undefined {
	if (typeof val === "string") return val;
	if (Array.isArray(val) && typeof val[0] === "string") return val[0];
	return undefined;
}

function parsePositiveInteger(
	value: string | undefined,
	fieldName: string,
	defaultValue: number,
): number {
	if (!value) return defaultValue;

	const parsed = Number(value);

	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw new BadRequestError(`${fieldName} must be positive integer`);
	}

	return parsed;
}

export function paginationMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	try {
		const pageRaw = getSingleQueryParam(
			req.query.pageNumber ?? req.query.page,
		);
		const limitRaw = getSingleQueryParam(
			req.query.limit ?? req.query.pageSize,
		);
		const sortByRaw = getSingleQueryParam(
			req.query.sortBy ?? req.query.sort,
		);
		const sortOrderRaw = getSingleQueryParam(
			req.query.sortOrder ?? req.query.order,
		);
		const searchRaw = getSingleQueryParam(req.query.search ?? req.query.q);

		const page = parsePositiveInteger(pageRaw, "pageNumber", 1);
		let limit = parsePositiveInteger(limitRaw, "limit", 20);

		if (limit > MAX_LIMIT) {
			limit = MAX_LIMIT;
		}

		const sortOrder: "asc" | "desc" =
			sortOrderRaw?.toLowerCase() === "asc" ? "asc" : "desc";

		const skip = (page - 1) * limit;
		const take = limit;

		res.locals.page = page;
		res.locals.limit = limit;
		res.locals.skip = skip;
		res.locals.take = take;
		res.locals.sortBy = sortByRaw?.trim() || undefined;
		res.locals.sortOrder = sortOrder;
		res.locals.search = searchRaw?.trim() || undefined;

		res.locals.buildMeta = (total: number) => {
			const totalPages = Math.ceil(total / limit) || 1;
			return {
				page,
				limit,
				total,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			};
		};

		next();
	} catch (error) {
		next(error);
	}
}

export function buildPaginatedResponse<T>(
	data: T[],
	total: number,
	page: number,
	limit: number,
	message?: string,
): PaginatedResponse<T> {
	const totalPages = Math.ceil(total / limit) || 1;
	return {
		success: true,
		message,
		data,
		meta: {
			page,
			limit,
			total,
			totalPages,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1,
		},
		timestamp: new Date().toISOString(),
	};
}
