import { PRISMA_CLIENT } from "../../config/database";
import { gameRedisService } from "./game-redis.service";
import { socketManager } from "../../socket/socket.manager";
import { logger } from "../../tools/logger";

export class RoomCleanupService {
	private intervalId: NodeJS.Timeout | null = null;

	/**
	 * Перевірка та автоматичне видалення кімнат, які були створені понад 30 хвилин тому
	 * і так і не були запущені (status: "AWAITING").
	 */
	public async cleanupExpiredRooms(maxAgeMinutes = 30): Promise<number> {
		try {
			const expirationThreshold = new Date(Date.now() - maxAgeMinutes * 60 * 1000);

			// Знаходимо всі кімнати в режимі очікування, які старші за 30 хвилин
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
					// 1. Сповіщаємо підключених учасників та хоста через Socket.IO
					try {
						socketManager.toRoom(room.id).emit("room:participant_kicked", {
							reason: "Кімнату автоматично закрито через 30 хвилин бездіяльності.",
						});
					} catch (socketErr) {
						// Ігноруємо помилки сокетів, якщо сокет-сервер ще не запущений
					}

					// 2. Очищаємо кеш кімнати в Redis
					await gameRedisService.clearSession(room.id);

					// 3. Видаляємо кімнату з бази даних (каскадно видалить зв'язаних учасників)
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

			// Також завершуємо закинуті сесії в прогресі старші за 6 годин
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
	 * Запуск періодичного фонового воркера очищення
	 * @param intervalMs Інтервал перевірки (за замовчуванням кожні 60 секунд)
	 */
	public startCleanupScheduler(intervalMs = 60_000): void {
		if (this.intervalId) {
			return;
		}

		logger.info(
			`[RoomCleanupService] Scheduler started. Checking for inactive rooms every ${intervalMs / 1000}s (30m max inactivity).`,
		);

		// Виконуємо очищення відразу при старті сервера
		this.cleanupExpiredRooms().catch((err) => {
			logger.error("[RoomCleanupService] Initial cleanup run failed:", err);
		});

		// Встановлюємо регулярний інтервал
		this.intervalId = setInterval(() => {
			this.cleanupExpiredRooms().catch((err) => {
				logger.error("[RoomCleanupService] Scheduled cleanup run failed:", err);
			});
		}, intervalMs);
	}

	/**
	 * Зупинка воркера при завершенні роботи сервера
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
