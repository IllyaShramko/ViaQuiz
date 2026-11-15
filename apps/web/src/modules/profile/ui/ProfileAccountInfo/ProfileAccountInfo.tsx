import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  getShareableOrigin,
  PublicIcon,
} from '../../../../shared';
import { useCopyState } from '../../models';
import type { ProfileAccountInfoProps } from './ProfileAccountInfo.types';
import styles from './ProfileAccountInfo.module.css';

export function ProfileAccountInfo({
  user,
  title = 'Деталі акаунта',
}: ProfileAccountInfoProps) {
  const { copiedKey, copy } = useCopyState();

  const email = user?.email?.trim() || '';
  const login = user?.login?.trim() || '';
  const roleLabel = user?.role === 'ADMIN' ? 'Адміністратор' : 'Викладач';

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const publicProfilePath = user?.uuid ? `/users/${user.uuid}` : null;
  const publicProfileUrl = publicProfilePath
    ? `${getShareableOrigin()}${publicProfilePath}`
    : null;

  return (
    <aside className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <Link to="/settings" className={styles.settingsLink}>
          <span>Змінити</span>
          <ArrowRightIcon size={13} aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.list}>
        <div className={styles.row}>
          <span className={styles.label}>Електронна пошта</span>
          <div className={styles.valueRow}>
            <span className={styles.value}>{email || '—'}</span>
            {email && (
              <button
                type="button"
                className={`${styles.iconBtn} ${
                  copiedKey === 'email' ? styles.iconBtnSuccess : ''
                }`}
                onClick={() => void copy(email, 'email')}
                aria-label="Скопіювати email"
                title={copiedKey === 'email' ? 'Скопійовано' : 'Скопіювати email'}
              >
                {copiedKey === 'email' ? (
                  <CheckIcon size={13} aria-hidden="true" />
                ) : (
                  <CopyIcon size={13} aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Логін</span>
          <div className={styles.valueRow}>
            <span className={`${styles.value} ${styles.valueMono}`}>
              {login ? `@${login}` : '—'}
            </span>
            {login && (
              <button
                type="button"
                className={`${styles.iconBtn} ${
                  copiedKey === 'login' ? styles.iconBtnSuccess : ''
                }`}
                onClick={() => void copy(login, 'login')}
                aria-label="Скопіювати логін"
                title={copiedKey === 'login' ? 'Скопійовано' : 'Скопіювати логін'}
              >
                {copiedKey === 'login' ? (
                  <CheckIcon size={13} aria-hidden="true" />
                ) : (
                  <CopyIcon size={13} aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Роль</span>
          <span className={styles.value}>{roleLabel}</span>
        </div>

        {formattedDate && (
          <div className={styles.row}>
            <span className={styles.label}>Дата реєстрації</span>
            <span className={styles.value}>{formattedDate}</span>
          </div>
        )}

        {publicProfilePath && publicProfileUrl && (
          <div className={styles.row}>
            <span className={styles.label}>Публічна сторінка</span>
            <div className={styles.publicActions}>
              <button
                type="button"
                className={`${styles.pillAction} ${
                  copiedKey === 'publicUrl' ? styles.pillActionSuccess : ''
                }`}
                onClick={() => void copy(publicProfileUrl, 'publicUrl')}
              >
                {copiedKey === 'publicUrl' ? (
                  <>
                    <CheckIcon size={12} aria-hidden="true" />
                    <span>Скопійовано</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={12} aria-hidden="true" />
                    <span>Копіювати посилання</span>
                  </>
                )}
              </button>

              <Link to={publicProfilePath} className={styles.pillAction}>
                <PublicIcon size={11} aria-hidden="true" />
                <span>Відкрити</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
