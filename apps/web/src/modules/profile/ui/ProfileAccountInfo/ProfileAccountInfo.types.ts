import type { User } from '../../../auth/models';

export interface ProfileAccountInfoProps {
  user: User | null;
  title?: string;
}
