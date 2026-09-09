export interface VerificationCodeInputProps {
  /** Current code string (up to `length` digits) */
  value: string;
  /** Callback triggered whenever the code value changes */
  onChange: (value: string) => void;
  /** Callback triggered automatically when all digits are filled */
  onComplete?: (code: string) => void;
  /** Number of digit inputs (defaults to 6) */
  length?: number;
  /** Whether the inputs are in an error state or error message string */
  error?: boolean | string;
  /** Whether the inputs are disabled */
  disabled?: boolean;
  /** Whether to automatically focus the first empty input on mount/activation */
  autoFocus?: boolean;
  /** Optional custom class name for the wrapper element */
  className?: string;
  /** Optional HTML id for the container */
  id?: string;
}
