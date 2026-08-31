import { PRISMA_CLIENT } from "../../config/database";
import type { ReportsRepositoryContract } from "./types/reports.contracts";

export const ReportsRepository: ReportsRepositoryContract = {
	async findFinishedSessionsByHost(hostId: number, page: number, pageSize: number, search?: string) {
		const whereClause: any = {
			hostId,
			status: "FINISHED"
		};

		if (search) {
			whereClause.quiz = {
				name: {
					contains: search,
					mode: "insensitive"
				}
			};
		}

		const [rooms, total] = await Promise.all([
			PRISMA_CLIENT.room.findMany({
				where: whereClause,
				include: {
					quiz: {
						select: { id: true, uuid: true, name: true }
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

	async findSessionReportData(roomUuid: string, hostId: number) {
		return PRISMA_CLIENT.room.findFirst({
			where: {
				uuid: roomUuid,
				hostId
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

	async findParticipantReportData(roomUuid: string, participantId: number, hostId: number) {
		return PRISMA_CLIENT.room.findFirst({
			where: {
				uuid: roomUuid,
				hostId
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
