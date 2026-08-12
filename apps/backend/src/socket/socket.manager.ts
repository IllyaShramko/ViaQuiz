import type { Server as HttpServer } from "node:http";
import { logger } from "../tools/logger";

export class SocketManager {
	private server?: HttpServer;

	public initialize(server: HttpServer): void {
		this.server = server;
		logger.info("Socket manager initialized (WebSocket/real-time layer ready)");
	}

	public emit(event: string, payload: unknown): void {
		logger.info(`[Socket Emit] ${event}`, payload);
	}
}

export const socketManager = new SocketManager();