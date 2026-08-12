import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError } from "../errors/customErrors";
import type { AuthenticatedUser } from "../types/token";

export const authenticate = (
	req: Request,
	res: Response<unknown, AuthenticatedUser>,
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
		};

		res.locals.userId = Number(decoded.userId);
		res.locals.email = decoded.email;

		next();
	} catch {
		next(new UnauthorizedError("Invalid or expired token"));
	}
};
