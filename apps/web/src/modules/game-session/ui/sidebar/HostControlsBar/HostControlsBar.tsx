import { Button } from '../../../../../shared/ui';
import { NextIcon, TimerIcon } from '../../../../../shared/ui/icons';
import type { HostControlsBarProps } from './HostControlsBar.types';
import styles from './HostControlsBar.module.css';

export function HostControlsBar({
  status,
  remainingSeconds,
  answeredCount,
  totalParticipants,
  isLastQuestion = false,
  onExtendTime,
  onPrimaryAction,
}: HostControlsBarProps) {
  const isLowTime = status === 'PROGRESS' && remainingSeconds <= 5;
  const primaryLabel =
    status === 'PROGRESS'
      ? 'Далі'
      : isLastQuestion
        ? 'Результати'
        : 'Наступне';

  return (
    <div className={styles.bar}>
      <div className={styles.metricsRow}>
        <div className={`${styles.timerPill} ${isLowTime ? styles.isWarning : ''}`}>
          <TimerIcon size={16} />
          <span className={styles.timerValue}>{remainingSeconds} с</span>
        </div>

        <div className={styles.progressText}>
          {status === 'PROGRESS' ? 'Відповіли:' : 'Встигли:'}{' '}
          <strong className={styles.progressCount}>
            {answeredCount} / {totalParticipants}
          </strong>
        </div>
      </div>

      <div className={styles.actionsRow}>
        {status === 'PROGRESS' && onExtendTime && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onExtendTime(15)}
            disabled={remainingSeconds >= 900}
            title={
              remainingSeconds >= 900
                ? 'Максимальний час досягнуто (900 с)'
                : 'Додати 15 секунд'
            }
            className={styles.extendBtn}
          >
            +15 с
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onPrimaryAction}
          title={
            status === 'PROGRESS'
              ? 'Завершити запитання'
              : isLastQuestion
                ? 'Завершити вікторину'
                : 'Перейти до наступного запитання'
          }
          className={styles.nextBtn}
        >
          <span>{primaryLabel}</span>
          <NextIcon size={14} />
        </Button>
      </div>
    </div>
  );
}
