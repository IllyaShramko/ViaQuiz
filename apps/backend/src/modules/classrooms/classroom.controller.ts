import { ClassroomService } from "./classroom.service";
import type { ClassroomControllerContract } from "./types/classrooms.contracts";

export const ClassroomController: ClassroomControllerContract = {
	async getClassrooms(_req, res, next) {
		try {
			const teacherId = res.locals.userId as number;
			const result = await ClassroomService.getClassrooms(teacherId);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	},

	async createClassroom(req, res, next) {
		try {
			const teacherId = res.locals.userId as number;
			const classroom = await ClassroomService.createClassroom(
				teacherId,
				req.body,
			);
			res.status(201).json(classroom);
		} catch (error) {
			next(error);
		}
	},

	async getClassroom(req, res, next) {
		try {
			const teacherId = res.locals.userId as number;
			const uuid = req.params.uuid as string;
			const classroom = await ClassroomService.getClassroom(uuid, teacherId);
			res.status(200).json(classroom);
		} catch (error) {
			next(error);
		}
	},

	async updateClassroom(req, res, next) {
		try {
			const teacherId = res.locals.userId as number;
			const uuid = req.params.uuid as string;
			const classroom = await ClassroomService.updateClassroom(
				uuid,
				teacherId,
				req.body,
			);
			res.status(200).json(classroom);
		} catch (error) {
			next(error);
		}
	},

	async deleteClassroom(req, res, next) {
		try {
			const teacherId = res.locals.userId as number;
			const uuid = req.params.uuid as string;
			await ClassroomService.deleteClassroom(uuid, teacherId);
			res.status(200).json({ message: "Клас успішно видалено" });
		} catch (error) {
			next(error);
		}
	},

	async addStudent(req, res, next) {
		try {
			const teacherId = res.locals.userId as number;
			const uuid = req.params.uuid as string;
			const result = await ClassroomService.addStudent(
				uuid,
				teacherId,
				req.body,
			);
			res.status(201).json(result);
		} catch (error) {
			next(error);
		}
	},

	async resetStudentPassword(req, res, next) {
		try {
			const teacherId = res.locals.userId as number;
			const classUuid = req.params.classUuid as string;
			const studentUuid = req.params.studentUuid as string;
			const result = await ClassroomService.resetStudentPassword(
				classUuid,
				studentUuid,
				teacherId,
			);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	},

	async deleteStudent(req, res, next) {
		try {
			const teacherId = res.locals.userId as number;
			const classUuid = req.params.classUuid as string;
			const studentUuid = req.params.studentUuid as string;
			await ClassroomService.deleteStudent(
				classUuid,
				studentUuid,
				teacherId,
			);
			res.status(200).json({ message: "Учня успішно видалено з класу" });
		} catch (error) {
			next(error);
		}
	},

	async getStudentAnalytics(req, res, next) {
		try {
			const teacherId = res.locals.userId as number;
			const classUuid = req.params.classUuid as string;
			const studentUuid = req.params.studentUuid as string;
			const filter: { from?: string; to?: string } = {};
			if (req.query.from) filter.from = String(req.query.from);
			if (req.query.to) filter.to = String(req.query.to);
			const result = await ClassroomService.getStudentAnalytics(
				classUuid,
				studentUuid,
				teacherId,
				filter,
			);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	},

	async getCourse(req, res, next) {
		try {
			const teacherId = res.locals.userId as number;
			const classUuid = req.params.classUuid as string;
			const courseUuid = req.params.courseUuid as string;
			const course = await ClassroomService.getCourse(
				classUuid,
				courseUuid,
				teacherId,
			);
			res.status(200).json(course);
		} catch (error) {
			next(error);
		}
	},

	async createCourse(req, res, next) {
		try {
			const teacherId = res.locals.userId as number;
			const uuid = req.params.uuid as string;
			const course = await ClassroomService.createCourse(
				uuid,
				teacherId,
				req.body,
			);
			res.status(201).json(course);
		} catch (error) {
			next(error);
		}
	},

	async updateCourse(req, res, next) {
		try {
			const teacherId = res.locals.userId as number;
			const classUuid = req.params.classUuid as string;
			const courseUuid = req.params.courseUuid as string;
			const course = await ClassroomService.updateCourse(
				classUuid,
				courseUuid,
				teacherId,
				req.body,
			);
			res.status(200).json(course);
		} catch (error) {
			next(error);
		}
	},

	async enrollStudentsToCourse(req, res, next) {
		try {
			const teacherId = res.locals.userId as number;
			const classUuid = req.params.classUuid as string;
			const courseUuid = req.params.courseUuid as string;
			const course = await ClassroomService.enrollStudents(
				classUuid,
				courseUuid,
				teacherId,
				req.body.studentUuids,
			);
			res.status(200).json(course);
		} catch (error) {
			next(error);
		}
	},

	async unenrollStudentFromCourse(req, res, next) {
		try {
			const teacherId = res.locals.userId as number;
			const classUuid = req.params.classUuid as string;
			const courseUuid = req.params.courseUuid as string;
			const studentUuid = req.params.studentUuid as string;
			const result = await ClassroomService.unenrollStudent(
				classUuid,
				courseUuid,
				studentUuid,
				teacherId,
			);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	},

	async deleteCourse(req, res, next) {
		try {
			const teacherId = res.locals.userId as number;
			const classUuid = req.params.classUuid as string;
			const courseUuid = req.params.courseUuid as string;
			await ClassroomService.deleteCourse(
				classUuid,
				courseUuid,
				teacherId,
			);
			res.status(200).json({ message: "Курс успішно видалено" });
		} catch (error) {
			next(error);
		}
	},
};
