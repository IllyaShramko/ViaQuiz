type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
	private formatMessage(
		level: LogLevel,
		message: string,
		meta?: unknown,
	): string {
		const timestamp = new Date().toISOString();
		const metaString = meta ? ` ${JSON.stringify(meta)}` : "";
		return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaString}`;
	}

	info(message: string, meta?: unknown) {
		console.log(this.formatMessage("info", message, meta));
	}

	warn(message: string, meta?: unknown) {
		console.warn(this.formatMessage("warn", message, meta));
	}

	error(message: string, meta?: unknown) {
		console.error(this.formatMessage("error", message, meta));
	}

	debug(message: string, meta?: unknown) {
		if (process.env.NODE_ENV === "development") {
			console.debug(this.formatMessage("debug", message, meta));
		}
	}
}

export const logger = new Logger();
