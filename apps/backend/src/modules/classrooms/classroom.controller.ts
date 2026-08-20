import type { Request, Response } from "express";
import { ClassroomService } from "./classroom.service";

export const ClassroomController = {
	async getClassrooms(_req: Request, res: Response): Promise<void> {
		const teacherId = res.locals.userId as number;
		const result = await ClassroomService.getClassrooms(teacherId);
		res.status(200).json(result);
	},

	async createClassroom(req: Request, res: Response): Promise<void> {
		const teacherId = res.locals.userId as number;
		const classroom = await ClassroomService.createClassroom(teacherId, req.body);
		res.status(201).json(classroom);
	},

	async getClassroom(req: Request, res: Response): Promise<void> {
		const teacherId = res.locals.userId as number;
		const uuid = req.params.uuid as string;
		const classroom = await ClassroomService.getClassroom(uuid, teacherId);
		res.status(200).json(classroom);
	},

	async updateClassroom(req: Request, res: Response): Promise<void> {
		const teacherId = res.locals.userId as number;
		const uuid = req.params.uuid as string;
		const classroom = await ClassroomService.updateClassroom(uuid, teacherId, req.body);
		res.status(200).json(classroom);
	},

	async deleteClassroom(req: Request, res: Response): Promise<void> {
		const teacherId = res.locals.userId as number;
		const uuid = req.params.uuid as string;
		await ClassroomService.deleteClassroom(uuid, teacherId);
		res.status(200).json({ message: "Клас успішно видалено" });
	},

	async addStudent(req: Request, res: Response): Promise<void> {
		const teacherId = res.locals.userId as number;
		const uuid = req.params.uuid as string;
		const result = await ClassroomService.addStudent(uuid, teacherId, req.body);
		res.status(201).json(result);
	},

	async resetStudentPassword(req: Request, res: Response): Promise<void> {
		const teacherId = res.locals.userId as number;
		const classUuid = req.params.classUuid as string;
		const studentUuid = req.params.studentUuid as string;
		const result = await ClassroomService.resetStudentPassword(classUuid, studentUuid, teacherId);
		res.status(200).json(result);
	},

	async deleteStudent(req: Request, res: Response): Promise<void> {
		const teacherId = res.locals.userId as number;
		const classUuid = req.params.classUuid as string;
		const studentUuid = req.params.studentUuid as string;
		await ClassroomService.deleteStudent(classUuid, studentUuid, teacherId);
		res.status(200).json({ message: "Учня успішно видалено з класу" });
	},

	async getStudentAnalytics(req: Request, res: Response): Promise<void> {
		const teacherId = res.locals.userId as number;
		const classUuid = req.params.classUuid as string;
		const studentUuid = req.params.studentUuid as string;
		const filter: { from?: string; to?: string } = {};
		if (req.query.from) filter.from = String(req.query.from);
		if (req.query.to) filter.to = String(req.query.to);
		const result = await ClassroomService.getStudentAnalytics(classUuid, studentUuid, teacherId, filter);
		res.status(200).json(result);
	},

	async createCourse(req: Request, res: Response): Promise<void> {
		const teacherId = res.locals.userId as number;
		const uuid = req.params.uuid as string;
		const course = await ClassroomService.createCourse(uuid, teacherId, req.body);
		res.status(201).json(course);
	},

	async updateCourse(req: Request, res: Response): Promise<void> {
		const teacherId = res.locals.userId as number;
		const classUuid = req.params.classUuid as string;
		const courseUuid = req.params.courseUuid as string;
		const course = await ClassroomService.updateCourse(classUuid, courseUuid, teacherId, req.body);
		res.status(200).json(course);
	},

	async deleteCourse(req: Request, res: Response): Promise<void> {
		const teacherId = res.locals.userId as number;
		const classUuid = req.params.classUuid as string;
		const courseUuid = req.params.courseUuid as string;
		await ClassroomService.deleteCourse(classUuid, courseUuid, teacherId);
		res.status(200).json({ message: "Курс успішно видалено" });
	},
};
