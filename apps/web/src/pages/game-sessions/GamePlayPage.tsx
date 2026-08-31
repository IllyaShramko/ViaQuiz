import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
	useGetRoomByUuidQuery,
	useGameSession,
	StudentLobby,
	QuestionStudentView,
	ReviewStudentView,
	shuffleArray,
	formatTimer,
} from '../../modules/game-session';
import { LogoIcon, TimerIcon } from '../../shared/ui/icons';
import styles from '../../modules/game-session/ui/GameSession.module.css';

export function GamePlayPage() {
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
		alreadyAnswered,
		reviewData,
		resultUuid,
		remainingSeconds,
		kickedReason,
		submitAnswer,
	} = useGameSession({ roomUuid });

	const currentRoomId = roomId || room?.id || 0;
	const quizName = room?.quiz?.name || 'Вікторина';

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

	// Automatic redirect to student result report when test finishes
	useEffect(() => {
		if (status === 'FINISHED' && resultUuid) {
			navigate(`/student/results/${resultUuid}`, { replace: true });
		}
	}, [status, resultUuid, navigate]);

	if (kickedReason) {
		return (
			<div className={styles['game-root']}>
				<div className={styles['game-main-content']}>
					<div className={styles['student-lobby-card']} style={{ textAlign: 'center' }}>
						<h2 style={{ color: 'var(--color-error, #ef4444)' }}>Доступ обмежено</h2>
						<p style={{ color: 'var(--color-text-secondary)' }}>{kickedReason}</p>
						<button
							type="button"
							className={styles['lobby-start-btn']}
							style={{ marginTop: '1.5rem' }}
							onClick={() => navigate('/')}
						>
							На головну
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
					<div style={{ color: 'var(--color-text-secondary)' }}>Підключення до сесії...</div>
				</div>
			</div>
		);
	}

	return (
		<div className={styles['game-root']}>
			{/* Top Bar for Student */}
			<header className={styles['game-topbar']}>
				<div className={styles['game-logo']}>
					<LogoIcon size={24} className={styles['game-logo-icon']} />
					<span>ViaQuiz</span>
				</div>

				<div className={styles['game-topbar-center']}>
					<TimerIcon size={18} />
					<span>{status === 'PROGRESS' ? formatTimer(remainingSeconds) : '00:00'}</span>
				</div>

				<div className={styles['game-topbar-right']}>
					<span>
						{status === 'PROGRESS' || status === 'REVIEWING'
							? `${currentQuestionIndex + 1} / ${totalQuestions || 1}`
							: `0 / ${totalQuestions || 1}`}
					</span>
				</div>
			</header>

			{/* Views based on status */}
			{status === 'AWAITING' && (
				<StudentLobby
					quizName={quizName}
					teacherName="Вчитель"
					totalQuestions={totalQuestions || room?.quiz?.id || 1}
					participants={participants}
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
					<div className={styles['game-main-content']}>
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
					<div className={styles['game-main-content']}>
						<div style={{ color: 'var(--color-text-secondary)' }}>Завантаження результатів...</div>
					</div>
				)
			)}

			{status === 'FINISHED' && (
				<div className={styles['game-main-content']}>
					<div className={styles['student-lobby-card']} style={{ textAlign: 'center', padding: '3rem 2rem' }}>
						<h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>
							Тест завершено!
						</h2>
						<p style={{ color: 'var(--color-text-secondary, #9090a8)', marginBottom: '1.5rem' }}>
							Формуємо ваш звіт результатів тестування...
						</p>
						<div
							style={{
								width: '40px',
								height: '40px',
								border: '3px solid rgba(134, 59, 255, 0.2)',
								borderTopColor: 'var(--color-accent, #863bff)',
								borderRadius: '50%',
								animation: 'spin 0.8s linear infinite',
								margin: '0 auto',
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
