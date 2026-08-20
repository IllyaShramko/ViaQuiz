import { PRISMA_CLIENT } from "../../config/database";
import { errorValidator } from "../../errors/errorValidator";

export const StudentRepository = {
	async findByLogin(login: string, classCode?: string) {
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

	async findById(id: number) {
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

	async findStudentResults(studentId: number, take = 20, skip = 0) {
		try {
			return await PRISMA_CLIENT.participant.findMany({
				where: {
					studentId,
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

	async countStudentResults(studentId: number) {
		try {
			return await PRISMA_CLIENT.participant.count({
				where: {
					studentId,
					result: { isNot: null },
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findStudentCourses(studentId: number) {
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
};
