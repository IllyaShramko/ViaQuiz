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
			userId?: number;
			studentId?: number;
			email?: string;
			login?: string;
			role?: string;
			classroomId?: number;
		};

		res.locals.userId = decoded.userId ? Number(decoded.userId) : undefined;
		res.locals.studentId = decoded.studentId ? Number(decoded.studentId) : undefined;
		res.locals.email = decoded.email;
		res.locals.login = decoded.login;
		res.locals.role = decoded.role || (decoded.studentId ? "STUDENT" : "TEACHER");
		res.locals.classroomId = decoded.classroomId;

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
			userId?: number;
			id?: number;
			studentId?: number;
			participantId?: number;
			roomId?: number;
			roomUuid?: string;
			email?: string;
			login?: string;
			role?: string;
			classroomId?: number;
		};

		res.locals.userId = decoded.userId
			? Number(decoded.userId)
			: decoded.id
				? Number(decoded.id)
				: undefined;
		res.locals.studentId = decoded.studentId ? Number(decoded.studentId) : undefined;
		res.locals.participantId = decoded.participantId
			? Number(decoded.participantId)
			: undefined;
		res.locals.roomId = decoded.roomId ? Number(decoded.roomId) : undefined;
		res.locals.roomUuid = decoded.roomUuid ? String(decoded.roomUuid) : undefined;
		res.locals.email = decoded.email;
		res.locals.login = decoded.login;
		res.locals.role =
			decoded.role ||
			(decoded.studentId
				? "STUDENT"
				: decoded.participantId
					? "ANONYMOUS"
					: "TEACHER");
		res.locals.classroomId = decoded.classroomId;
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
		if (!res.locals.userId && !res.locals.studentId) {
			next(new UnauthorizedError("Authentication required"));
			return;
		}

		const userRole = (res.locals.role as string | undefined) || (res.locals.studentId ? "STUDENT" : "TEACHER");

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
