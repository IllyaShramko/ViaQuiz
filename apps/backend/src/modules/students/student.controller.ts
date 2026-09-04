import { StudentService } from "./student.service";
import type { StudentControllerContract } from "./types/students.contracts";

export const StudentController: StudentControllerContract = {
	async login(req, res, next) {
		try {
			const result = await StudentService.login(req.body);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	},

	async getMe(_req, res, next) {
		try {
			const studentId = res.locals.studentId as number;
			const student = await StudentService.getMe(studentId);
			res.status(200).json(student);
		} catch (error) {
			next(error);
		}
	},

	async getDashboard(_req, res, next) {
		try {
			const studentId = res.locals.studentId as number;
			const dashboard = await StudentService.getDashboard(studentId);
			res.status(200).json(dashboard);
		} catch (error) {
			next(error);
		}
	},

	async getResults(req, res, next) {
		try {
			const studentId = res.locals.studentId as number;
			const take = req.query.take ? Number(req.query.take) : 20;
			const skip = req.query.skip ? Number(req.query.skip) : 0;
			const from = req.query.from ? String(req.query.from) : undefined;
			const to = req.query.to ? String(req.query.to) : undefined;
			const results = await StudentService.getResults(studentId, take, skip, from, to);
			res.status(200).json(results);
		} catch (error) {
			next(error);
		}
	},

	async getCourses(_req, res, next) {
		try {
			const studentId = res.locals.studentId as number;
			const courses = await StudentService.getCourses(studentId);
			res.status(200).json(courses);
		} catch (error) {
			next(error);
		}
	},

	async getClassroom(_req, res, next) {
		try {
			const studentId = res.locals.studentId as number;
			const classroom = await StudentService.getClassroom(studentId);
			res.status(200).json(classroom);
		} catch (error) {
			next(error);
		}
	},

	async getClassmateProfile(req, res, next) {
		try {
			const studentId = res.locals.studentId as number;
			const classmateUuid = req.params.uuid as string;
			const profile = await StudentService.getClassmateProfile(
				studentId,
				classmateUuid,
			);
			res.status(200).json(profile);
		} catch (error) {
			next(error);
		}
	},
};
