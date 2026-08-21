import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { UnauthorizedError } from "../../errors/customErrors";
import { StudentRepository } from "./student.repository";
import type { StudentServiceContract } from "./types/students.contracts";
import type {
	StudentDetailedResultItem,
	StudentRecentResultItem,
} from "./types/students.types";

const JWT_SECRET = env.JWT_SECRET;

export const StudentService: StudentServiceContract = {
	async login(credentials) {
		const studentWithPassword = await StudentRepository.findByLogin(
			credentials.login.trim().toLowerCase(),
			credentials.classCode?.trim().toUpperCase(),
		);

		if (!studentWithPassword) {
			throw new UnauthorizedError("Невірний логін або пароль");
		}

		const isPasswordValid = await bcrypt.compare(
			credentials.password,
			studentWithPassword.password,
		);

		if (!isPasswordValid) {
			throw new UnauthorizedError("Невірний логін або пароль");
		}

		const studentName = `${studentWithPassword.firstName} ${studentWithPassword.lastName}`;

		const token = jwt.sign(
			{
				studentId: studentWithPassword.id,
				role: "STUDENT",
				classroomId: studentWithPassword.classroomId,
				login: studentWithPassword.login,
				name: studentName,
			},
			JWT_SECRET,
			{
				expiresIn: "7d",
			},
		);

		const { password: _p, ...student } = studentWithPassword;

		return {
			token,
			student: {
				id: student.id,
				uuid: student.uuid,
				firstName: student.firstName,
				lastName: student.lastName,
				login: student.login,
				classroomId: student.classroomId,
				classroomName: student.classroom.name,
				classroomCode: student.classroom.code,
			},
		};
	},

	async getMe(studentId) {
		return await StudentRepository.findById(studentId);
	},

	async getDashboard(studentId) {
		const [student, recentQuizzes, totalResultsCount, courses] =
			await Promise.all([
				StudentRepository.findById(studentId),
				StudentRepository.findStudentResults(studentId, 5, 0),
				StudentRepository.countStudentResults(studentId),
				StudentRepository.findStudentCourses(studentId),
			]);

		// Calculate average grade across results
		let totalGradeSum = 0;
		const formattedRecent: StudentRecentResultItem[] = (recentQuizzes || []).map((p) => {
			const res = p.result || { score: 0, correctAnswersCount: 0, totalQuestionsCount: 0 };
			const dateObj = new Date(p.joinedAt);
			const formattedDate = `${String(dateObj.getDate()).padStart(2, "0")}.${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
			const formattedTime = `${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`;

			const maxQuestions = res.totalQuestionsCount || 1;
			const grade12 = Math.round((res.correctAnswersCount / maxQuestions) * 12);
			const safeGrade = Math.max(1, Math.min(12, grade12 || 1));

			totalGradeSum += safeGrade;

			return {
				id: p.id,
				uuid: p.uuid,
				resultUuid: p.result?.uuid || undefined,
				date: formattedDate,
				joinTime: formattedTime,
				joinedAt: p.joinedAt,
				score: res.score,
				grade: safeGrade,
				correctAnswersCount: res.correctAnswersCount,
				totalQuestionsCount: res.totalQuestionsCount,
				quizTitle: p.room?.quiz?.name || "Тест",
				quizCoverImage: p.room?.quiz?.coverImg || null,
				courseName: p.room?.course?.name || "Загальний тест",
			};
		});

		const averageGrade =
			formattedRecent.length > 0
				? Number((totalGradeSum / formattedRecent.length).toFixed(1))
				: 0;

		return {
			student: {
				id: student.id,
				uuid: student.uuid,
				firstName: student.firstName,
				lastName: student.lastName,
				login: student.login,
				classroomName: student.classroom.name,
				classroomCode: student.classroom.code,
				teacherName: student.classroom.teacher
					? `${student.classroom.teacher.firstName || ""} ${student.classroom.teacher.lastName || ""}`.trim()
					: "Вчитель",
			},
			stats: {
				totalQuizzesPassed: totalResultsCount,
				averageGrade,
				coursesCount: (courses || []).length,
			},
			recentResults: formattedRecent,
			courses: (courses || []).map((c) => ({
				id: c.id,
				uuid: c.uuid,
				name: c.name,
				roomsCount: c._count?.rooms || 0,
			})),
		};
	},

	async getResults(studentId, take = 20, skip = 0) {
		const [quizzes, total] = await Promise.all([
			StudentRepository.findStudentResults(studentId, take, skip),
			StudentRepository.countStudentResults(studentId),
		]);

		const results: StudentDetailedResultItem[] = (quizzes || []).map((p) => {
			const res = p.result || { score: 0, correctAnswersCount: 0, totalQuestionsCount: 0, uuid: "" };
			const dateObj = new Date(p.joinedAt);
			const formattedDate = `${String(dateObj.getDate()).padStart(2, "0")}.${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
			const formattedTime = `${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`;

			const maxQuestions = res.totalQuestionsCount || 1;
			const grade12 = Math.round((res.correctAnswersCount / maxQuestions) * 12);
			const safeGrade = Math.max(1, Math.min(12, grade12 || 1));

			return {
				id: p.id,
				uuid: p.uuid,
				resultUuid: p.result?.uuid || undefined,
				date: formattedDate,
				fullDate: dateObj.toISOString().split("T")[0] || "",
				joinTime: formattedTime,
				joinedAt: p.joinedAt,
				score: res.score,
				grade: safeGrade,
				correctAnswersCount: res.correctAnswersCount,
				totalQuestionsCount: res.totalQuestionsCount,
				quizTitle: p.room?.quiz?.name || "Тест",
				quizCoverImage: p.room?.quiz?.coverImg || null,
				courseName: p.room?.course?.name || "Загальний тест",
			};
		});

		return {
			results,
			total,
		};
	},

	async getCourses(studentId) {
		return await StudentRepository.findStudentCourses(studentId);
	},
};
