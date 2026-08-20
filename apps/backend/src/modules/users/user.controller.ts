import { UserService } from "./user.service";
import { StudentRepository } from "../students/student.repository";
import type { UserControllerContract } from "./types/users.contracts";

export const UserController: UserControllerContract = {
	async checkUnique(req, res, next) {
		try {
			const result = await UserService.checkUnique(req.body);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	},

	async sendCode(req, res, next) {
		try {
			const result = await UserService.sendCode(req.body);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	},

	async register(req, res, next) {
		try {
			const tokenDTO = await UserService.register(req.body);
			res.status(201).json(tokenDTO);
		} catch (error) {
			next(error);
		}
	},

	async login(req, res, next) {
		try {
			const tokenDTO = await UserService.login(req.body);
			res.status(200).json(tokenDTO);
		} catch (error) {
			next(error);
		}
	},

	async me(_req, res, next) {
		try {
			if (res.locals.role === "STUDENT" && res.locals.studentId) {
				const student = await StudentRepository.findById(res.locals.studentId);
				res.status(200).json({
					...(student as any),
					role: "STUDENT",
				});
				return;
			}

			const user = await UserService.me(res.locals.userId!);
			res.status(200).json({
				...user,
				role: (user as any)?.role || "TEACHER",
			});
		} catch (error) {
			next(error);
		}
	},

	async getUsers(_req, res, next) {
		try {
			const { users } = await UserService.getUsers({
				skip: res.locals.skip,
				take: res.locals.take,
			});

			res.status(200).json(users);
		} catch (error) {
			next(error);
		}
	},
};
