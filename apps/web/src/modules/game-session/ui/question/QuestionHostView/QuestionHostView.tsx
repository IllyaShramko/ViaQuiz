import { useState, useEffect } from 'react';
import { ImageLightboxModal } from '../../modals';
import type { QuestionHostViewProps } from './QuestionHostView.types';
import timerIcon from '../../../../../assets/icons/timer.svg';
import nextIcon from '../../../../../assets/icons/next.svg';
import { KeyboardIcon, ViewEyeIcon, ViewEyeOffIcon } from '../../../../../shared/ui/icons';
import styles from './QuestionHostView.module.css';

export function QuestionHostView({
	question,
	questionIndex,
	totalQuestions,
	participants,
	answeredCount,
	answeredParticipantIds: _answeredParticipantIds,
	remainingSeconds,
	onExtendTime,
	onSkipQuestion,
	onKickParticipant: _onKickParticipant,
}: QuestionHostViewProps) {
	const [lightboxImage, setLightboxImage] = useState<string | null>(null);
	const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);

	// Reset revealed state on question change
	useEffect(() => {
		setIsAnswerRevealed(false);
	}, [questionIndex, (question as { questionId?: number; id?: number }).questionId, (question as { id?: number }).id]);

	const variantCount = question.variants?.length || 0;
	const gridVariantClass =
		variantCount === 2
			? styles.variantsGridCount2
			: variantCount === 3
				? styles.variantsGridCount3
				: variantCount > 4
					? styles.variantsGridColumnMobile
					: '';

	return (
		<div className={styles.gameMainContent}>
			<div className={styles.questionContainer}>
				{/* Question Card */}
				<div className={styles.questionHeaderCard}>
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

					<h2 className={styles.questionText}>{question.text}</h2>

					{question.media && (
						<img
							src={question.media}
							alt="Question media"
							className={styles.questionMediaImg}
							onClick={() => setLightboxImage(question.media || null)}
						/>
					)}
				</div>

				{/* Variants Grid / Typed Preview (Host View) */}
				{question.type === 'TYPE_ANSWER_V1' || question.type === 'TYPE_ANSWER_V2' ? (
					<div className={styles.typedHostCard}>
						<div className={styles.typedHostHeader}>
							<div className={styles.typedHostTypeBadge}>
								<KeyboardIcon size={16} />
								<span>
									{question.type === 'TYPE_ANSWER_V2'
										? 'Тип запитання: Слово по буквах'
										: 'Тип запитання: Ввід тексту'}
								</span>
							</div>

							<button
								type="button"
								className={`${styles.typedHostRevealBtn} ${
									isAnswerRevealed ? styles.isRevealed : ''
								}`}
								onClick={() => setIsAnswerRevealed((prev) => !prev)}
								title={
									isAnswerRevealed
										? 'Приховати правильну відповідь'
										: 'Показати правильну відповідь (обережно при демонстрації екрана)'
								}
							>
								{isAnswerRevealed ? <ViewEyeOffIcon size={16} /> : <ViewEyeIcon size={16} />}
								<span>
									{isAnswerRevealed ? 'Приховати відповідь' : 'Показати відповідь'}
								</span>
							</button>
						</div>

						{isAnswerRevealed ? (
							<div className={`${styles.typedHostStatusBox} ${styles.isRevealed}`}>
								<div className={styles.typedHostRevealedInner}>
									<span className={styles.typedHostRevealedLabel}>
										Правильна відповідь:
									</span>
									<span className={styles.typedHostRevealedText}>
										{question.variants.map((v) => v.text).filter(Boolean).join(' / ') || '—'}
									</span>
								</div>
							</div>
						) : (
							<div className={styles.typedHostStatusBox}>
								<p className={styles.typedHostStatusText}>
									Учасники самостійно вводять відповідь на своїх пристроях
								</p>
							</div>
						)}
					</div>
				) : (
					<div className={`${styles.variantsGrid} ${gridVariantClass}`}>
						{question.variants.map((v, idx) => (
							<div key={v.id} className={styles.teacherVariantCard}>
								<div className={styles.variantBadgeCorner}>{idx + 1}</div>
								<span className={styles.teacherVariantText}>
									{v.text || 'Варіант без тексту'}
								</span>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Floating Bottom Control Bar (matches old GPTQuiz design) */}
			<div className={styles.teacherBottomControls}>
				<div className={styles.bottomTimerSection}>
					<img src={timerIcon} alt="Timer" className={styles.bottomTimerIcon} />
					<span className={styles.bottomTimerText}>{remainingSeconds} с</span>
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

				<div className={styles.bottomControlsButtons}>
					<button
						type="button"
						className={styles.bottomControlBtn}
						onClick={() => onExtendTime(15)}
						disabled={remainingSeconds >= 900}
						title={
							remainingSeconds >= 900
								? 'Максимальний час досягнуто (900 с)'
								: undefined
						}
					>
						<div className={styles.bottomControlBtnInner}>
							<p>+15 сек</p>
						</div>
					</button>

					<button
						type="button"
						className={styles.bottomControlBtn}
						onClick={onSkipQuestion}
						title="Перейти до наступного"
					>
						<div className={styles.bottomControlBtnInner}>
							<img src={nextIcon} alt="Далі" className={styles.bottomNextIcon} />
						</div>
					</button>
				</div>
			</div>

			<ImageLightboxModal
				isOpen={!!lightboxImage}
				imageUrl={lightboxImage}
				onClose={() => setLightboxImage(null)}
			/>
		</div>
	);
}
