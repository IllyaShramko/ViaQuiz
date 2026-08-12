import { AppError } from "./AppError";

export class BadRequestError extends AppError {
	constructor(message = "Bad Request", details?: unknown) {
		super(message, 400, true, details);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized", details?: unknown) {
		super(message, 401, true, details);
	}
}

export class ForbiddenError extends AppError {
	constructor(message = "Forbidden", details?: unknown) {
		super(message, 403, true, details);
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Resource not found", details?: unknown) {
		super(message, 404, true, details);
	}
}

export class ConflictError extends AppError {
	constructor(message = "Resource conflict", details?: unknown) {
		super(message, 409, true, details);
	}
}

export class InternalServerError extends AppError {
	constructor(message = "Internal Server Error", details?: unknown) {
		super(message, 500, false, details);
	}
}
