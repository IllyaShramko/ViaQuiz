import { useState, useEffect } from 'react';
import { AntiCheatOverlay } from '../AntiCheatOverlay';
import { ImageLightboxModal } from '../../modals';
import type { QuestionStudentViewProps } from './QuestionStudentView.types';
import styles from '../../GameSession.module.css';

export function QuestionStudentView({
	question,
	alreadyAnswered,
	onSubmitAnswer,
}: QuestionStudentViewProps) {
	const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);
	const [typedInput, setTypedInput] = useState<string>('');
	const [lightboxImage, setLightboxImage] = useState<string | null>(null);

	const questionKey =
		(question as { questionId?: number; id?: number }).questionId ??
		(question as { questionId?: number; id?: number }).id ??
		question.text ??
		'';

	// Reset state whenever a new question starts
	useEffect(() => {
		setSelectedVariantIds([]);
		setTypedInput('');
	}, [questionKey]);

	const isMulti = question.type === 'MANY_ANSWERS';
	const isTypeV1 = question.type === 'TYPE_ANSWER_V1';
	const isTypeV2 = question.type === 'TYPE_ANSWER_V2';
	const isTyped = isTypeV1 || isTypeV2;

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

	const handleSubmitTyped = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		const trimmed = typedInput.trim();
		if (!trimmed || alreadyAnswered) return;
		onSubmitAnswer(undefined, trimmed);
	};

	// Keyboard shortcuts for answering (1-8 to select variants, Enter to submit multi-answer)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (alreadyAnswered) return;

			// Do not intercept if user is typing in an input or textarea
			const targetTag = (e.target as HTMLElement)?.tagName;
			if (
				targetTag === 'INPUT' ||
				targetTag === 'TEXTAREA' ||
				(e.target as HTMLElement)?.isContentEditable
			) {
				return;
			}

			if (isTyped) return;

			let num: number | null = null;
			if (e.key >= '1' && e.key <= '8') {
				num = parseInt(e.key, 10);
			} else if (/^Numpad[1-8]$/.test(e.code)) {
				num = parseInt(e.code.replace('Numpad', ''), 10);
			}

			if (num !== null) {
				const variantIndex = num - 1;
				const targetVariant = question.variants?.[variantIndex];
				if (targetVariant) {
					e.preventDefault();
					if (isMulti) {
						setSelectedVariantIds((prev) =>
							prev.includes(targetVariant.id)
								? prev.filter((id) => id !== targetVariant.id)
								: [...prev, targetVariant.id],
						);
					} else {
						onSubmitAnswer([targetVariant.id]);
					}
				}
				return;
			}

			if (e.key === 'Enter') {
				if (isMulti && selectedVariantIds.length > 0) {
					e.preventDefault();
					onSubmitAnswer(selectedVariantIds);
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [
		alreadyAnswered,
		isTyped,
		isMulti,
		question.variants,
		selectedVariantIds,
		onSubmitAnswer,
	]);

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

					{isTypeV1 && (
						<p
							style={{
								color: 'var(--color-accent, #863bff)',
								fontSize: '0.875rem',
								fontWeight: 600,
								marginTop: '0.75rem',
							}}
						>
							* Введіть вашу відповідь у поле нижче
						</p>
					)}

					{isTypeV2 && (
						<p
							style={{
								color: 'var(--color-accent, #863bff)',
								fontSize: '0.875rem',
								fontWeight: 600,
								marginTop: '0.75rem',
							}}
						>
							* Введіть слово (по буквах)
						</p>
					)}
				</div>

				{/* Typed Answer Input (V1 or V2) */}
				{isTyped ? (
					<form
						className={styles['typed-answer-wrapper']}
						onSubmit={handleSubmitTyped}
					>
						<div className={styles['typed-answer-input-box']}>
							<input
								type="text"
								disabled={alreadyAnswered}
								autoFocus
								className={styles['typed-answer-text-input']}
								placeholder={
									isTypeV2 ? 'Введіть слово...' : 'Введіть відповідь...'
								}
								value={typedInput}
								onChange={(e) =>
									setTypedInput(
										isTypeV2 ? e.target.value.toUpperCase() : e.target.value,
									)
								}
							/>
							<button
								type="submit"
								disabled={alreadyAnswered || !typedInput.trim()}
								className={styles['typed-answer-submit-btn']}
							>
								<span>Відповісти</span>
								<span>↵</span>
							</button>
						</div>

						{/* V2 Letters Preview Boxes */}
						{isTypeV2 && typedInput.length > 0 && (
							<div className={styles['typed-v2-boxes']}>
								{typedInput.split('').map((char, i) => (
									<div
										key={i}
										className={`${styles['typed-v2-letter-box']} ${
											char.trim() ? styles['is-filled'] : ''
										}`}
									>
										{char}
									</div>
								))}
							</div>
						)}
					</form>
				) : (
					/* Horizontal Squares Variants Grid */
					<div className={styles['variants-grid']}>
						{question.variants.map((v, idx) => {
							const colorIndex = idx % 8;
							const isSelected = selectedVariantIds.includes(v.id);

							return (
								<button
									key={v.id}
									type="button"
									disabled={alreadyAnswered}
									className={`${styles['student-variant-btn']} ${
										styles[`variant-color-${colorIndex}`]
									} ${isSelected ? styles['is-selected'] : ''}`}
									onClick={() => handleVariantClick(v.id)}
								>
									<div className={styles['variant-badge-corner']}>{idx + 1}</div>
									<span>{v.text || 'Варіант без тексту'}</span>
								</button>
							);
						})}
					</div>
				)}

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
