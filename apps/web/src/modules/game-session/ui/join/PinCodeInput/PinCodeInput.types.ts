export interface PinCodeInputProps {
	/** Current numeric PIN string (up to `length` digits) */
	value: string;
	/** Callback triggered whenever the PIN value changes */
	onChange: (value: string) => void;
	/** Optional callback invoked when the last empty slot completes the PIN */
	onComplete?: (code: string) => void;
	/** Number of digit slots (defaults to 6) */
	length?: number;
	/** Applies error border styling to all cells */
	hasError?: boolean;
	/** Disables input across all cells */
	disabled?: boolean;
	/** Automatically focuses the first empty slot on mount */
	autoFocus?: boolean;
	/** Accessible label prefix for each digit input */
	ariaLabelPrefix?: string;
	/** Optional HTML id for the container */
	id?: string;
	/** Optional extra class name for the container */
	className?: string;
}
