import type { User } from '../../../auth/models';

export interface SettingsHeaderProps {
  user: Pick<User, 'firstName' | 'lastName' | 'login'> | null;
}
