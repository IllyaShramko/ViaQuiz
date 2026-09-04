import { PRISMA_CLIENT } from "../../config/database";
import { errorValidator } from "../../errors/errorValidator";
import { NotFoundError } from "../../errors/customErrors";
import type { StudentRepositoryContract } from "./types/students.contracts";

export const StudentRepository: StudentRepositoryContract = {
	async findByLogin(login, classCode) {
		try {
			if (classCode) {
				return await PRISMA_CLIENT.student.findFirst({
					where: {
						login,
						classroom: {
							code: classCode,
						},
					},
					include: {
						classroom: true,
					},
				});
			}

			return await PRISMA_CLIENT.student.findFirst({
				where: { login },
				include: {
					classroom: true,
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findById(id) {
		try {
			return await PRISMA_CLIENT.student.findUniqueOrThrow({
				where: { id },
				omit: { password: true },
				include: {
					classroom: {
						select: {
							id: true,
							uuid: true,
							name: true,
							code: true,
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
							createdAt: true,
						},
					},
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findStudentResults(studentId, take = 20, skip = 0, fromDate, toDate) {
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
					result: { isNot: null },
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
				take,
				skip,
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async countStudentResults(studentId, fromDate, toDate) {
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

			return await PRISMA_CLIENT.participant.count({
				where: {
					studentId,
					...dateFilter,
					result: { isNot: null },
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findStudentCourses(studentId) {
		try {
			return await PRISMA_CLIENT.course.findMany({
				where: {
					students: {
						some: { id: studentId },
					},
					isArchived: false,
				},
				include: {
					classroom: {
						select: {
							id: true,
							uuid: true,
							name: true,
						},
					},
					_count: {
						select: {
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

	async findClassroomDetails(studentId) {
		try {
			const currentStudent = await PRISMA_CLIENT.student.findUniqueOrThrow({
				where: { id: studentId },
				select: { id: true, classroomId: true },
			});

			const classroom = await PRISMA_CLIENT.classroom.findUniqueOrThrow({
				where: { id: currentStudent.classroomId },
				select: {
					id: true,
					uuid: true,
					name: true,
					code: true,
					teacher: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
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
					students: {
						select: {
							id: true,
							uuid: true,
							firstName: true,
							lastName: true,
							createdAt: true,
							_count: {
								select: {
									passedQuizes: {
										where: { result: { isNot: null } },
									},
								},
							},
						},
						orderBy: [
							{ lastName: "asc" },
							{ firstName: "asc" },
						],
					},
				},
			});

			return {
				id: classroom.id,
				uuid: classroom.uuid,
				name: classroom.name,
				code: classroom.code,
				teacher: classroom.teacher,
				courses: classroom.courses,
				classmates: classroom.students.map((s) => ({
					uuid: s.uuid,
					firstName: s.firstName,
					lastName: s.lastName,
					createdAt: s.createdAt.toISOString(),
					isMe: s.id === currentStudent.id,
					totalQuizzesPassed: s._count?.passedQuizes || 0,
				})),
			};
		} catch (e) {
			errorValidator(e);
		}
	},

	async findClassmateProfile(studentId, classmateUuid) {
		try {
			const currentStudent = await PRISMA_CLIENT.student.findUniqueOrThrow({
				where: { id: studentId },
				select: { id: true, classroomId: true },
			});

			const classmate = await PRISMA_CLIENT.student.findUnique({
				where: { uuid: classmateUuid },
				select: {
					id: true,
					uuid: true,
					firstName: true,
					lastName: true,
					createdAt: true,
					classroomId: true,
					classroom: {
						select: {
							name: true,
						},
					},
					_count: {
						select: {
							passedQuizes: {
								where: { result: { isNot: null } },
							},
						},
					},
				},
			});

			if (!classmate || classmate.classroomId !== currentStudent.classroomId) {
				throw new NotFoundError("Однокласника не знайдено у вашому класі");
			}

			return {
				uuid: classmate.uuid,
				firstName: classmate.firstName,
				lastName: classmate.lastName,
				createdAt: classmate.createdAt.toISOString(),
				classroomName: classmate.classroom.name,
				stats: {
					totalQuizzesPassed: classmate._count?.passedQuizes || 0,
				},
			};
		} catch (e) {
			errorValidator(e);
		}
	},
};

