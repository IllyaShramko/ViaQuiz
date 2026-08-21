import http from "node:http";
import { createApp } from "./app/app";
import { env } from "./config/env";
import { socketManager } from "./socket/socket.manager";
import { gameSessionsSocketController } from "./modules/game-sessions/game-sessions.socket.controller";
import { roomCleanupService } from "./modules/game-sessions/room-cleanup.service";
import { logger } from "./tools/logger";

const app = createApp();
const server = http.createServer(app);

socketManager.registerController(gameSessionsSocketController);
socketManager.initialize(server);

// Start room cleanup scheduler for inactive game rooms (30m max inactivity)
roomCleanupService.startCleanupScheduler();

server.listen(env.PORT, () => {
	logger.info(
		`Backend running in ${env.NODE_ENV} mode on http://${env.HOST}:${env.PORT}`,
	);
});

const gracefulShutdown = (signal: string) => {
	logger.info(`Received ${signal}. Shutting down server gracefully...`);
	roomCleanupService.stopCleanupScheduler();
	server.close(() => {
		logger.info("HTTP server closed.");
		process.exit(0);
	});
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

