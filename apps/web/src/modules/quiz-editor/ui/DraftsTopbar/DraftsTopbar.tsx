import { ArrowIcon } from '../../../../shared';
import styles from '../Drafts.module.css';

export interface DraftsTopbarProps {
  draftsCount: number;
  maxDrafts: number;
  onBack: () => void;
  title?: string;
  backText?: string;
}

export function DraftsTopbar({
  draftsCount,
  maxDrafts,
  onBack,
  title = 'Конструктор вікторин',
  backText = 'До панелі вчителя',
}: DraftsTopbarProps) {
  const isFull = draftsCount >= maxDrafts;

  return (
    <header className={styles['drafts-topbar']}>
      <div className={styles['drafts-topbar__left']}>
        <button
          type="button"
          className={styles['drafts-back-btn']}
          onClick={onBack}
        >
          <ArrowIcon width={16} height={16} />
          <span>{backText}</span>
        </button>
      </div>

      <div className={styles['drafts-topbar__center']}>
        <h1 className={styles['drafts-topbar__title']}>{title}</h1>
      </div>

      <div className={styles['drafts-topbar__right']}>
        <div className={`${styles['drafts-counter-pill']} ${isFull ? styles['is-full'] : ''}`}>
          <span className={styles['counter-dot']} />
          <span>
            Чернетки: <strong>{draftsCount}</strong> / {maxDrafts}
          </span>
        </div>
      </div>
    </header>
  );
}
