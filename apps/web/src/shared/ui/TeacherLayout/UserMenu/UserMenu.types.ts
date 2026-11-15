import type { User } from '../../../../modules/auth/models';

export interface UserMenuProps {
  user: Pick<User, 'firstName' | 'lastName' | 'login' | 'email'> | null;
  onLogout: () => void;
}
