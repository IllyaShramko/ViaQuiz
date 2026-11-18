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
	const valuesRef = useRef<string[]>(
		Array.from({ length: parsed.inputCount }, () => ''),
	);
	const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
	const composingSlotRef = useRef<number | null>(null);
	const backspaceHandledRef = useRef(false);

	useEffect(() => {
		if (!disabled && parsed.inputCount > 0) {
			requestAnimationFrame(() => {
				inputRefs.current[0]?.focus({ preventScroll: true });
			});
		}
	}, [parsed.inputCount, disabled]);

	const commitValues = (next: string[]) => {
		valuesRef.current = next;
		setValues(next);
	};

	const syncDomValues = (next: string[]) => {
		for (let i = 0; i < next.length; i++) {
			const el = inputRefs.current[i];
			if (el && el.value !== (next[i] ?? '')) {
				el.value = next[i] ?? '';
			}
		}
	};

	const focusSlot = (slotIndex: number) => {
		const target = inputRefs.current[slotIndex];
		if (!target) return;
		target.focus({ preventScroll: true });
		const len = target.value.length;
		if (len > 0) {
			try {
				target.setSelectionRange(len, len);
			} catch {
				// Ignore selection errors on unsupported input modes
			}
		}
	};

	const filledCount = values.filter((val) => val.trim().length > 0).length;
	const isComplete = parsed.inputCount > 0 && filledCount === parsed.inputCount;

	const submitCurrentAnswer = () => {
		if (disabled || !isComplete) return;
		const assembled = assembleTypeAnswerV2Answer(mask, valuesRef.current).trim();
		if (!assembled) return;
		onSubmit(assembled);
	};

	const handleBackspaceAt = (slotIndex: number) => {
		const currentValues = valuesRef.current;
		const current = currentValues[slotIndex] ?? '';
		if (current) {
			const next = [...currentValues];
			next[slotIndex] = '';
			const el = inputRefs.current[slotIndex];
			if (el) el.value = '';
			commitValues(next);
			return;
		}
		if (slotIndex > 0) {
			const prevIndex = slotIndex - 1;
			const next = [...currentValues];
			next[prevIndex] = '';
			const prevEl = inputRefs.current[prevIndex];
			// Clear target DOM value before focusing so iOS does not flash/delete stale text
			if (prevEl) prevEl.value = '';
			commitValues(next);
			focusSlot(prevIndex);
		}
	};

	const handleChange = (slotIndex: number, rawValue: string) => {
		if (disabled) return;

		if (composingSlotRef.current === slotIndex) {
			const next = [...valuesRef.current];
			next[slotIndex] = rawValue;
			commitValues(next);
			return;
		}

		if (rawValue === '') {
			const next = [...valuesRef.current];
			if (next[slotIndex] !== '') {
				next[slotIndex] = '';
				commitValues(next);
			}
			return;
		}

		const currentValues = valuesRef.current;
		const prevChar = currentValues[slotIndex] ?? '';
		let candidate = rawValue;
		if (prevChar && rawValue.length === 2) {
			if (rawValue.startsWith(prevChar)) {
				candidate = rawValue.slice(1);
			} else if (rawValue.endsWith(prevChar)) {
				candidate = rawValue.slice(0, 1);
			}
		}

		if (candidate.length > 1) {
			const { nextValues, nextFocusIndex } = applyTypeAnswerV2Paste(
				mask,
				currentValues,
				slotIndex,
				candidate,
			);
			syncDomValues(nextValues);
			commitValues(nextValues);
			focusSlot(nextFocusIndex);
			return;
		}

		if (candidate === ' ') {
			const el = inputRefs.current[slotIndex];
			if (el) el.value = prevChar;
			const nextWordStart = parsed.nextWordStartByInputIndex[slotIndex] ?? -1;
			if (nextWordStart !== -1) {
				focusSlot(nextWordStart);
			}
			return;
		}

		if (isTypeAnswerV2Bracket(candidate)) {
			const el = inputRefs.current[slotIndex];
			if (el) el.value = prevChar;
			return;
		}

		const next = [...currentValues];
		next[slotIndex] = candidate;
		const currentEl = inputRefs.current[slotIndex];
		if (currentEl) currentEl.value = candidate;
		commitValues(next);

		if (slotIndex + 1 < parsed.inputCount) {
			focusSlot(slotIndex + 1);
		}
	};

	const handleCompositionEnd = (slotIndex: number, composedValue: string) => {
		if (composingSlotRef.current === slotIndex) {
			composingSlotRef.current = null;
		}
		const chars = Array.from(composedValue).filter(
			(ch) => ch !== ' ' && !isTypeAnswerV2Bracket(ch),
		);
		const lastChar = chars[chars.length - 1] ?? '';

		const next = [...valuesRef.current];
		next[slotIndex] = lastChar;
		const el = inputRefs.current[slotIndex];
		if (el) el.value = lastChar;
		commitValues(next);

		if (lastChar && slotIndex + 1 < parsed.inputCount) {
			requestAnimationFrame(() => focusSlot(slotIndex + 1));
		}
	};

	const handleBeforeInput = (
		slotIndex: number,
		e: React.InputEvent<HTMLInputElement>,
	) => {
		if (disabled) return;
		const inputType = (e.nativeEvent as InputEvent).inputType;
		if (inputType === 'deleteContentBackward') {
			e.preventDefault();
			if (backspaceHandledRef.current) {
				backspaceHandledRef.current = false;
				return;
			}
			handleBackspaceAt(slotIndex);
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
				composingSlotRef.current === slotIndex
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
			// Let active IME composition delete its composing buffer first
			if (
				e.nativeEvent.isComposing ||
				e.keyCode === 229 ||
				composingSlotRef.current === slotIndex
			) {
				return;
			}
			e.preventDefault();
			backspaceHandledRef.current = true;
			window.setTimeout(() => {
				backspaceHandledRef.current = false;
			}, 0);
			handleBackspaceAt(slotIndex);
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
			valuesRef.current,
			slotIndex,
			pastedText,
		);
		syncDomValues(nextValues);
		commitValues(nextValues);
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
									onBeforeInput={(e) => handleBeforeInput(token.inputIndex, e)}
									onChange={(e) => handleChange(token.inputIndex, e.target.value)}
									onBlur={() => {
										if (composingSlotRef.current === token.inputIndex) {
											composingSlotRef.current = null;
										}
									}}
									onCompositionStart={() => {
										composingSlotRef.current = token.inputIndex;
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
