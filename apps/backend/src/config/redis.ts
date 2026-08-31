import { Redis, type RedisOptions } from "ioredis";
import { env } from "./env";
import { logger } from "../tools/logger";

export const createRedisClient = (options?: RedisOptions): Redis => {
	const defaultOptions = {
		maxRetriesPerRequest: 3,
		retryStrategy(times: number): number {
			return Math.min(times * 100, 3000);
		},
		enableReadyCheck: true,
		lazyConnect: false,
	};

	const mergedOptions = options ? { ...defaultOptions, ...options } : defaultOptions;
	const client = new Redis(env.REDIS_URL, mergedOptions as never);

	client.on("connect", () => {
		logger.info(`[Redis] Connecting to Redis server at ${env.REDIS_URL}`);
	});

	client.on("ready", () => {
		logger.info("[Redis] Redis client connected and ready to receive commands");
	});

	client.on("error", (error) => {
		logger.error("[Redis] Redis connection error:", error.message);
	});

	client.on("close", () => {
		logger.warn("[Redis] Redis connection closed");
	});

	client.on("reconnecting", (time: number) => {
		logger.info(`[Redis] Reconnecting to Redis in ${time}ms...`);
	});

	return client;
};

export const redis = createRedisClient();
