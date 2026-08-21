import { useState, useMemo, useEffect } from 'react';
import { AntiCheatOverlay } from './AntiCheatOverlay';
import { ImageLightboxModal } from '../modals/ImageLightboxModal';
import { shuffleArray } from '../../utils/shuffle';
import type { GameQuestionDto } from '@viaquiz/shared-types';
import styles from '../GameSession.module.css';

export interface QuestionStudentViewProps {
	question: GameQuestionDto;
	alreadyAnswered: boolean;
	onSubmitAnswer: (variantIds: number[]) => void;
}

export function QuestionStudentView({
	question,
	alreadyAnswered,
	onSubmitAnswer,
}: QuestionStudentViewProps) {
	const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);
	const [lightboxImage, setLightboxImage] = useState<string | null>(null);

	const questionKey = (question as { questionId?: number; id?: number }).questionId ?? (question as { questionId?: number; id?: number }).id ?? question.text ?? '';

	// Reset selected variants whenever a new question starts
	useEffect(() => {
		setSelectedVariantIds([]);
	}, [questionKey]);

	// Fisher-Yates shuffle: each participant gets an independent, randomized answer order to prevent cheating
	const shuffledVariants = useMemo(() => {
		return shuffleArray(question.variants || []);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [questionKey]);

	const isMulti = question.type === 'MANY_ANSWERS';

	const handleVariantClick = (variantId: number) => {
		if (alreadyAnswered) return;

		if (isMulti) {
			setSelectedVariantIds((prev) =>
				prev.includes(variantId)
					? prev.filter((id) => id !== variantId)
					: [...prev, variantId],
			);
		} else {
			onSubmitAnswer([variantId]);
		}
	};

	const handleSubmitMulti = () => {
		if (selectedVariantIds.length === 0 || alreadyAnswered) return;
		onSubmitAnswer(selectedVariantIds);
	};

	return (
		<div className={styles['game-main-content']}>
			{alreadyAnswered && <AntiCheatOverlay />}

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

					{isMulti && (
						<p
							style={{
								color: 'var(--color-accent, #863bff)',
								fontSize: '0.875rem',
								fontWeight: 600,
								marginTop: '0.75rem',
							}}
						>
							* Оберіть декілька правильних варіантів
						</p>
					)}
				</div>

				{/* Horizontal Squares Variants Grid */}
				<div className={styles['variants-grid']}>
					{shuffledVariants.map((v, idx) => {
						const colorIndex = idx % 8;
						const isSelected = selectedVariantIds.includes(v.id);

						return (
							<button
								key={v.id}
								type="button"
								disabled={alreadyAnswered}
								className={`${styles['student-variant-btn']} ${styles[`variant-color-${colorIndex}`]} ${
									isSelected ? styles['is-selected'] : ''
								}`}
								onClick={() => handleVariantClick(v.id)}
							>
								<div className={styles['variant-badge-corner']}>{idx + 1}</div>
								<span>{v.text || 'Варіант без тексту'}</span>
							</button>
						);
					})}
				</div>

				{/* Multi-answer confirmation button */}
				{isMulti && !alreadyAnswered && (
					<button
						type="button"
						disabled={selectedVariantIds.length === 0}
						className={styles['lobby-start-btn']}
						style={{ width: '100%', maxWidth: '400px', marginTop: '1rem' }}
						onClick={handleSubmitMulti}
					>
						Відправити відповідь ({selectedVariantIds.length})
					</button>
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
