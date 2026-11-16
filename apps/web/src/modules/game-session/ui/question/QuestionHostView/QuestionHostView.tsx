import { useState } from 'react';
import { ImageLightboxModal } from '../../modals';
import type { QuestionHostViewProps } from './QuestionHostView.types';
import { KeyboardIcon, ViewEyeIcon, ViewEyeOffIcon } from '../../../../../shared/ui/icons';
import styles from './QuestionHostView.module.css';

export function QuestionHostView({
	question,
	questionIndex,
	totalQuestions,
}: QuestionHostViewProps) {
	const [lightboxImage, setLightboxImage] = useState<string | null>(null);
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);
	const [revealedQuestionKey, setRevealedQuestionKey] = useState<string | null>(null);

	const handleOpenLightbox = (url?: string | null) => {
		if (!url) return;
		setLightboxImage(url);
		setIsLightboxOpen(true);
	};

	const currentKey = `${questionIndex}-${question.questionId ?? ''}`;
	const isAnswerRevealed = revealedQuestionKey === currentKey;

	const isTypedQuestion =
		question.type === 'TYPE_ANSWER_V1' || question.type === 'TYPE_ANSWER_V2';

	return (
		<div className={styles.stage}>
			<div className={styles.container}>
				<div className={styles.questionCard}>
					<div className={styles.questionCounter}>
						Запитання {questionIndex + 1} з {totalQuestions}
					</div>

					<h2 className={styles.questionText}>{question.text}</h2>

					{question.media && (
						<img
							src={question.media}
							alt="Медіа запитання"
							className={styles.questionMediaImg}
							onClick={() => handleOpenLightbox(question.media)}
						/>
					)}
				</div>

				{isTypedQuestion ? (
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
								onClick={() =>
									setRevealedQuestionKey((prev) => (prev === currentKey ? null : currentKey))
								}
								title={
									isAnswerRevealed
										? 'Приховати правильну відповідь'
										: 'Показати правильну відповідь'
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
					<div className={styles.variantsRow}>
						{question.variants.map((variant, idx) => (
							<div key={variant.id} className={styles.variantCard}>
								<span className={styles.variantBadge}>{idx + 1}</span>
								<span className={styles.variantText}>
									{variant.text || 'Варіант без тексту'}
								</span>
							</div>
						))}
					</div>
				)}
			</div>

			<ImageLightboxModal
				isOpen={isLightboxOpen}
				imageUrl={lightboxImage}
				onClose={() => setIsLightboxOpen(false)}
				onAfterClose={() => setLightboxImage(null)}
			/>
		</div>
	);
}
