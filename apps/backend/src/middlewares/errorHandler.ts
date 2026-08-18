import type {
	Request,
	Response,
	NextFunction,
	ErrorRequestHandler,
} from "express";
import { AppError } from "../errors/AppError";
import { logger } from "../tools/logger";

export const errorHandler: ErrorRequestHandler = (
	err: Error,
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	logger.error(`Error processing ${req.method} ${req.url}: ${err.message}`, {
		stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
	});

	if (err instanceof AppError) {
		res.status(err.statusCode).json({
			success: false,
			error: {
				code: err.constructor.name,
				message: err.message,
				details: err.details,
			},
			timestamp: new Date().toISOString(),
		});
		return;
	}

	res.status(500).json({
		success: false,
		error: {
			code: "InternalServerError",
			message:
				process.env.NODE_ENV === "production"
					? "Internal Server Error"
					: err.message,
		},
		timestamp: new Date().toISOString(),
	});
};
