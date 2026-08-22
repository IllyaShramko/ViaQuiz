import { useParams, useNavigate } from 'react-router-dom';
import {
	useGetRoomByUuidQuery,
	useGameSession,
	HostLobby,
	QuestionHostView,
	ReviewHostView,
	FinalResultsHost,
} from '../../modules/game-session';
import styles from '../../modules/game-session/ui/GameSession.module.css';

export function GameHostPage() {
	const { roomUuid } = useParams<{ roomUuid: string }>();
	const navigate = useNavigate();

	const { data: room, isLoading: isRoomLoading } = useGetRoomByUuidQuery(
		roomUuid || '',
		{ skip: !roomUuid, refetchOnMountOrArgChange: true },
	);

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
		remainingSeconds,
		kickedReason,
		startGame,
		nextQuestion,
		endQuestion,
		extendTime,
		kickParticipant,
	} = useGameSession({ roomUuid });

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

	if (isRoomLoading) {
		return (
			<div className={styles['game-root']}>
				<div className={styles['game-main-content']}>
					<div style={{ color: 'var(--color-text-secondary)' }}>Завантаження сесії...</div>
				</div>
			</div>
		);
	}

	return (
		<div className={styles['game-root']}>
			{/* Views based on status */}
			{status === 'AWAITING' && (
				<HostLobby
					joinCode={joinCode}
					roomUuid={roomUuid || ''}
					participants={participants}
					onStartGame={() => startGame(currentRoomId)}
					onKickParticipant={(pId) => kickParticipant(currentRoomId, pId)}
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
						onExtendTime={(secs) => extendTime(currentRoomId, secs)}
						onSkipQuestion={() => endQuestion(currentRoomId)}
						onKickParticipant={(pId) => kickParticipant(currentRoomId, pId)}
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
						reviewData={reviewData}
						participants={participants}
						remainingSeconds={remainingSeconds}
						onExtendTime={(secs) => extendTime(currentRoomId, secs)}
						onNextQuestion={() => nextQuestion(currentRoomId)}
					/>
				) : (
					<div className={styles['game-main-content']}>
						<div style={{ color: 'var(--color-text-secondary)' }}>Завантаження огляду результатів...</div>
					</div>
				)
			)}

			{status === 'FINISHED' && (
				<FinalResultsHost
					quizName={quizName}
					totalQuestions={totalQuestions}
					leaderboard={finishedData?.leaderboard || participants}
				/>
			)}
		</div>
	);
}
