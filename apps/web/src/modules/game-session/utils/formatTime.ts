/**
 * Formats a duration in seconds into MM:SS format (e.g., 81 -> "01:21", 5 -> "00:05").
 * If the duration is negative or not a finite number, returns "00:00".
 * If the duration is 60 minutes or longer, formats as HH:MM:SS.
 */
export function formatTimer(totalSeconds: number): string {
	if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
		return '00:00';
	}

	const totalSecs = Math.floor(totalSeconds);
	const hours = Math.floor(totalSecs / 3600);
	const minutes = Math.floor((totalSecs % 3600) / 60);
	const seconds = totalSecs % 60;

	const paddedMinutes = String(minutes).padStart(2, '0');
	const paddedSeconds = String(seconds).padStart(2, '0');

	if (hours > 0) {
		const paddedHours = String(hours).padStart(2, '0');
		return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
	}

	return `${paddedMinutes}:${paddedSeconds}`;
}

export const formatTime = formatTimer;
