/**
 * Formats a user's display name from firstName, lastName, and login fallback.
 */
export function getUserDisplayName(
  user?: { firstName?: string | null; lastName?: string | null; login?: string | null } | null,
  fallback = 'Користувач',
): string {
  if (!user) return fallback;
  const fullName = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
  return fullName || user.login?.trim() || fallback;
}

/**
 * Computes up to 2 uppercase initials for avatar chips.
 */
export function getUserInitials(
  user?: { firstName?: string | null; lastName?: string | null; login?: string | null } | null,
): string {
  if (!user) return '?';
  const first = user.firstName?.trim();
  const last = user.lastName?.trim();
  if (first && last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }
  const single = first || last || user.login?.trim();
  if (!single) return '?';
  return single.slice(0, 2).toUpperCase();
}
