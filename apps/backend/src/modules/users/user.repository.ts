import { PRISMA_CLIENT } from "../../config/database";
import type { UserRepositoryContract } from "./types/users.contracts";

export const UserRepository: UserRepositoryContract = {
	async findByEmail(email) {
		return PRISMA_CLIENT.user.findUnique({
			where: { email },
		});
	},

	async findById(id) {
		return PRISMA_CLIENT.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				username: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	},

	async create(data) {
		return PRISMA_CLIENT.user.create({
			data: {
				email: data.email,
				password: data.password,
				username: data.username ?? null,
			},
			select: {
				id: true,
				email: true,
				username: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	},

	async findUsers({ skip, take }) {
		return PRISMA_CLIENT.user.findMany({
			skip,
			take,
			select: {
				id: true,
				email: true,
				username: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: { createdAt: "desc" },
		});
	},

	async countUsers() {
		return PRISMA_CLIENT.user.count();
	},
};
