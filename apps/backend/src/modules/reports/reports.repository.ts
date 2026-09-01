import { PRISMA_CLIENT } from "../../config/database";
import type { ReportsRepositoryContract } from "./types/reports.contracts";

export const ReportsRepository: ReportsRepositoryContract = {
	async findFinishedSessionsByHost(
		userId: number,
		page: number,
		pageSize: number,
		search?: string,
		classUuid?: string,
		courseUuid?: string,
	) {
		const andConditions: any[] = [];

		if (search) {
			andConditions.push({
				quiz: {
					name: {
						contains: search,
						mode: "insensitive"
					}
				}
			});
		}

		if (courseUuid) {
			andConditions.push({
				course: { uuid: courseUuid }
			});
		} else if (classUuid) {
			andConditions.push({
				OR: [
					{ classroom: { uuid: classUuid } },
					{ course: { classroom: { uuid: classUuid } } }
				]
			});
		}

		const whereClause: any = {
			status: "FINISHED",
			OR: [
				{ hostId: userId },
				{ classroom: { teacherId: userId } },
				{ course: { classroom: { teacherId: userId } } }
			]
		};

		if (andConditions.length > 0) {
			whereClause.AND = andConditions;
		}

		const [rooms, total] = await Promise.all([
			PRISMA_CLIENT.room.findMany({
				where: whereClause,
				include: {
					quiz: {
						select: { id: true, uuid: true, name: true }
					},
					classroom: {
						select: { id: true, name: true }
					},
					course: {
						select: {
							id: true,
							name: true,
							classroom: {
								select: { id: true, name: true }
							}
						}
					},
					_count: {
						select: { participants: { where: { isBanned: false } } }
					},
					participants: {
						where: { isBanned: false },
						include: { result: true }
					}
				},
				orderBy: { endedAt: "desc" },
				skip: (page - 1) * pageSize,
				take: pageSize
			}),
			PRISMA_CLIENT.room.count({ where: whereClause })
		]);

		return { rooms, total };
	},

	async findSessionReportData(roomUuid: string, userId: number) {
		return PRISMA_CLIENT.room.findFirst({
			where: {
				uuid: roomUuid,
				OR: [
					{ hostId: userId },
					{ classroom: { teacherId: userId } },
					{ course: { classroom: { teacherId: userId } } }
				]
			},
			include: {
				quiz: {
					select: {
						id: true,
						uuid: true,
						name: true,
						questions: {
							orderBy: { order: "asc" },
							include: {
								variants: {
									orderBy: { order: "asc" }
								}
							}
						}
					}
				},
				classroom: {
					select: { id: true, name: true }
				},
				course: {
					select: {
						id: true,
						name: true,
						classroom: {
							select: { id: true, name: true }
						}
					}
				},
				participants: {
					where: { isBanned: false },
					select: {
						id: true,
						uuid: true,
						nickname: true,
						score: true,
						studentId: true,
						student: {
							select: { firstName: true, lastName: true }
						},
						result: {
							select: {
								score: true,
								correctAnswersCount: true,
								totalQuestionsCount: true
							}
						},
						answers: {
							include: {
								variants: {
									include: { variant: true }
								}
							}
						}
					}
				}
			}
		});
	},

	async findParticipantReportData(roomUuid: string, participantId: number, userId: number) {
		return PRISMA_CLIENT.room.findFirst({
			where: {
				uuid: roomUuid,
				OR: [
					{ hostId: userId },
					{ classroom: { teacherId: userId } },
					{ course: { classroom: { teacherId: userId } } }
				]
			},
			include: {
				quiz: {
					include: {
						author: true,
						questions: {
							include: {
								variants: true
							}
						}
					}
				},
				host: true,
				participants: {
					where: { id: participantId },
					include: {
						student: true,
						answers: {
							include: {
								variants: {
									include: { variant: true }
								}
							}
						}
					}
				}
			}
		});
	}
};
