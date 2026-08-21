import { useState, useEffect, useRef, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { getGameSocket, closeGameSocket } from './socketClient';
import type {
	ParticipantDto,
	GameQuestionDto,
	GameReviewDataDto,
	GameFinishedDto,
	GameSyncStateDto,
	RoomStatus,
} from '@viaquiz/shared-types';

export interface UseGameSessionProps {
	roomUuid?: string;
	joinCode?: string;
	explicitToken?: string;
}

export function useGameSession({
	roomUuid,
	joinCode,
	explicitToken,
}: UseGameSessionProps) {
	const [status, setStatus] = useState<RoomStatus>('AWAITING');
	const [roomId, setRoomId] = useState<number | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
	const [totalQuestions, setTotalQuestions] = useState<number>(0);
	const [participants, setParticipants] = useState<ParticipantDto[]>([]);
	const [currentParticipantId, setCurrentParticipantId] = useState<number | null>(null);
	const [currentQuestion, setCurrentQuestion] = useState<GameQuestionDto | null>(null);
	const [alreadyAnswered, setAlreadyAnswered] = useState<boolean>(false);
	const [reviewData, setReviewData] = useState<GameReviewDataDto | null>(null);
	const [finishedData, setFinishedData] = useState<GameFinishedDto | null>(null);
	const [resultUuid, setResultUuid] = useState<string | null>(null);
	const [answeredCount, setAnsweredCount] = useState<number>(0);
	const [remainingMs, setRemainingMs] = useState<number>(0);
	const [isHost, setIsHost] = useState<boolean>(false);
	const [kickedReason, setKickedReason] = useState<string | null>(null);
	const [isConnected, setIsConnected] = useState<boolean>(false);

	const socketRef = useRef<Socket | null>(null);
	const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);


	// Start frontend countdown timer
	const startCountdown = useCallback((durationMs: number) => {
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current);
		}

		const endTime = Date.now() + durationMs;
		setRemainingMs(Math.max(0, durationMs));

		timerIntervalRef.current = setInterval(() => {
			const left = Math.max(0, endTime - Date.now());
			setRemainingMs(left);
			if (left <= 0) {
				if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
			}
		}, 200);
	}, []);

	useEffect(() => {
		// Reset state for new session
		setStatus('AWAITING');
		setRoomId(null);
		setCurrentQuestionIndex(0);
		setTotalQuestions(0);
		setParticipants([]);
		setCurrentParticipantId(null);
		setCurrentQuestion(null);
		setAlreadyAnswered(false);
		setReviewData(null);
		setFinishedData(null);
		setResultUuid(null);
		setAnsweredCount(0);
		setRemainingMs(0);
		setIsHost(false);
		setKickedReason(null);

		const socket = getGameSocket(explicitToken, roomUuid);
		socketRef.current = socket;

		const handleConnect = () => {
			setIsConnected(true);
			socket.emit('game:join', { roomUuid, joinCode });
		};

		const handleDisconnect = () => {
			setIsConnected(false);
		};

		const handleSyncState = (data: GameSyncStateDto) => {
			if (data.roomState) {
				setStatus(data.roomState.status);
				setRoomId(data.roomState.roomId);
				setCurrentQuestionIndex(data.roomState.currentQuestionIndex);
				if (data.roomState.totalQuestions) {
					setTotalQuestions(data.roomState.totalQuestions);
				}

				if (data.roomState.status === 'PROGRESS' && data.roomState.questionStartedAt && data.roomState.timeLimitMs) {
					const elapsed = Date.now() - data.roomState.questionStartedAt;
					const left = Math.max(0, data.roomState.timeLimitMs - elapsed);
					startCountdown(left);
				}
			}

			if (data.participants) setParticipants(data.participants);
			if (data.currentParticipantId) setCurrentParticipantId(data.currentParticipantId);
			if (data.currentQuestion) setCurrentQuestion(data.currentQuestion);
			setAlreadyAnswered(!!data.alreadyAnswered);
			if (data.reviewData) setReviewData(data.reviewData);
			if (data.resultUuid) setResultUuid(data.resultUuid);
			setIsHost(!!data.isHost);
		};

		const handleParticipantJoined = (payload: { participantId: number; nickname: string; totalCount?: number }) => {
			setParticipants((prev) => {
				const exists = prev.some((p) => p.participantId === payload.participantId);
				if (exists) {
					return prev.map((p) =>
						p.participantId === payload.participantId ? { ...p, isConnected: true } : p,
					);
				}
				return [
					...prev,
					{
						participantId: payload.participantId,
						participantUuid: '',
						nickname: payload.nickname,
						isConnected: true,
						score: 0,
					},
				];
			});
		};

		const handleParticipantLeft = (payload: { participantId: number; kicked?: boolean }) => {
			setParticipants((prev) =>
				payload.kicked
					? prev.filter((p) => p.participantId !== payload.participantId)
					: prev.map((p) =>
							p.participantId === payload.participantId ? { ...p, isConnected: false } : p,
						),
			);
		};

		const handleParticipantKicked = (payload: { reason?: string }) => {
			setKickedReason(payload.reason || 'Вас було вилучено з вікторини.');
		};

		const handleQuestionStarted = (payload: GameQuestionDto) => {
			setStatus('PROGRESS');
			setCurrentQuestionIndex(payload.questionIndex);
			if (payload.totalQuestions) setTotalQuestions(payload.totalQuestions);
			setCurrentQuestion(payload);
			setAlreadyAnswered(false);
			setReviewData(null);
			setAnsweredCount(0);
			startCountdown(payload.timeLimit || 30000);
		};

		const handleTimeExtended = (payload: { addedSeconds: number; newRemainingMs: number }) => {
			startCountdown(payload.newRemainingMs);
		};

		const handleAnswerReceived = (payload: { answeredCount: number; totalParticipants: number }) => {
			setAnsweredCount(payload.answeredCount);
		};

		const handleQuestionEnded = (payload: GameReviewDataDto) => {
			if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
			setStatus('REVIEWING');
			setReviewData(payload);
		};

		const handleFinished = (payload: GameFinishedDto) => {
			if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
			setStatus('FINISHED');
			setFinishedData(payload);
		};

		const handleFinishedResult = (payload: { resultUuid: string }) => {
			if (payload?.resultUuid) {
				setResultUuid(payload.resultUuid);
			}
		};

		socket.on('connect', handleConnect);
		socket.on('disconnect', handleDisconnect);
		socket.on('game:sync_state', handleSyncState);
		socket.on('room:participant_joined', handleParticipantJoined);
		socket.on('room:participant_left', handleParticipantLeft);
		socket.on('room:participant_kicked', handleParticipantKicked);
		socket.on('game:question_started', handleQuestionStarted);
		socket.on('game:time_extended', handleTimeExtended);
		socket.on('game:answer_received', handleAnswerReceived);
		socket.on('game:question_ended', handleQuestionEnded);
		socket.on('game:finished', handleFinished);
		socket.on('game:finished_result', handleFinishedResult);

		if (socket.connected) {
			handleConnect();
		}

		return () => {
			if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
			socket.off('connect', handleConnect);
			socket.off('disconnect', handleDisconnect);
			socket.off('game:sync_state', handleSyncState);
			socket.off('room:participant_joined', handleParticipantJoined);
			socket.off('room:participant_left', handleParticipantLeft);
			socket.off('room:participant_kicked', handleParticipantKicked);
			socket.off('game:question_started', handleQuestionStarted);
			socket.off('game:time_extended', handleTimeExtended);
			socket.off('game:answer_received', handleAnswerReceived);
			socket.off('game:question_ended', handleQuestionEnded);
			socket.off('game:finished', handleFinished);
			socket.off('game:finished_result', handleFinishedResult);
			closeGameSocket();
		};
	}, [roomUuid, joinCode, explicitToken, startCountdown]);

	// Actions
	const startGame = useCallback(
		(rId: number) => {
			socketRef.current?.emit('host:start_game', { roomId: rId });
		},
		[],
	);

	const nextQuestion = useCallback(
		(rId: number) => {
			socketRef.current?.emit('host:next_question', { roomId: rId });
		},
		[],
	);

	const endQuestion = useCallback(
		(rId: number) => {
			socketRef.current?.emit('host:end_question', { roomId: rId });
		},
		[],
	);

	const extendTime = useCallback(
		(rId: number, seconds = 15) => {
			socketRef.current?.emit('host:extend_time', { roomId: rId, seconds });
		},
		[],
	);

	const kickParticipant = useCallback(
		(rId: number, pId: number) => {
			socketRef.current?.emit('host:kick_participant', {
				roomId: rId,
				participantId: pId,
			});
		},
		[],
	);

	const submitAnswer = useCallback(
		(rId: number, qIdx: number, vIds: number[]) => {
			setAlreadyAnswered(true);
			socketRef.current?.emit('participant:submit_answer', {
				roomId: rId,
				questionIndex: qIdx,
				variantIds: vIds,
			});
		},
		[],
	);

	return {
		status,
		roomId,
		currentQuestionIndex,
		totalQuestions,
		participants,
		currentParticipantId,
		currentQuestion,
		alreadyAnswered,
		reviewData,
		finishedData,
		resultUuid,
		answeredCount,
		remainingSeconds: Math.ceil(remainingMs / 1000),
		remainingMs,
		isHost,
		kickedReason,
		isConnected,
		startGame,
		nextQuestion,
		endQuestion,
		extendTime,
		kickParticipant,
		submitAnswer,
	};
}
