import type { User } from "@viaquiz/shared-types";
import { NotFoundError } from "../../errors/index.js";

export class UserService {
	private users: User[] = [
		{
			id: "1",
			email: "admin@viaquiz.com",
			name: "Admin User",
			role: "admin",
			createdAt: new Date().toISOString(),
		},
		{
			id: "2",
			email: "user@viaquiz.com",
			name: "Demo User",
			role: "user",
			createdAt: new Date().toISOString(),
		},
	];

	public async getAllUsers(): Promise<User[]> {
		return this.users;
	}

	public async getUserById(id: string): Promise<User> {
		const user = this.users.find((u) => u.id === id);
		if (!user) {
			throw new NotFoundError(`User with ID ${id} not found`);
		}
		return user;
	}
}
