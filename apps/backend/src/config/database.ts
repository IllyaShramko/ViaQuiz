import { PrismaClient } from "../generated/prisma/client.js";

// Initialize Prisma client with options
export const prisma = new (PrismaClient as any)({
	log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});
