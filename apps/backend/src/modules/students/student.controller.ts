import type { Request, Response } from "express";
import { StudentService } from "./student.service";

export const StudentController = {
	async login(req: Request, res: Response): Promise<void> {
		const result = await StudentService.login(req.body);
		res.status(200).json(result);
	},

	async getMe(_req: Request, res: Response): Promise<void> {
		const studentId = res.locals.studentId as number;
		const student = await StudentService.getMe(studentId);
		res.status(200).json(student);
	},

	async getDashboard(_req: Request, res: Response): Promise<void> {
		const studentId = res.locals.studentId as number;
		const dashboard = await StudentService.getDashboard(studentId);
		res.status(200).json(dashboard);
	},

	async getResults(req: Request, res: Response): Promise<void> {
		const studentId = res.locals.studentId as number;
		const take = req.query.take ? Number(req.query.take) : 20;
		const skip = req.query.skip ? Number(req.query.skip) : 0;
		const results = await StudentService.getResults(studentId, take, skip);
		res.status(200).json(results);
	},

	async getCourses(_req: Request, res: Response): Promise<void> {
		const studentId = res.locals.studentId as number;
		const courses = await StudentService.getCourses(studentId);
		res.status(200).json(courses);
	},
};
