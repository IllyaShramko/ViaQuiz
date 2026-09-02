import { PRISMA_CLIENT } from "../../config/database";
import { errorValidator } from "../../errors/errorValidator";
import type { ClassroomRepositoryContract } from "./types/classrooms.contracts";

export const ClassroomRepository: ClassroomRepositoryContract = {
	async findTeacherClassrooms(teacherId) {
		try {
			return await PRISMA_CLIENT.classroom.findMany({
				where: {
					teacherId,
					isArchived: false,
				},
				include: {
					courses: {
						where: { isArchived: false },
					},
					_count: {
						select: {
							students: true,
							courses: {
								where: { isArchived: false },
							},
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findAssignedCoursesForTeacher(teacherId) {
		try {
			return await PRISMA_CLIENT.course.findMany({
				where: {
					teacherId,
					creatorId: { not: teacherId },
					isArchived: false,
				},
				include: {
					classroom: {
						select: {
							id: true,
							uuid: true,
							name: true,
							code: true,
						},
					},
					creator: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
					_count: {
						select: {
							students: true,
							rooms: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async countActiveTeacherClassrooms(teacherId) {
		try {
			return await PRISMA_CLIENT.classroom.count({
				where: {
					teacherId,
					isActive: true,
					isArchived: false,
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async countPendingInvitationsForTeacher(teacherId) {
		try {
			return await PRISMA_CLIENT.courseInvitation.count({
				where: {
					receiverId: teacherId,
					status: "PENDING",
					expiresAt: { gt: new Date() },
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findClassroomByUuid(uuid, teacherId) {
		try {
			return await PRISMA_CLIENT.classroom.findFirstOrThrow({
				where: {
					uuid,
					...(teacherId ? { teacherId } : {}),
				},
				include: {
					students: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							createdAt: true,
							_count: {
								select: {
									passedQuizes: true,
								},
							},
						},
						orderBy: [
							{ lastName: "asc" },
							{ firstName: "asc" },
						],
					},
					courses: {
						where: { isArchived: false },
						include: {
							_count: {
								select: {
									students: true,
									rooms: true,
								},
							},
						},
						orderBy: { createdAt: "desc" },
					},
					teacher: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							login: true,
						},
					},
					_count: {
						select: {
							students: true,
							courses: true,
						},
					},
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async createClassroom(data) {
		try {
			return await PRISMA_CLIENT.classroom.create({
				data: {
					name: data.name,
					code: data.code,
					teacherId: data.teacherId,
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async updateClassroom(id, data) {
		try {
			const updateData: {
				name?: string;
				isActive?: boolean;
				isArchived?: boolean;
			} = {};
			if (data.name !== undefined) updateData.name = data.name;
			if (data.isActive !== undefined) updateData.isActive = data.isActive;
			if (data.isArchived !== undefined) updateData.isArchived = data.isArchived;

			return await PRISMA_CLIENT.classroom.update({
				where: { id },
				data: updateData,
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async deleteClassroom(id) {
		try {
			return await PRISMA_CLIENT.classroom.delete({
				where: { id },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async countStudentsInClassroom(classroomId) {
		try {
			return await PRISMA_CLIENT.student.count({
				where: { classroomId },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findStudentByLoginInClassroom(classroomId, login) {
		try {
			return await PRISMA_CLIENT.student.findFirst({
				where: {
					classroomId,
					login,
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findStudentByGlobalLogin(login) {
		try {
			return await PRISMA_CLIENT.student.findUnique({
				where: { login },
				include: {
					classroom: {
						select: {
							id: true,
							uuid: true,
							name: true,
							code: true,
							teacherId: true,
						},
					},
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findStudentByUuid(uuid) {
		try {
			return await PRISMA_CLIENT.student.findUniqueOrThrow({
				where: { uuid },
				include: {
					classroom: {
						select: {
							id: true,
							uuid: true,
							name: true,
							code: true,
							teacherId: true,
							teacher: {
								select: {
									id: true,
									firstName: true,
									lastName: true,
								},
							},
						},
					},
					courses: {
						where: { isArchived: false },
						select: {
							id: true,
							uuid: true,
							name: true,
						},
					},
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async createStudent(data) {
		try {
			return await PRISMA_CLIENT.student.create({
				data: {
					firstName: data.firstName,
					lastName: data.lastName,
					login: data.login,
					password: data.password,
					classroomId: data.classroomId,
				},
				omit: { password: true },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async updateStudentPassword(studentId, hashedPassword) {
		try {
			return await PRISMA_CLIENT.student.update({
				where: { id: studentId },
				data: { password: hashedPassword },
				omit: { password: true },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async deleteStudent(studentId) {
		try {
			return await PRISMA_CLIENT.student.delete({
				where: { id: studentId },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async countTeacherActiveCourses(teacherId) {
		try {
			return await PRISMA_CLIENT.course.count({
				where: {
					teacherId,
					isActive: true,
					isArchived: false,
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async countClassroomCourses(classroomId) {
		try {
			return await PRISMA_CLIENT.course.count({
				where: {
					classroomId,
					isArchived: false,
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findCourseByUuid(uuid) {
		try {
			return await PRISMA_CLIENT.course.findUniqueOrThrow({
				where: { uuid },
				include: {
					students: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							createdAt: true,
							_count: {
								select: {
									passedQuizes: true,
								},
							},
						},
						orderBy: [
							{ lastName: "asc" },
							{ firstName: "asc" },
						],
					},
					classroom: {
						select: {
							id: true,
							uuid: true,
							name: true,
							code: true,
						},
					},
					creator: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
					teacher: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
					invitations: {
						where: {
							status: "PENDING",
						},
						select: {
							id: true,
							uuid: true,
							token: true,
							invitedEmail: true,
							invitedLogin: true,
							status: true,
							expiresAt: true,
							createdAt: true,
							receiver: {
								select: {
									id: true,
									uuid: true,
									firstName: true,
									lastName: true,
									login: true,
									email: true,
								},
							},
						},
					},
					_count: {
						select: {
							students: true,
							rooms: true,
						},
					},
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async createCourse(data) {
		try {
			const createData: {
				name: string;
				classroomId: number;
				creatorId: number;
				teacherId: number;
				students?: { connect: { id: number }[] };
			} = {
				name: data.name,
				classroomId: data.classroomId,
				creatorId: data.creatorId,
				teacherId: data.teacherId,
			};

			if (data.studentIds && data.studentIds.length > 0) {
				createData.students = {
					connect: data.studentIds.map((id) => ({ id })),
				};
			}

			return await PRISMA_CLIENT.course.create({
				data: createData,
				include: {
					students: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
						},
					},
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async updateCourse(courseId, data) {
		try {
			const updateData: {
				name?: string;
				isActive?: boolean;
				isArchived?: boolean;
				students?: { set: { id: number }[] };
			} = {};

			if (data.name !== undefined) updateData.name = data.name;
			if (data.isActive !== undefined) updateData.isActive = data.isActive;
			if (data.isArchived !== undefined) updateData.isArchived = data.isArchived;
			if (data.studentIds !== undefined) {
				updateData.students = {
					set: data.studentIds.map((id) => ({ id })),
				};
			}

			return await PRISMA_CLIENT.course.update({
				where: { id: courseId },
				data: updateData,
				include: {
					students: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
						},
					},
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async updateCourseTeacher(courseId, teacherId) {
		try {
			return await PRISMA_CLIENT.course.update({
				where: { id: courseId },
				data: { teacherId },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async enrollStudentsToCourse(courseId, studentIds) {
		try {
			return await PRISMA_CLIENT.course.update({
				where: { id: courseId },
				data: {
					students: {
						connect: studentIds.map((id) => ({ id })),
					},
				},
				include: {
					students: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							createdAt: true,
							_count: {
								select: {
									passedQuizes: true,
								},
							},
						},
						orderBy: [
							{ lastName: "asc" },
							{ firstName: "asc" },
						],
					},
					classroom: {
						select: {
							id: true,
							uuid: true,
							name: true,
							code: true,
						},
					},
					creator: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
					teacher: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
					invitations: {
						where: {
							status: "PENDING",
						},
						select: {
							id: true,
							uuid: true,
							token: true,
							invitedEmail: true,
							invitedLogin: true,
							status: true,
							expiresAt: true,
							createdAt: true,
							receiver: {
								select: {
									id: true,
									uuid: true,
									firstName: true,
									lastName: true,
									login: true,
									email: true,
								},
							},
						},
					},
					_count: {
						select: {
							students: true,
							rooms: true,
						},
					},
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async unenrollStudentFromCourse(courseId, studentId) {
		try {
			return await PRISMA_CLIENT.course.update({
				where: { id: courseId },
				data: {
					students: {
						disconnect: { id: studentId },
					},
				},
				include: {
					students: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							createdAt: true,
							_count: {
								select: {
									passedQuizes: true,
								},
							},
						},
						orderBy: [
							{ lastName: "asc" },
							{ firstName: "asc" },
						],
					},
					classroom: {
						select: {
							id: true,
							uuid: true,
							name: true,
							code: true,
						},
					},
					creator: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
					teacher: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
					invitations: {
						where: {
							status: "PENDING",
						},
						select: {
							id: true,
							uuid: true,
							token: true,
							invitedEmail: true,
							invitedLogin: true,
							status: true,
							expiresAt: true,
							createdAt: true,
							receiver: {
								select: {
									id: true,
									uuid: true,
									firstName: true,
									lastName: true,
									login: true,
									email: true,
								},
							},
						},
					},
					_count: {
						select: {
							students: true,
							rooms: true,
						},
					},
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async deleteCourse(courseId) {
		try {
			return await PRISMA_CLIENT.course.delete({
				where: { id: courseId },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findStudentQuizResults(studentId, fromDate, toDate) {
		try {
			const dateFilter = {
				...(fromDate || toDate
					? {
							joinedAt: {
								...(fromDate ? { gte: fromDate } : {}),
								...(toDate ? { lte: toDate } : {}),
							},
						}
					: {}),
			};

			return await PRISMA_CLIENT.participant.findMany({
				where: {
					studentId,
					...dateFilter,
					result: {
						isNot: null,
					},
				},
				include: {
					result: true,
					room: {
						select: {
							id: true,
							uuid: true,
							quiz: {
								select: {
									id: true,
									uuid: true,
									name: true,
									coverImg: true,
								},
							},
							course: {
								select: {
									id: true,
									uuid: true,
									name: true,
								},
							},
						},
					},
				},
				orderBy: { joinedAt: "desc" },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findUserByLoginOrEmail(search) {
		try {
			const trimmed = search.trim();
			return await PRISMA_CLIENT.user.findFirst({
				where: {
					OR: [
						{ login: trimmed },
						{ email: trimmed.toLowerCase() },
					],
				},
				select: {
					id: true,
					uuid: true,
					firstName: true,
					lastName: true,
					login: true,
					email: true,
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async createCourseInvitation(data) {
		try {
			return await PRISMA_CLIENT.courseInvitation.create({
				data: {
					courseId: data.courseId,
					senderId: data.senderId,
					receiverId: data.receiverId ?? null,
					invitedEmail: data.invitedEmail ?? null,
					invitedLogin: data.invitedLogin ?? null,
					expiresAt: data.expiresAt,
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findPendingInvitationByCourse(courseId) {
		try {
			return await PRISMA_CLIENT.courseInvitation.findFirst({
				where: {
					courseId,
					status: "PENDING",
					expiresAt: { gt: new Date() },
				},
				include: {
					course: {
						select: {
							id: true,
							uuid: true,
							name: true,
							classroom: {
								select: {
									id: true,
									uuid: true,
									name: true,
								},
							},
						},
					},
					sender: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
					receiver: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findCourseInvitations(courseId) {
		try {
			return await PRISMA_CLIENT.courseInvitation.findMany({
				where: { courseId },
				include: {
					course: {
						select: {
							id: true,
							uuid: true,
							name: true,
							classroom: {
								select: {
									id: true,
									uuid: true,
									name: true,
								},
							},
						},
					},
					sender: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
					receiver: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findInvitationByToken(token) {
		try {
			return await PRISMA_CLIENT.courseInvitation.findUnique({
				where: { token },
				include: {
					course: {
						select: {
							id: true,
							uuid: true,
							name: true,
							classroom: {
								select: {
									id: true,
									uuid: true,
									name: true,
								},
							},
						},
					},
					sender: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
					receiver: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findInvitationByUuid(uuid) {
		try {
			return await PRISMA_CLIENT.courseInvitation.findUnique({
				where: { uuid },
				include: {
					course: {
						select: {
							id: true,
							uuid: true,
							name: true,
							classroom: {
								select: {
									id: true,
									uuid: true,
									name: true,
								},
							},
						},
					},
					sender: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
					receiver: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findPendingInvitationsForTeacher(teacherId, email, login) {
		try {
			const orConditions: Array<
				| { receiverId: number }
				| { invitedEmail: string }
				| { invitedLogin: string }
			> = [{ receiverId: teacherId }];

			if (email) {
				orConditions.push({ invitedEmail: email.toLowerCase() });
			}
			if (login) {
				orConditions.push({ invitedLogin: login });
			}

			return await PRISMA_CLIENT.courseInvitation.findMany({
				where: {
					status: "PENDING",
					expiresAt: { gt: new Date() },
					OR: orConditions,
				},
				include: {
					course: {
						select: {
							id: true,
							uuid: true,
							name: true,
							classroom: {
								select: {
									id: true,
									uuid: true,
									name: true,
								},
							},
						},
					},
					sender: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
					receiver: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							login: true,
							email: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async updateInvitationStatus(id, status, receiverId) {
		try {
			return await PRISMA_CLIENT.courseInvitation.update({
				where: { id },
				data: {
					status,
					...(receiverId ? { receiverId } : {}),
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},
};
