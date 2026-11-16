import { useState } from 'react';
import { ImageLightboxModal } from '../../modals';
import { ReviewStatsCard } from '../ReviewStatsCard';
import { ReviewOverviewTab } from '../ReviewOverviewTab';
import { ReviewAnswersTab } from '../ReviewAnswersTab';
import type { ReviewHostViewProps } from './ReviewHostView.types';
import styles from './ReviewHostView.module.css';

type ReviewTabId = 'overview' | 'answers';

const REVIEW_TABS: readonly { id: ReviewTabId; label: string }[] = [
	{ id: 'overview', label: 'Загальний огляд' },
	{ id: 'answers', label: 'Відповіді' },
];

/**
 * Host review phase screen combining accuracy statistics, question distribution, and individual student answers.
 */
export function ReviewHostView({
	question,
	questionIndex,
	reviewData,
	participants,
}: ReviewHostViewProps) {
	const [activeTab, setActiveTab] = useState<ReviewTabId>('overview');
	const [lightboxImage, setLightboxImage] = useState<string | null>(null);
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);

	const handleOpenLightbox = (url?: string | null) => {
		if (!url) return;
		setLightboxImage(url);
		setIsLightboxOpen(true);
	};

	return (
		<div className={styles.gameMainContent}>
			<div className={styles.container}>
				<ReviewStatsCard
					correctVariantIds={reviewData.correctVariantIds}
					answersDistribution={reviewData.answersDistribution}
					participantAnswers={reviewData.participantAnswers}
					totalParticipantsCount={participants.length}
				/>

				<div className={styles.rightColumn}>
					<div className={styles.tabsHeader}>
						{REVIEW_TABS.map((tab) => (
							<button
								key={tab.id}
								type="button"
								className={`${styles.tabBtn} ${activeTab === tab.id ? styles.isActive : ''}`}
								onClick={() => setActiveTab(tab.id)}
							>
								{tab.label}
							</button>
						))}
					</div>

					{activeTab === 'overview' && (
						<ReviewOverviewTab
							question={question}
							reviewData={reviewData}
							participantsCount={participants.length}
							onOpenImage={handleOpenLightbox}
						/>
					)}

					{activeTab === 'answers' && (
						<ReviewAnswersTab
							key={questionIndex}
							participants={participants}
							participantAnswers={reviewData.participantAnswers}
							variants={question.variants}
							correctVariantIds={reviewData.correctVariantIds}
						/>
					)}
				</div>
			</div>

			<ImageLightboxModal
				isOpen={isLightboxOpen}
				imageUrl={lightboxImage}
				onClose={() => setIsLightboxOpen(false)}
				onAfterClose={() => setLightboxImage(null)}
			/>
		</div>
	);
}
