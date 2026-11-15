export type SettingsTabId = 'profile' | 'email' | 'security';

export interface SettingsStatusFeedback {
  type: 'success' | 'error';
  message: string;
}
