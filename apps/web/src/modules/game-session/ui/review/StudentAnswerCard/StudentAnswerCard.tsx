import { TimerIcon, CheckIcon, UserIcon, IncorrectCrossIcon } from '../../../../../shared/ui/icons';
import type { StudentAnswerCardProps } from './StudentAnswerCard.types';
import styles from './StudentAnswerCard.module.css';

/**
 * Renders an individual participant's submitted answer card in the host review view.
 */
export function StudentAnswerCard({
	student,
	variants,
	correctVariantIds,
	animationDelaySec = 0,
}: StudentAnswerCardProps) {
	const cardStatusClass = student.isCorrect ? styles.isCorrect : styles.isWrong;
	const variantIds = student.variantIds || [];

	const renderAnswerBody = () => {
		if (student.typedAnswer) {
			return (
				<div className={styles.selectedVariant}>
					<span className={styles.variantText}>
						Відповідь: &ldquo;{student.typedAnswer}&rdquo;
					</span>
					{student.isCorrect && (
						<span className={styles.correctCheckMark}>
							<CheckIcon size={14} />
						</span>
					)}
				</div>
			);
		}

		if (variantIds.length > 0) {
			return (
				<div className={styles.variantsColumn}>
					{variantIds.map((variantId) => {
						const variantIndex = variants.findIndex((variant) => variant.id === variantId);
						const variant = variantIndex >= 0 ? variants[variantIndex] : undefined;
						const isThisCorrect = correctVariantIds.includes(variantId);

						return (
							<div key={variantId} className={styles.selectedVariant}>
								<span className={styles.variantNum}>
									{variantIndex >= 0 ? variantIndex + 1 : '•'}
								</span>
								<span className={styles.variantText}>
									{variant?.text || 'Варіант без тексту'}
								</span>
								{isThisCorrect && (
									<span className={styles.correctCheckMark}>
										<CheckIcon size={14} />
									</span>
								)}
							</div>
						);
					})}
				</div>
			);
		}

		return <div className={styles.skippedText}>Час вийшов (без відповіді)</div>;
	};

	return (
		<div
			className={`${styles.card} ${cardStatusClass}`}
			style={animationDelaySec > 0 ? { animationDelay: `${animationDelaySec}s` } : undefined}
		>
			<div className={styles.header}>
				<div className={styles.name}>
					<span className={styles.avatarIcon}>
						<UserIcon size={14} />
					</span>
					<span>{student.nickname}</span>
				</div>

				{student.isCorrect ? (
					<span className={`${styles.statusBadge} ${styles.statusCorrect}`}>
						<CheckIcon size={12} /> Правильно{' '}
						{student.scoreEarned > 0 ? `(+${student.scoreEarned})` : ''}
					</span>
				) : (
					<span className={`${styles.statusBadge} ${styles.statusWrong}`}>
						<IncorrectCrossIcon size={10} /> Неправильно (+0)
					</span>
				)}
			</div>

			<div className={styles.body}>{renderAnswerBody()}</div>

			<div className={styles.footer}>
				<div className={styles.time}>
					{student.timeSpentMs > 0 ? (
						<span className={styles.timeInner}>
							<TimerIcon size={14} /> {(student.timeSpentMs / 1000).toFixed(1)} сек
						</span>
					) : (
						<span>-</span>
					)}
				</div>
				<div className={styles.totalScore}>
					Загальний бал: <strong>{student.totalScore}</strong> б
				</div>
			</div>
		</div>
	);
}
