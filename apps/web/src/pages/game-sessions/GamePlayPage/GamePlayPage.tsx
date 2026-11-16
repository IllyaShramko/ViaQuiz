import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../modules/auth';
import {
	useGetRoomByUuidQuery,
	useGameSession,
	StudentLobby,
	QuestionStudentView,
	ReviewStudentView,
	shuffleArray,
	formatTimer,
	getGameSessionToken,
	removeGameSessionToken,
} from '../../../modules/game-session';
import { getAuthToken } from '../../../shared/api/headers';
import { Button } from '../../../shared/ui';
import { LogoIcon, TimerIcon } from '../../../shared/ui/icons';
import sessionStyles from '../../../modules/game-session/ui/GameSession.module.css';
import styles from './GamePlayPage.module.css';

export function GamePlayPage() {
	const { roomUuid } = useParams<{ roomUuid: string }>();
	const navigate = useNavigate();
	const { user, isLoading: isAuthLoading } = useAuth();

	const {
		data: room,
		isLoading: isRoomLoading,
		isError: isRoomError,
	} = useGetRoomByUuidQuery(roomUuid || '', {
		skip: !roomUuid,
		refetchOnMountOrArgChange: true,
	});

	const isFinished = room?.status === 'FINISHED';
	const isTeacher =
		user?.role === 'TEACHER' ||
		user?.role === 'ADMIN' ||
		(user?.id != null && room?.hostId != null && user.id === room.hostId);

	// Redirect when room has already finished or does not exist
	useEffect(() => {
		if (isRoomLoading || isAuthLoading) return;

		// If room was not found or invalid UUID -> redirect to not-found
		if (isRoomError || !room) {
			navigate('/not-found', { replace: true });
			return;
		}

		// If room has already finished when navigating to this link
		if (isFinished) {
			if (isTeacher) {
				navigate(`/dashboard/reports/${roomUuid}`, { replace: true });
			} else {
				navigate('/not-found', { replace: true });
			}
		}
	}, [isRoomLoading, isAuthLoading, isRoomError, room, isFinished, isTeacher, roomUuid, navigate]);

	const {
		status,
		roomId,
		currentQuestionIndex,
		totalQuestions,
		participants,
		currentParticipantId,
		currentQuestion,
		alreadyAnswered,
		reviewData,
		resultUuid,
		remainingSeconds,
		kickedReason,
		submitAnswer,
	} = useGameSession({
		roomUuid,
		enabled: !isFinished && !isRoomError && !isRoomLoading && !isAuthLoading,
	});

	const currentRoomId = roomId || room?.id || 0;
	const quizName = room?.quiz?.name || 'Вікторина';
	const teacherName = room?.host
		? `${room.host.lastName || ''} ${room.host.firstName || ''}`.trim() || undefined
		: undefined;
	const resolvedTotalQuestions = totalQuestions || room?.quiz?._count?.questions || 0;
	const currentParticipant = participants.find(
		(participant) => participant.participantId === currentParticipantId,
	);

	const questionKey = currentQuestion
		? `${currentQuestionIndex}-${(currentQuestion as { questionId?: number; id?: number }).questionId ?? (currentQuestion as { questionId?: number; id?: number }).id ?? currentQuestion.text ?? ''}`
		: '';

	const studentQuestion = useMemo(() => {
		if (!currentQuestion) return null;
		return {
			...currentQuestion,
			variants: shuffleArray(currentQuestion.variants || []),
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [questionKey]);

	// If anonymous user opens /game/play/:roomUuid without having joined, redirect to /join
	useEffect(() => {
		if (!isRoomLoading && !isFinished && room && roomUuid) {
			const isLoggedIn = !!getAuthToken();
			const hasGameToken = !!getGameSessionToken(roomUuid);
			if (!isLoggedIn && !hasGameToken) {
				navigate(`/join?code=${room.joinCode}`, { replace: true });
			}
		}
	}, [isRoomLoading, isFinished, room, roomUuid, navigate]);

	// Cleanup token when participant is kicked
	useEffect(() => {
		if (kickedReason && roomUuid) {
			removeGameSessionToken(roomUuid);
		}
	}, [kickedReason, roomUuid]);

	// Automatic redirect to student result report when test finishes + cleanup
	useEffect(() => {
		if (status === 'FINISHED') {
			if (roomUuid) {
				removeGameSessionToken(roomUuid);
			}
			if (resultUuid) {
				navigate(`/student/results/${resultUuid}`, { replace: true });
			}
		}
	}, [status, resultUuid, roomUuid, navigate]);

	if (kickedReason) {
		return (
			<div className={sessionStyles.gameRoot}>
				<div className={sessionStyles.gameMainContent}>
					<div className={sessionStyles.statusCard}>
						<h2 className={sessionStyles.statusCardErrorTitle}>Доступ обмежено</h2>
						<p className={sessionStyles.statusCardText}>{kickedReason}</p>
						<Button
							type="button"
							variant="primary"
							size="md"
							onClick={() => navigate('/')}
						>
							На головну
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (isRoomLoading || isAuthLoading) {
		return (
			<div className={sessionStyles.gameRoot}>
				<div className={sessionStyles.gameMainContent}>
					<div style={{ color: 'var(--color-text-secondary)' }}>Підключення до сесії...</div>
				</div>
			</div>
		);
	}

	if (isRoomError || !room || isFinished) {
		return null;
	}

	return (
		<div className={sessionStyles.gameRoot}>
			{/* Top Bar for Student */}
			<header className={styles.gameTopbar}>
				<div className={styles.gameLogo}>
					<LogoIcon size={24} className={styles.gameLogoIcon} />
					<span className={styles.gameLogoText}>ViaQuiz</span>
				</div>

				<div className={styles.gameTopbarCenter}>
					<TimerIcon size={18} />
					<span>{status === 'PROGRESS' ? formatTimer(remainingSeconds) : '00:00'}</span>
				</div>

				<div className={styles.gameTopbarRight}>
					<span>
						{status === 'PROGRESS' || status === 'REVIEWING'
							? `${currentQuestionIndex + 1} / ${resolvedTotalQuestions || 1}`
							: `0 / ${resolvedTotalQuestions}`}
					</span>
				</div>
			</header>

			{/* Views based on status */}
			{status === 'AWAITING' && (
				<StudentLobby
					quizName={quizName}
					teacherName={teacherName}
					totalQuestions={resolvedTotalQuestions}
					participants={participants}
					currentParticipantId={currentParticipantId}
					currentParticipantNickname={currentParticipant?.nickname}
				/>
			)}

			{status === 'PROGRESS' && (
				studentQuestion ? (
					<QuestionStudentView
						question={studentQuestion}
						alreadyAnswered={alreadyAnswered}
						onSubmitAnswer={(vIds, typedAnswer) =>
							submitAnswer(currentRoomId, currentQuestionIndex, vIds, typedAnswer)
						}
					/>
				) : (
					<div className={sessionStyles.gameMainContent}>
						<div style={{ color: 'var(--color-text-secondary)' }}>Завантаження запитання...</div>
					</div>
				)
			)}

			{status === 'REVIEWING' && (
				studentQuestion && reviewData ? (
					<ReviewStudentView
						question={studentQuestion}
						reviewData={reviewData}
					/>
				) : (
					<div className={sessionStyles.gameMainContent}>
						<div style={{ color: 'var(--color-text-secondary)' }}>Завантаження результатів...</div>
					</div>
				)
			)}

			{status === 'FINISHED' && (
				<div className={sessionStyles.gameMainContent}>
					<div className={sessionStyles.statusCard} style={{ padding: '2.5rem 2rem' }}>
						<h2 className={sessionStyles.statusCardTitle}>Тест завершено!</h2>
						<p className={sessionStyles.statusCardText}>
							Формуємо ваш звіт результатів тестування...
						</p>
						<div className={sessionStyles.statusSpinner} />
					</div>
				</div>
			)}
		</div>
	);
}
