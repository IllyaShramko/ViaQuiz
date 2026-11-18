import { useEffect } from 'react';

const MOBILE_MEDIA_QUERY = '(max-width: 768px)';
const PINCH_ZOOM_SCALE_THRESHOLD = 1.02;
const KEYBOARD_HEIGHT_DELTA_PX = 120;

function ensureElementVisibleInScrollParent(el: HTMLElement): void {
	let parent = el.parentElement;
	while (parent && parent !== document.body && parent !== document.documentElement) {
		const style = window.getComputedStyle(parent);
		const isScrollableY =
			(style.overflowY === 'auto' || style.overflowY === 'scroll') &&
			parent.scrollHeight > parent.clientHeight;
		if (isScrollableY) {
			const parentRect = parent.getBoundingClientRect();
			const elRect = el.getBoundingClientRect();
			if (elRect.bottom > parentRect.bottom) {
				parent.scrollTop += elRect.bottom - parentRect.bottom + 8;
			} else if (elRect.top < parentRect.top) {
				parent.scrollTop -= parentRect.top - elRect.top + 8;
			}
			return;
		}
		parent = parent.parentElement;
	}
}

/**
 * Locks outer document scrolling and syncs `--game-viewport-height` and
 * `--game-viewport-top` with the mobile visual viewport so browser toolbars
 * and soft keyboards keep the entire game view visible without clipping.
 */
export function useMobileGameViewport(): void {
	useEffect(() => {
		if (typeof window === 'undefined') return;

		const docEl = document.documentElement;
		const body = document.body;
		const mql = window.matchMedia(MOBILE_MEDIA_QUERY);

		const savedStyles = {
			docOverflow: docEl.style.overflow,
			docHeight: docEl.style.height,
			bodyOverflow: body.style.overflow,
			bodyHeight: body.style.height,
			bodyMinHeight: body.style.minHeight,
			bodyOverscroll: body.style.overscrollBehavior,
			viewportHeightVar: docEl.style.getPropertyValue('--game-viewport-height'),
			viewportTopVar: docEl.style.getPropertyValue('--game-viewport-top'),
			keyboardAttr: docEl.getAttribute('data-game-keyboard'),
		};

		let isActive = false;
		let rafId: number | null = null;
		let blurTimeoutId: number | null = null;
		let prevWidth = window.innerWidth;
		let maxUnzoomedHeight = window.visualViewport?.height ?? window.innerHeight;
		let prevViewportHeight = maxUnzoomedHeight;
		let lastAppliedHeight = '';
		let lastAppliedTop = '';

		const restoreDocumentStyles = () => {
			if (!isActive) return;
			isActive = false;
			lastAppliedHeight = '';
			lastAppliedTop = '';

			docEl.style.overflow = savedStyles.docOverflow;
			docEl.style.height = savedStyles.docHeight;
			body.style.overflow = savedStyles.bodyOverflow;
			body.style.height = savedStyles.bodyHeight;
			body.style.minHeight = savedStyles.bodyMinHeight;
			body.style.overscrollBehavior = savedStyles.bodyOverscroll;

			if (savedStyles.viewportHeightVar) {
				docEl.style.setProperty('--game-viewport-height', savedStyles.viewportHeightVar);
			} else {
				docEl.style.removeProperty('--game-viewport-height');
			}

			if (savedStyles.viewportTopVar) {
				docEl.style.setProperty('--game-viewport-top', savedStyles.viewportTopVar);
			} else {
				docEl.style.removeProperty('--game-viewport-top');
			}

			if (savedStyles.keyboardAttr !== null) {
				docEl.setAttribute('data-game-keyboard', savedStyles.keyboardAttr);
			} else {
				docEl.removeAttribute('data-game-keyboard');
			}
		};

		const applyCssVar = (name: string, value: string, prevValue: string): string => {
			if (value === prevValue) return prevValue;
			docEl.style.setProperty(name, value);
			return value;
		};

		const syncViewport = () => {
			if (!mql.matches) {
				restoreDocumentStyles();
				return;
			}

			isActive = true;
			const vv = window.visualViewport;
			const isUnzoomed = !vv || vv.scale <= PINCH_ZOOM_SCALE_THRESHOLD;

			// Reset baseline height when viewport width changes (e.g. device rotation)
			if (Math.abs(window.innerWidth - prevWidth) > 50) {
				prevWidth = window.innerWidth;
				maxUnzoomedHeight = vv?.height ?? window.innerHeight;
			}

			docEl.style.overflow = 'hidden';
			docEl.style.height = '100%';
			body.style.overflow = 'hidden';
			body.style.height = '100%';
			body.style.minHeight = '0';
			body.style.overscrollBehavior = 'none';

			const activeEl = document.activeElement;
			const isInputFocused =
				activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;

			if (vv && isUnzoomed) {
				const flooredHeight = Math.floor(vv.height);
				const roundedTop = Math.max(0, Math.round(vv.offsetTop));
				maxUnzoomedHeight = Math.max(maxUnzoomedHeight, flooredHeight);

				lastAppliedHeight = applyCssVar(
					'--game-viewport-height',
					`${flooredHeight}px`,
					lastAppliedHeight,
				);
				lastAppliedTop = applyCssVar(
					'--game-viewport-top',
					`${roundedTop}px`,
					lastAppliedTop,
				);

				const isKeyboardOpen =
					isInputFocused && maxUnzoomedHeight - flooredHeight >= KEYBOARD_HEIGHT_DELTA_PX;
				docEl.setAttribute('data-game-keyboard', isKeyboardOpen ? 'open' : 'closed');

				if (flooredHeight < prevViewportHeight && isInputFocused) {
					ensureElementVisibleInScrollParent(activeEl);
				}
				prevViewportHeight = flooredHeight;
			} else if (!vv) {
				lastAppliedHeight = applyCssVar(
					'--game-viewport-height',
					`${window.innerHeight}px`,
					lastAppliedHeight,
				);
				lastAppliedTop = applyCssVar('--game-viewport-top', '0px', lastAppliedTop);
				docEl.setAttribute('data-game-keyboard', 'closed');
				prevViewportHeight = window.innerHeight;
			} else {
				// Preserve pinch-zoom behavior without compressing the layout
				docEl.style.removeProperty('--game-viewport-height');
				docEl.style.removeProperty('--game-viewport-top');
				docEl.setAttribute('data-game-keyboard', 'closed');
				lastAppliedHeight = '';
				lastAppliedTop = '';
			}

			if (isUnzoomed && !isInputFocused && (window.scrollX !== 0 || window.scrollY !== 0)) {
				window.scrollTo(0, 0);
			}
		};

		const scheduleSync = () => {
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
			}
			rafId = requestAnimationFrame(() => {
				rafId = null;
				syncViewport();
			});
		};

		const handleFocusOut = (e: FocusEvent) => {
			// Skip when focus is moving directly to another input (e.g. letter-by-letter slots)
			const nextTarget = e.relatedTarget;
			if (nextTarget instanceof HTMLInputElement || nextTarget instanceof HTMLTextAreaElement) {
				return;
			}

			syncViewport();
			if (blurTimeoutId !== null) {
				window.clearTimeout(blurTimeoutId);
			}
			// Re-sync after iOS keyboard dismissal settles
			blurTimeoutId = window.setTimeout(() => {
				blurTimeoutId = null;
				const currentActive = document.activeElement;
				if (
					!(
						currentActive instanceof HTMLInputElement ||
						currentActive instanceof HTMLTextAreaElement
					) &&
					(window.scrollX !== 0 || window.scrollY !== 0)
				) {
					window.scrollTo(0, 0);
				}
				syncViewport();
			}, 150);
		};

		const handleMediaChange = () => {
			syncViewport();
		};

		syncViewport();

		mql.addEventListener('change', handleMediaChange);
		window.addEventListener('resize', syncViewport);
		window.addEventListener('orientationchange', scheduleSync);
		window.addEventListener('focusin', scheduleSync);
		window.addEventListener('focusout', handleFocusOut);

		const vv = window.visualViewport;
		vv?.addEventListener('resize', syncViewport);
		vv?.addEventListener('scroll', syncViewport);

		return () => {
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
			}
			if (blurTimeoutId !== null) {
				window.clearTimeout(blurTimeoutId);
			}
			mql.removeEventListener('change', handleMediaChange);
			window.removeEventListener('resize', syncViewport);
			window.removeEventListener('orientationchange', scheduleSync);
			window.removeEventListener('focusin', scheduleSync);
			window.removeEventListener('focusout', handleFocusOut);
			vv?.removeEventListener('resize', syncViewport);
			vv?.removeEventListener('scroll', syncViewport);
			restoreDocumentStyles();
		};
	}, []);
}
