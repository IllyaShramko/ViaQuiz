import http from "node:http";
import { createApp } from "./app/app";
import { env } from "./config/env";
import { socketManager } from "./socket/socket.manager";
import { logger } from "./tools/logger";

const app = createApp();
const server = http.createServer(app);

socketManager.initialize(server);

server.listen(env.PORT, () => {
	logger.info(
		`Backend running in ${env.NODE_ENV} mode on http://${env.HOST}:${env.PORT}`,
	);
});

const gracefulShutdown = (signal: string) => {
	logger.info(`Received ${signal}. Shutting down server gracefully...`);
	server.close(() => {
		logger.info("HTTP server closed.");
		process.exit(0);
	});
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
