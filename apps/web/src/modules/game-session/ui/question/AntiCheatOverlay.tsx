import { useState } from 'react';
import waitIcon from '../../../../assets/icons/wait.svg';
import { getRandomCaption } from '../../utils/captions';
import styles from '../GameSession.module.css';

export interface AntiCheatOverlayProps {
	text?: string;
}

export function AntiCheatOverlay({ text }: AntiCheatOverlayProps) {
	const [caption] = useState(() => text || getRandomCaption('wait'));

	return (
		<>
			{/* Overlay to add blur and backdrop */}
			<div
				className={`${styles['review-student-overlay']} ${styles['is-active']}`}
			/>

			{/* Status Banner Container (stays in center, doesn't drop down) */}
			<div className={styles['wait-student-banner-container']}>
				<div
					className={`${styles['review-student-banner']} ${styles['review-banner-wait']}`}
				>
					<img
						src={waitIcon}
						className={styles['wait-spinner-icon']}
						alt="Очікування"
					/>
					<span>Зачекайте...</span>
				</div>
				<span className={styles['review-banner-quote']}>
					{caption}
				</span>
			</div>
		</>
	);
}

