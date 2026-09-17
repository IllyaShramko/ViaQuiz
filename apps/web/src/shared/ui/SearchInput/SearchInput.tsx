import type { SearchInputProps } from './SearchInput.types';
import styles from './SearchInput.module.css';

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Пошук...',
  maxWidth,
  className,
  disabled,
  autoFocus,
  ...restProps
}: SearchInputProps) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
  };

  const style = maxWidth !== undefined ? { maxWidth } : undefined;

  return (
    <div className={`${styles['search-wrapper']} ${className || ''}`} style={style}>
      <svg
        className={styles['search-icon']}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={styles['search-input']}
        {...restProps}
      />

      {value && !disabled && (
        <button
          type="button"
          className={styles['search-clear-btn']}
          onClick={handleClear}
          aria-label="Очистити пошук"
          title="Очистити пошук"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
