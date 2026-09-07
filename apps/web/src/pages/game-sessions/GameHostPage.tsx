import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth';
import {
	useGetRoomByUuidQuery,
	useGameSession,
	HostLobby,
	QuestionHostView,
	ReviewHostView,
	FinalResultsHost,
	ParticipantsSidebar,
} from '../../modules/game-session';
import { getAuthToken } from '../../shared/api/headers';
import styles from '../../modules/game-session/ui/GameSession.module.css';

export function GameHostPage() {
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
		currentQuestion,
		reviewData,
		finishedData,
		answeredCount,
		answeredParticipantIds,
		remainingSeconds,
		kickedReason,
		startGame,
		nextQuestion,
		endQuestion,
		extendTime,
		kickParticipant,
	} = useGameSession({
		roomUuid,
		explicitToken: getAuthToken() || undefined,
		enabled: !isFinished && !isRoomError && !isRoomLoading && !isAuthLoading,
	});

	const currentRoomId = roomId || room?.id || 0;
	const joinCode = room?.joinCode || '000000';
	const quizName = room?.quiz?.name || 'Вікторина';

	if (kickedReason) {
		return (
			<div className={styles['game-root']}>
				<div className={styles['game-main-content']}>
					<div className={styles['lobby-host-card']} style={{ textAlign: 'center' }}>
						<h2 style={{ color: 'var(--color-error, #ef4444)' }}>Сесію закрито</h2>
						<p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
							{kickedReason}
						</p>
						<button
							type="button"
							className={styles['lobby-start-btn']}
							style={{ marginTop: '1.5rem' }}
							onClick={() => navigate('/dashboard')}
						>
							Повернутися до панелі
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (isRoomLoading || isAuthLoading) {
		return (
			<div className={styles['game-root']}>
				<div className={styles['game-main-content']}>
					<div style={{ color: 'var(--color-text-secondary)' }}>Завантаження сесії...</div>
				</div>
			</div>
		);
	}

	if (isRoomError || !room || isFinished) {
		return null;
	}

	return (
		<div className={styles['game-root']}>
			{/* Final results screen (full podium view without sidebar) */}
			{status === 'FINISHED' ? (
				<FinalResultsHost
					quizName={quizName}
					totalQuestions={totalQuestions}
					leaderboard={finishedData?.leaderboard || participants}
					roomUuid={roomUuid}
				/>
			) : (
				<div className={styles['game-layout-body']}>
					{/* Main interactive area switching between lobby, question, and review */}
					{status === 'AWAITING' && (
						<HostLobby
							joinCode={joinCode}
							roomUuid={roomUuid || ''}
							onStartGame={() => startGame(currentRoomId)}
						/>
					)}

					{status === 'PROGRESS' && (
						currentQuestion ? (
							<QuestionHostView
								question={currentQuestion}
								questionIndex={currentQuestionIndex}
								totalQuestions={totalQuestions}
								participants={participants}
								answeredCount={answeredCount}
								remainingSeconds={remainingSeconds}
								onExtendTime={(secs?: number) => extendTime(currentRoomId, secs)}
								onSkipQuestion={() => endQuestion(currentRoomId)}
							/>
						) : (
							<div className={styles['game-main-content']}>
								<div style={{ color: 'var(--color-text-secondary)' }}>Завантаження запитання...</div>
							</div>
						)
					)}

					{status === 'REVIEWING' && (
						currentQuestion && reviewData ? (
							<ReviewHostView
								question={currentQuestion}
								questionIndex={currentQuestionIndex}
								totalQuestions={totalQuestions}
								reviewData={reviewData}
								participants={participants}
								remainingSeconds={remainingSeconds}
								onExtendTime={(secs?: number) => extendTime(currentRoomId, secs)}
								onNextQuestion={() => nextQuestion(currentRoomId)}
							/>
						) : (
							<div className={styles['game-main-content']}>
								<div style={{ color: 'var(--color-text-secondary)' }}>Завантаження огляду результатів...</div>
							</div>
						)
					)}

					{/* Persistent Sidebar across all non-finished states */}
					<ParticipantsSidebar
						participants={participants}
						status={status}
						answeredParticipantIds={answeredParticipantIds}
						reviewData={reviewData}
						onKickParticipant={(pId) => kickParticipant(currentRoomId, pId)}
					/>
				</div>
			)}
		</div>
	);
}
