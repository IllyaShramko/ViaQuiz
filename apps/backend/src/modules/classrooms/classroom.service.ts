import bcrypt from "bcryptjs";
import { CLASSROOM_LIMITS } from "../../config/limits";
import { BadRequestError, NotFoundError } from "../../errors/customErrors";
import {
	generateClassCode,
	generateSimplePassword,
	generateStudentLogin,
} from "../../tools/credentialsGenerator";
import { ClassroomRepository } from "./classroom.repository";
import type { ClassroomServiceContract } from "./types/classrooms.contracts";
import type { StudentAnalyticsHistoryItem } from "./types/classrooms.types";

export const ClassroomService: ClassroomServiceContract = {
	async getClassrooms(teacherId) {
		const [classrooms, activeCount, activeCoursesCount] = await Promise.all([
			ClassroomRepository.findTeacherClassrooms(teacherId),
			ClassroomRepository.countActiveTeacherClassrooms(teacherId),
			ClassroomRepository.countTeacherActiveCourses(teacherId),
		]);

		return {
			classrooms,
			limits: {
				maxClasses: CLASSROOM_LIMITS.MAX_ACTIVE_CLASSES_PER_TEACHER,
				currentActiveClasses: activeCount,
				maxTotalCourses: CLASSROOM_LIMITS.MAX_ACTIVE_COURSES_PER_TEACHER,
				currentActiveCourses: activeCoursesCount,
				maxStudentsPerClass: CLASSROOM_LIMITS.MAX_STUDENTS_PER_CLASSROOM,
				maxCoursesPerClass: CLASSROOM_LIMITS.MAX_COURSES_PER_CLASSROOM,
				maxStudentsPerCourse: CLASSROOM_LIMITS.MAX_STUDENTS_PER_COURSE,
			},
		};
	},

	async createClassroom(teacherId, data) {
		const activeCount = await ClassroomRepository.countActiveTeacherClassrooms(teacherId);
		if (activeCount >= CLASSROOM_LIMITS.MAX_ACTIVE_CLASSES_PER_TEACHER) {
			throw new BadRequestError(
				`Ви досягли максимального ліміту (${CLASSROOM_LIMITS.MAX_ACTIVE_CLASSES_PER_TEACHER}) активних класів.`,
			);
		}

		let code = data.code?.toUpperCase().trim();
		if (!code) {
			code = generateClassCode(6);
		}

		return await ClassroomRepository.createClassroom({
			name: data.name.trim(),
			code,
			teacherId,
		});
	},

	async getClassroom(uuid, teacherId) {
		const classroom = await ClassroomRepository.findClassroomByUuid(uuid, teacherId);
		if (!classroom) {
			throw new NotFoundError("Клас не знайдено");
		}
		return classroom;
	},

	async updateClassroom(uuid, teacherId, data) {
		const classroom = await ClassroomRepository.findClassroomByUuid(uuid, teacherId);
		if (!classroom) {
			throw new NotFoundError("Клас не знайдено");
		}

		if (data.isActive === true && !classroom.isActive) {
			const activeCount = await ClassroomRepository.countActiveTeacherClassrooms(teacherId);
			if (activeCount >= CLASSROOM_LIMITS.MAX_ACTIVE_CLASSES_PER_TEACHER) {
				throw new BadRequestError(
					`Ви досягли максимального ліміту (${CLASSROOM_LIMITS.MAX_ACTIVE_CLASSES_PER_TEACHER}) активних класів.`,
				);
			}
		}

		return await ClassroomRepository.updateClassroom(classroom.id, data);
	},

	async deleteClassroom(uuid, teacherId) {
		const classroom = await ClassroomRepository.findClassroomByUuid(uuid, teacherId);
		if (!classroom) {
			throw new NotFoundError("Клас не знайдено");
		}
		return await ClassroomRepository.deleteClassroom(classroom.id);
	},

	async addStudent(classUuid, teacherId, data) {
		const classroom = await ClassroomRepository.findClassroomByUuid(classUuid, teacherId);
		if (!classroom) {
			throw new NotFoundError("Клас не знайдено");
		}

		const currentStudentsCount = await ClassroomRepository.countStudentsInClassroom(classroom.id);
		if (currentStudentsCount >= CLASSROOM_LIMITS.MAX_STUDENTS_PER_CLASSROOM) {
			throw new BadRequestError(
				`У класі досягнуто ліміт у ${CLASSROOM_LIMITS.MAX_STUDENTS_PER_CLASSROOM} учнів.`,
			);
		}

		const isCustomLogin = Boolean(data.login?.trim());
		let login = data.login?.trim().toLowerCase();
		if (!login) {
			login = generateStudentLogin(data.firstName, data.lastName);
		}

		// Check uniqueness of login
		if (isCustomLogin) {
			const existing = await ClassroomRepository.findStudentByGlobalLogin(login);
			if (existing) {
				throw new BadRequestError("Учень з таким логіном вже зареєстрований у системі. Оберіть інший логін.");
			}
		}

		let finalLogin = login;
		let suffix = 1;
		while (await ClassroomRepository.findStudentByGlobalLogin(finalLogin)) {
			finalLogin = `${login}_${suffix}`;
			suffix++;
		}

		const plainPassword = data.password?.trim() || generateSimplePassword(8);
		const hashedPassword = await bcrypt.hash(plainPassword, 10);

		const student = await ClassroomRepository.createStudent({
			firstName: data.firstName.trim(),
			lastName: data.lastName.trim(),
			login: finalLogin,
			password: hashedPassword,
			classroomId: classroom.id,
		});

		return {
			student,
			credentials: {
				login: finalLogin,
				password: plainPassword,
				firstName: data.firstName.trim(),
				lastName: data.lastName.trim(),
			},
		};
	},

	async resetStudentPassword(classUuid, studentUuid, teacherId) {
		const classroom = await ClassroomRepository.findClassroomByUuid(classUuid, teacherId);
		if (!classroom) {
			throw new NotFoundError("Клас не знайдено");
		}

		const student = await ClassroomRepository.findStudentByUuid(studentUuid);
		if (!student || student.classroomId !== classroom.id) {
			throw new NotFoundError("Учня не знайдено в цьому класі");
		}

		const newPlainPassword = generateSimplePassword(8);
		const hashedPassword = await bcrypt.hash(newPlainPassword, 10);

		await ClassroomRepository.updateStudentPassword(student.id, hashedPassword);

		return {
			studentUuid,
			studentName: `${student.firstName} ${student.lastName}`,
			login: student.login,
			newPassword: newPlainPassword,
		};
	},

	async deleteStudent(classUuid, studentUuid, teacherId) {
		const classroom = await ClassroomRepository.findClassroomByUuid(classUuid, teacherId);
		if (!classroom) {
			throw new NotFoundError("Клас не знайдено");
		}

		const student = await ClassroomRepository.findStudentByUuid(studentUuid);
		if (!student || student.classroomId !== classroom.id) {
			throw new NotFoundError("Учня не знайдено в цьому класі");
		}

		return await ClassroomRepository.deleteStudent(student.id);
	},

	async getStudentAnalytics(classUuid, studentUuid, teacherId, filter) {
		const classroom = await ClassroomRepository.findClassroomByUuid(classUuid, teacherId);
		if (!classroom) {
			throw new NotFoundError("Клас не знайдено");
		}

		const student = await ClassroomRepository.findStudentByUuid(studentUuid);
		if (!student || student.classroomId !== classroom.id) {
			throw new NotFoundError("Учня не знайдено в цьому класі");
		}

		const fromDate = filter?.from ? new Date(filter.from) : undefined;
		const toDate = filter?.to ? new Date(filter.to) : undefined;

		const quizParticipants = await ClassroomRepository.findStudentQuizResults(
			student.id,
			fromDate,
			toDate,
		);

		// Calculate statistics
		const gradeCounts: Record<string, number> = {};
		let totalScoreSum = 0;
		let totalCorrectAnswers = 0;
		let totalQuestions = 0;

		const timeline: Array<{
			date: string;
			timestamp: number;
			score: number;
			grade: number;
			quizTitle: string;
		}> = [];

		const history: StudentAnalyticsHistoryItem[] = (quizParticipants || []).map((p) => {
			const res = p.result || { score: 0, correctAnswersCount: 0, totalQuestionsCount: 0 };
			const dateObj = new Date(p.joinedAt);
			const formattedDate = `${String(dateObj.getDate()).padStart(2, "0")}.${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
			const formattedFullDate = dateObj.toISOString().split("T")[0] || "";
			const formattedTime = `${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`;

			// Calculate 12-point grade or percentage
			const maxQuestions = res.totalQuestionsCount || 1;
			const grade12 = Math.round((res.correctAnswersCount / maxQuestions) * 12);
			const safeGrade = Math.max(1, Math.min(12, grade12 || 1));

			const gradeKey = `Оцінка ${safeGrade}`;
			gradeCounts[gradeKey] = (gradeCounts[gradeKey] || 0) + 1;

			totalScoreSum += res.score;
			totalCorrectAnswers += res.correctAnswersCount;
			totalQuestions += res.totalQuestionsCount;

			timeline.push({
				date: formattedFullDate,
				timestamp: dateObj.getTime(),
				score: res.score,
				grade: safeGrade,
				quizTitle: p.room?.quiz?.name || "Тест",
			});

			return {
				id: p.id,
				uuid: p.uuid,
				date: formattedDate,
				fullDate: formattedFullDate,
				joinTime: formattedTime,
				joinedAt: p.joinedAt,
				score: res.score,
				grade: safeGrade,
				correctAnswersCount: res.correctAnswersCount,
				totalQuestionsCount: res.totalQuestionsCount,
				quizTitle: p.room?.quiz?.name || "Тест",
				quizCoverImage: p.room?.quiz?.coverImg || null,
				courseName: p.room?.course?.name || "Без курсу",
			};
		});

		// Sort timeline chronologically
		timeline.sort((a, b) => a.timestamp - b.timestamp);

		const totalTests = history.length;
		const averageGrade =
			totalTests > 0
				? Number(
						(
							history.reduce((sum, h) => sum + h.grade, 0) / totalTests
						).toFixed(1),
					)
				: 0;

		const accuracyPercentage =
			totalQuestions > 0
				? Math.round((totalCorrectAnswers / totalQuestions) * 100)
				: 0;

		return {
			student: {
				id: student.id,
				uuid: student.uuid,
				firstName: student.firstName,
				lastName: student.lastName,
				login: student.login,
				classroomName: classroom.name,
				classroomId: classroom.id,
				classroomUuid: classroom.uuid,
				courses: student.courses,
			},
			stats: {
				totalTests,
				averageGrade,
				accuracyPercentage,
				totalCorrectAnswers,
				totalQuestions,
			},
			charts: {
				progress: {
					categories: timeline.map((t) => t.date),
					grades: timeline.map((t) => t.grade),
					scores: timeline.map((t) => t.score),
					quizTitles: timeline.map((t) => t.quizTitle),
				},
				distribution: {
					labels: Object.keys(gradeCounts),
					series: Object.values(gradeCounts),
				},
			},
			history,
		};
	},

	async createCourse(classUuid, teacherId, data) {
		const classroom = await ClassroomRepository.findClassroomByUuid(classUuid, teacherId);
		if (!classroom) {
			throw new NotFoundError("Клас не знайдено");
		}

		// Check teacher max active courses <= 30
		const teacherCoursesCount = await ClassroomRepository.countTeacherActiveCourses(teacherId);
		if (teacherCoursesCount >= CLASSROOM_LIMITS.MAX_ACTIVE_COURSES_PER_TEACHER) {
			throw new BadRequestError(
				`Ви досягли ліміту у ${CLASSROOM_LIMITS.MAX_ACTIVE_COURSES_PER_TEACHER} активних курсів.`,
			);
		}

		// Check classroom max courses <= 15
		const classCoursesCount = await ClassroomRepository.countClassroomCourses(classroom.id);
		if (classCoursesCount >= CLASSROOM_LIMITS.MAX_COURSES_PER_CLASSROOM) {
			throw new BadRequestError(
				`У класі досягнуто ліміт у ${CLASSROOM_LIMITS.MAX_COURSES_PER_CLASSROOM} курсів.`,
			);
		}

		// Resolve student IDs if provided
		let studentIds: number[] = [];
		if (data.studentUuids && data.studentUuids.length > 0) {
			if (data.studentUuids.length > CLASSROOM_LIMITS.MAX_STUDENTS_PER_COURSE) {
				throw new BadRequestError(
					`У курсі може бути максимум ${CLASSROOM_LIMITS.MAX_STUDENTS_PER_COURSE} учнів.`,
				);
			}

			// Validate that all studentUuids belong to this classroom
			const validClassStudents = classroom.students.filter((s) =>
				data.studentUuids!.includes(s.uuid),
			);

			studentIds = validClassStudents.map((s) => s.id);
		}

		return await ClassroomRepository.createCourse({
			name: data.name.trim(),
			classroomId: classroom.id,
			teacherId,
			studentIds,
		});
	},

	async updateCourse(classUuid, courseUuid, teacherId, data) {
		const classroom = await ClassroomRepository.findClassroomByUuid(classUuid, teacherId);
		if (!classroom) {
			throw new NotFoundError("Клас не знайдено");
		}

		const course = await ClassroomRepository.findCourseByUuid(courseUuid);
		if (!course || course.classroomId !== classroom.id) {
			throw new NotFoundError("Курс не знайдено у цьому класі");
		}

		let studentIds: number[] | undefined;
		if (data.studentUuids) {
			if (data.studentUuids.length > CLASSROOM_LIMITS.MAX_STUDENTS_PER_COURSE) {
				throw new BadRequestError(
					`У курсі може бути максимум ${CLASSROOM_LIMITS.MAX_STUDENTS_PER_COURSE} учнів.`,
				);
			}

			const validClassStudents = classroom.students.filter((s) =>
				data.studentUuids!.includes(s.uuid),
			);
			studentIds = validClassStudents.map((s) => s.id);
		}

		const updatePayload: {
			name?: string;
			isActive?: boolean;
			isArchived?: boolean;
			studentIds?: number[];
		} = {};

		if (data.name !== undefined) updatePayload.name = data.name.trim();
		if (data.isActive !== undefined) updatePayload.isActive = data.isActive;
		if (data.isArchived !== undefined) updatePayload.isArchived = data.isArchived;
		if (studentIds !== undefined) updatePayload.studentIds = studentIds;

		return await ClassroomRepository.updateCourse(course.id, updatePayload);
	},

	async deleteCourse(classUuid, courseUuid, teacherId) {
		const classroom = await ClassroomRepository.findClassroomByUuid(classUuid, teacherId);
		if (!classroom) {
			throw new NotFoundError("Клас не знайдено");
		}

		const course = await ClassroomRepository.findCourseByUuid(courseUuid);
		if (!course || course.classroomId !== classroom.id) {
			throw new NotFoundError("Курс не знайдено у цьому класі");
		}

		return await ClassroomRepository.deleteCourse(course.id);
	},
};
