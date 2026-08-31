import type { User } from '../models';

export function isStudent(user?: User | null): boolean {
  return user?.role?.toUpperCase() === 'STUDENT';
}

export function isTeacher(user?: User | null): boolean {
  return user?.role?.toUpperCase() === 'TEACHER';
}

export function getUserDashboardPath(user?: User | null): string {
  if (isStudent(user)) {
    return '/student/dashboard';
  }
  return '/dashboard';
}
