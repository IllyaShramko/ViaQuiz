import jwt from "jsonwebtoken";
import { env } from "../../config/index.js";
import { UnauthorizedError } from "../../errors/index.js";

export class AuthService {
	public async login(email?: string, pass?: string) {
		if (!email || !pass) {
			throw new UnauthorizedError("Email and password are required");
		}

		const token = jwt.sign(
			{ userId: "1", email, role: "user" },
			env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

		return {
			token,
			user: { id: "1", email, role: "user" },
		};
	}
}
