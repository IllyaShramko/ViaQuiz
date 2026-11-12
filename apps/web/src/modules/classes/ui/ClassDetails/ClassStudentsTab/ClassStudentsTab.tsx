import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BinIcon,
  CheckIcon,
  CopyIcon,
  LockIcon,
  PlusIcon,
  SearchInput,
  copyToClipboard,
} from '../../../../../shared';
import type { ClassStudentsTabProps } from './ClassStudentsTab.types';
import styles from './ClassStudentsTab.module.css';

export function ClassStudentsTab({
  classUuid,
  students,
  maxStudents = 50,
  onOpenAddStudent,
  onResetPassword,
  onDeleteStudent,
}: ClassStudentsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUuid, setCopiedUuid] = useState<string | null>(null);
  const [openMenuUuid, setOpenMenuUuid] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  // Close row action popover on outside click or Escape key
  useEffect(() => {
    if (!openMenuUuid) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setOpenMenuUuid(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuUuid(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuUuid]);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => {
      const fullName = `${student.lastName} ${student.firstName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        student.login.toLowerCase().includes(query)
      );
    });
  }, [students, searchQuery]);

  const handleCopyLogin = async (studentUuid: string, login: string) => {
    const copied = await copyToClipboard(login);
    if (!copied) return;
    setCopiedUuid(studentUuid);
    window.setTimeout(() => {
      setCopiedUuid((prev) => (prev === studentUuid ? null : prev));
    }, 1500);
  };

  if (students.length === 0) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>У класі ще немає учнів</p>
          <p className={styles.emptySubtitle}>
            Додайте першого учня, щоб згенерувати логін для входу та відстежувати результати тестувань.
          </p>
          <button
            type="button"
            className={styles.emptyAction}
            onClick={onOpenAddStudent}
          >
            <PlusIcon size={15} />
            <span>Додати першого учня</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Пошук за ім'ям або логіном..."
          maxWidth={300}
        />
        <span className={styles.capacityText}>
          {searchQuery.trim()
            ? `Знайдено ${filteredStudents.length} з ${students.length}`
            : `${students.length} / ${maxStudents} учнів`}
        </span>
      </div>

      <div className={styles.tableCard}>
        {filteredStudents.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Учнів не знайдено</p>
            <p className={styles.emptySubtitle}>
              За запитом «{searchQuery.trim()}» збігів немає.
            </p>
            <button
              type="button"
              className={styles.resetFilterBtn}
              onClick={() => setSearchQuery('')}
            >
              Скинути пошук
            </button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colIndex}>#</th>
                <th>Учень</th>
                <th>Логін</th>
                <th className={styles.colTests}>Пройдено тестів</th>
                <th className={styles.colActions} aria-label="Дії" />
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => {
                const fullName = `${student.lastName} ${student.firstName}`;
                const passedCount = student._count?.passedQuizes ?? 0;
                const isCopied = copiedUuid === student.uuid;
                const isMenuOpen = openMenuUuid === student.uuid;

                return (
                  <tr key={student.uuid}>
                    <td className={styles.colIndex}>{index + 1}</td>
                    <td>
                      <Link
                        to={`/classes/${classUuid}/students/${student.uuid}`}
                        className={styles.studentLink}
                      >
                        <span className={styles.avatar}>
                          {student.lastName[0]}
                          {student.firstName[0]}
                        </span>
                        <span>{fullName}</span>
                      </Link>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`${styles.loginCopyBtn} ${isCopied ? styles.isCopied : ''}`}
                        onClick={() => handleCopyLogin(student.uuid, student.login)}
                        title={isCopied ? 'Скопійовано' : 'Натисніть, щоб скопіювати логін'}
                      >
                        <span>{student.login}</span>
                        <span className={styles.copyIcon}>
                          {isCopied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                        </span>
                      </button>
                    </td>
                    <td className={styles.colTests}>
                      <span
                        className={
                          passedCount === 0
                            ? styles.testsCountZero
                            : styles.testsCountValue
                        }
                      >
                        {passedCount}
                      </span>
                    </td>
                    <td className={styles.colActions}>
                      <div
                        className={styles.menuContainer}
                        ref={isMenuOpen ? menuContainerRef : null}
                      >
                        <button
                          type="button"
                          className={styles.menuTrigger}
                          aria-label={`Дії для ${fullName}`}
                          aria-expanded={isMenuOpen}
                          aria-haspopup="menu"
                          onClick={() =>
                            setOpenMenuUuid((prev) =>
                              prev === student.uuid ? null : student.uuid,
                            )
                          }
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <circle cx="5" cy="12" r="1.75" />
                            <circle cx="12" cy="12" r="1.75" />
                            <circle cx="19" cy="12" r="1.75" />
                          </svg>
                        </button>

                        {isMenuOpen && (
                          <div className={styles.menuPopover} role="menu">
                            <Link
                              to={`/classes/${classUuid}/students/${student.uuid}`}
                              className={styles.menuItem}
                              role="menuitem"
                              onClick={() => setOpenMenuUuid(null)}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="20" x2="18" y2="10" />
                                <line x1="12" y1="20" x2="12" y2="4" />
                                <line x1="6" y1="20" x2="6" y2="14" />
                              </svg>
                              <span>Аналітика</span>
                            </Link>

                            <button
                              type="button"
                              className={styles.menuItem}
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuUuid(null);
                                onResetPassword({ uuid: student.uuid, name: fullName });
                              }}
                            >
                              <LockIcon size={14} />
                              <span>Скинути пароль</span>
                            </button>

                            <div className={styles.menuDivider} />

                            <button
                              type="button"
                              className={`${styles.menuItem} ${styles.menuItemDanger}`}
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuUuid(null);
                                onDeleteStudent(student.uuid, fullName);
                              }}
                            >
                              <BinIcon size={14} />
                              <span>Видалити з класу</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
