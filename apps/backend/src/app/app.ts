import express, { type Application } from "express";
import { requestLogger, errorHandler } from "../middlewares/index.js";
import { apiRouter } from "../modules/index.js";
import { NotFoundError } from "../errors/index.js";

export function createApp(): Application {
	const app = express();

	// Middlewares
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
