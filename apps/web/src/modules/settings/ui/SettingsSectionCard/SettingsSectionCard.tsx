import { CheckIcon, WarningIcon } from '../../../../shared';
import type { SettingsSectionCardProps } from './SettingsSectionCard.types';
import styles from './SettingsSectionCard.module.css';

export function SettingsSectionCard({
  title,
  description,
  feedback,
  children,
}: SettingsSectionCardProps) {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </header>

      <div className={styles.body}>
        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className={`${styles.banner} ${
              feedback.type === 'success' ? styles.bannerSuccess : styles.bannerError
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckIcon size={15} aria-hidden="true" />
            ) : (
              <WarningIcon size={15} aria-hidden="true" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {children}
      </div>
    </section>
  );
}
