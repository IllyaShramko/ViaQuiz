import type { User } from '../models';

export function getUserDashboardPath(user?: User | { role?: string } | null): string {
  const role = (user as any)?.role?.toUpperCase();
  if (role === 'STUDENT') {
    return '/student/dashboard';
  }
  return '/dashboard';
}
