import { useState, useEffect } from 'react';
import { MAX_QUESTION_VARIANTS } from '@viaquiz/shared-types';
import { ImageLightboxModal } from '../../modals';
import { getRandomCaption } from '../../../utils/captions';
import { pluralizePoints } from '../../../../../shared';
import type { ReviewStudentViewProps } from './ReviewStudentView.types';
import styles from './ReviewStudentView.module.css';

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
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);

	const handleOpenLightbox = (url?: string | null) => {
		if (!url) return;
		setLightboxImage(url);
		setIsLightboxOpen(true);
	};

	useEffect(() => {
		// Wait 3.5 seconds (1-2s for entry animation + some reading time) then minimize
		const timer = setTimeout(() => {
			setIsMinimized(true);
		}, 3500);

		return () => clearTimeout(timer);
	}, []);

	const isTyped =
		question.type === 'TYPE_ANSWER_V1' || question.type === 'TYPE_ANSWER_V2';
	const typedStatusClass = isTyped
		? !isAnswered
			? styles.isTypedSkipped
			: isCorrect
				? styles.isTypedCorrect
				: styles.isTypedWrong
		: '';

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
			{/* Overlay to add blur, backdrop, and red/green status highlight for typed answers */}
			<div
				className={`${styles.reviewStudentOverlay} ${styles.isActive} ${typedStatusClass}`}
			/>

			{/* Status Banner Container */}
			<div
				className={`${styles.reviewStudentBannerContainer} ${
					isMinimized ? styles.isMinimized : ''
				}`}
			>
				{!isAnswered ? (
					<>
						<div
							className={`${styles.reviewStudentBanner} ${
								styles.reviewBannerSkipped
							} ${isMinimized ? styles.isMinimized : ''}`}
						>
							<span>Пропущено</span>
						</div>
						<span
							className={`${styles.reviewBannerQuote} ${
								isMinimized ? styles.isHidden : ''
							}`}
						>
							{quote}
						</span>
					</>
				) : isCorrect ? (
					<>
						<div
							className={`${styles.reviewStudentBanner} ${
								styles.reviewBannerCorrect
							} ${isMinimized ? styles.isMinimized : ''}`}
						>
							<span>Правильно! +{pluralizePoints(res?.pointsEarned ?? 1000, true)}</span>
						</div>
						<span
							className={`${styles.reviewBannerQuote} ${
								isMinimized ? styles.isHidden : ''
							}`}
						>
							{quote}
						</span>
					</>
				) : (
					<>
						<div
							className={`${styles.reviewStudentBanner} ${
								styles.reviewBannerWrong
							} ${isMinimized ? styles.isMinimized : ''}`}
						>
							<span>Не правильно</span>
						</div>
						<span
							className={`${styles.reviewBannerQuote} ${
								isMinimized ? styles.isHidden : ''
							}`}
						>
							{quote}
						</span>
					</>
				)}
			</div>

			{/* Question and variants remain blurred in review screen */}
			<div
				className={`${styles.questionContainer} ${styles.isBlurred}`}
			>
				{/* Top Section: Question Card (pinned to top on mobile) */}
				<div className={`${styles.questionHeaderCard} ${typedStatusClass}`}>
					<h2 className={styles.questionText}>{question.text}</h2>

					{question.media && (
						<img
							src={question.media}
							alt="Question media"
							className={styles.questionMediaImg}
							onClick={() => handleOpenLightbox(question.media)}
						/>
					)}
				</div>

				{/* For choice questions, keep highlighted variant tiles behind blur; typed answers use clean green/red highlight */}
				{!isTyped && (
					<div className={styles.variantsSectionBottom}>
						<div
							className={`${styles.variantsGrid} ${gridVariantClass}`}
						>
							{question.variants.map((v, idx) => {
								const colorIndex = idx % MAX_QUESTION_VARIANTS;
								const isThisCorrect = correctIds.includes(v.id);
								const isThisSelected = selectedIds.includes(v.id);

								const reviewClass = isThisCorrect
									? styles.reviewVariantCorrect
									: isThisSelected
										? styles.reviewVariantWrong
										: styles.reviewVariantDimmed;

								const colorClass =
									styles[
										`variantColor${colorIndex}` as keyof typeof styles
									] || '';

								return (
									<div
										key={v.id}
										className={`${styles.studentVariantBtn} ${colorClass} ${reviewClass}`}
									>
										<div className={styles.variantBadgeCorner}>{idx + 1}</div>
										<span>{v.text || 'Варіант без тексту'}</span>
									</div>
								);
							})}
						</div>
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
