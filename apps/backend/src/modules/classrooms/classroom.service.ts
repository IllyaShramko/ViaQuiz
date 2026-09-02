import bcrypt from "bcryptjs";
import { CLASSROOM_LIMITS } from "../../config/limits";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors/customErrors";
import {
	generateClassCode,
	generateSimplePassword,
	generateStudentLogin,
} from "../../tools/credentialsGenerator";
import { UserRepository } from "../users/user.repository";
import { sendCourseInvitationEmail } from "./classroom.mail";
import { ClassroomRepository } from "./classroom.repository";
import type { ClassroomServiceContract } from "./types/classrooms.contracts";
import type { StudentAnalyticsHistoryItem } from "./types/classrooms.types";

export const ClassroomService: ClassroomServiceContract = {
	async getClassrooms(teacherId) {
		const [classrooms, assignedCourses, activeCount, activeCoursesCount, pendingCount] =
			await Promise.all([
				ClassroomRepository.findTeacherClassrooms(teacherId),
				ClassroomRepository.findAssignedCoursesForTeacher(teacherId),
				ClassroomRepository.countActiveTeacherClassrooms(teacherId),
				ClassroomRepository.countTeacherActiveCourses(teacherId),
				ClassroomRepository.countPendingInvitationsForTeacher(teacherId),
			]);

		return {
			classrooms: classrooms || [],
			assignedCourses: assignedCourses || [],
			pendingInvitationsCount: pendingCount || 0,
			limits: {
				maxClasses: CLASSROOM_LIMITS.MAX_ACTIVE_CLASSES_PER_TEACHER,
				currentActiveClasses: activeCount || 0,
				maxTotalCourses: CLASSROOM_LIMITS.MAX_ACTIVE_COURSES_PER_TEACHER,
				currentActiveCourses: activeCoursesCount || 0,
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

		let finalLogin = data.login?.trim().toLowerCase();
		if (!finalLogin) {
			let attempts = 0;
			let isUnique = false;
			while (!isUnique && attempts < 10) {
				const candidate = generateStudentLogin(data.firstName, data.lastName);
				const existing = await ClassroomRepository.findStudentByGlobalLogin(candidate);
				if (!existing) {
					finalLogin = candidate;
					isUnique = true;
				}
				attempts++;
			}
			if (!finalLogin) {
				finalLogin = `student_${Math.random().toString(36).substring(2, 9)}`;
			}
		} else {
			const existing = await ClassroomRepository.findStudentByGlobalLogin(finalLogin);
			if (existing) {
				throw new BadRequestError("Учень з таким логіном вже існує в системі");
			}
		}

		let plainPassword = data.password?.trim();
		if (!plainPassword) {
			plainPassword = generateSimplePassword(8);
		}

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

		const newPassword = generateSimplePassword(8);
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		await ClassroomRepository.updateStudentPassword(student.id, hashedPassword);

		return {
			studentUuid: student.uuid,
			studentName: `${student.firstName} ${student.lastName}`,
			login: student.login,
			newPassword,
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
		const classroom = await ClassroomRepository.findClassroomByUuid(classUuid);
		if (!classroom) {
			throw new NotFoundError("Клас не знайдено");
		}

		const course = classroom.courses.find(
			(c) => c.teacherId === teacherId || c.creatorId === teacherId,
		);
		if (classroom.teacherId !== teacherId && !course) {
			throw new NotFoundError("Клас не знайдено або у вас немає доступу");
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

		timeline.sort((a, b) => a.timestamp - b.timestamp);

		const totalTests = history.length;
		const averageGrade =
			totalTests > 0
				? Number(
						(
							history.reduce((sum, item) => sum + item.grade, 0) / totalTests
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
				classroomName: student.classroom.name,
				classroomId: student.classroom.id,
				classroomUuid: student.classroom.uuid,
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

	async getCourse(classUuid, courseUuid, teacherId) {
		const course = await ClassroomRepository.findCourseByUuid(courseUuid);
		if (!course || course.classroom.uuid !== classUuid) {
			throw new NotFoundError("Курс не знайдено у цьому класі");
		}

		if (course.creatorId !== teacherId && course.teacherId !== teacherId) {
			throw new ForbiddenError("У вас немає доступу до цього курсу");
		}

		return course;
	},

	async createCourse(classUuid, teacherId, data) {
		const classroom = await ClassroomRepository.findClassroomByUuid(classUuid, teacherId);
		if (!classroom) {
			throw new NotFoundError("Клас не знайдено");
		}

		const teacherCoursesCount = await ClassroomRepository.countTeacherActiveCourses(teacherId);
		if (teacherCoursesCount >= CLASSROOM_LIMITS.MAX_ACTIVE_COURSES_PER_TEACHER) {
			throw new BadRequestError(
				`Ви досягли ліміту у ${CLASSROOM_LIMITS.MAX_ACTIVE_COURSES_PER_TEACHER} активних курсів.`,
			);
		}

		const classCoursesCount = await ClassroomRepository.countClassroomCourses(classroom.id);
		if (classCoursesCount >= CLASSROOM_LIMITS.MAX_COURSES_PER_CLASSROOM) {
			throw new BadRequestError(
				`У класі досягнуто ліміт у ${CLASSROOM_LIMITS.MAX_COURSES_PER_CLASSROOM} курсів.`,
			);
		}

		let studentIds: number[] = [];
		if (data.studentUuids && data.studentUuids.length > 0) {
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

		return await ClassroomRepository.createCourse({
			name: data.name.trim(),
			classroomId: classroom.id,
			creatorId: teacherId,
			teacherId,
			studentIds,
		});
	},

	async updateCourse(classUuid, courseUuid, teacherId, data) {
		const course = await ClassroomRepository.findCourseByUuid(courseUuid);
		if (!course || course.classroom.uuid !== classUuid) {
			throw new NotFoundError("Курс не знайдено у цьому класі");
		}

		if (course.creatorId !== teacherId && course.teacherId !== teacherId) {
			throw new ForbiddenError("У вас немає прав на редагування цього курсу");
		}

		const classroom = await ClassroomRepository.findClassroomByUuid(classUuid);
		if (!classroom) {
			throw new NotFoundError("Клас не знайдено");
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

	async enrollStudents(classUuid, courseUuid, teacherId, studentUuids) {
		const course = await ClassroomRepository.findCourseByUuid(courseUuid);
		if (!course || course.classroom.uuid !== classUuid) {
			throw new NotFoundError("Курс не знайдено у цьому класі");
		}

		if (course.creatorId !== teacherId && course.teacherId !== teacherId) {
			throw new ForbiddenError("У вас немає доступу до цього курсу");
		}

		const classroom = await ClassroomRepository.findClassroomByUuid(classUuid);
		if (!classroom) {
			throw new NotFoundError("Клас не знайдено");
		}

		const validClassStudents = classroom.students.filter((s) =>
			studentUuids.includes(s.uuid),
		);

		const currentEnrolledIds = new Set(course.students.map((s) => s.id));
		const newStudentsToAdd = validClassStudents.filter((s) => !currentEnrolledIds.has(s.id));

		if (currentEnrolledIds.size + newStudentsToAdd.length > CLASSROOM_LIMITS.MAX_STUDENTS_PER_COURSE) {
			throw new BadRequestError(
				`У курсі може бути максимум ${CLASSROOM_LIMITS.MAX_STUDENTS_PER_COURSE} учнів.`,
			);
		}

		const studentIds = newStudentsToAdd.map((s) => s.id);
		if (studentIds.length === 0) {
			return course;
		}

		return await ClassroomRepository.enrollStudentsToCourse(course.id, studentIds);
	},

	async unenrollStudent(classUuid, courseUuid, studentUuid, teacherId) {
		const course = await ClassroomRepository.findCourseByUuid(courseUuid);
		if (!course || course.classroom.uuid !== classUuid) {
			throw new NotFoundError("Курс не знайдено у цьому класі");
		}

		if (course.creatorId !== teacherId && course.teacherId !== teacherId) {
			throw new ForbiddenError("У вас немає доступу до цього курсу");
		}

		const studentToUnenroll = course.students.find((s) => s.uuid === studentUuid);
		if (!studentToUnenroll) {
			throw new NotFoundError("Учня не знайдено у цьому курсі");
		}

		await ClassroomRepository.unenrollStudentFromCourse(course.id, studentToUnenroll.id);
		return { message: "Учня успішно вилучено з курсу" };
	},

	async deleteCourse(classUuid, courseUuid, teacherId) {
		const course = await ClassroomRepository.findCourseByUuid(courseUuid);
		if (!course || course.classroom.uuid !== classUuid) {
			throw new NotFoundError("Курс не знайдено у цьому класі");
		}

		if (course.creatorId !== teacherId) {
			throw new ForbiddenError("Тільки куратор курсу може видалити його");
		}

		return await ClassroomRepository.deleteCourse(course.id);
	},

	async inviteTeacher(classUuid, courseUuid, creatorId, search) {
		const course = await ClassroomRepository.findCourseByUuid(courseUuid);
		if (!course || course.classroom.uuid !== classUuid) {
			throw new NotFoundError("Курс не знайдено у цьому класі");
		}

		if (course.creatorId !== creatorId) {
			throw new ForbiddenError("Тільки куратор курсу може надсилати запрошення");
		}

		const trimmedSearch = search.trim();
		if (!trimmedSearch) {
			throw new BadRequestError("Вкажіть логін або email викладача");
		}

		const targetUser = await ClassroomRepository.findUserByLoginOrEmail(trimmedSearch);

		if (targetUser && targetUser.id === creatorId) {
			throw new BadRequestError("Ви не можете запросити самого себе, оскільки вже є куратором курсу");
		}

		if (targetUser && course.teacherId === targetUser.id) {
			throw new BadRequestError("Цей користувач уже є ведучим викладачем курсу");
		}

		// Cancel any existing pending invitation for this course
		const existingPending = await ClassroomRepository.findPendingInvitationByCourse(course.id);
		if (existingPending) {
			await ClassroomRepository.updateInvitationStatus(existingPending.id, "CANCELED");
		}

		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days TTL

		const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedSearch);
		let receiverId: number | null = null;
		let invitedEmail: string | null = null;
		let invitedLogin: string | null = null;

		if (targetUser) {
			receiverId = targetUser.id;
			invitedEmail = targetUser.email;
			invitedLogin = targetUser.login;
		} else if (isEmail) {
			invitedEmail = trimmedSearch.toLowerCase();
		} else {
			throw new BadRequestError(
				"Користувача з таким логіном не знайдено. Якщо він ще не зареєстрований, введіть його email.",
			);
		}

		const invitation = await ClassroomRepository.createCourseInvitation({
			courseId: course.id,
			senderId: creatorId,
			receiverId,
			invitedEmail,
			invitedLogin,
			expiresAt,
		});

		const inviter = await UserRepository.findById(creatorId);
		const inviterName = inviter
			? inviter.firstName && inviter.lastName
				? `${inviter.firstName} ${inviter.lastName}`
				: inviter.login
			: "Куратор курсу";

		if (invitedEmail) {
			sendCourseInvitationEmail({
				toEmail: invitedEmail,
				courseName: course.name,
				classroomName: course.classroom.name,
				inviterName,
				isRegistered: !!targetUser,
				token: invitation.token,
			}).catch(() => {});
		}

		return {
			message: "Запрошення успішно надіслано",
			invitation,
		};
	},

	async cancelInvitation(classUuid, courseUuid, creatorId, inviteUuid) {
		const course = await ClassroomRepository.findCourseByUuid(courseUuid);
		if (!course || course.classroom.uuid !== classUuid) {
			throw new NotFoundError("Курс не знайдено у цьому класі");
		}

		if (course.creatorId !== creatorId) {
			throw new ForbiddenError("Тільки куратор курсу може скасувати запрошення");
		}

		const invitation = await ClassroomRepository.findInvitationByUuid(inviteUuid);
		if (!invitation || invitation.courseId !== course.id) {
			throw new NotFoundError("Запрошення не знайдено");
		}

		if (invitation.status !== "PENDING") {
			throw new BadRequestError("Це запрошення вже не активне");
		}

		await ClassroomRepository.updateInvitationStatus(invitation.id, "CANCELED");

		return { message: "Запрошення успішно скасовано" };
	},

	async getCourseInvitations(classUuid, courseUuid, userId) {
		const course = await ClassroomRepository.findCourseByUuid(courseUuid);
		if (!course || course.classroom.uuid !== classUuid) {
			throw new NotFoundError("Курс не знайдено у цьому класі");
		}

		if (course.creatorId !== userId) {
			throw new ForbiddenError("Тільки куратор курсу може переглядати історію запрошень");
		}

		return (await ClassroomRepository.findCourseInvitations(course.id)) || [];
	},

	async getMyPendingInvitations(userId) {
		const user = await UserRepository.findById(userId);
		if (!user) {
			throw new NotFoundError("Користувача не знайдено");
		}

		return (
			(await ClassroomRepository.findPendingInvitationsForTeacher(
				userId,
				user.email,
				user.login,
			)) || []
		);
	},

	async acceptInvitation(tokenOrUuid, userId) {
		let invitation = await ClassroomRepository.findInvitationByToken(tokenOrUuid);
		if (!invitation) {
			invitation = await ClassroomRepository.findInvitationByUuid(tokenOrUuid);
		}

		if (!invitation) {
			throw new NotFoundError("Запрошення не знайдено");
		}

		if (invitation.status !== "PENDING") {
			throw new BadRequestError(
				invitation.status === "ACCEPTED"
					? "Це запрошення вже було прийнято"
					: "Це запрошення більше не дійсне",
			);
		}

		if (new Date(invitation.expiresAt) < new Date()) {
			await ClassroomRepository.updateInvitationStatus(invitation.id, "EXPIRED");
			throw new BadRequestError("Термін дії запрошення закінчився");
		}

		const user = await UserRepository.findById(userId);
		if (!user) {
			throw new NotFoundError("Користувача не знайдено");
		}

		if (invitation.receiverId && invitation.receiverId !== userId) {
			throw new ForbiddenError("Це запрошення призначене для іншого користувача");
		}

		if (
			invitation.invitedEmail &&
			invitation.invitedEmail.toLowerCase() !== user.email.toLowerCase()
		) {
			throw new ForbiddenError("Email вашого акаунту не збігається з адресою в запрошенні");
		}

		await ClassroomRepository.updateInvitationStatus(invitation.id, "ACCEPTED", userId);
		await ClassroomRepository.updateCourseTeacher(invitation.course.id, userId);

		return {
			message: `Ви успішно прийняли керівництво курсом "${invitation.course.name}"`,
			course: {
				uuid: invitation.course.uuid,
				name: invitation.course.name,
				classUuid: invitation.course.classroom.uuid,
			},
		};
	},

	async rejectInvitation(tokenOrUuid, userId) {
		let invitation = await ClassroomRepository.findInvitationByToken(tokenOrUuid);
		if (!invitation) {
			invitation = await ClassroomRepository.findInvitationByUuid(tokenOrUuid);
		}

		if (!invitation) {
			throw new NotFoundError("Запрошення не знайдено");
		}

		if (invitation.status !== "PENDING") {
			throw new BadRequestError("Це запрошення більше не дійсне");
		}

		await ClassroomRepository.updateInvitationStatus(invitation.id, "REJECTED", userId);

		return { message: "Запрошення відхилено" };
	},

	async leaveCourse(classUuid, courseUuid, teacherId) {
		const course = await ClassroomRepository.findCourseByUuid(courseUuid);
		if (!course || course.classroom.uuid !== classUuid) {
			throw new NotFoundError("Курс не знайдено у цьому класі");
		}

		if (course.teacherId !== teacherId) {
			throw new ForbiddenError("Ви не є ведучим викладачем цього курсу");
		}

		if (course.creatorId === teacherId) {
			throw new BadRequestError(
				"Куратор курсу не може покинути його. Ви можете призначити іншого викладача або видалити курс.",
			);
		}

		await ClassroomRepository.updateCourseTeacher(course.id, course.creatorId);

		return { message: "Ви успішно покинули керівництво курсом. Керування повернуто куратору." };
	},

	async verifyInvitationToken(token) {
		const invitation = await ClassroomRepository.findInvitationByToken(token);
		if (!invitation) {
			throw new NotFoundError("Запрошення не знайдено");
		}

		if (invitation.status !== "PENDING") {
			throw new BadRequestError(
				invitation.status === "ACCEPTED"
					? "Це запрошення вже було прийнято"
					: "Це запрошення більше не дійсне",
			);
		}

		if (new Date(invitation.expiresAt) < new Date()) {
			throw new BadRequestError("Термін дії запрошення закінчився");
		}

		const senderName =
			invitation.sender.firstName && invitation.sender.lastName
				? `${invitation.sender.firstName} ${invitation.sender.lastName}`
				: invitation.sender.login;

		return {
			isValid: true,
			courseName: invitation.course.name,
			classroomName: invitation.course.classroom.name,
			senderName,
			invitedEmail: invitation.invitedEmail,
			invitedLogin: invitation.invitedLogin,
		};
	},
};
