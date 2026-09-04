import express, { type Application } from "express";
import { corsMiddleware } from "../middlewares/corsMiddleware";
import { requestLogger } from "../middlewares/loggerMiddleware";
import { errorHandler } from "../middlewares/errorHandler";
import { apiRouter } from "./routes";
import { NotFoundError } from "../errors/customErrors";

export function createApp(): Application {
	const app = express();

	// Middlewares
	app.use(corsMiddleware);
	app.options("*", corsMiddleware);
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(requestLogger);

	// API Routes
	app.use("/api", apiRouter);

	// Fallback top-level routes for backwards compatibility
	app.use("/", apiRouter);

	// 404 Handler
	app.use((_req, _res, next) => {
		next(new NotFoundError("Route not found"));
	});

	// Global Error Handler
	app.use(errorHandler);

	return app;
}
