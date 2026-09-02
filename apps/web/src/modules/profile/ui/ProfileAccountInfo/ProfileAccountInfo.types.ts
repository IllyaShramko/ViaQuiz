import type { User } from '../../../../modules/auth/models';

export interface ProfileAccountInfoProps {
  user: User | null;
  title?: string;
  defaultEmail?: string;
  defaultUsername?: string;
}
