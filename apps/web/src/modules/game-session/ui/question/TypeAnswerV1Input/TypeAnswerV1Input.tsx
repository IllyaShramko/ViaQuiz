import { useState, useEffect, useRef, useCallback } from 'react';
import { QUESTION_LIMITS } from '@viaquiz/shared-types';
import { Button } from '../../../../../shared';
import type { TypeAnswerV1InputProps } from './TypeAnswerV1Input.types';
import styles from './TypeAnswerV1Input.module.css';

const TEXTAREA_MAX_HEIGHT_PX = 176;

/**
 * Renders the free-text answer input with auto-growing textarea and character counter.
 */
export function TypeAnswerV1Input({
	disabled = false,
	onSubmit,
}: TypeAnswerV1InputProps) {
	const [typedInput, setTypedInput] = useState('');
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	const syncTextareaHeight = useCallback(() => {
		const el = textareaRef.current;
		if (!el) return;
		// Only manage height imperatively when native CSS field-sizing: content is unavailable
		if (typeof CSS !== 'undefined' && CSS.supports?.('field-sizing', 'content')) {
			return;
		}
		el.style.height = 'auto';
		el.style.height = `${Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT_PX)}px`;
	}, []);

	useEffect(() => {
		syncTextareaHeight();
	}, [typedInput, syncTextareaHeight]);

	const handleSubmit = (e?: React.SyntheticEvent) => {
		if (e) e.preventDefault();
		const trimmed = typedInput.trim();
		if (!trimmed || disabled) return;
		onSubmit(trimmed);
	};

	const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			// Ignore confirming Enter keystrokes during IME composition (including Safari keyCode 229)
			if (e.nativeEvent.isComposing || e.keyCode === 229) return;
			handleSubmit();
		}
	};

	return (
		<form className={styles.wrapper} onSubmit={handleSubmit}>
			<div className={styles.inputBox}>
				<textarea
					ref={textareaRef}
					rows={1}
					disabled={disabled}
					autoFocus
					maxLength={QUESTION_LIMITS.MAX_VARIANT_TEXT_LENGTH}
					className={styles.textInput}
					placeholder="Введіть відповідь..."
					value={typedInput}
					onChange={(e) => setTypedInput(e.target.value)}
					onKeyDown={handleTextareaKeyDown}
				/>
				<Button
					type="submit"
					variant="primary"
					size="md"
					disabled={disabled || !typedInput.trim()}
					className={styles.submitBtn}
				>
					Відповісти
				</Button>
			</div>
			<div className={styles.metaRow}>
				<span
					className={`${styles.charCounter} ${
						typedInput.length >= QUESTION_LIMITS.MAX_VARIANT_TEXT_LENGTH - 40
							? styles.isNearLimit
							: ''
					}`}
				>
					{typedInput.length} / {QUESTION_LIMITS.MAX_VARIANT_TEXT_LENGTH}
				</span>
			</div>
		</form>
	);
}
