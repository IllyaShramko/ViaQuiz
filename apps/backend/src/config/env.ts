import os from "node:os";
import dotenv from "dotenv";
import { cleanEnv, str, port } from "envalid";
import { isAutoEnvValue, resolveAutoUrl, selectLanIpv4 } from "@viaquiz/utils";

dotenv.config();

const DEFAULT_CLIENT_PORT = 5173;
const nodeEnv = process.env.NODE_ENV?.trim() || "development";
const isProduction = nodeEnv === "production";

function isExplicitAutoToken(rawValue: string | undefined): boolean {
	const trimmed = rawValue?.trim();
	if (!trimmed) {
		return false;
	}
	return isAutoEnvValue(trimmed);
}

if (isProduction) {
	for (const key of ["HOST", "CLIENT_URL", "CORS_ORIGIN"] as const) {
		const value = process.env[key];
		if (value?.split(",").some((part) => isExplicitAutoToken(part))) {
			throw new Error(
				`[env] "${key}" cannot use "auto" when NODE_ENV is "production"`,
			);
		}
	}
} else {
	const needsLanResolution =
		nodeEnv === "development" ||
		isExplicitAutoToken(process.env.HOST) ||
		isExplicitAutoToken(process.env.CLIENT_URL) ||
		isExplicitAutoToken(process.env.CORS_ORIGIN);

	if (needsLanResolution) {
		const detectedIp = selectLanIpv4(os.networkInterfaces());
		const devHost = detectedIp ?? "localhost";

		if (isAutoEnvValue(process.env.HOST)) {
			process.env.HOST = devHost;
		}
		if (isAutoEnvValue(process.env.CLIENT_URL)) {
			process.env.CLIENT_URL = resolveAutoUrl(
				process.env.CLIENT_URL,
				devHost,
				DEFAULT_CLIENT_PORT,
			);
		}

		const rawCorsOrigin = process.env.CORS_ORIGIN?.trim();
		if (!rawCorsOrigin) {
			process.env.CORS_ORIGIN = `http://${devHost}:${DEFAULT_CLIENT_PORT}`;
		} else {
			const corsParts = rawCorsOrigin
				.split(",")
				.map((part) =>
					isExplicitAutoToken(part)
						? resolveAutoUrl(part, devHost, DEFAULT_CLIENT_PORT)
						: part.trim(),
				)
				.filter((part) => part.length > 0);
			process.env.CORS_ORIGIN = corsParts.join(",");
		}
	}
}

export const env = cleanEnv(process.env, {
	NODE_ENV: str({
		choices: ["development", "test", "production"],
		default: "development",
	}),
	HOST: str({ default: "localhost" }),
	PORT: port({ default: 3000 }),
	DATABASE_URL: str({
		default: "postgresql://postgres:postgres@localhost:5432/viaquidb",
	}),
	JWT_SECRET: str({
		default: "super-secret-viaquiz-key-change-in-production",
	}),
	BREVO_SMTP_SENDER: str(),
	BREVO_SMTP_KEY: str(),
	BREVO_SMTP_LOGIN: str(),
	BREVO_SMTP_PORT: port({ default: 2525 }),
	CLOUDINARY_CLOUD_NAME: str(),
	CLOUDINARY_API_KEY: str(),
	CLOUDINARY_API_SECRET: str(),
	REDIS_URL: str({
		default: "redis://localhost:6379",
	}),
	CLIENT_URL: str({
		default: "http://localhost:5173",
	}),
	CORS_ORIGIN: str({
		default: "*",
	}),
});
