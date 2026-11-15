/**
 * Formats an ISO timestamp into a concise Ukrainian relative label for draft cards.
 */
export function formatDraftRelativeTime(dateInput?: string | null): string {
  if (!dateInput) return 'Нещодавно';

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return 'Нещодавно';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return 'Щойно';
  if (diffMinutes < 60) return `${diffMinutes} хв тому`;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000);

  const timeFormatted = date.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (date >= startOfToday) {
    return `Сьогодні, ${timeFormatted}`;
  }

  if (date >= startOfYesterday) {
    return `Вчора, ${timeFormatted}`;
  }

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/**
 * Formats an ISO timestamp into a full human-readable date and time for tooltips.
 */
export function formatDraftFullDate(dateInput?: string | null): string {
  if (!dateInput) return 'Нещодавно';

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return 'Нещодавно';

  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
