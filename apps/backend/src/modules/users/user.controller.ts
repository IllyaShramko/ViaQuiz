import type { Request, Response, RequestHandler } from "express";
import { UserService } from "./user.service.js";
import { asyncHandler } from "../../tools/index.js";

export class UserController {
	private userService = new UserService();

	public getUsers: RequestHandler = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
		const users = await this.userService.getAllUsers();
		res.json({
			success: true,
			data: users,
			timestamp: new Date().toISOString(),
		});
	});

	public getUserById: RequestHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ success: false, error: "Missing user ID parameter" });
			return;
		}
		const user = await this.userService.getUserById(id);
		res.json({
			success: true,
			data: user,
			timestamp: new Date().toISOString(),
		});
	});
}
