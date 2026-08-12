import type { AuthPayload } from "./common.js";

declare global {
	namespace Express {
		interface Request {
			user?: AuthPayload;
		}
	}
}
