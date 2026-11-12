import React from 'react';
import { useTeacherHeader } from '../../../../shared';
import { SessionsHistoryTable } from '../SessionsHistoryTable';
import styles from '../Reports.module.css';

export const ReportsListPage: React.FC = () => {
  useTeacherHeader({ title: 'Звіти' });

  return (
    <div className={styles['reports-page']}>
      <SessionsHistoryTable searchPlaceholder="Пошук звітів..." />
    </div>
  );
};

