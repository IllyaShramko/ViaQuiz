import http from "node:http";
import { createApp } from "./app/index.js";
import { env } from "./config/index.js";
import { socketManager } from "./socket/index.js";
import { logger } from "./tools/index.js";

const app = createApp();
const server = http.createServer(app);

socketManager.initialize(server);

server.listen(env.PORT, () => {
	logger.info(`Backend running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
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
