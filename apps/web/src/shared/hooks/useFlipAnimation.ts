import { useRef, useLayoutEffect, type DependencyList } from 'react';

/**
 * Lightweight FLIP (First-Last-Invert-Play) hook for animating
 * reorder / add / remove of keyed child elements within a container.
 *
 * Zero external dependencies — uses native Web Animations API (WAAPI).
 *
 * ## How it works
 * Each child MUST have a `data-flip-key` attribute with a stable unique ID.
 * When dependencies change (or on each commit), the hook measures new un-transformed rects,
 * compares them with the previous resting positions, and animates changes smoothly.
 */

export interface UseFlipAnimationOptions {
	/** Animation duration in ms (default: 350) */
	duration?: number;
	/** CSS easing string (default: cubic-bezier(0.16, 1, 0.3, 1) — expo out) */
	easing?: string;
	/** Optional dependencies to limit FLIP calculation only to data/order changes */
	deps?: DependencyList;
}

export function useFlipAnimation<T extends HTMLElement>({
	duration = 350,
	easing = 'cubic-bezier(0.16, 1, 0.3, 1)',
	deps,
}: UseFlipAnimationOptions = {}) {
	const containerRef = useRef<T | null>(null);

	/**
	 * Stored resting rects keyed by `data-flip-key` value.
	 * Captured BEFORE animations start, ensuring we always compare true resting positions.
	 */
	const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());

	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const children = Array.from(container.children) as HTMLElement[];
		const prevRects = prevRectsRef.current;

		// 1. Cancel any active running WAAPI animations before measuring natural DOM layout
		for (const child of children) {
			if (typeof child.getAnimations === 'function') {
				const activeAnimations = child.getAnimations();
				for (const anim of activeAnimations) {
					anim.cancel();
				}
			}
		}

		// 2. Measure TRUE resting positions BEFORE applying any new animations
		const currentRects = new Map<string, DOMRect>();
		for (const child of children) {
			const key = child.dataset.flipKey;
			if (key) {
				currentRects.set(key, child.getBoundingClientRect());
			}
		}

		// 3. Compare with prevRects and animate moved / new elements
		if (prevRects.size > 0) {
			for (const child of children) {
				const key = child.dataset.flipKey;
				if (!key) continue;

				const newRect = currentRects.get(key);
				if (!newRect) continue;

				const prevRect = prevRects.get(key);

				if (!prevRect) {
					// New element — subtle entrance animation
					child.animate(
						[
							{ opacity: '0', transform: 'scale(0.92)' },
							{ opacity: '1', transform: 'scale(1)' },
						],
						{ duration, easing },
					);
					continue;
				}

				const deltaX = prevRect.left - newRect.left;
				const deltaY = prevRect.top - newRect.top;

				// Skip if the element didn't actually move (using 1px threshold to avoid subpixel noise)
				if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) continue;

				// Invert + Play: start at old position, animate to natural (new) position
				child.animate(
					[
						{ transform: `translate(${deltaX}px, ${deltaY}px)` },
						{ transform: 'translate(0, 0)' },
					],
					{ duration, easing },
				);
			}
		}

		// 4. Save TRUE resting positions (measured BEFORE animations were launched)
		prevRectsRef.current = currentRects;
	}, deps);

	return containerRef;
}
