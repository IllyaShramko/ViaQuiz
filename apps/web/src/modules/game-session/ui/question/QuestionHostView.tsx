import { useState } from 'react';
import { ImageLightboxModal } from '../modals/ImageLightboxModal';
import { KickConfirmModal } from '../modals/KickConfirmModal';
import type { GameQuestionDto, ParticipantDto } from '@viaquiz/shared-types';
import timerIcon from '../../../../assets/icons/timer.svg';
import nextIcon from '../../../../assets/icons/next.svg';
import styles from '../GameSession.module.css';

export interface QuestionHostViewProps {
	question: GameQuestionDto;
	questionIndex: number;
	totalQuestions: number;
	participants: ParticipantDto[];
	answeredCount: number;
	remainingSeconds: number;
	onExtendTime: (seconds?: number) => void;
	onSkipQuestion: () => void;
	onKickParticipant: (participantId: number) => void;
}

export function QuestionHostView({
	question,
	questionIndex,
	totalQuestions,
	participants,
	answeredCount,
	remainingSeconds,
	onExtendTime,
	onSkipQuestion,
	onKickParticipant,
}: QuestionHostViewProps) {
	const [lightboxImage, setLightboxImage] = useState<string | null>(null);
	const [kickTarget, setKickTarget] = useState<ParticipantDto | null>(null);

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
						<div className={styles['typed-review-card']}>
							<div className={styles['typed-review-row']}>
								<span className={styles['typed-review-label']}>
									{question.type === 'TYPE_ANSWER_V2'
										? 'Тип запитання: Слово по буквах'
										: 'Тип запитання: Ввід тексту'}
								</span>
								<div className={`${styles['typed-review-value']} ${styles['is-correct']}`}>
									Правильна відповідь: {question.variants.map((v) => v.text).filter(Boolean).join(' / ') || '—'}
								</div>
							</div>
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
						<span className={styles['bottom-timer-text']}>{remainingSeconds}</span>
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
			<aside className={styles['game-sidebar']}>
				<div className={styles['game-sidebar-header']}>
					<span>Учасники: ({participants.length})</span>
					<span style={{ color: 'var(--color-text-muted)' }}>⚙</span>
				</div>
				<div className={styles['game-sidebar-list']}>
					{participants.map((p, idx) => (
						<div key={p.participantId || idx} className={styles['participant-item']}>
							<div className={styles['participant-item-left']}>
								<span className={styles['participant-badge']}>{idx + 1}</span>
								<span style={{ fontWeight: 600 }}>{p.nickname}</span>
							</div>
							<button
								type="button"
								className={styles['participant-kick-btn']}
								onClick={() => setKickTarget(p)}
								title="Вилучити учасника"
							>
								✕
							</button>
						</div>
					))}
				</div>
			</aside>

			<ImageLightboxModal
				isOpen={!!lightboxImage}
				imageUrl={lightboxImage}
				onClose={() => setLightboxImage(null)}
			/>

			<KickConfirmModal
				isOpen={!!kickTarget}
				participantName={kickTarget?.nickname || ''}
				onConfirm={() => {
					if (kickTarget) {
						onKickParticipant(kickTarget.participantId);
						setKickTarget(null);
					}
				}}
				onCancel={() => setKickTarget(null)}
			/>
		</div>
	);
}
