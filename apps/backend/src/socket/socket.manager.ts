import type { Server as HttpServer } from "node:http";
import jwt from "jsonwebtoken";
import { Server, type BroadcastOperator } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { redis, createRedisClient } from "../config/redis";
import { env } from "../config/env";
import { logger } from "../tools/logger";
import type {
	ServerSocket,
	AuthenticatedSocket,
	SocketController,
	ServerToClientEvents,
	SocketData,
} from "./socket.types";

export type GameBroadcastOperator = BroadcastOperator<
	ServerToClientEvents,
	SocketData
>;

export class SocketManager {
	private ioServer?: ServerSocket;
	private controllers: SocketController[] = [];

	public initialize(httpServer: HttpServer): ServerSocket {
		const pubClient = redis;
		const subClient = createRedisClient();

		this.ioServer = new Server(httpServer, {
			cors: {
				origin: "*",
				methods: ["GET", "POST"],
				credentials: true,
			},
			adapter: createAdapter(pubClient, subClient),
		}) as ServerSocket;

		this.setupMiddlewares();
		this.setupConnectionHandlers();

		logger.info(
			"[SocketManager] Initialized with Redis Pub/Sub adapter and room management",
		);

		return this.ioServer;
	}

	public registerController(controller: SocketController): void {
		this.controllers.push(controller);
	}

	public getIO(): ServerSocket {
		if (!this.ioServer) {
			throw new Error(
				"[SocketManager] Cannot get IO: Socket server is not initialized yet",
			);
		}
		return this.ioServer;
	}

	public toRoom(roomId: number | string): GameBroadcastOperator {
		return this.getIO().to(`room:${roomId}`);
	}

	public toHost(roomId: number | string): GameBroadcastOperator {
		return this.getIO().to(`room:host:${roomId}`);
	}

	public toParticipant(participantId: number | string): GameBroadcastOperator {
		return this.getIO().to(`participant:${participantId}`);
	}

	private setupMiddlewares(): void {
		if (!this.ioServer) return;

		this.ioServer.use(async (socket: AuthenticatedSocket, next) => {
			try {
				const token =
					socket.handshake.auth?.token ||
					socket.handshake.headers?.authorization?.replace("Bearer ", "");

				if (!token) {
					return next();
				}

				try {
					const decoded = jwt.verify(token, env.JWT_SECRET) as Record<string, unknown>;

					if (decoded.participantId) {
						// Game session token for student/guest
						socket.data.participantId = Number(decoded.participantId);
						socket.data.participantUuid = String(decoded.participantUuid || "");
						socket.data.roomId = Number(decoded.roomId);
						socket.data.roomUuid = String(decoded.roomUuid || "");
						socket.data.role = decoded.role as "STUDENT" | "ANONYMOUS";
						socket.data.nickname = String(decoded.nickname || "Participant");
						socket.data.studentId = decoded.studentId ? Number(decoded.studentId) : null;
					} else if (decoded.studentId) {
						// Logged-in student auth token
						socket.data.studentId = Number(decoded.studentId);
						socket.data.role = "STUDENT";
						socket.data.nickname = String(decoded.name || "Student");
					} else if (decoded.id || decoded.userId) {
						// Standard teacher/user auth token
						socket.data.userId = Number(decoded.id || decoded.userId);
						socket.data.role = "TEACHER";
					}
				} catch (err) {
					logger.warn("[Socket Auth Middleware] Invalid token presented", err);
				}

				return next();
			} catch (error) {
				logger.error("[Socket Auth Middleware Error]", error);
				return next();
			}
		});
	}

	private setupConnectionHandlers(): void {
		if (!this.ioServer) return;

		this.ioServer.on("connection", (socket: AuthenticatedSocket) => {
			logger.info(`[Socket Connected] Socket ID: ${socket.id}`);

			// Register custom controllers
			for (const controller of this.controllers) {
				controller.registerHandlers(socket, this.ioServer!);
			}

			socket.on("disconnect", (reason) => {
				logger.info(
					`[Socket Disconnected] Socket ID: ${socket.id}, Reason: ${reason}`,
				);
			});
		});
	}
}

export const socketManager = new SocketManager();
