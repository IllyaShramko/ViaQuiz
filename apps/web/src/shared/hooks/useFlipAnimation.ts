import { useRef, useLayoutEffect } from 'react';

/**
 * Lightweight FLIP (First-Last-Invert-Play) hook for animating
 * reorder / add / remove of keyed child elements within a container.
 *
 * Zero external dependencies — uses native Web Animations API (WAAPI).
 *
 * ## How it works
 * Each child MUST have a `data-flip-key` attribute with a stable unique ID.
 * After every React commit the hook compares each child's new bounding rect
 * with the rect stored from the previous commit (keyed by `data-flip-key`).
 * If a child moved, it animates `translate()` from the old position to the new.
 * New children get a subtle scale-in entrance.
 *
 * Because `useLayoutEffect` runs after DOM mutations but before the browser
 * paints, the user never sees the "jump" — only the smooth animation.
 *
 * ## Usage
 * ```tsx
 * const listRef = useFlipAnimation<HTMLDivElement>({ duration: 400 });
 * return (
 *   <div ref={listRef}>
 *     {items.map(item => (
 *       <div key={item.id} data-flip-key={item.id}>…</div>
 *     ))}
 *   </div>
 * );
 * ```
 */

export interface UseFlipAnimationOptions {
	/** Animation duration in ms (default: 350) */
	duration?: number;
	/** CSS easing string (default: cubic-bezier(0.16, 1, 0.3, 1) — expo out) */
	easing?: string;
}

export function useFlipAnimation<T extends HTMLElement>({
	duration = 350,
	easing = 'cubic-bezier(0.16, 1, 0.3, 1)',
}: UseFlipAnimationOptions = {}) {
	const containerRef = useRef<T | null>(null);

	/**
	 * Stored rects keyed by `data-flip-key` value.
	 * Updated at the end of every useLayoutEffect so they are always
	 * ready for comparison on the next render.
	 */
	const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());

	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const children = Array.from(container.children) as HTMLElement[];
		const prevRects = prevRectsRef.current;

		// Only animate if we have previously stored positions (skip first mount)
		if (prevRects.size > 0) {
			for (const child of children) {
				const key = child.dataset.flipKey;
				if (!key) continue;

				const newRect = child.getBoundingClientRect();
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

				// Skip if the element didn't actually move
				if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) continue;

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

		// Store current positions for the next render's comparison
		const nextRects = new Map<string, DOMRect>();
		for (const child of children) {
			const key = child.dataset.flipKey;
			if (key) {
				nextRects.set(key, child.getBoundingClientRect());
			}
		}
		prevRectsRef.current = nextRects;
	});

	return containerRef;
}
