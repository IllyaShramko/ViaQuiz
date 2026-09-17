export interface ProfileHeaderCardUser {
  firstName?: string | null;
  lastName?: string | null;
  login?: string;
  createdAt?: string | Date;
}

export interface ProfileHeaderCardProps {
  user: ProfileHeaderCardUser | null;
  roleLabel?: string;
}
