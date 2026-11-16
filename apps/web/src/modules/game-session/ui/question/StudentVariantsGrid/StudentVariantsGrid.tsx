import { useState, useEffect, useCallback } from 'react';
import { MAX_QUESTION_VARIANTS } from '@viaquiz/shared-types';
import { Button, CheckIcon } from '../../../../../shared';
import type { StudentVariantsGridProps } from './StudentVariantsGrid.types';
import styles from './StudentVariantsGrid.module.css';

/**
 * Renders single- or multi-choice option buttons with keyboard shortcuts (1-6, Enter).
 */
export function StudentVariantsGrid({
	variants,
	isMulti,
	disabled = false,
	onSubmit,
}: StudentVariantsGridProps) {
	const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);

	const selectOrToggleVariant = useCallback(
		(variantId: number) => {
			if (disabled) return;

			if (isMulti) {
				setSelectedVariantIds((prev) =>
					prev.includes(variantId)
						? prev.filter((id) => id !== variantId)
						: [...prev, variantId],
				);
			} else {
				onSubmit([variantId]);
			}
		},
		[disabled, isMulti, onSubmit],
	);

	const handleSubmitMulti = () => {
		if (selectedVariantIds.length === 0 || disabled) return;
		onSubmit(selectedVariantIds);
	};

	// Keyboard shortcuts for fast option selection (1-6) and Enter submit on multi-choice
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (disabled) return;

			const targetTag = (e.target as HTMLElement)?.tagName;
			if (
				targetTag === 'INPUT' ||
				targetTag === 'TEXTAREA' ||
				(e.target as HTMLElement)?.isContentEditable
			) {
				return;
			}

			let num: number | null = null;
			if (e.key >= '1' && e.key <= '6') {
				num = parseInt(e.key, 10);
			} else if (/^Numpad[1-6]$/.test(e.code)) {
				num = parseInt(e.code.replace('Numpad', ''), 10);
			}

			if (num !== null) {
				const targetVariant = variants[num - 1];
				if (targetVariant) {
					e.preventDefault();
					selectOrToggleVariant(targetVariant.id);
				}
				return;
			}

			if (e.key === 'Enter' && isMulti && selectedVariantIds.length > 0) {
				e.preventDefault();
				onSubmit(selectedVariantIds);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [disabled, isMulti, variants, selectedVariantIds, selectOrToggleVariant, onSubmit]);

	const variantCount = variants.length;
	const gridVariantClass =
		variantCount === 2
			? styles.variantsGridCount2
			: variantCount === 3
				? styles.variantsGridCount3
				: variantCount > 4
					? styles.variantsGridColumnMobile
					: '';

	return (
		<div className={styles.variantsSectionBottom}>
			<div className={`${styles.variantsGrid} ${gridVariantClass}`}>
				{variants.map((variant, idx) => {
					const colorIndex = idx % MAX_QUESTION_VARIANTS;
					const isSelected = selectedVariantIds.includes(variant.id);
					const colorClass =
						styles[`variantColor${colorIndex}` as keyof typeof styles] || '';

					return (
						<button
							key={variant.id}
							type="button"
							role={isMulti ? 'checkbox' : undefined}
							aria-checked={isMulti ? isSelected : undefined}
							disabled={disabled}
							className={`${styles.studentVariantBtn} ${colorClass} ${
								isSelected ? styles.isSelected : ''
							}`}
							onClick={() => selectOrToggleVariant(variant.id)}
						>
							<div className={styles.variantBadgeCorner}>{idx + 1}</div>

							{isMulti && (
								<div
									className={`${styles.variantCheckboxCorner} ${
										isSelected ? styles.variantCheckboxSelected : ''
									}`}
									aria-hidden="true"
								>
									{isSelected && (
										<CheckIcon
											size={16}
											strokeWidth="3"
											className={styles.variantCheckboxCheck}
										/>
									)}
								</div>
							)}

							<span>{variant.text || 'Варіант без тексту'}</span>
						</button>
					);
				})}
			</div>

			{isMulti && !disabled && (
				<Button
					type="button"
					variant="primary"
					size="md"
					disabled={selectedVariantIds.length === 0}
					className={styles.multiSubmitBtn}
					onClick={handleSubmitMulti}
				>
					Відправити відповідь{' '}
					{selectedVariantIds.length > 0 ? `(${selectedVariantIds.length})` : ''}
				</Button>
			)}
		</div>
	);
}
