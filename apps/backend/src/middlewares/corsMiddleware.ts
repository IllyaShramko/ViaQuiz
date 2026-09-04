import cors, { type CorsOptions } from "cors";
import { env } from "../config/env";
import { logger } from "../tools/logger";

/**
 * Returns a list of normalized allowed origins from environment variables and defaults.
 */
export function getAllowedOrigins(): string[] {
	const rawOrigins: string[] = [];

	if (env.CORS_ORIGIN) {
		rawOrigins.push(...env.CORS_ORIGIN.split(",").map((o) => o.trim()));
	}

	if (env.CLIENT_URL) {
		rawOrigins.push(...env.CLIENT_URL.split(",").map((o) => o.trim()));
	}

	if (env.NODE_ENV !== "production") {
		rawOrigins.push(
			"http://localhost:5173",
			"http://localhost:3000",
			"http://localhost:4173",
			"http://127.0.0.1:5173",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:4173",
		);
	}

	return Array.from(
		new Set(
			rawOrigins
				.map((o) => o.replace(/\/+$/, ""))
				.filter((o) => o.length > 0),
		),
	);
}

/**
 * Checks whether an incoming origin is allowed.
 */
export function isOriginAllowed(origin?: string): boolean {
	// Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
	if (!origin) {
		return true;
	}

	// Wildcard explicit check
	if (env.CORS_ORIGIN === "*") {
		return true;
	}

	const normalizedOrigin = origin.replace(/\/+$/, "");
	const allowedOrigins = getAllowedOrigins();

	if (allowedOrigins.includes(normalizedOrigin)) {
		return true;
	}

	// In non-production environments, allow any localhost or 127.0.0.1 port
	if (env.NODE_ENV !== "production") {
		try {
			const parsed = new URL(origin);
			if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
				return true;
			}
		} catch {
			// Ignore invalid URL
		}
	}

	return false;
}

export const corsOptions: CorsOptions = {
	origin: (origin, callback) => {
		if (isOriginAllowed(origin)) {
			callback(null, true);
		} else {
			logger.warn(`[CORS] Request from disallowed origin blocked: ${origin}`);
			callback(null, false);
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: [
		"Content-Type",
		"Authorization",
		"X-Requested-With",
		"Accept",
		"Origin",
	],
	exposedHeaders: ["Content-Range", "X-Content-Range"],
	optionsSuccessStatus: 204,
};

export const corsMiddleware = cors(corsOptions);

