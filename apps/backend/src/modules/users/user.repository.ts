import { PRISMA_CLIENT } from "../../config/database";
import { errorValidator } from "../../errors/errorValidator";
import type { UserRepositoryContract } from "./types/users.contracts";

export const UserRepository: UserRepositoryContract = {
	async findByEmail(email) {
		try {
			return await PRISMA_CLIENT.user.findUnique({
				where: { email },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findByLogin(login) {
		try {
			return await PRISMA_CLIENT.user.findUnique({
				where: { login },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findById(id) {
		try {
			return await PRISMA_CLIENT.user.findUnique({
				where: { id },
				select: {
					id: true,
					uuid: true,
					email: true,
					login: true,
					firstName: true,
					lastName: true,
					createdAt: true,
					updatedAt: true,
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async create(data) {
		try {
			return await PRISMA_CLIENT.user.create({
				data: {
					email: data.email,
					login: data.login,
					password: data.password,
					firstName: data.firstName || null,
					lastName: data.lastName || null,
				},
				select: {
					id: true,
					uuid: true,
					email: true,
					login: true,
					firstName: true,
					lastName: true,
					createdAt: true,
					updatedAt: true,
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findUsers({ skip, take }) {
		try {
			return await PRISMA_CLIENT.user.findMany({
				skip,
				take,
				select: {
					id: true,
					uuid: true,
					email: true,
					login: true,
					firstName: true,
					lastName: true,
					createdAt: true,
					updatedAt: true,
				},
				orderBy: { createdAt: "desc" },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async countUsers() {
		try {
			return await PRISMA_CLIENT.user.count();
		} catch (e) {
			errorValidator(e);
		}
	},

	async upsertVerificationCode({ email, code, expiresAt }) {
		try {
			return await PRISMA_CLIENT.verificationCode.upsert({
				where: { email },
				update: {
					code,
					attempts: 0,
					expiresAt,
					createdAt: new Date(),
				},
				create: {
					email,
					code,
					attempts: 0,
					expiresAt,
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findVerificationCodeByEmail(email) {
		try {
			return await PRISMA_CLIENT.verificationCode.findUnique({
				where: { email },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async incrementVerificationCodeAttempts(email) {
		try {
			return await PRISMA_CLIENT.verificationCode.update({
				where: { email },
				data: {
					attempts: { increment: 1 },
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async deleteVerificationCode(email) {
		try {
			return await PRISMA_CLIENT.verificationCode.delete({
				where: { email },
			});
		} catch (e) {
			// If record was already deleted/not found, ignore P2025, otherwise errorValidator(e)
			errorValidator(e);
		}
	},
};
