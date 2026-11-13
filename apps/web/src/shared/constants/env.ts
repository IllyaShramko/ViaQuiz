import { resolveAutoUrl } from '@viaquiz/utils';

const DEFAULT_API_PORT = 3000;

export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;

function getRuntimeDevHost(): string {
	if (typeof window !== 'undefined' && window.location.hostname) {
		return window.location.hostname;
	}
	return import.meta.env.VITE_DEV_LAN_HOST || 'localhost';
}

function resolveClientBaseUrl(): string {
	const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
	if (IS_DEV) {
		const protocol =
			typeof window !== 'undefined' ? window.location.protocol : 'http:';
		return resolveAutoUrl(
			rawApiUrl,
			getRuntimeDevHost(),
			DEFAULT_API_PORT,
			protocol,
		);
	}

	if (!rawApiUrl || rawApiUrl.toLowerCase() === 'auto') {
		return `http://localhost:${DEFAULT_API_PORT}`;
	}

	return rawApiUrl.replace(/\/+$/, '');
}

export const BASE_URL = resolveClientBaseUrl();

/**
 * Returns the origin for shareable links and QR codes.
 * In development, replaces localhost/127.0.0.1 with the detected LAN IP
 * so local network devices can open generated join links.
 */
export function getShareableOrigin(): string {
	if (typeof window === 'undefined') {
		return '';
	}

	const lanHost = import.meta.env.VITE_DEV_LAN_HOST;
	const { hostname, protocol, port, origin } = window.location;
	if (
		IS_DEV &&
		lanHost &&
		(hostname === 'localhost' || hostname === '127.0.0.1')
	) {
		return `${protocol}//${lanHost}${port ? `:${port}` : ''}`;
	}

	return origin;
}
