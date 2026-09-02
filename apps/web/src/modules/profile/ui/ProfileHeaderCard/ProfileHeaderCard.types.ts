import type { User } from '../../../../modules/auth/models';

export interface ProfileHeaderCardProps {
  user: User | null;
  roleLabel?: string;
}
