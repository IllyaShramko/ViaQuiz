import dotenv from "dotenv";
import { cleanEnv, str, port } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
	NODE_ENV: str({
		choices: ["development", "test", "production"],
		default: "development",
	}),
	PORT: port({ default: 3000 }),
	DATABASE_URL: str({ default: "postgresql://postgres:postgres@localhost:5432/viaquiz" }),
	JWT_SECRET: str({ default: "super-secret-viaquiz-key-change-in-production" }),
});
