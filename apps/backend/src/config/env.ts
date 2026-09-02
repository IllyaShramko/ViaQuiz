import dotenv from "dotenv";
import { cleanEnv, str, port } from "envalid";

dotenv.config();

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
	CLOUDINARY_CLOUD_NAME: str(),
	CLOUDINARY_API_KEY: str(),
	CLOUDINARY_API_SECRET: str(),
	REDIS_URL: str({
		default: "redis://localhost:6379",
	}),
	CLIENT_URL: str({
		default: "http://localhost:5173",
	}),
});
