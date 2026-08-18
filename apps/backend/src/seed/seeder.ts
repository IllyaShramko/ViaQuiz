import { logger } from "../tools/logger";

export async function runSeed(): Promise<void> {
	logger.info("Starting database seed process...");
	// Insert initial roles, test users, or quizzes here
	logger.info("Database seeding completed successfully.");
}

if (
	process.argv[1]?.endsWith("seeder.ts") ||
	process.argv[1]?.endsWith("seeder.js")
) {
	runSeed().catch((err) => {
		logger.error("Seeding error:", err);
		process.exit(1);
	});
}
