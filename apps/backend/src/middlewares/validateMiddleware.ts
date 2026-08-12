import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z, ZodError } from "zod";
import { BadRequestError } from "../errors/customErrors";

export interface RequestValidationSchemas {
	body?: z.ZodType;
	query?: z.ZodType;
	params?: z.ZodType;
}

export const validateRequest = (schemas: RequestValidationSchemas): RequestHandler => {
	return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
		try {
			const allIssues: z.ZodIssue[] = [];

			if (schemas.params) {
				const result = await schemas.params.safeParseAsync(req.params);
				if (!result.success) {
					allIssues.push(...result.error.issues);
				} else {
					req.params = result.data as typeof req.params;
				}
			}

			if (schemas.query) {
				const result = await schemas.query.safeParseAsync(req.query);
				if (!result.success) {
					allIssues.push(...result.error.issues);
				} else {
					req.query = result.data as typeof req.query;
				}
			}

			if (schemas.body) {
				const result = await schemas.body.safeParseAsync(req.body);
				if (!result.success) {
					allIssues.push(...result.error.issues);
				} else {
					req.body = result.data;
				}
			}

			if (allIssues.length > 0) {
				const formattedErrors = allIssues.map((issue) => ({
					field: issue.path.length > 0 ? issue.path.join(".") : "root",
					message: issue.message,
				}));
				next(new BadRequestError("Validation failed", formattedErrors));
				return;
			}

			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const formattedErrors = error.issues.map((issue) => ({
					field: issue.path.length > 0 ? issue.path.join(".") : "root",
					message: issue.message,
				}));
				next(new BadRequestError("Validation failed", formattedErrors));
				return;
			}
			next(error);
		}
	};
};

export const validateBody = (schema: z.ZodType): RequestHandler => {
	return validateRequest({ body: schema });
};

export const validateQuery = (schema: z.ZodType): RequestHandler => {
	return validateRequest({ query: schema });
};

export const validateParams = (schema: z.ZodType): RequestHandler => {
	return validateRequest({ params: schema });
};
