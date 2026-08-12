import type { Request, Response, RequestHandler } from "express";
import { AuthService } from "./auth.service.js";
import { asyncHandler } from "../../tools/index.js";

export class AuthController {
	private authService = new AuthService();

	public login: RequestHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
		const { email, password } = req.body ?? {};
		const result = await this.authService.login(email, password);
		res.json({
			success: true,
			data: result,
			timestamp: new Date().toISOString(),
		});
	});
}
