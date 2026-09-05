import { useState } from 'react';
import waitIcon from '../../../../../assets/icons/wait.svg';
import { getRandomCaption } from '../../../utils/captions';
import type { AntiCheatOverlayProps } from './AntiCheatOverlay.types';
import styles from './AntiCheatOverlay.module.css';

export function AntiCheatOverlay({ text }: AntiCheatOverlayProps) {
	const [caption] = useState(() => text || getRandomCaption('wait'));

	return (
		<>
			{/* Overlay to add blur and backdrop */}
			<div className={styles.overlay} />

			{/* Status Banner Container (stays in center, doesn't drop down) */}
			<div className={styles.waitBannerContainer}>
				<div className={styles.waitBanner}>
					<img
						src={waitIcon}
						className={styles.waitSpinnerIcon}
						alt="Очікування"
					/>
					<span>Зачекайте...</span>
				</div>
				<span className={styles.quote}>
					{caption}
				</span>
			</div>
		</>
	);
}
