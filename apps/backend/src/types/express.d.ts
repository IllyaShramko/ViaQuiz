import type { AuthPayload, PaginationParams } from "./common";

declare global {
	namespace Express {
		interface Request {
			user?: AuthPayload;
			pagination?: PaginationParams;
		}
	}
}
