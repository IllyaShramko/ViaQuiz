import { useEffect, useRef } from 'react';
import type { PinCodeInputProps } from './PinCodeInput.types';
import styles from './PinCodeInput.module.css';

/**
 * Six-cell Minimal Pro PIN input with paste, keyboard navigation, and mobile autofill support.
 */
export function PinCodeInput({
	value,
	onChange,
	onComplete,
	length = 6,
	hasError = false,
	disabled = false,
	autoFocus = false,
	ariaLabelPrefix = 'Цифра коду',
	id,
	className = '',
}: PinCodeInputProps) {
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
	const hasAutoFocusedRef = useRef(false);
	const prevDisabledRef = useRef(disabled);

	const cleanValue = value.replace(/\D/g, '').slice(0, length);
	const digits = Array.from({ length }, (_, i) => cleanValue[i] ?? '');

	// Focus the first empty cell only once when autoFocus activates
	useEffect(() => {
		if (autoFocus && !disabled && !hasAutoFocusedRef.current) {
			hasAutoFocusedRef.current = true;
			const targetIndex = Math.min(cleanValue.length, length - 1);
			const el = inputRefs.current[targetIndex];
			el?.focus();
			el?.select();
		} else if (!autoFocus) {
			hasAutoFocusedRef.current = false;
		}
	}, [autoFocus, disabled, length, cleanValue.length]);

	// Restore focus to the last entered digit when a failed submit re-enables the input
	useEffect(() => {
		const wasDisabled = prevDisabledRef.current;
		prevDisabledRef.current = disabled;

		if (wasDisabled && !disabled && hasError) {
			const targetIndex = Math.max(0, Math.min(cleanValue.length - 1, length - 1));
			const el = inputRefs.current[targetIndex];
			el?.focus();
			el?.select();
		}
	}, [disabled, hasError, cleanValue.length, length]);

	const focusSlot = (index: number) => {
		const clamped = Math.max(0, Math.min(index, length - 1));
		const el = inputRefs.current[clamped];
		if (!el) return;
		el.focus();
		el.select();
	};

	const emitChange = (nextCode: string) => {
		onChange(nextCode);
		if (nextCode.length === length && cleanValue.length < length) {
			onComplete?.(nextCode);
		}
	};

	const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>, index: number) => {
		if (disabled) return;
		// Redirect clicks on trailing empty cells to the first unfilled slot
		if (index > cleanValue.length) {
			e.preventDefault();
			focusSlot(cleanValue.length);
		}
	};

	const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		e.target.select();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
		if (disabled) return;

		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			if (index > 0) focusSlot(index - 1);
			return;
		}

		if (e.key === 'ArrowRight') {
			e.preventDefault();
			const maxReachable = Math.min(cleanValue.length, length - 1);
			if (index < maxReachable) focusSlot(index + 1);
			return;
		}

		if (e.key === 'Home') {
			e.preventDefault();
			focusSlot(0);
			return;
		}

		if (e.key === 'End') {
			e.preventDefault();
			focusSlot(Math.min(cleanValue.length, length - 1));
			return;
		}

		if (e.key === 'Backspace') {
			e.preventDefault();
			if (index < cleanValue.length) {
				const nextCode = cleanValue.slice(0, index) + cleanValue.slice(index + 1);
				onChange(nextCode);
			} else if (index > 0) {
				const deleteIndex = Math.min(index - 1, cleanValue.length - 1);
				if (deleteIndex >= 0) {
					const nextCode =
						cleanValue.slice(0, deleteIndex) + cleanValue.slice(deleteIndex + 1);
					onChange(nextCode);
					focusSlot(deleteIndex);
				} else {
					focusSlot(0);
				}
			}
			return;
		}

		if (e.key === 'Delete') {
			e.preventDefault();
			if (index < cleanValue.length) {
				const nextCode = cleanValue.slice(0, index) + cleanValue.slice(index + 1);
				onChange(nextCode);
			}
			return;
		}

		if (/^[0-9]$/.test(e.key)) {
			e.preventDefault();
			const targetIndex = Math.min(index, cleanValue.length);
			const nextCode = (
				cleanValue.slice(0, targetIndex) +
				e.key +
				cleanValue.slice(targetIndex + 1)
			).slice(0, length);
			emitChange(nextCode);

			if (targetIndex < length - 1) {
				focusSlot(targetIndex + 1);
			}
			return;
		}

		// Prevent stray non-numeric characters while preserving shortcuts and Enter submit
		if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
			e.preventDefault();
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
		if (disabled) return;

		const sanitized = e.target.value.replace(/\D/g, '');
		if (!sanitized) {
			if (index < cleanValue.length) {
				onChange(cleanValue.slice(0, index) + cleanValue.slice(index + 1));
			}
			return;
		}

		// Handle full-code autofill from mobile keyboards or SMS OTP
		if (sanitized.length >= length) {
			const fullCode = sanitized.slice(0, length);
			onChange(fullCode);
			focusSlot(length - 1);
			if (cleanValue.length < length || fullCode !== cleanValue) {
				onComplete?.(fullCode);
			}
			return;
		}

		// Handle replacement when typing into an already-filled slot on Android IME
		if (sanitized.length === 2 && digits[index] && sanitized.startsWith(digits[index])) {
			const nextDigit = sanitized[1];
			const nextCode = (
				cleanValue.slice(0, index) +
				nextDigit +
				cleanValue.slice(index + 1)
			).slice(0, length);
			emitChange(nextCode);
			if (index < length - 1) {
				focusSlot(index + 1);
			}
			return;
		}

		const startIndex = Math.min(index, cleanValue.length);
		const nextCode = (
			cleanValue.slice(0, startIndex) +
			sanitized +
			cleanValue.slice(startIndex + sanitized.length)
		).slice(0, length);
		emitChange(nextCode);
		focusSlot(Math.min(length - 1, startIndex + sanitized.length));
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
		e.preventDefault();
		if (disabled) return;

		const sanitized = e.clipboardData.getData('text').replace(/\D/g, '');
		if (!sanitized) return;

		if (sanitized.length >= length) {
			const fullCode = sanitized.slice(0, length);
			onChange(fullCode);
			focusSlot(length - 1);
			if (cleanValue.length < length || fullCode !== cleanValue) {
				onComplete?.(fullCode);
			}
			return;
		}

		const startIndex = Math.min(index, cleanValue.length);
		const nextCode = (
			cleanValue.slice(0, startIndex) +
			sanitized +
			cleanValue.slice(startIndex + sanitized.length)
		).slice(0, length);
		emitChange(nextCode);
		focusSlot(Math.min(length - 1, startIndex + sanitized.length));
	};

	return (
		<div
			id={id}
			className={`${styles.grid} ${className}`.trim()}
			role="group"
			aria-label="6-значний PIN-код тесту"
		>
			{digits.map((digit, index) => (
				<input
					key={index}
					ref={(el) => {
						inputRefs.current[index] = el;
					}}
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					autoComplete={index === 0 ? 'one-time-code' : 'off'}
					tabIndex={index === 0 || index <= cleanValue.length ? 0 : -1}
					value={digit}
					disabled={disabled}
					placeholder="·"
					aria-label={`${ariaLabelPrefix} ${index + 1} з ${length}`}
					aria-invalid={hasError || undefined}
					className={[
						styles.cell,
						digit ? styles.cellFilled : '',
						hasError ? styles.cellError : '',
					]
						.filter(Boolean)
						.join(' ')}
					onMouseDown={(e) => handleMouseDown(e, index)}
					onFocus={handleFocus}
					onKeyDown={(e) => handleKeyDown(e, index)}
					onChange={(e) => handleChange(e, index)}
					onPaste={(e) => handlePaste(e, index)}
				/>
			))}
		</div>
	);
}
