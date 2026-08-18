import { Prisma } from "../generated/prisma";
import { AppError } from "./AppError";
import { BadRequestError, ConflictError, NotFoundError } from "./customErrors";

/**
 * Validates and transforms Prisma errors into application-specific AppErrors.
 * Catches 5 popular Prisma Known Request Error codes:
 * - P2002: Unique constraint failed
 * - P2025: Record required but not found
 * - P2003: Foreign key constraint failed
 * - P2014: Required relation constraint violated
 * - P2000 / P2011 / P2023: Invalid data input or constraint violation
 */
export function errorValidator(e: unknown): never {
	if (e instanceof AppError) {
		throw e;
	}

	if (e instanceof Prisma.PrismaClientKnownRequestError) {
		switch (e.code) {
			case "P2002": {
				const targets = Array.isArray(e.meta?.target)
					? e.meta.target.join(", ")
					: (e.meta?.target as string) || "field";
				throw new ConflictError(
					`Unique constraint failed on field(s): ${targets}`,
				);
			}
			case "P2025": {
				throw new NotFoundError("Requested record was not found");
			}
			case "P2003": {
				throw new BadRequestError("Foreign key constraint failed");
			}
			case "P2014": {
				throw new BadRequestError(
					"Required relation constraint violated",
				);
			}
			case "P2000":
			case "P2011":
			case "P2023": {
				throw new BadRequestError(
					"Invalid data provided or database constraint violation",
				);
			}
			default:
				throw e;
		}
	}

	throw e;
}
