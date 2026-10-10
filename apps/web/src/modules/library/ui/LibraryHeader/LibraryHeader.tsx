import styles from '../Library.module.css';

// No props needed — the create button is now only in the global topbar
export function LibraryHeader() {
  return (
    <div className={styles['library-header']}>
      <div className={styles['library-header__left']}>
        <h1 className={styles['library-header__title']}>Бібліотека</h1>
        <p className={styles['library-header__subtitle']}>
          Керуйте своїми створеними вікторинами та переглядайте збережене
        </p>
      </div>
    </div>
  );
}
