import type { CSSProperties } from 'react';
import { pluralizeAnswers } from '../../../../../shared';
import type { ReviewOverviewTabProps } from './ReviewOverviewTab.types';
import styles from './ReviewOverviewTab.module.css';

/**
 * Displays the question prompt, optional media, and answer distribution overview.
 */
export function ReviewOverviewTab({
	question,
	reviewData,
	participantsCount,
	onOpenImage,
}: ReviewOverviewTabProps) {
	const distribution = reviewData.answersDistribution || {};
	const correctIds = reviewData.correctVariantIds;
	const isTypeV2 = question.type === 'TYPE_ANSWER_V2';
	const isTyped = question.type === 'TYPE_ANSWER_V1' || isTypeV2;
	const correctAnswersText =
		reviewData.correctTextAnswers?.join(' / ') ||
		question.variants.map((variant) => variant.text).filter(Boolean).join(' / ') ||
		'—';

	return (
		<div className={styles.container}>
			<h3 className={styles.questionTitle}>{question.text}</h3>

			{question.media && (
				<img
					src={question.media}
					alt="Question media"
					className={styles.mediaImg}
					onClick={() => onOpenImage(question.media!)}
				/>
			)}

			{isTyped ? (
				<div className={styles.typedCard}>
					<div className={styles.typedRow}>
						<span className={styles.typedLabel}>
							{isTypeV2 ? 'Тип: Слово по буквах' : 'Тип: Ввід тексту'}
						</span>
						<div className={`${styles.typedValue} ${styles.isCorrect}`}>
							Правильна відповідь: {correctAnswersText}
						</div>
					</div>
				</div>
			) : (
				<div className={styles.variantsList}>
					{question.variants.map((variant, idx) => {
						const count = distribution[variant.id] || 0;
						const isCorrect = correctIds.includes(variant.id);
						const pct =
							participantsCount > 0
								? Math.min(100, Math.round((count / participantsCount) * 100))
								: 0;

						return (
							<div
								key={variant.id}
								className={`${styles.variantRow} ${isCorrect ? styles.isCorrect : ''}`}
							>
								<div className={styles.variantInfo}>
									<div className={styles.variantBadge}>{idx + 1}</div>
									<span className={styles.variantText}>
										{variant.text || 'Варіант без тексту'}
										{isCorrect && <span className={styles.correctHint}>(Правильний)</span>}
									</span>
								</div>

								<div className={`${styles.badgeCount} ${count > 0 ? styles.hasAnswers : ''}`}>
									<div
										className={styles.badgeFill}
										style={
											{
												'--badge-target-width': `${pct}%`,
												width: `${pct}%`,
											} as CSSProperties
										}
									/>
									<span className={styles.badgeText}>{pluralizeAnswers(count, true)}</span>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
