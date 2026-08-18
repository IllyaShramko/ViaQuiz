import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ForbiddenError, UnauthorizedError } from "../errors/customErrors";

export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		next(new UnauthorizedError("Missing or invalid authorization token"));
		return;
	}

	const token = authHeader.split(" ")[1];

	if (!token) {
		next(new UnauthorizedError("Token not provided"));
		return;
	}

	try {
		const decoded = jwt.verify(token, env.JWT_SECRET) as {
			userId: number;
			email: string;
			role?: string;
		};

		res.locals.userId = Number(decoded.userId);
		res.locals.email = decoded.email;
		res.locals.role = decoded.role;

		next();
	} catch {
		next(new UnauthorizedError("Invalid or expired token"));
	}
};

export const optionalAuthenticate = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return next();
	}

	const token = authHeader.split(" ")[1];
	if (!token) {
		return next();
	}

	try {
		const decoded = jwt.verify(token, env.JWT_SECRET) as {
			userId: number;
			email: string;
			role?: string;
		};

		res.locals.userId = Number(decoded.userId);
		res.locals.email = decoded.email;
		res.locals.role = decoded.role;
	} catch {
		// Silently continue for optional auth
	}

	next();
};

/**
 * Middleware factory to authorize specific user roles.
 * Must be used after `authenticate` middleware.
 *
 * @example
 * router.get("/admin/users", authenticate, authorizeRoles("ADMIN"), controller);
 * router.post("/quizzes", authenticate, authorizeRoles("TEACHER", "ADMIN"), controller);
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
	return (_req: Request, res: Response, next: NextFunction): void => {
		if (!res.locals.userId) {
			next(new UnauthorizedError("Authentication required"));
			return;
		}

		const userRole = res.locals.role as string | undefined;

		if (!userRole) {
			next(new ForbiddenError("Access denied: no role assigned to user"));
			return;
		}

		const normalizedUserRole = userRole.toLowerCase();
		const hasAccess = allowedRoles.some(
			(role) => role.toLowerCase() === normalizedUserRole,
		);

		if (!hasAccess) {
			next(
				new ForbiddenError(
					`Access denied: requires one of [${allowedRoles.join(", ")}] role`,
				),
			);
			return;
		}

		next();
	};
};

export const requireRoles = authorizeRoles;
export const checkRole = authorizeRoles;
