import { useState, useEffect, useRef, useCallback } from 'react';
import podiumSound from '../../../../../assets/sounds/podium.ogg';

export interface UsePodiumAnimationOptions {
	/** Whether the animation sequence should start automatically on mount */
	autoStart?: boolean;
	/** Number of participants shown on the podium (default: 3) */
	participantCount?: number;
	/** Delay in milliseconds before 3rd place is revealed (default: 800) */
	thirdPlaceDelay?: number;
	/** Delay in milliseconds between 3rd and 2nd place reveal (default: 1200) */
	secondPlaceDelay?: number;
	/** Delay in milliseconds between 2nd and 1st place reveal (default: 1500) */
	firstPlaceDelay?: number;
	/** Duration in milliseconds that confetti stays active (default: 3000) */
	confettiDuration?: number;
	/** Whether to play sound effects when podium places appear (default: true) */
	enableSound?: boolean;
	/** Audio playback volume between 0 and 1 (default: 0.6) */
	soundVolume?: number;
}

export interface UsePodiumAnimationResult {
	/** Set of revealed place numbers (1, 2, 3) */
	revealedPlaces: Set<number>;
	/** Whether confetti particle effect is actively firing */
	isConfettiActive: boolean;
	/** Current animation lifecycle phase */
	phase: 'waiting' | 'revealing' | 'complete';
	/** Instantly reveals all places and finishes the animation sequence */
	skipToEnd: () => void;
}

function checkPrefersReducedMotion(): boolean {
	if (typeof window !== 'undefined' && window.matchMedia) {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}
	return false;
}

function playPodiumSound(volume = 0.6): void {
	try {
		const audio = new Audio(podiumSound);
		audio.volume = Math.max(0, Math.min(1, volume));
		const playPromise = audio.play();
		if (playPromise !== undefined) {
			playPromise.catch((err) => {
				// Autoplay restriction may block playback if user hasn't interacted yet
				console.warn('Podium sound playback was prevented:', err);
			});
		}
	} catch (error) {
		console.warn('Failed to initialize podium sound:', error);
	}
}

export function usePodiumAnimation({
	autoStart = true,
	participantCount = 3,
	thirdPlaceDelay = 800,
	secondPlaceDelay = 1200,
	firstPlaceDelay = 1500,
	confettiDuration = 3000,
	enableSound = true,
	soundVolume = 0.6,
}: UsePodiumAnimationOptions = {}): UsePodiumAnimationResult {
	const prefersReducedMotion = checkPrefersReducedMotion();

	const [revealedPlaces, setRevealedPlaces] = useState<Set<number>>(() => {
		if (prefersReducedMotion) {
			return new Set([1, 2, 3]);
		}
		return new Set();
	});

	const [isConfettiActive, setIsConfettiActive] = useState<boolean>(false);

	const [phase, setPhase] = useState<'waiting' | 'revealing' | 'complete'>(() => {
		if (prefersReducedMotion) {
			return 'complete';
		}
		return autoStart ? 'revealing' : 'waiting';
	});

	const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

	const clearAllTimers = useCallback(() => {
		for (const timerId of timersRef.current) {
			clearTimeout(timerId);
		}
		timersRef.current = [];
	}, []);

	const skipToEnd = useCallback(() => {
		clearAllTimers();
		setRevealedPlaces(new Set([1, 2, 3]));
		setIsConfettiActive(false);
		setPhase('complete');
	}, [clearAllTimers]);

	// Preload audio asset when sound is enabled
	useEffect(() => {
		if (!enableSound) return;
		try {
			const preloadAudio = new Audio(podiumSound);
			preloadAudio.preload = 'auto';
		} catch {
			// Ignore preload errors in non-browser environments
		}
	}, [enableSound]);

	useEffect(() => {
		if (prefersReducedMotion || !autoStart) return;

		clearAllTimers();

		// 1. Reveal 3rd place
		const timer3 = setTimeout(() => {
			setRevealedPlaces((prev) => new Set([...prev, 3]));
			if (enableSound && participantCount >= 3) {
				playPodiumSound(soundVolume);
			}
		}, thirdPlaceDelay);
		timersRef.current.push(timer3);

		// 2. Reveal 2nd place
		const timeFor2 = thirdPlaceDelay + secondPlaceDelay;
		const timer2 = setTimeout(() => {
			setRevealedPlaces((prev) => new Set([...prev, 2]));
			if (enableSound && participantCount >= 2) {
				playPodiumSound(soundVolume);
			}
		}, timeFor2);
		timersRef.current.push(timer2);

		// 3. Reveal 1st place
		const timeFor1 = timeFor2 + firstPlaceDelay;
		const timer1 = setTimeout(() => {
			setRevealedPlaces((prev) => new Set([...prev, 1]));
			if (enableSound && participantCount >= 1) {
				playPodiumSound(soundVolume);
			}
		}, timeFor1);
		timersRef.current.push(timer1);

		// 4. Trigger confetti slightly after 1st place appears
		const confettiStart = timeFor1 + 400;
		const timerConfettiStart = setTimeout(() => {
			setIsConfettiActive(true);
		}, confettiStart);
		timersRef.current.push(timerConfettiStart);

		// 5. Complete animation sequence and stop confetti
		const finishTime = confettiStart + confettiDuration;
		const timerFinish = setTimeout(() => {
			setIsConfettiActive(false);
			setPhase('complete');
		}, finishTime);
		timersRef.current.push(timerFinish);

		return () => {
			clearAllTimers();
		};
	}, [
		autoStart,
		participantCount,
		prefersReducedMotion,
		thirdPlaceDelay,
		secondPlaceDelay,
		firstPlaceDelay,
		confettiDuration,
		enableSound,
		soundVolume,
		clearAllTimers,
	]);

	return {
		revealedPlaces,
		isConfettiActive,
		phase,
		skipToEnd,
	};
}
