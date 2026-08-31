import { useState, useEffect } from 'react';
import { ImageLightboxModal } from '../modals/ImageLightboxModal';
import { getRandomCaption } from '../../utils/captions';
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

	const [quote] = useState(() => {
		if (!isAnswered) return getRandomCaption('skipped');
		if (isCorrect) return getRandomCaption('correct');
		return getRandomCaption('incorrect');
	});

	const [isMinimized, setIsMinimized] = useState(false);
	const [lightboxImage, setLightboxImage] = useState<string | null>(null);

	useEffect(() => {
		// Wait 3.5 seconds (1-2s for entry animation + some reading time) then minimize
		const timer = setTimeout(() => {
			setIsMinimized(true);
		}, 3500);

		return () => clearTimeout(timer);
	}, []);

	const isTypeV1 = question.type === 'TYPE_ANSWER_V1';
	const isTypeV2 = question.type === 'TYPE_ANSWER_V2';
	const isTyped = isTypeV1 || isTypeV2;
	const studentTypedAnswer = res?.typedAnswer ?? reviewData.myAnswer?.typedAnswer;
	const correctAnswersText =
		reviewData.correctTextAnswers?.join(' / ') ||
		question.variants.map((v) => v.text).filter(Boolean).join(' / ') ||
		'—';

	return (
		<div className={styles['game-main-content']}>
			{/* Overlay to add blur and backdrop */}
			<div
				className={`${styles['review-student-overlay']} ${styles['is-active']}`}
			/>

			{/* Status Banner Container */}
			<div
				className={`${styles['review-student-banner-container']} ${
					isMinimized ? styles['is-minimized'] : ''
				}`}
			>
				{!isAnswered ? (
					<>
						<div
							className={`${styles['review-student-banner']} ${
								styles['review-banner-skipped']
							} ${isMinimized ? styles['is-minimized'] : ''}`}
						>
							<span>Пропущено</span>
						</div>
						<span
							className={`${styles['review-banner-quote']} ${
								isMinimized ? styles['is-hidden'] : ''
							}`}
						>
							{quote}
						</span>
					</>
				) : isCorrect ? (
					<>
						<div
							className={`${styles['review-student-banner']} ${
								styles['review-banner-correct']
							} ${isMinimized ? styles['is-minimized'] : ''}`}
						>
							<span>Правильно! +{res?.pointsEarned ?? 1000} балів</span>
						</div>
						<span
							className={`${styles['review-banner-quote']} ${
								isMinimized ? styles['is-hidden'] : ''
							}`}
						>
							{quote}
						</span>
					</>
				) : (
					<>
						<div
							className={`${styles['review-student-banner']} ${
								styles['review-banner-wrong']
							} ${isMinimized ? styles['is-minimized'] : ''}`}
						>
							<span>Не правильно</span>
						</div>
						<span
							className={`${styles['review-banner-quote']} ${
								isMinimized ? styles['is-hidden'] : ''
							}`}
						>
							{quote}
						</span>
					</>
				)}
			</div>

			<div className={styles['question-container']}>
				{/* Question Card */}
				<div className={styles['question-header-card']}>
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

				{/* Highlighted Variants Grid OR Typed Review Card */}
				{isTyped ? (
					<div className={styles['typed-review-card']}>
						<div className={styles['typed-review-row']}>
							<span className={styles['typed-review-label']}>Ваша відповідь</span>
							<div
								className={`${styles['typed-review-value']} ${
									!isAnswered
										? styles['is-skipped']
										: isCorrect
											? styles['is-correct']
											: styles['is-wrong']
								}`}
							>
								{isAnswered ? studentTypedAnswer || '—' : 'Пропущено (без відповіді)'}
							</div>
						</div>

						<div className={styles['typed-review-row']}>
							<span className={styles['typed-review-label']}>
								Правильна відповідь
							</span>
							<div
								className={`${styles['typed-review-value']} ${styles['is-correct']}`}
							>
								{correctAnswersText}
							</div>
						</div>
					</div>
				) : (
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
				)}
			</div>

			<ImageLightboxModal
				isOpen={!!lightboxImage}
				imageUrl={lightboxImage}
				onClose={() => setLightboxImage(null)}
			/>
		</div>
	);
}
