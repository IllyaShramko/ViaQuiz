import type { Request, Response } from "express";

export class HealthController {
	public getStatus = (_req: Request, res: Response): void => {
		res.json({
			status: "ok",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
		});
	};
}
