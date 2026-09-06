import type {
	SocketController,
	AuthenticatedSocket,
	ServerSocket,
} from "../../socket/socket.types";
import { gameRedisService, type RedisQuestionData } from "./game-redis.service";
import { GameSessionsRepository } from "./game-sessions.repository";
import { PRISMA_CLIENT } from "../../config/database";
import { logger } from "../../tools/logger";
import type { ParticipantRoundAnswerDto } from "@viaquiz/shared-types";

// Store question timers in server memory by roomId
const activeRoomTimers = new Map<number, NodeJS.Timeout>();

export const gameSessionsSocketController: SocketController = {
	registerHandlers(socket: AuthenticatedSocket, ioServer: ServerSocket): void {
		/**
		 * Client joins the session
		 */
		socket.on("game:join", async (data) => {
			try {
				let targetRoom = null;

				// 1. Prioritize explicit parameters from client
				if (data?.roomUuid) {
					targetRoom = await GameSessionsRepository.findRoomByUuid(data.roomUuid);
				} else if (data?.joinCode) {
					targetRoom = await GameSessionsRepository.findRoomByJoinCode(data.joinCode);
				} else if (socket.data.roomUuid) {
					targetRoom = await GameSessionsRepository.findRoomByUuid(socket.data.roomUuid);
				} else if (socket.data.roomId) {
					targetRoom = await GameSessionsRepository.findRoomById(socket.data.roomId);
				}

				if (!targetRoom) {
					logger.warn(
						`[Socket Event game:join] Target room not found for payload: ${JSON.stringify(data)}`,
					);
					return;
				}

				const roomId = targetRoom.id;
				const previousRoomId = socket.data.roomId;

				// Leave previous room channels if socket switched to a different room
				if (previousRoomId && previousRoomId !== roomId) {
					socket.leave(`room:${previousRoomId}`);
					socket.leave(`room:host:${previousRoomId}`);
				}

				socket.data.roomId = roomId;
				socket.data.roomUuid = targetRoom.uuid;
				socket.join(`room:${roomId}`);

				let participantId = socket.data.participantId;
				const isTeacher =
					socket.data.role === "TEACHER" || socket.data.userId === targetRoom.hostId;

				if (isTeacher) {
					socket.data.role = "TEACHER";
					socket.join(`room:host:${roomId}`);
				} else {
					// Verify participant belongs to this specific room
					if (participantId) {
						const existingParticipant =
							await GameSessionsRepository.findParticipantById(participantId);
						if (!existingParticipant || existingParticipant.roomId !== roomId) {
							participantId = undefined;
							socket.data.participantId = undefined;
						}
					}

					// If participantId is not set, try to find participant by studentId for this room
					if (!participantId && (socket.data.studentId || socket.data.userId)) {
						const studentId = socket.data.studentId || socket.data.userId;
						if (studentId) {
							const existingStudentPart =
								await GameSessionsRepository.findParticipantByRoomAndStudent(
									roomId,
									studentId,
								);
							if (existingStudentPart) {
								participantId = existingStudentPart.id;
								socket.data.participantId = participantId;
								socket.data.nickname = existingStudentPart.nickname;
							}
						}
					}

					if (participantId) {
						socket.join(`participant:${participantId}`);
						await GameSessionsRepository.updateParticipantConnection(
							participantId,
							true,
						);
						await gameRedisService.setParticipantConnection(
							roomId,
							participantId,
							true,
						);
					}
				}

				let roomState = await gameRedisService.getRoomState(roomId);
				if (!roomState) {
					const quiz = await GameSessionsRepository.findQuizWithQuestions(
						targetRoom.quizId,
					);
					roomState = {
						roomId: targetRoom.id,
						roomUuid: targetRoom.uuid,
						status: targetRoom.status as any,
						currentQuestionIndex: targetRoom.currentQuestionIndex,
						totalQuestions: quiz?.questions?.length || 0,
					};
					await gameRedisService.setRoomState(roomId, roomState);
				}

				let participants = await gameRedisService.getParticipants(roomId);
				if (participants.length === 0) {
					const dbParticipants =
						await GameSessionsRepository.findParticipantsByRoomId(roomId);
					for (const p of dbParticipants) {
						await gameRedisService.addParticipant(roomId, {
							participantId: p.id,
							participantUuid: p.uuid,
							nickname: p.nickname,
							studentId: p.studentId,
							isConnected: p.isConnected,
							score: p.score,
						});
					}
					participants = await gameRedisService.getParticipants(roomId);
				}

				let currentQuestionSanitized: unknown = null;
				let alreadyAnswered = false;
				let reviewData: unknown = null;
				let answeredCount = 0;
				let answeredParticipantIds: number[] = [];
				let finishedData: unknown = null;

				if (roomState && roomState.status === "PROGRESS") {
					const cachedQ = await getOrCacheQuestion(
						roomId,
						targetRoom.quizId,
						roomState.currentQuestionIndex,
					);
					if (cachedQ) {
						const isTyped =
							cachedQ.type === "TYPE_ANSWER_V1" ||
							cachedQ.type === "TYPE_ANSWER_V2";

						currentQuestionSanitized = {
							questionId: cachedQ.questionId,
							questionIndex: roomState.currentQuestionIndex,
							totalQuestions: roomState.totalQuestions || 0,
							text: cachedQ.text,
							media: cachedQ.media,
							type: cachedQ.type,
							points: cachedQ.points,
							timeLimit: cachedQ.timeLimit,
							startedAt: roomState.questionStartedAt || Date.now(),
							variants: cachedQ.variants.map((v) => ({
								id: v.id,
								text: !isTeacher && isTyped ? "" : v.text,
								media: v.media,
								order: v.order,
							})),
						};

						const answers = await gameRedisService.getAnswersForQuestion(
							roomId,
							roomState.currentQuestionIndex,
						);
						answeredCount = Object.keys(answers).length;
						answeredParticipantIds = Object.keys(answers).map(Number);

						if (participantId) {
							alreadyAnswered = !!answers[participantId];
						}
					}
				} else if (roomState && roomState.status === "REVIEWING") {
					const cachedQ = await getOrCacheQuestion(
						roomId,
						targetRoom.quizId,
						roomState.currentQuestionIndex,
					);
					if (cachedQ) {
						currentQuestionSanitized = {
							questionId: cachedQ.questionId,
							questionIndex: roomState.currentQuestionIndex,
							totalQuestions: roomState.totalQuestions || 0,
							text: cachedQ.text,
							media: cachedQ.media,
							type: cachedQ.type,
							points: cachedQ.points,
							timeLimit: cachedQ.timeLimit,
							startedAt: roomState.questionStartedAt || Date.now(),
							variants: cachedQ.variants.map((v) => ({
								id: v.id,
								text: v.text,
								media: v.media,
								order: v.order,
							})),
						};

						const answers = await gameRedisService.getAnswersForQuestion(
							roomId,
							roomState.currentQuestionIndex,
						);
						answeredCount = Object.keys(answers).length;
						answeredParticipantIds = Object.keys(answers).map(Number);

						const correctVariantIds = cachedQ.variants
							.filter((v) => v.isCorrect)
							.map((v) => v.id);
						const correctTextAnswers = cachedQ.variants
							.filter((v) => v.text && v.text.trim().length > 0)
							.map((v) => v.text!);

						const distribution: Record<number, number> = {};
						for (const v of cachedQ.variants) {
							distribution[v.id] = 0;
						}
						for (const a of Object.values(answers)) {
							if (a.variantIds) {
								for (const vId of a.variantIds) {
									distribution[vId] = (distribution[vId] || 0) + 1;
								}
							}
						}

						let participantAnswers: ParticipantRoundAnswerDto[] | undefined = undefined;
						if (isTeacher) {
							participantAnswers = participants.map((p) => {
								const participantAnswer = answers[p.participantId];
								return {
									participantId: p.participantId,
									nickname: p.nickname,
									isAnswered: !!participantAnswer,
									variantIds: participantAnswer?.variantIds || [],
									typedAnswer: participantAnswer?.typedAnswer,
									timeSpentMs: participantAnswer?.timeSpentMs || 0,
									isCorrect: participantAnswer?.isCorrect ?? false,
									scoreEarned: participantAnswer?.scoreEarned ?? 0,
									totalScore: p.score,
								};
							});
						}

						let participantResult: unknown = undefined;
						if (participantId) {
							const myAns = answers[participantId];
							participantResult = {
								isAnswered: !!myAns,
								isCorrect: myAns?.isCorrect ?? false,
								pointsEarned: myAns?.scoreEarned ?? 0,
								timeSpentMs: myAns?.timeSpentMs ?? 0,
								selectedVariantIds: myAns?.variantIds || [],
								typedAnswer: myAns?.typedAnswer,
							};
						}

						reviewData = {
							questionIndex: roomState.currentQuestionIndex,
							correctVariantIds,
							correctTextAnswers,
							answersDistribution: distribution,
							totalAnswered: Object.keys(answers).length,
							totalParticipants: participants.length,
							participantAnswers,
							participantResult,
							myAnswer: participantId ? answers[participantId] : null,
						};
					}
				}

				let resultUuid: string | null = null;
				if (roomState && roomState.status === "FINISHED") {
					finishedData = {
						totalQuestions: roomState.totalQuestions || 0,
						leaderboard: [...participants].sort((a, b) => b.score - a.score),
					};
					if (participantId) {
						const res = await PRISMA_CLIENT.result.findUnique({
							where: { participantId },
						});
						resultUuid = res?.uuid || null;
					}
				}

				// Send state synchronization to the client
				socket.emit("game:sync_state", {
					roomState,
					participants,
					currentParticipantId: participantId,
					currentQuestion: currentQuestionSanitized,
					alreadyAnswered,
					reviewData,
					finishedData,
					answeredCount,
					answeredParticipantIds,
					resultUuid,
					isHost: isTeacher,
				});

				// Notify the room about the new participant
				if (!isTeacher && participantId && socket.data.nickname) {
					ioServer.to(`room:${roomId}`).emit("room:participant_joined", {
						participantId,
						nickname: socket.data.nickname,
						totalCount: participants.length,
					});
				}
			} catch (error) {
				logger.error("[Socket Event game:join Error]", error);
			}
		});

		/**
		 * Teacher starts the quiz
		 */
		socket.on("host:start_game", async (data) => {
			try {
				const { roomId } = data;
				const room = await GameSessionsRepository.findRoomById(roomId);
				if (!room) return;

				const quiz = await GameSessionsRepository.findQuizWithQuestions(room.quizId);
				if (!quiz || !quiz.questions || quiz.questions.length === 0) return;

				const q0 = quiz.questions[0];
				if (!q0) return;

				const now = Date.now();
				const timeLimitMs = q0.timeLimit || 30000;

				const questionData: RedisQuestionData = {
					questionId: q0.id,
					text: q0.text,
					media: q0.media,
					type: q0.type,
					points: q0.points,
					timeLimit: timeLimitMs,
					variants: q0.variants.map((v) => ({
						id: v.id,
						text: v.text,
						media: v.media,
						isCorrect: v.isCorrect,
						order: v.order,
					})),
				};

				await gameRedisService.cacheQuestion(roomId, 0, questionData);
				await gameRedisService.setRoomState(roomId, {
					status: "PROGRESS",
					currentQuestionIndex: 0,
					questionStartedAt: now,
					timeLimitMs,
					totalQuestions: quiz.questions.length,
				});
				await GameSessionsRepository.updateRoomStatus(roomId, "PROGRESS", 0);

				const isTyped0 =
					q0.type === "TYPE_ANSWER_V1" || q0.type === "TYPE_ANSWER_V2";

				// Send question to host (with full variants)
				ioServer.to(`room:host:${roomId}`).emit("game:question_started", {
					questionIndex: 0,
					totalQuestions: quiz.questions.length,
					text: q0.text,
					media: q0.media,
					type: q0.type,
					points: q0.points,
					timeLimit: timeLimitMs,
					startedAt: now,
					variants: q0.variants.map((v) => ({
						id: v.id,
						text: v.text,
						media: v.media,
						order: v.order,
					})),
				});

				// Send question to students (sanitized for text answers)
				ioServer
					.to(`room:${roomId}`)
					.except(`room:host:${roomId}`)
					.emit("game:question_started", {
						questionIndex: 0,
						totalQuestions: quiz.questions.length,
						text: q0.text,
						media: q0.media,
						type: q0.type,
						points: q0.points,
						timeLimit: timeLimitMs,
						startedAt: now,
						variants: q0.variants.map((v) => ({
							id: v.id,
							text: isTyped0 ? "" : v.text,
							media: v.media,
							order: v.order,
						})),
					});

				// Start the server timer
				startServerQuestionTimer(ioServer, roomId, 0, timeLimitMs);
			} catch (error) {
				logger.error("[Socket Event host:start_game Error]", error);
			}
		});

		/**
		 * Teacher switches to next question
		 */
		socket.on("host:next_question", async (data) => {
			try {
				const { roomId } = data;
				const room = await GameSessionsRepository.findRoomById(roomId);
				if (!room) return;

				const quiz = await GameSessionsRepository.findQuizWithQuestions(room.quizId);
				if (!quiz || !quiz.questions) return;

				const state = await gameRedisService.getRoomState(roomId);
				const nextIndex = (state?.currentQuestionIndex ?? 0) + 1;

				if (nextIndex >= quiz.questions.length) {
					// All questions completed -> finish quiz
					await finishGameSession(ioServer, roomId, quiz.questions.length);
					return;
				}

				const nextQ = quiz.questions[nextIndex];
				if (!nextQ) return;

				const now = Date.now();
				const timeLimitMs = nextQ.timeLimit || 30000;

				const questionData: RedisQuestionData = {
					questionId: nextQ.id,
					text: nextQ.text,
					media: nextQ.media,
					type: nextQ.type,
					points: nextQ.points,
					timeLimit: timeLimitMs,
					variants: nextQ.variants.map((v) => ({
						id: v.id,
						text: v.text,
						media: v.media,
						isCorrect: v.isCorrect,
						order: v.order,
					})),
				};

				await gameRedisService.cacheQuestion(roomId, nextIndex, questionData);
				await gameRedisService.setRoomState(roomId, {
					status: "PROGRESS",
					currentQuestionIndex: nextIndex,
					questionStartedAt: now,
					timeLimitMs,
				});
				await GameSessionsRepository.updateRoomStatus(roomId, "PROGRESS", nextIndex);

				const isNextTyped =
					nextQ.type === "TYPE_ANSWER_V1" || nextQ.type === "TYPE_ANSWER_V2";

				// Send question to host
				ioServer.to(`room:host:${roomId}`).emit("game:question_started", {
					questionIndex: nextIndex,
					totalQuestions: quiz.questions.length,
					text: nextQ.text,
					media: nextQ.media,
					type: nextQ.type,
					points: nextQ.points,
					timeLimit: timeLimitMs,
					startedAt: now,
					variants: nextQ.variants.map((v) => ({
						id: v.id,
						text: v.text,
						media: v.media,
						order: v.order,
					})),
				});

				// Send question to students (sanitized for text answers)
				ioServer
					.to(`room:${roomId}`)
					.except(`room:host:${roomId}`)
					.emit("game:question_started", {
						questionIndex: nextIndex,
						totalQuestions: quiz.questions.length,
						text: nextQ.text,
						media: nextQ.media,
						type: nextQ.type,
						points: nextQ.points,
						timeLimit: timeLimitMs,
						startedAt: now,
						variants: nextQ.variants.map((v) => ({
							id: v.id,
							text: isNextTyped ? "" : v.text,
							media: v.media,
							order: v.order,
						})),
					});

				startServerQuestionTimer(ioServer, roomId, nextIndex, timeLimitMs);
			} catch (error) {
				logger.error("[Socket Event host:next_question Error]", error);
			}
		});

		socket.on("host:end_question", async (data) => {
			try {
				const { roomId } = data;
				const state = await gameRedisService.getRoomState(roomId);
				if (!state || state.status !== "PROGRESS") return;

				await endQuestionRound(ioServer, roomId, state.currentQuestionIndex);
			} catch (error) {
				logger.error("[Socket Event host:end_question Error]", error);
			}
		});

		/**
		 * Teacher extends time (+15 sec)
		 */
		socket.on("host:extend_time", async (data) => {
			try {
				const { roomId, seconds = 15 } = data;
				const state = await gameRedisService.getRoomState(roomId);
				if (!state || state.status !== "PROGRESS") return;

				const MAX_TIME_MS = 900 * 1000;
				const startedAt = state.questionStartedAt || Date.now();
				const elapsed = Date.now() - startedAt;
				const currentLimit = state.timeLimitMs || 30000;
				const currentRemainingMs = Math.max(0, currentLimit - elapsed);

				if (currentRemainingMs >= MAX_TIME_MS) return;

				const addedMs = seconds * 1000;
				const remainingMs = Math.min(MAX_TIME_MS, currentRemainingMs + addedMs);
				const newLimit = elapsed + remainingMs;

				await gameRedisService.setRoomState(roomId, { timeLimitMs: newLimit });

				// Restart timer with remaining time
				startServerQuestionTimer(
					ioServer,
					roomId,
					state.currentQuestionIndex,
					remainingMs,
				);

				ioServer.to(`room:${roomId}`).emit("game:time_extended", {
					addedSeconds: Math.round((remainingMs - currentRemainingMs) / 1000),
					newRemainingMs: remainingMs,
				});
			} catch (error) {
				logger.error("[Socket Event host:extend_time Error]", error);
			}
		});

		/**
		 * Teacher kicks a participant
		 */
		socket.on("host:kick_participant", async (data) => {
			try {
				const { roomId, participantId } = data;
				await GameSessionsRepository.banParticipant(participantId);
				await gameRedisService.banParticipant(roomId, participantId);

				// Send notification to the student's personal room
				ioServer
					.to(`participant:${participantId}`)
					.emit("room:participant_kicked", {
						reason: "Вилучено організатором вікторини",
					});

				// Notify the entire room
				ioServer.to(`room:${roomId}`).emit("room:participant_left", {
					participantId,
					kicked: true,
				});
			} catch (error) {
				logger.error("[Socket Event host:kick_participant Error]", error);
			}
		});

		/**
		 * Student submits an answer
		 */
		socket.on("participant:submit_answer", async (data) => {
			try {
				const { roomId, questionIndex, variantIds, typedAnswer } = data;
				const participantId = socket.data.participantId;
				if (!participantId) return;

				const state = await gameRedisService.getRoomState(roomId);
				if (!state || state.status !== "PROGRESS") return;
				if (state.currentQuestionIndex !== questionIndex) return;

				const cachedQ = await gameRedisService.getCachedQuestion(
					roomId,
					questionIndex,
				);
				if (!cachedQ) return;

				const startedAt = state.questionStartedAt || Date.now();
				const timeSpentMs = Math.max(0, Date.now() - startedAt);
				const timeLimit = cachedQ.timeLimit || 30000;

				// Verify correctness
				const correctVariantIds = cachedQ.variants
					.filter((v) => v.isCorrect)
					.map((v) => v.id);

				let isCorrect = false;
				if (cachedQ.type === "MANY_ANSWERS") {
					const ids = variantIds || [];
					isCorrect =
						ids.length === correctVariantIds.length &&
						ids.every((id) => correctVariantIds.includes(id));
				} else if (
					cachedQ.type === "TYPE_ANSWER_V1" ||
					cachedQ.type === "TYPE_ANSWER_V2"
				) {
					if (typeof typedAnswer === "string" && typedAnswer.trim().length > 0) {
						const normalizedInput = typedAnswer
							.trim()
							.toLowerCase()
							.replace(/\s+/g, " ");
						const acceptableVariants = cachedQ.variants.filter(
							(v) => v.text && v.text.trim().length > 0,
						);
						isCorrect = acceptableVariants.some((v) => {
							const normalizedVariant = (v.text || "")
								.trim()
								.toLowerCase()
								.replace(/\s+/g, " ");
							return normalizedInput === normalizedVariant;
						});
					}
				} else {
					const ids = variantIds || [];
					const chosenId = ids[0];
					isCorrect =
						ids.length === 1 &&
						chosenId !== undefined &&
						correctVariantIds.includes(chosenId);
				}

				// Calculate speed points
				let scoreEarned = 0;
				if (isCorrect) {
					const basePoints = cachedQ.points || 1000;
					const speedFactor = Math.max(0, (timeLimit - timeSpentMs) / timeLimit);
					scoreEarned = Math.max(
						100,
						Math.round(basePoints * (0.5 + 0.5 * speedFactor)),
					);
					await gameRedisService.incrementScore(roomId, participantId, scoreEarned);
				}

				const { answeredCount, isFirstSubmission } =
					await gameRedisService.recordAnswer(roomId, questionIndex, participantId, {
						participantId,
						variantIds,
						typedAnswer,
						timeSpentMs,
						isCorrect,
						scoreEarned,
						submittedAt: Date.now(),
					});

				if (!isFirstSubmission) return;

				const activeParticipants = await gameRedisService.getParticipants(roomId);

				// Notify host about response progress
				ioServer.to(`room:host:${roomId}`).emit("game:answer_received", {
					participantId,
					answeredCount,
					totalParticipants: activeParticipants.length,
				});

				// If all active students answered -> end the round early!
				if (
					activeParticipants.length > 0 &&
					answeredCount >= activeParticipants.length
				) {
					await endQuestionRound(ioServer, roomId, questionIndex);
				}
			} catch (error) {
				logger.error("[Socket Event participant:submit_answer Error]", error);
			}
		});

		/**
		 * Socket disconnection
		 */
		socket.on("disconnect", async () => {
			try {
				const { roomId, participantId } = socket.data;
				if (roomId && participantId) {
					await GameSessionsRepository.updateParticipantConnection(participantId, false);
					await gameRedisService.setParticipantConnection(roomId, participantId, false);
				}
			} catch (error) {
				logger.error("[Socket Disconnect Handler Error]", error);
			}
		});
	},
};

/**
 * Get cached question or fetch from database and cache it
 */
async function getOrCacheQuestion(
	roomId: number,
	quizId: number,
	questionIndex: number,
): Promise<RedisQuestionData | null> {
	let cachedQ = await gameRedisService.getCachedQuestion(roomId, questionIndex);
	if (!cachedQ) {
		const quiz = await GameSessionsRepository.findQuizWithQuestions(quizId);
		const q = quiz?.questions?.[questionIndex];
		if (q) {
			const timeLimitMs = q.timeLimit || 30000;
			cachedQ = {
				questionId: q.id,
				text: q.text,
				media: q.media,
				type: q.type,
				points: q.points,
				timeLimit: timeLimitMs,
				variants: q.variants.map((v) => ({
					id: v.id,
					text: v.text,
					media: v.media,
					isCorrect: v.isCorrect,
					order: v.order,
				})),
			};
			await gameRedisService.cacheQuestion(roomId, questionIndex, cachedQ);
		}
	}
	return cachedQ;
}

/**
 * Start server timer for a question
 */
function startServerQuestionTimer(
	ioServer: ServerSocket,
	roomId: number,
	questionIndex: number,
	durationMs: number,
): void {
	if (activeRoomTimers.has(roomId)) {
		clearTimeout(activeRoomTimers.get(roomId)!);
	}

	const timer = setTimeout(async () => {
		try {
			await endQuestionRound(ioServer, roomId, questionIndex);
		} catch (err) {
			logger.error(`[Question Timer Error for room ${roomId}]`, err);
		}
	}, durationMs + 500); // 500ms network buffer

	activeRoomTimers.set(roomId, timer);
}

/**
 * End question round -> transition to REVIEWING status
 */
async function endQuestionRound(
	ioServer: ServerSocket,
	roomId: number,
	questionIndex: number,
): Promise<void> {
	if (activeRoomTimers.has(roomId)) {
		clearTimeout(activeRoomTimers.get(roomId)!);
		activeRoomTimers.delete(roomId);
	}

	const state = await gameRedisService.getRoomState(roomId);
	if (!state || state.status !== "PROGRESS") return;

	await gameRedisService.setRoomState(roomId, { status: "REVIEWING" });
	await GameSessionsRepository.updateRoomStatus(roomId, "REVIEWING", questionIndex);

	const room = await GameSessionsRepository.findRoomById(roomId);
	const cachedQ = room
		? await getOrCacheQuestion(roomId, room.quizId, questionIndex)
		: await gameRedisService.getCachedQuestion(roomId, questionIndex);
	if (!cachedQ) return;

	const answers = await gameRedisService.getAnswersForQuestion(
		roomId,
		questionIndex,
	);
	const correctVariantIds = cachedQ.variants
		.filter((v) => v.isCorrect)
		.map((v) => v.id);
	const correctTextAnswers = cachedQ.variants
		.filter((v) => v.text && v.text.trim().length > 0)
		.map((v) => v.text!);

	// Answer distribution across options for the pie/bar chart
	const distribution: Record<number, number> = {};
	for (const v of cachedQ.variants) {
		distribution[v.id] = 0;
	}
	for (const a of Object.values(answers)) {
		if (a.variantIds) {
			for (const vId of a.variantIds) {
				distribution[vId] = (distribution[vId] || 0) + 1;
			}
		}
	}

	const participants = await gameRedisService.getParticipants(roomId);

	// Detailed answers of each participant for the host
	const participantAnswers: ParticipantRoundAnswerDto[] = participants.map((p) => {
		const participantAnswer = answers[p.participantId];
		return {
			participantId: p.participantId,
			nickname: p.nickname,
			isAnswered: !!participantAnswer,
			variantIds: participantAnswer?.variantIds || [],
			typedAnswer: participantAnswer?.typedAnswer,
			timeSpentMs: participantAnswer?.timeSpentMs || 0,
			isCorrect: participantAnswer?.isCorrect ?? false,
			scoreEarned: participantAnswer?.scoreEarned ?? 0,
			totalScore: p.score,
		};
	});

	// Event for the host with detailed results of all participants
	ioServer.to(`room:host:${roomId}`).emit("game:question_ended", {
		questionIndex,
		correctVariantIds,
		correctTextAnswers,
		answersDistribution: distribution,
		totalAnswered: Object.keys(answers).length,
		totalParticipants: participants.length,
		participantAnswers,
	});

	// General event for students (excluding host)
	ioServer
		.to(`room:${roomId}`)
		.except(`room:host:${roomId}`)
		.emit("game:question_ended", {
			questionIndex,
			correctVariantIds,
			correctTextAnswers,
			answersDistribution: distribution,
			totalAnswered: Object.keys(answers).length,
			totalParticipants: participants.length,
		});

	// Send personal results to each student in their private participant:id room
	for (const p of participants) {
		const participantAnswer = answers[p.participantId];
		const isCorrect = participantAnswer?.isCorrect ?? false;
		const pointsEarned = participantAnswer?.scoreEarned ?? 0;
		const timeSpentMs = participantAnswer?.timeSpentMs ?? 0;

		ioServer.to(`participant:${p.participantId}`).emit("game:question_ended", {
			questionIndex,
			correctVariantIds,
			correctTextAnswers,
			answersDistribution: distribution,
			participantResult: {
				isAnswered: !!participantAnswer,
				isCorrect,
				pointsEarned,
				timeSpentMs,
				selectedVariantIds: participantAnswer?.variantIds || [],
				typedAnswer: participantAnswer?.typedAnswer,
			},
		});
	}
}

/**
 * Finish entire quiz -> save to PostgreSQL and produce final leaderboard
 */
async function finishGameSession(
	ioServer: ServerSocket,
	roomId: number,
	totalQuestions: number,
): Promise<void> {
	if (activeRoomTimers.has(roomId)) {
		clearTimeout(activeRoomTimers.get(roomId)!);
		activeRoomTimers.delete(roomId);
	}

	await gameRedisService.setRoomState(roomId, { status: "FINISHED" });
	await GameSessionsRepository.updateRoomStatus(roomId, "FINISHED");

	const room = await GameSessionsRepository.findRoomById(roomId);
	const quiz = room ? await GameSessionsRepository.findQuizWithQuestions(room.quizId) : null;
	const questions = quiz?.questions || [];
	const actualTotalQuestions = questions.length > 0 ? questions.length : totalQuestions;

	const participants = await gameRedisService.getParticipants(roomId);

	// Save results for each participant to PostgreSQL
	for (const p of participants) {
		let totalCorrect = 0;
		let totalTime = 0;

		for (let i = 0; i < actualTotalQuestions; i++) {
			const q = questions[i];
			if (!q) continue;

			const answers = await gameRedisService.getAnswersForQuestion(roomId, i);
			const ans = answers[p.participantId];
			const hasAnswer =
				ans &&
				((ans.variantIds && ans.variantIds.length > 0) ||
					(typeof ans.typedAnswer === "string" && ans.typedAnswer.trim().length > 0));

			if (hasAnswer && ans) {
				totalTime += ans.timeSpentMs;
				if (ans.isCorrect) totalCorrect++;

				await GameSessionsRepository.saveAnswer({
					participantId: p.participantId,
					questionId: q.id,
					variantIds: ans.variantIds,
					typedAnswer: ans.typedAnswer,
					timeSpentMs: ans.timeSpentMs,
					scoreEarned: ans.scoreEarned ?? 0,
					isCorrect: !!ans.isCorrect,
					isSkipped: false,
				});
			} else {
				// Question skipped (no answer submitted)
				await GameSessionsRepository.saveAnswer({
					participantId: p.participantId,
					questionId: q.id,
					timeSpentMs: ans?.timeSpentMs || 0,
					scoreEarned: 0,
					isCorrect: false,
					isSkipped: true,
				});
			}
		}

		const savedResult = await GameSessionsRepository.saveResult({
			roomId,
			participantId: p.participantId,
			score: p.score,
			correctAnswersCount: totalCorrect,
			totalQuestionsCount: actualTotalQuestions,
		});

		// Send individual notification with resultUuid
		ioServer.to(`participant:${p.participantId}`).emit("game:finished_result", {
			resultUuid: savedResult.uuid,
		});
	}

	// Send quiz finished event
	ioServer.to(`room:${roomId}`).emit("game:finished", {
		totalQuestions: actualTotalQuestions,
		leaderboard: participants.sort((a, b) => b.score - a.score),
	});

	// Set 2 hours TTL in Redis
	await gameRedisService.setSessionExpiry(roomId, 7200);
}
