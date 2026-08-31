export function getSafeRedirectUrl(
	searchParams: URLSearchParams,
	fallbackPath: string,
): string {
	const rawRedirect = searchParams.get('redirect') || searchParams.get('from');

	if (!rawRedirect) {
		return fallbackPath;
	}

	// Security check: Must be a relative path and not protocol-relative (//evil.com)
	if (rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')) {
		return rawRedirect;
	}

	return fallbackPath;
}

export function createLoginRedirectUrl(
	targetPath: string,
	role?: 'teacher' | 'student',
): string {
	const params = new URLSearchParams();
	params.set('redirect', targetPath);
	const determinedRole =
		role ||
		(targetPath.startsWith('/join') || targetPath.startsWith('/student')
			? 'student'
			: undefined);
	if (determinedRole) {
		params.set('role', determinedRole);
	}
	return `/login?${params.toString()}`;
}
