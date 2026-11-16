import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../modules/auth';
import {
	useGetRoomByUuidQuery,
	useGameSession,
	HostLobby,
	HostControlsBar,
	QuestionHostView,
	ReviewHostView,
	FinalResultsHost,
	ParticipantsSidebar,
} from '../../../modules/game-session';
import { Button } from '../../../shared/ui';
import { getAuthToken } from '../../../shared/api/headers';
import sessionStyles from '../../../modules/game-session/ui/GameSession.module.css';
import styles from './GameHostPage.module.css';

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
	const resolvedTotalQuestions = room?.quiz?._count?.questions || totalQuestions || 0;
	const isLastQuestion =
		resolvedTotalQuestions > 0 && currentQuestionIndex >= resolvedTotalQuestions - 1;

	if (kickedReason) {
		return (
			<div className={sessionStyles.gameRoot}>
				<div className={sessionStyles.gameMainContent}>
					<div className={sessionStyles.statusCard}>
						<h2 className={sessionStyles.statusCardErrorTitle}>Сесію закрито</h2>
						<p className={sessionStyles.statusCardText}>{kickedReason}</p>
						<Button
							type="button"
							variant="primary"
							size="md"
							onClick={() => navigate('/dashboard')}
						>
							Повернутися до панелі
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
					<div style={{ color: 'var(--color-text-secondary)' }}>Завантаження сесії...</div>
				</div>
			</div>
		);
	}

	if (isRoomError || !room || isFinished) {
		return null;
	}

	return (
		<div className={sessionStyles.gameRoot}>
			{/* Final results screen (full podium view without sidebar) */}
			{status === 'FINISHED' ? (
				<FinalResultsHost
					quizName={quizName}
					totalQuestions={totalQuestions}
					leaderboard={finishedData?.leaderboard || participants}
					roomUuid={roomUuid}
				/>
			) : (
				<div className={styles.gameLayoutBody}>
					{/* Main interactive area switching between lobby, question, and review */}
					{status === 'AWAITING' && (
						<HostLobby
							joinCode={joinCode}
							quizName={quizName}
							totalQuestions={resolvedTotalQuestions}
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
							/>
						) : (
							<div className={sessionStyles.gameMainContent}>
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
								isLastQuestion={isLastQuestion}
								reviewData={reviewData}
								participants={participants}
							/>
						) : (
							<div className={sessionStyles.gameMainContent}>
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
						footer={
							status === 'PROGRESS' && currentQuestion ? (
								<HostControlsBar
									status="PROGRESS"
									remainingSeconds={remainingSeconds}
									answeredCount={answeredCount}
									totalParticipants={participants.length}
									onExtendTime={(secs) => extendTime(currentRoomId, secs)}
									onPrimaryAction={() => endQuestion(currentRoomId)}
								/>
							) : status === 'REVIEWING' && currentQuestion && reviewData ? (
								<HostControlsBar
									status="REVIEWING"
									remainingSeconds={remainingSeconds}
									answeredCount={reviewData.totalAnswered ?? answeredCount}
									totalParticipants={participants.length}
									isLastQuestion={isLastQuestion}
									onPrimaryAction={() => nextQuestion(currentRoomId)}
								/>
							) : undefined
						}
					/>
				</div>
			)}
		</div>
	);
}
