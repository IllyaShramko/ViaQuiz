import { useState, useEffect } from 'react';
import { ImageLightboxModal } from '../../modals';
import { ParticipantsSidebar } from '../../sidebar';
import type { QuestionHostViewProps } from './QuestionHostView.types';
import timerIcon from '../../../../../assets/icons/timer.svg';
import nextIcon from '../../../../../assets/icons/next.svg';
import styles from '../../GameSession.module.css';

export function QuestionHostView({
	question,
	questionIndex,
	totalQuestions,
	participants,
	answeredCount,
	answeredParticipantIds,
	remainingSeconds,
	onExtendTime,
	onSkipQuestion,
	onKickParticipant,
}: QuestionHostViewProps) {
	const [lightboxImage, setLightboxImage] = useState<string | null>(null);
	const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);

	// Reset revealed state on question change
	useEffect(() => {
		setIsAnswerRevealed(false);
	}, [questionIndex, (question as { questionId?: number; id?: number }).questionId, (question as { id?: number }).id]);

	return (
		<div className={styles['game-layout-body']}>
			<div className={styles['game-main-content']}>
				<div className={styles['question-container']}>
					{/* Question Card */}
					<div className={styles['question-header-card']}>
						<div
							style={{
								fontSize: '0.9rem',
								fontWeight: 700,
								color: 'var(--color-accent, #863bff)',
								marginBottom: '0.5rem',
							}}
						>
							Запитання {questionIndex + 1} з {totalQuestions}
						</div>

						<h2 className={styles['question-text']}>{question.text}</h2>

						{question.media && (
							<img
								src={question.media}
								alt="Question media"
								className={styles['question-media-img']}
								onClick={() => setLightboxImage(question.media || null)}
							/>
						)}
					</div>

					{/* Variants Grid / Typed Preview (Host View) */}
					{question.type === 'TYPE_ANSWER_V1' || question.type === 'TYPE_ANSWER_V2' ? (
						<div className={styles['typed-host-card']}>
							<div className={styles['typed-host-header']}>
								<div className={styles['typed-host-type-badge']}>
									<span className={styles['typed-host-icon']}>⌨️</span>
									<span>
										{question.type === 'TYPE_ANSWER_V2'
											? 'Тип запитання: Слово по буквах'
											: 'Тип запитання: Ввід тексту'}
									</span>
								</div>

								<button
									type="button"
									className={`${styles['typed-host-reveal-btn']} ${
										isAnswerRevealed ? styles['is-revealed'] : ''
									}`}
									onClick={() => setIsAnswerRevealed((prev) => !prev)}
									title={
										isAnswerRevealed
											? 'Приховати правильну відповідь'
											: 'Показати правильну відповідь (обережно при демонстрації екрана)'
									}
								>
									<span>{isAnswerRevealed ? '🙈' : '👁️'}</span>
									<span>
										{isAnswerRevealed ? 'Приховати відповідь' : 'Показати відповідь'}
									</span>
								</button>
							</div>

							{isAnswerRevealed ? (
								<div className={`${styles['typed-host-status-box']} ${styles['is-revealed']}`}>
									<div className={styles['typed-host-revealed-inner']}>
										<span className={styles['typed-host-revealed-label']}>
											Правильна відповідь:
										</span>
										<span className={styles['typed-host-revealed-text']}>
											{question.variants.map((v) => v.text).filter(Boolean).join(' / ') || '—'}
										</span>
									</div>
								</div>
							) : (
								<div className={styles['typed-host-status-box']}>
									<p className={styles['typed-host-status-text']}>
										Учасники самостійно вводять відповідь на своїх пристроях
									</p>
								</div>
							)}
						</div>
					) : (
						<div className={styles['variants-grid']}>
							{question.variants.map((v, idx) => (
								<div key={v.id} className={styles['teacher-variant-card']}>
									<div className={styles['variant-badge-corner']}>{idx + 1}</div>
									<span className={styles['teacher-variant-text']}>
										{v.text || 'Варіант без тексту'}
									</span>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Floating Bottom Control Bar (matches old GPTQuiz design) */}
				<div className={styles['teacher-bottom-controls']}>
					<div className={styles['bottom-timer-section']}>
						<img src={timerIcon} alt="Timer" className={styles['bottom-timer-icon']} />
						<span className={styles['bottom-timer-text']}>{remainingSeconds} с</span>
					</div>

					<div
						style={{
							fontSize: '0.8rem',
							color: '#ccc',
							fontWeight: 600,
							textAlign: 'center',
						}}
					>
						Відповіли: {answeredCount} / {participants.length}
					</div>

					<div className={styles['bottom-controls-buttons']}>
						<button
							type="button"
							className={styles['bottom-control-btn']}
							onClick={() => onExtendTime(15)}
							disabled={remainingSeconds >= 900}
							title={
								remainingSeconds >= 900
									? 'Максимальний час досягнуто (900 с)'
									: undefined
							}
						>
							<div className={styles['bottom-control-btn-inner']}>
								<p>+15 сек</p>
							</div>
						</button>

						<button
							type="button"
							className={styles['bottom-control-btn']}
							onClick={onSkipQuestion}
							title="Перейти до наступного"
						>
							<div className={styles['bottom-control-btn-inner']}>
								<img src={nextIcon} alt="Далі" className={styles['bottom-next-icon']} />
							</div>
						</button>
					</div>
				</div>
			</div>

			{/* Sidebar Participants */}
			<ParticipantsSidebar
				participants={participants}
				status="PROGRESS"
				answeredParticipantIds={answeredParticipantIds}
				onKickParticipant={onKickParticipant}
			/>

			<ImageLightboxModal
				isOpen={!!lightboxImage}
				imageUrl={lightboxImage}
				onClose={() => setLightboxImage(null)}
			/>
		</div>
	);
}
