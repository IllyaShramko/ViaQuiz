import { PRISMA_CLIENT } from "../../config/database";
import { gameRedisService } from "./game-redis.service";
import { socketManager } from "../../socket/socket.manager";
import { logger } from "../../tools/logger";

export class RoomCleanupService {
	private intervalId: NodeJS.Timeout | null = null;

	/**
	 * Check and automatically delete rooms created over 30 minutes ago
	 * that were never launched (status: "AWAITING").
	 */
	public async cleanupExpiredRooms(maxAgeMinutes = 30): Promise<number> {
		try {
			const expirationThreshold = new Date(Date.now() - maxAgeMinutes * 60 * 1000);

			// Find all awaiting rooms older than 30 minutes
			const expiredRooms = await PRISMA_CLIENT.room.findMany({
				where: {
					status: "AWAITING",
					createdAt: { lte: expirationThreshold },
				},
				select: {
					id: true,
					uuid: true,
					joinCode: true,
				},
			});

			if (expiredRooms.length === 0) {
				return 0;
			}

			logger.info(
				`[RoomCleanupService] Found ${expiredRooms.length} inactive room(s) older than ${maxAgeMinutes}m. Starting cleanup...`,
			);

			for (const room of expiredRooms) {
				try {
					// 1. Notify connected participants and host via Socket.IO
					try {
						socketManager.toRoom(room.id).emit("room:participant_kicked", {
							reason: "Кімнату автоматично закрито через 30 хвилин бездіяльності.",
						});
					} catch (socketErr) {
						// Ignore socket errors if socket server is not initialized yet
					}

					// 2. Clear room cache in Redis
					await gameRedisService.clearSession(room.id);

					// 3. Delete room from database (cascades to related participants)
					await PRISMA_CLIENT.room.delete({
						where: { id: room.id },
					});

					logger.info(
						`[RoomCleanupService] Successfully deleted expired awaiting room ID:${room.id} (Code: ${room.joinCode})`,
					);
				} catch (roomErr) {
					logger.error(
						`[RoomCleanupService] Error deleting expired room ID:${room.id}:`,
						roomErr,
					);
				}
			}

			// Also complete abandoned in-progress sessions older than 6 hours
			const abandonedThreshold = new Date(Date.now() - 6 * 60 * 60 * 1000);
			const abandonedRooms = await PRISMA_CLIENT.room.findMany({
				where: {
					status: { in: ["PROGRESS", "REVIEWING"] },
					createdAt: { lte: abandonedThreshold },
				},
				select: { id: true },
			});

			for (const room of abandonedRooms) {
				await gameRedisService.setSessionExpiry(room.id, 60);
				await PRISMA_CLIENT.room.update({
					where: { id: room.id },
					data: { status: "FINISHED", endedAt: new Date() },
				});
			}

			return expiredRooms.length;
		} catch (error) {
			logger.error("[RoomCleanupService] Error during room cleanup check:", error);
			return 0;
		}
	}

	/**
	 * Start periodic background cleanup worker
	 * @param intervalMs Check interval (defaults to every 60 seconds)
	 */
	public startCleanupScheduler(intervalMs = 60_000): void {
		if (this.intervalId) {
			return;
		}

		logger.info(
			`[RoomCleanupService] Scheduler started. Checking for inactive rooms every ${intervalMs / 1000}s (30m max inactivity).`,
		);

		// Run cleanup immediately on server startup
		this.cleanupExpiredRooms().catch((err) => {
			logger.error("[RoomCleanupService] Initial cleanup run failed:", err);
		});

		// Set regular interval
		this.intervalId = setInterval(() => {
			this.cleanupExpiredRooms().catch((err) => {
				logger.error("[RoomCleanupService] Scheduled cleanup run failed:", err);
			});
		}, intervalMs);
	}

	/**
	 * Stop worker on server shutdown
	 */
	public stopCleanupScheduler(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			logger.info("[RoomCleanupService] Scheduler stopped.");
		}
	}
}

export const roomCleanupService = new RoomCleanupService();
