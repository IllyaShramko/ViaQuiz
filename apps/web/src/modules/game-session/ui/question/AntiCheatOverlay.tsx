import styles from '../GameSession.module.css';

export interface AntiCheatOverlayProps {
	text?: string;
}

export function AntiCheatOverlay({
	text = 'Завантажуємо перемогу... Залишилось зовсім трохи.',
}: AntiCheatOverlayProps) {
	return (
		<div className={styles['anticheat-overlay']}>
			<div className={styles['anticheat-banner']}>
				<div className={styles['anticheat-spinner']}>↻</div>
				<div className={styles['anticheat-title']}>Зачекайте...</div>
				<div className={styles['anticheat-subtitle']}>{text}</div>
			</div>
		</div>
	);
}
