import type { ReactNode } from 'react';
import type { User } from '../../../auth/models';

export type ProfileHeaderCardUser = Partial<
  Pick<User, 'firstName' | 'lastName' | 'login'>
> & {
  createdAt?: string | Date;
};

export interface ProfileHeaderCardProps {
  user: ProfileHeaderCardUser | null;
  roleLabel?: string;
  actions?: ReactNode;
}
