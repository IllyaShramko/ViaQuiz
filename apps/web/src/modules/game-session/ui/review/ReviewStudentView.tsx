import { useState, useEffect } from 'react';
import type {
	GameQuestionDto,
	GameReviewDataDto,
} from '@viaquiz/shared-types';
import styles from '../GameSession.module.css';

export interface ReviewStudentViewProps {
	question: GameQuestionDto;
	reviewData: GameReviewDataDto;
}

export function ReviewStudentView({
	question,
	reviewData,
}: ReviewStudentViewProps) {
	const res = reviewData.participantResult;
	const isAnswered = res?.isAnswered ?? !!reviewData.myAnswer;
	const isCorrect = res?.isCorrect ?? reviewData.myAnswer?.isCorrect ?? false;
	const selectedIds = res?.selectedVariantIds ?? reviewData.myAnswer?.variantIds ?? [];
	const correctIds = reviewData.correctVariantIds;

	const [isMinimized, setIsMinimized] = useState(false);

	useEffect(() => {
		// Wait 3 seconds (1-2s for entry animation + some reading time) then minimize
		const timer = setTimeout(() => {
			setIsMinimized(true);
		}, 3500); // 3.5s total

		return () => clearTimeout(timer);
	}, []);

	return (
		<div className={styles['game-main-content']}>
			{/* Overlay to block clicks and add blur, appears immediately */}
			<div className={`${styles['review-student-overlay']} ${styles['is-active']}`} />

			{/* Status Banner Container */}
			<div className={`${styles['review-student-banner-container']} ${isMinimized ? styles['is-minimized'] : ''}`}>
				{!isAnswered ? (
					<>
						<div className={`${styles['review-student-banner']} ${styles['review-banner-skipped']}`}>
							<span>Пропущено</span>
						</div>
						<span className={`${styles['review-banner-quote']} ${isMinimized ? styles['is-hidden'] : ''}`}>
							Занадто легко для твоєї уваги?
						</span>
					</>
				) : isCorrect ? (
					<>
						<div className={`${styles['review-student-banner']} ${styles['review-banner-correct']}`}>
							<span>Правильно! +{res?.pointsEarned ?? 1000} балів</span>
						</div>
						<span className={`${styles['review-banner-quote']} ${isMinimized ? styles['is-hidden'] : ''}`}>
							Чудова робота! Так тримати!
						</span>
					</>
				) : (
					<>
						<div className={`${styles['review-student-banner']} ${styles['review-banner-wrong']}`}>
							<span>Не правильно</span>
						</div>
						<span className={`${styles['review-banner-quote']} ${isMinimized ? styles['is-hidden'] : ''}`}>
							Невдача — це лише паливо для майбутньої перемоги.
						</span>
					</>
				)}
			</div>

			<div className={styles['question-container']}>
				{/* Question Card */}
				<div className={styles['question-header-card']}>
					<h2 className={styles['question-text']}>{question.text}</h2>
				</div>

				{/* Highlighted Variants Grid */}
				<div className={styles['variants-grid']}>
					{question.variants.map((v, idx) => {
						const colorIndex = idx % 8;
						const isThisCorrect = correctIds.includes(v.id);
						const isThisSelected = selectedIds.includes(v.id);

						let reviewClass = '';
						if (isThisCorrect) {
							reviewClass = styles['review-variant-correct'];
						} else if (isThisSelected && !isThisCorrect) {
							reviewClass = styles['review-variant-wrong'];
						} else {
							reviewClass = styles['review-variant-dimmed'];
						}

						return (
							<div
								key={v.id}
								className={`${styles['student-variant-btn']} ${styles[`variant-color-${colorIndex}`]} ${reviewClass}`}
							>
								<div className={styles['variant-badge-corner']}>{idx + 1}</div>
								<span>{v.text || 'Варіант без тексту'}</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
