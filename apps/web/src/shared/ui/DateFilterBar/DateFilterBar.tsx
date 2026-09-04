import type { SyntheticEvent } from 'react';
import type { DateFilterBarProps } from './DateFilterBar.types';
import styles from './DateFilterBar.module.css';

export function DateFilterBar({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onSubmit,
  onReset,
  submitLabel = 'Оновити дані',
  resetLabel = 'Скинути',
  isLoading = false,
  className,
}: DateFilterBarProps) {
  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className={`${styles.dateFilterBar} ${className || ''}`.trim()} onSubmit={handleSubmit}>
      <div className={styles.inputsWrapper}>
        <input
          type="date"
          className={styles.dateInput}
          value={fromDate}
          onChange={(e) => onFromDateChange(e.target.value)}
          aria-label="Початкова дата"
        />
        <span className={styles.separator}>—</span>
        <input
          type="date"
          className={styles.dateInput}
          value={toDate}
          onChange={(e) => onToDateChange(e.target.value)}
          aria-label="Кінцева дата"
        />
      </div>

      <button
        type="submit"
        className={styles.btnSubmit}
        disabled={isLoading}
      >
        {isLoading ? 'Оновлення...' : submitLabel}
      </button>

      {onReset && (
        <button
          type="button"
          className={styles.btnReset}
          onClick={onReset}
          disabled={isLoading}
        >
          {resetLabel}
        </button>
      )}
    </form>
  );
}
