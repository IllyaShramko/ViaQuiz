import { redis } from "../../config/redis";
import { logger } from "../../tools/logger";

export interface RedisRoomState {
	roomId: number;
	roomUuid: string;
	status: "AWAITING" | "PROGRESS" | "REVIEWING" | "FINISHED";
	currentQuestionIndex: number;
	questionStartedAt?: number;
	timeLimitMs?: number;
	totalQuestions?: number;
}

export interface RedisParticipant {
	participantId: number;
	participantUuid: string;
	nickname: string;
	studentId?: number | null | undefined;
	isConnected: boolean;
	isBanned?: boolean | undefined;
	score: number;
}

export interface RedisAnswerData {
	participantId: number;
	variantIds: number[];
	timeSpentMs: number;
	isCorrect?: boolean | undefined;
	scoreEarned?: number | undefined;
	submittedAt: number;
}

export interface RedisQuestionData {
	questionId: number;
	text: string;
	media?: string | null | undefined;
	type: string;
	points: number;
	timeLimit: number;
	variants: Array<{
		id: number;
		text?: string | null | undefined;
		media?: string | null | undefined;
		isCorrect: boolean;
		order: number;
	}>;
}

export class GameRedisService {
	private getKey(roomId: number | string, suffix: string): string {
		return `game:room:${roomId}:${suffix}`;
	}

	/**
	 * Зберегти / оновити повний стан кімнати в Redis
	 */
	public async setRoomState(
		roomId: number,
		state: Partial<RedisRoomState>,
	): Promise<void> {
		try {
			const key = this.getKey(roomId, "state");
			const entries = Object.entries(state)
				.filter(([, v]) => v !== undefined)
				.map(([k, v]) => [
					k,
					typeof v === "object" ? JSON.stringify(v) : String(v),
				]);
			if (entries.length > 0) {
				await redis.hset(key, Object.fromEntries(entries));
			}
		} catch (error) {
			logger.error(`[GameRedisService] Error saving room state for ${roomId}:`, error);
		}
	}

	/**
	 * Отримати поточний стан кімнати з Redis
	 */
	public async getRoomState(roomId: number): Promise<RedisRoomState | null> {
		try {
			const key = this.getKey(roomId, "state");
			const raw = await redis.hgetall(key);
			if (!raw || Object.keys(raw).length === 0) return null;

			const state: RedisRoomState = {
				roomId: Number(raw.roomId || roomId),
				roomUuid: raw.roomUuid || "",
				status: (raw.status || "AWAITING") as RedisRoomState["status"],
				currentQuestionIndex: Number(raw.currentQuestionIndex || 0),
			};

			if (raw.questionStartedAt) {
				state.questionStartedAt = Number(raw.questionStartedAt);
			}
			if (raw.timeLimitMs) {
				state.timeLimitMs = Number(raw.timeLimitMs);
			}
			if (raw.totalQuestions) {
				state.totalQuestions = Number(raw.totalQuestions);
			}

			return state;
		} catch (error) {
			logger.error(`[GameRedisService] Error reading room state for ${roomId}:`, error);
			return null;
		}
	}

	/**
	 * Зберегти кеш запитання з варіантами в Redis
	 */
	public async cacheQuestion(
		roomId: number,
		questionIndex: number,
		question: RedisQuestionData,
	): Promise<void> {
		try {
			const key = this.getKey(roomId, `q:${questionIndex}:data`);
			await redis.set(key, JSON.stringify(question), "EX", 7200);
		} catch (error) {
			logger.error(`[GameRedisService] Error caching question for room ${roomId}:`, error);
		}
	}

	/**
	 * Отримати кеш запитання з Redis
	 */
	public async getCachedQuestion(
		roomId: number,
		questionIndex: number,
	): Promise<RedisQuestionData | null> {
		try {
			const key = this.getKey(roomId, `q:${questionIndex}:data`);
			const raw = await redis.get(key);
			if (!raw) return null;
			return JSON.parse(raw) as RedisQuestionData;
		} catch (error) {
			logger.error(`[GameRedisService] Error getting cached question for room ${roomId}:`, error);
			return null;
		}
	}

	/**
	 * Додати учасника до сесії в Redis
	 */
	public async addParticipant(
		roomId: number,
		participant: RedisParticipant,
	): Promise<void> {
		try {
			const key = this.getKey(roomId, "participants");
			await redis.hset(
				key,
				String(participant.participantId),
				JSON.stringify(participant),
			);
		} catch (error) {
			logger.error(
				`[GameRedisService] Error adding participant ${participant.participantId} to room ${roomId}:`,
				error,
			);
		}
	}

	/**
	 * Оновити статус підключення учасника
	 */
	public async setParticipantConnection(
		roomId: number,
		participantId: number,
		isConnected: boolean,
	): Promise<void> {
		try {
			const key = this.getKey(roomId, "participants");
			const raw = await redis.hget(key, String(participantId));
			if (raw) {
				const participant = JSON.parse(raw) as RedisParticipant;
				participant.isConnected = isConnected;
				await redis.hset(key, String(participantId), JSON.stringify(participant));
			}
		} catch (error) {
			logger.error(`[GameRedisService] Error updating participant connection:`, error);
		}
	}

	/**
	 * Позначити учасника як заблокованого (banned)
	 */
	public async banParticipant(roomId: number, participantId: number): Promise<void> {
		try {
			const key = this.getKey(roomId, "participants");
			const raw = await redis.hget(key, String(participantId));
			if (raw) {
				const participant = JSON.parse(raw) as RedisParticipant;
				participant.isBanned = true;
				participant.isConnected = false;
				await redis.hset(key, String(participantId), JSON.stringify(participant));
			}
		} catch (error) {
			logger.error(`[GameRedisService] Error banning participant:`, error);
		}
	}

	/**
	 * Отримати всіх активних учасників сесії з Redis
	 */
	public async getParticipants(roomId: number): Promise<RedisParticipant[]> {
		try {
			const key = this.getKey(roomId, "participants");
			const rawList = await redis.hvals(key);
			return rawList
				.map((item) => JSON.parse(item) as RedisParticipant)
				.filter((p) => !p.isBanned);
		} catch (error) {
			logger.error(`[GameRedisService] Error getting participants for room ${roomId}:`, error);
			return [];
		}
	}

	/**
	 * Записати відповідь учасника на конкретне питання
	 */
	public async recordAnswer(
		roomId: number,
		questionIndex: number,
		participantId: number,
		answer: RedisAnswerData,
	): Promise<{ answeredCount: number; isFirstSubmission: boolean }> {
		try {
			const key = this.getKey(roomId, `q:${questionIndex}:answers`);
			const isNew = await redis.hsetnx(
				key,
				String(participantId),
				JSON.stringify(answer),
			);
			const answeredCount = await redis.hlen(key);
			return {
				answeredCount,
				isFirstSubmission: isNew === 1,
			};
		} catch (error) {
			logger.error(
				`[GameRedisService] Error recording answer for room ${roomId}, q ${questionIndex}:`,
				error,
			);
			return { answeredCount: 0, isFirstSubmission: false };
		}
	}

	/**
	 * Отримати всі збережені відповіді на запитання
	 */
	public async getAnswersForQuestion(
		roomId: number,
		questionIndex: number,
	): Promise<Record<number, RedisAnswerData>> {
		try {
			const key = this.getKey(roomId, `q:${questionIndex}:answers`);
			const raw = await redis.hgetall(key);
			const result: Record<number, RedisAnswerData> = {};
			for (const [pId, answerJson] of Object.entries(raw)) {
				result[Number(pId)] = JSON.parse(answerJson) as RedisAnswerData;
			}
			return result;
		} catch (error) {
			logger.error(
				`[GameRedisService] Error getting answers for room ${roomId}, q ${questionIndex}:`,
				error,
			);
			return {};
		}
	}

	/**
	 * Оновити бали учасника
	 */
	public async incrementScore(
		roomId: number,
		participantId: number,
		points: number,
	): Promise<number> {
		try {
			const scoresKey = this.getKey(roomId, "scores");
			const newScore = await redis.hincrby(scoresKey, String(participantId), points);

			// Також оновлюємо об'єкт учасника в хеші participants
			const pKey = this.getKey(roomId, "participants");
			const raw = await redis.hget(pKey, String(participantId));
			if (raw) {
				const participant = JSON.parse(raw) as RedisParticipant;
				participant.score = newScore;
				await redis.hset(pKey, String(participantId), JSON.stringify(participant));
			}

			return newScore;
		} catch (error) {
			logger.error(`[GameRedisService] Error updating score:`, error);
			return 0;
		}
	}

	/**
	 * Встановити TTL для всіх ключів сесії після її завершення (наприклад, 2 години)
	 */
	public async setSessionExpiry(roomId: number, ttlSeconds = 7200): Promise<void> {
		try {
			const state = await this.getRoomState(roomId);
			const totalQ = state?.totalQuestions || 50;

			await redis.expire(this.getKey(roomId, "state"), ttlSeconds);
			await redis.expire(this.getKey(roomId, "participants"), ttlSeconds);
			await redis.expire(this.getKey(roomId, "scores"), ttlSeconds);

			for (let i = 0; i <= totalQ; i++) {
				await redis.expire(this.getKey(roomId, `q:${i}:answers`), ttlSeconds);
				await redis.expire(this.getKey(roomId, `q:${i}:data`), ttlSeconds);
			}
		} catch (error) {
			logger.error(`[GameRedisService] Error setting TTL for room ${roomId}:`, error);
		}
	}

	/**
	 * Повністю очистити тимчасові дані кімнати
	 */
	public async clearSession(roomId: number): Promise<void> {
		try {
			const state = await this.getRoomState(roomId);
			const totalQ = state?.totalQuestions || 50;
			const keysToDelete = [
				this.getKey(roomId, "state"),
				this.getKey(roomId, "participants"),
				this.getKey(roomId, "scores"),
			];
			for (let i = 0; i <= totalQ; i++) {
				keysToDelete.push(this.getKey(roomId, `q:${i}:answers`));
				keysToDelete.push(this.getKey(roomId, `q:${i}:data`));
			}
			await redis.del(...keysToDelete);
		} catch (error) {
			logger.error(`[GameRedisService] Error clearing session for room ${roomId}:`, error);
		}
	}
}

export const gameRedisService = new GameRedisService();
