import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";
import { env } from "./env";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const PRISMA_CLIENT = new PrismaClient({
	adapter,
	log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});
