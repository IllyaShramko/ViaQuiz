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

// Зберігаємо таймери питань на сервері в пам'яті за roomId
const activeRoomTimers = new Map<number, NodeJS.Timeout>();

export const gameSessionsSocketController: SocketController = {
	registerHandlers(socket: AuthenticatedSocket, ioServer: ServerSocket): void {
		/**
		 * Клієнт приєднується до сесії
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
				let finishedData: unknown = null;

				if (roomState && roomState.status === "PROGRESS") {
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

				// Надсилаємо синхронізацію клієнту
				socket.emit("game:sync_state", {
					roomState,
					participants,
					currentParticipantId: participantId,
					currentQuestion: currentQuestionSanitized,
					alreadyAnswered,
					reviewData,
					finishedData,
					answeredCount,
					resultUuid,
					isHost: isTeacher,
				});

				// Сповіщаємо кімнату про учасника
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
		 * Вчитель запускає вікторину
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

				// Відправляємо питання всім БЕЗ isCorrect
				ioServer.to(`room:${roomId}`).emit("game:question_started", {
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

				// Запускаємо серверний таймер
				startServerQuestionTimer(ioServer, roomId, 0, timeLimitMs);
			} catch (error) {
				logger.error("[Socket Event host:start_game Error]", error);
			}
		});

		/**
		 * Вчитель перемикає на наступне питання
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
					// Всі питання пройдені -> завершуємо вікторину
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

				ioServer.to(`room:${roomId}`).emit("game:question_started", {
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
		 * Вчитель додає час (+15 сек)
		 */
		socket.on("host:extend_time", async (data) => {
			try {
				const { roomId, seconds = 15 } = data;
				const state = await gameRedisService.getRoomState(roomId);
				if (!state || state.status !== "PROGRESS") return;

				const addedMs = seconds * 1000;
				const currentLimit = state.timeLimitMs || 30000;
				const newLimit = currentLimit + addedMs;

				await gameRedisService.setRoomState(roomId, { timeLimitMs: newLimit });

				// Перезапускаємо таймер із залишком часу
				const startedAt = state.questionStartedAt || Date.now();
				const elapsed = Date.now() - startedAt;
				const remainingMs = Math.max(0, newLimit - elapsed);

				startServerQuestionTimer(
					ioServer,
					roomId,
					state.currentQuestionIndex,
					remainingMs,
				);

				ioServer.to(`room:${roomId}`).emit("game:time_extended", {
					addedSeconds: seconds,
					newRemainingMs: remainingMs,
				});
			} catch (error) {
				logger.error("[Socket Event host:extend_time Error]", error);
			}
		});

		/**
		 * Вчитель виганяє учасника (Kick)
		 */
		socket.on("host:kick_participant", async (data) => {
			try {
				const { roomId, participantId } = data;
				await GameSessionsRepository.banParticipant(participantId);
				await gameRedisService.banParticipant(roomId, participantId);

				// Відправляємо сповіщення в персональну кімнату учня
				ioServer
					.to(`participant:${participantId}`)
					.emit("room:participant_kicked", {
						reason: "Вилучено організатором вікторини",
					});

				// Сповіщаємо всю кімнату
				ioServer.to(`room:${roomId}`).emit("room:participant_left", {
					participantId,
					kicked: true,
				});
			} catch (error) {
				logger.error("[Socket Event host:kick_participant Error]", error);
			}
		});

		/**
		 * Учень надсилає відповідь
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

				// Перевірка правильності
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

				// Підрахунок балів за швидкість
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

				// Сповіщаємо хоста про прогрес відповідей
				ioServer.to(`room:host:${roomId}`).emit("game:answer_received", {
					answeredCount,
					totalParticipants: activeParticipants.length,
				});

				// Якщо всі активні учні відповіли -> завершуємо раунд достроково!
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
		 * Відключення сокета
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
 * Отримати кешоване запитання або завантажити з БД і закешувати
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
 * Запуск серверного таймера для запитання
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
 * Завершення раунду запитання -> перехід у статус REVIEWING
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

	// Розподіл відповідей по варіантах для кругової діаграми
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

	// Детальні відповіді кожного учасника для вчителя (хоста)
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

	// Подія для хоста з детальними результатами всіх учасників
	ioServer.to(`room:host:${roomId}`).emit("game:question_ended", {
		questionIndex,
		correctVariantIds,
		correctTextAnswers,
		answersDistribution: distribution,
		totalAnswered: Object.keys(answers).length,
		totalParticipants: participants.length,
		participantAnswers,
	});

	// Спільна подія для учнів (виключаючи хоста)
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

	// Відправляємо персональні результати кожному учню в його власну кімнату participant:id
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
 * Завершення всієї вікторини -> збереження в PostgreSQL та фінальний рейтинг
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

	// Зберігаємо результати кожного учасника у PostgreSQL
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
				// Питання пропущено (не було відповіді)
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

		// Відправляємо індивідуальне сповіщення з resultUuid
		ioServer.to(`participant:${p.participantId}`).emit("game:finished_result", {
			resultUuid: savedResult.uuid,
		});
	}

	// Відправляємо подію закінчення вікторини
	ioServer.to(`room:${roomId}`).emit("game:finished", {
		totalQuestions: actualTotalQuestions,
		leaderboard: participants.sort((a, b) => b.score - a.score),
	});

	// Встановлюємо 2 години TTL у Redis
	await gameRedisService.setSessionExpiry(roomId, 7200);
}
