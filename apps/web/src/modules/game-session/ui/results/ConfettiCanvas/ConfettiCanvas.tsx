import { useEffect, useRef } from 'react';
import type { ConfettiCanvasProps } from './ConfettiCanvas.types';
import styles from './ConfettiCanvas.module.css';

interface Particle {
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
	vx: number;
	vy: number;
	rotation: number;
	rotationSpeed: number;
	opacity: number;
	wobble: number;
	wobbleSpeed: number;
}

const CONFETTI_COLORS = [
	'#FFD700', // Gold
	'#863BFF', // Primary purple accent
	'#3B82F6', // Blue
	'#10B981', // Emerald green
	'#EC4899', // Pink
	'#F59E0B', // Amber
	'#06B6D4', // Cyan
];

export function ConfettiCanvas({
	active,
	particleCount = 90,
}: ConfettiCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const particlesRef = useRef<Particle[]>([]);
	const isEmittingRef = useRef<boolean>(active);

	useEffect(() => {
		isEmittingRef.current = active;
	}, [active]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const resize = () => {
			const dpr = window.devicePixelRatio || 1;
			canvas.width = window.innerWidth * dpr;
			canvas.height = window.innerHeight * dpr;
			ctx.resetTransform?.();
			ctx.scale(dpr, dpr);
		};

		resize();
		window.addEventListener('resize', resize);

		const createParticle = (spawnTop = false): Particle => {
			const width = Math.random() * 8 + 6;
			const height = Math.random() * 6 + 4;
			const x = Math.random() * window.innerWidth;
			const y = spawnTop ? -20 : Math.random() * (window.innerHeight * 0.4);

			return {
				x,
				y,
				width,
				height,
				color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
				vx: (Math.random() - 0.5) * 4,
				vy: Math.random() * 3 + 2.5,
				rotation: Math.random() * 360,
				rotationSpeed: (Math.random() - 0.5) * 8,
				opacity: 1,
				wobble: Math.random() * Math.PI * 2,
				wobbleSpeed: Math.random() * 0.08 + 0.04,
			};
		};

		// Seed initial particles when active
		if (active && particlesRef.current.length === 0) {
			particlesRef.current = Array.from({ length: particleCount }, () => createParticle(false));
		}

		const render = () => {
			ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

			const particles = particlesRef.current;

			// Spawn replacements while emitting is active
			if (isEmittingRef.current && particles.length < particleCount) {
				const toAdd = Math.min(3, particleCount - particles.length);
				for (let i = 0; i < toAdd; i++) {
					particles.push(createParticle(true));
				}
			}

			// Update & render each particle
			for (let i = particles.length - 1; i >= 0; i--) {
				const p = particles[i];

				p.wobble += p.wobbleSpeed;
				p.x += p.vx + Math.sin(p.wobble) * 1.2;
				p.y += p.vy;
				p.rotation += p.rotationSpeed;

				// Slowly fade out when reaching bottom 15% of viewport
				if (p.y > window.innerHeight * 0.85) {
					p.opacity -= 0.02;
				}

				// Remove offscreen or fully faded particles
				if (p.y > window.innerHeight + 20 || p.opacity <= 0) {
					if (isEmittingRef.current) {
						particles[i] = createParticle(true);
					} else {
						particles.splice(i, 1);
					}
					continue;
				}

				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate((p.rotation * Math.PI) / 180);
				ctx.globalAlpha = Math.max(0, p.opacity);
				ctx.fillStyle = p.color;
				ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
				ctx.restore();
			}

			// Continue animation loop if emitting or particles remain
			if (isEmittingRef.current || particles.length > 0) {
				animationFrameRef.current = requestAnimationFrame(render);
			} else {
				animationFrameRef.current = null;
			}
		};

		if (active || particlesRef.current.length > 0) {
			animationFrameRef.current = requestAnimationFrame(render);
		}

		return () => {
			window.removeEventListener('resize', resize);
			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [active, particleCount]);

	return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
