import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../errors/customErrors";
import { UserRepository } from "./user.repository";
import type { UserServiceContract } from "./types/users.contracts";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export const UserService: UserServiceContract = {
	async register(credentials) {
		const existingUser = await UserRepository.findByEmail(credentials.email);
		if (existingUser) {
			throw new ConflictError("User with this email already exists");
		}

		const hashedPassword = await bcrypt.hash(credentials.password, 10);
		const user = await UserRepository.create({
			email: credentials.email,
			password: hashedPassword,
			username: credentials.username,
		});

		const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
			expiresIn: "7d",
		});

		return { token, user };
	},

	async login(credentials) {
		const userWithPassword = await UserRepository.findByEmail(credentials.email);
		if (!userWithPassword) {
			throw new UnauthorizedError("Invalid email or password");
		}

		const isPasswordValid = await bcrypt.compare(
			credentials.password,
			userWithPassword.password,
		);
		if (!isPasswordValid) {
			throw new UnauthorizedError("Invalid email or password");
		}

		const { password: _p, ...user } = userWithPassword;

		const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
			expiresIn: "7d",
		});

		return { token, user };
	},

	async me(userId) {
		const user = await UserRepository.findById(userId);
		if (!user) {
			throw new NotFoundError("User not found");
		}
		return user;
	},

	async getUsers(pagination) {
		const [users, total] = await Promise.all([
			UserRepository.findUsers(pagination),
			UserRepository.countUsers(),
		]);

		return { users, total };
	},
};
