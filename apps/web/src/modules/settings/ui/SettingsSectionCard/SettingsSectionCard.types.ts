import type { ReactNode } from 'react';
import type { SettingsStatusFeedback } from '../../models';

export interface SettingsSectionCardProps {
  title: string;
  description: string;
  feedback?: SettingsStatusFeedback | null;
  children: ReactNode;
}
