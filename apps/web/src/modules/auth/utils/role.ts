import type { User } from '../models';

export function getUserDashboardPath(user?: User | null): string {
  if (user?.role === 'student') {
    return '/student';
  }
  return '/dashboard';
}
