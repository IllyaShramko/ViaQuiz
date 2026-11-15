import { CheckIcon, CopyIcon, getUserDisplayName, getUserInitials } from '../../../../shared';
import { useCopyState } from '../../models';
import type { ProfileHeaderCardProps } from './ProfileHeaderCard.types';
import styles from './ProfileHeaderCard.module.css';

export function ProfileHeaderCard({
  user,
  roleLabel = 'Викладач',
  actions,
}: ProfileHeaderCardProps) {
  const { copiedKey, copy } = useCopyState();
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  const login = user?.login?.trim();

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const isLoginCopied = copiedKey === 'headerLogin';

  return (
    <section className={styles.card}>
      <div className={styles.identity}>
        <div className={styles.avatarChip} aria-hidden="true">
          {initials}
        </div>

        <div className={styles.meta}>
          <div className={styles.titleRow}>
            <h2 className={styles.name}>{displayName}</h2>
            <span className={styles.roleBadge}>{roleLabel}</span>
          </div>

          {(login || formattedDate) && (
            <div className={styles.subRow}>
              {login && (
                <button
                  type="button"
                  className={`${styles.handleBtn} ${isLoginCopied ? styles.handleBtnCopied : ''}`}
                  onClick={() => void copy(login, 'headerLogin')}
                  title={isLoginCopied ? 'Логін скопійовано' : 'Скопіювати логін'}
                >
                  <span>@{login}</span>
                  {isLoginCopied ? (
                    <CheckIcon size={12} aria-hidden="true" />
                  ) : (
                    <CopyIcon size={12} aria-hidden="true" />
                  )}
                </button>
              )}

              {login && formattedDate && (
                <span className={styles.dot} aria-hidden="true">
                  ·
                </span>
              )}

              {formattedDate && (
                <span className={styles.joinedDate}>
                  На платформі з {formattedDate}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {actions && <div className={styles.actions}>{actions}</div>}
    </section>
  );
}
