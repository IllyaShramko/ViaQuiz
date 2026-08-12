import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/index.js";
import { UnauthorizedError } from "../errors/index.js";
import type { AuthPayload } from "../types/index.js";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return next(new UnauthorizedError("Missing or invalid authorization token"));
	}

	const token = authHeader.split(" ")[1];

	if (!token) {
		return next(new UnauthorizedError("Token not provided"));
	}

	try {
		const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
		req.user = decoded;
		next();
	} catch {
		next(new UnauthorizedError("Invalid or expired token"));
	}
};
