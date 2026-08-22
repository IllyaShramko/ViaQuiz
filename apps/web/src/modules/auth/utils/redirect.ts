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

export function createLoginRedirectUrl(targetPath: string): string {
	return `/login?redirect=${encodeURIComponent(targetPath)}`;
}
