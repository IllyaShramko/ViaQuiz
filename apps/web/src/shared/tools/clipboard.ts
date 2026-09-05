/**
 * Copies text to the system clipboard across all environments,
 * including non-secure contexts (HTTP / local IP addresses like 192.168.x.x),
 * mobile devices, and browsers where navigator.clipboard is unavailable or restricted.
 *
 * @param text - The text string to copy to the clipboard
 * @returns Promise<boolean> - Resolves to true if copying succeeded, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	if (!text) {
		return false;
	}

	// 1. Try modern Clipboard API if supported and in a secure context
	if (
		typeof navigator !== 'undefined' &&
		navigator.clipboard &&
		typeof navigator.clipboard.writeText === 'function' &&
		(typeof window === 'undefined' || window.isSecureContext !== false)
	) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch (err) {
			console.warn('[copyToClipboard] navigator.clipboard.writeText failed, attempting fallback', err);
		}
	}

	// 2. Fallback for insecure contexts (HTTP / LAN IP) or when navigator.clipboard fails
	try {
		const textArea = document.createElement('textarea');
		textArea.value = text;
		// Position off-screen without causing page scroll
		textArea.style.position = 'fixed';
		textArea.style.top = '0';
		textArea.style.left = '-999999px';
		textArea.style.opacity = '0';
		textArea.setAttribute('readonly', '');
		textArea.setAttribute('tabindex', '-1');
		textArea.setAttribute('aria-hidden', 'true');

		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		textArea.setSelectionRange(0, text.length);

		const successful = document.execCommand('copy');
		document.body.removeChild(textArea);

		return successful;
	} catch (err) {
		console.error('[copyToClipboard] Fallback document.execCommand copy failed:', err);
		return false;
	}
}
