import { useState, useRef, useMemo, useEffect } from 'react';
import {
	parseTypeAnswerV2Mask,
	assembleTypeAnswerV2Answer,
	applyTypeAnswerV2Paste,
	isTypeAnswerV2Bracket,
} from '@viaquiz/utils';
import { Button } from '../../../../../shared/ui';
import type { TypeAnswerV2InputProps } from './TypeAnswerV2Input.types';
import styles from './TypeAnswerV2Input.module.css';

export function TypeAnswerV2Input(props: TypeAnswerV2InputProps) {
	return <TypeAnswerV2InputInner key={props.mask} {...props} />;
}

function TypeAnswerV2InputInner({
	mask,
	disabled = false,
	onSubmit,
}: TypeAnswerV2InputProps) {
	const parsed = useMemo(() => parseTypeAnswerV2Mask(mask), [mask]);
	const [values, setValues] = useState<string[]>(() =>
		Array.from({ length: parsed.inputCount }, () => ''),
	);
	const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
	const isComposingRef = useRef(false);

	useEffect(() => {
		if (!disabled && parsed.inputCount > 0) {
			requestAnimationFrame(() => {
				inputRefs.current[0]?.focus();
			});
		}
	}, [parsed.inputCount, disabled]);

	const focusSlot = (slotIndex: number) => {
		const target = inputRefs.current[slotIndex];
		if (target) {
			target.focus();
			target.select();
		}
	};

	const filledCount = values.filter((val) => val.trim().length > 0).length;
	const isComplete = parsed.inputCount > 0 && filledCount === parsed.inputCount;

	const submitCurrentAnswer = () => {
		if (disabled || !isComplete) return;
		const assembled = assembleTypeAnswerV2Answer(mask, values).trim();
		if (!assembled) return;
		onSubmit(assembled);
	};

	const handleChange = (slotIndex: number, rawValue: string) => {
		if (disabled) return;

		if (isComposingRef.current) {
			setValues((prev) => {
				const next = [...prev];
				next[slotIndex] = rawValue;
				return next;
			});
			return;
		}

		if (rawValue === '') {
			setValues((prev) => {
				const next = [...prev];
				next[slotIndex] = '';
				return next;
			});
			return;
		}

		const prevChar = values[slotIndex] ?? '';
		let candidate = rawValue;
		if (prevChar && rawValue.length === 2 && rawValue.startsWith(prevChar)) {
			candidate = rawValue.slice(1);
		}

		if (candidate.length > 1) {
			const { nextValues, nextFocusIndex } = applyTypeAnswerV2Paste(
				mask,
				values,
				slotIndex,
				candidate,
			);
			setValues(nextValues);
			focusSlot(nextFocusIndex);
			return;
		}

		if (candidate === ' ') {
			const nextWordStart = parsed.nextWordStartByInputIndex[slotIndex] ?? -1;
			if (nextWordStart !== -1) {
				focusSlot(nextWordStart);
			}
			return;
		}

		if (isTypeAnswerV2Bracket(candidate)) {
			return;
		}

		setValues((prev) => {
			const next = [...prev];
			next[slotIndex] = candidate;
			return next;
		});

		if (slotIndex + 1 < parsed.inputCount) {
			focusSlot(slotIndex + 1);
		}
	};

	const handleCompositionEnd = (slotIndex: number, composedValue: string) => {
		isComposingRef.current = false;
		const chars = Array.from(composedValue).filter(
			(ch) => ch !== ' ' && !isTypeAnswerV2Bracket(ch),
		);
		const lastChar = chars[chars.length - 1] ?? '';

		setValues((prev) => {
			const next = [...prev];
			next[slotIndex] = lastChar;
			return next;
		});

		if (lastChar && slotIndex + 1 < parsed.inputCount) {
			requestAnimationFrame(() => focusSlot(slotIndex + 1));
		}
	};

	const handleKeyDown = (
		slotIndex: number,
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (disabled) return;

		if (e.key === 'Enter') {
			e.preventDefault();
			// Guard IME composition confirm keystrokes across browsers including Safari keyCode 229
			if (
				e.nativeEvent.isComposing ||
				e.keyCode === 229 ||
				isComposingRef.current
			) {
				return;
			}
			submitCurrentAnswer();
			return;
		}

		if (e.key === ' ') {
			e.preventDefault();
			const nextWordStart = parsed.nextWordStartByInputIndex[slotIndex] ?? -1;
			if (nextWordStart !== -1) {
				focusSlot(nextWordStart);
			} else if (slotIndex + 1 < parsed.inputCount) {
				focusSlot(slotIndex + 1);
			}
			return;
		}

		if (e.key === 'ArrowLeft') {
			if (slotIndex > 0) {
				e.preventDefault();
				focusSlot(slotIndex - 1);
			}
			return;
		}

		if (e.key === 'ArrowRight') {
			if (slotIndex + 1 < parsed.inputCount) {
				e.preventDefault();
				focusSlot(slotIndex + 1);
			}
			return;
		}

		if (e.key === 'Backspace') {
			const current = values[slotIndex] ?? '';
			if (current) {
				e.preventDefault();
				setValues((prev) => {
					const next = [...prev];
					next[slotIndex] = '';
					return next;
				});
			} else if (slotIndex > 0) {
				e.preventDefault();
				setValues((prev) => {
					const next = [...prev];
					next[slotIndex - 1] = '';
					return next;
				});
				focusSlot(slotIndex - 1);
			}
		}
	};

	const handlePaste = (
		slotIndex: number,
		e: React.ClipboardEvent<HTMLInputElement>,
	) => {
		if (disabled) return;
		const pastedText = e.clipboardData.getData('text');
		if (!pastedText) return;

		e.preventDefault();
		const { nextValues, nextFocusIndex } = applyTypeAnswerV2Paste(
			mask,
			values,
			slotIndex,
			pastedText,
		);
		setValues(nextValues);
		focusSlot(nextFocusIndex);
	};

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		submitCurrentAnswer();
	};

	return (
		<form className={styles.form} onSubmit={handleFormSubmit}>
			<div className={styles.wordsRow} role="group" aria-label="Поля для вводу по літерах">
				{parsed.words.map((word) => (
					<div key={word.wordIndex} className={styles.wordGroup}>
						{word.tokens.map((token, tokenIdx) =>
							token.kind === 'bracket' ? (
								<span
									key={`b-${word.wordIndex}-${tokenIdx}`}
									className={styles.bracketToken}
									aria-hidden="true"
								>
									{token.char}
								</span>
							) : (
								<input
									key={`i-${token.inputIndex}`}
									ref={(el) => {
										inputRefs.current[token.inputIndex] = el;
									}}
									type="text"
									inputMode="text"
									autoComplete="off"
									autoCorrect="off"
									autoCapitalize="none"
									spellCheck={false}
									disabled={disabled}
									value={values[token.inputIndex] ?? ''}
									aria-label={`Літера ${token.inputIndex + 1} з ${parsed.inputCount}`}
									className={`${styles.letterInput} ${
										values[token.inputIndex] ? styles.isFilled : ''
									}`}
									onChange={(e) => handleChange(token.inputIndex, e.target.value)}
									onCompositionStart={() => {
										isComposingRef.current = true;
									}}
									onCompositionEnd={(e) =>
										handleCompositionEnd(token.inputIndex, e.currentTarget.value)
									}
									onKeyDown={(e) => handleKeyDown(token.inputIndex, e)}
									onPaste={(e) => handlePaste(token.inputIndex, e)}
								/>
							),
						)}
					</div>
				))}
			</div>

			<div className={styles.footer}>
				<span className={styles.progressHint}>
					Заповнено {filledCount} з {parsed.inputCount}
				</span>
				<Button
					type="submit"
					variant="primary"
					size="md"
					disabled={disabled || !isComplete}
					className={styles.submitBtn}
				>
					Відповісти
				</Button>
			</div>
		</form>
	);
}
