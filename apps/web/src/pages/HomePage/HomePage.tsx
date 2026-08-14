import { useState, type FormEvent } from "react";
import { useLocale } from "../../shared/i18n/useLocale";
import { Link } from "react-router-dom";
import { useGetPublishedQuizzesQuery } from "../../modules/home/api/quizApi";
import "./HomePage.css";

const DEFAULT_QUIZ_COVER = "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains";

export function HomePage() {
	const { t, locale, pluralize } = useLocale();
	const [code, setCode] = useState("");

	const { data, isLoading, error } = useGetPublishedQuizzesQuery({
		page: 1,
		limit: 6,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const quizzes = data?.quizzes ?? [];

	const handleCodeSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (code.trim()) {
			alert(`${t("hero.enterCode")}: ${code}`);
		}
	};

	const featureKeys = ["create", "share", "analyze", "ai"] as const;

	const featureIcons = [
		// Create — pencil/edit icon
		<svg key="create" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
		</svg>,
		// Share — share icon
		<svg key="share" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
			<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
		</svg>,
		// Analyze — bar chart icon
		<svg key="analyze" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
		</svg>,
		// AI — sparkles/wand icon
		<svg key="ai" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
		</svg>,
	];

	const getAuthorName = (author: { login: string; firstName: string | null; lastName: string | null }) => {
		if (author.firstName || author.lastName) {
			return [author.firstName, author.lastName].filter(Boolean).join(" ");
		}
		return author.login;
	};

	return (
		<div className="homepage">
			{/* Hero Section */}
			<section className="hero">
				<div className="hero__orb"></div>
				<div className="hero__content">
					<h1 className="hero__title">
						<span className="hero__accent">
							{t("hero.titleAccent")}
						</span>{" "}
						{t("hero.title")}
					</h1>
					<p className="hero__subtitle">{t("hero.subtitle")}</p>
					<div className="hero__actions">
						<Link
							to="/register"
							className="btn btn--primary btn--lg"
						>
							{t("hero.cta")}
						</Link>
						<form
							id="enter-code"
							className="hero__code-form"
							onSubmit={handleCodeSubmit}
						>
							<input
								type="text"
								placeholder={t("hero.enterCode")}
								value={code}
								onChange={(e) => setCode(e.target.value)}
								className="hero__code-input"
							/>
							<button
								type="submit"
								className="btn btn--secondary"
							>
								→
							</button>
						</form>
					</div>
				</div>
			</section>

			{/* Featured Quizzes Showcase Section */}
			<section className="quizzes-section">
				<div className="container">
					<div className="section-header">
						<h2 className="section-title">{t("quizzes.title")}</h2>
						<p className="section-subtitle">
							{t("quizzes.subtitle")}
						</p>
					</div>

					{isLoading && (
						<div className="quizzes-loading">
							<div className="quizzes-grid">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<div key={i} className="quiz-card quiz-card--skeleton">
										<div className="quiz-card__header quiz-card__header--skeleton" />
										<div className="quiz-card__body">
											<div className="skeleton-line skeleton-line--title" />
											<div className="skeleton-line skeleton-line--author" />
											<div className="skeleton-line skeleton-line--desc" />
											<div className="skeleton-line skeleton-line--desc-short" />
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{error && (
						<div className="quizzes-error">
							<p>{locale === "uk" ? "Не вдалося завантажити вікторини" : "Failed to load quizzes"}</p>
						</div>
					)}

					{!isLoading && !error && quizzes.length === 0 && (
						<div className="quizzes-empty">
							<p>{locale === "uk" ? "Поки що немає опублікованих вікторин" : "No published quizzes yet"}</p>
						</div>
					)}

					{!isLoading && !error && quizzes.length > 0 && (
						<div className="quizzes-grid">
							{quizzes.map((quiz) => (
								<div key={quiz.id} className="quiz-card card card--interactive">
									<div className="quiz-card__header">
										<img
											src={quiz.coverImg || DEFAULT_QUIZ_COVER}
											alt={quiz.name}
											className="quiz-card__cover-img"
											loading="lazy"
										/>
										{quiz.keywords.length > 0 && (
											<span className="quiz-card__category-badge">
												{quiz.keywords[0].name}
											</span>
										)}
									</div>
									<div className="quiz-card__body">
										<h3 className="quiz-card__title">{quiz.name}</h3>
										<p className="quiz-card__author">
											{t("quizzes.author")}: <span>{getAuthorName(quiz.author)}</span>
										</p>
										{quiz.description && (
											<p className="quiz-card__desc">
												{quiz.description}
											</p>
										)}
										<div className="quiz-card__footer">
											<span className="quiz-card__stat">
												📝 {quiz._count?.questions ?? 0} {pluralize(quiz._count?.questions ?? 0, { uk: ['запитання', 'запитання', 'запитань'], en: ['question', 'questions'] })}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</section>

			{/* Features Section */}
			<section className="features">
				<div className="container">
					<div className="section-header">
						<h2 className="section-title">{t("features.title")}</h2>
						<p className="section-subtitle">
							{t("features.subtitle")}
						</p>
					</div>
					<div className="features-grid">
						{featureKeys.map((key, i) => (
							<div key={key} className="feature-card">
								<div className="feature-icon">
									{featureIcons[i]}
								</div>
								<h3 className="feature-title">
									{t(`features.${key}.title`)}
								</h3>
								<p className="feature-desc">
									{t(`features.${key}.description`)}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="how-it-works">
				<div className="container">
					<div className="section-header">
						<h2 className="section-title">
							{t("howItWorks.title")}
						</h2>
					</div>
					<div className="steps-container">
						{[1, 2, 3].map((num) => (
							<div key={num} className="step-item">
								<div className="step-badge">{num}</div>
								<h3 className="step-title">
									{t(`howItWorks.step${num}.title`)}
								</h3>
								<p className="step-desc">
									{t(`howItWorks.step${num}.description`)}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="cta-section">
				<div className="container">
					<div className="cta-card">
						<h2 className="cta-title">{t("cta.title")}</h2>
						<p className="cta-subtitle">{t("cta.subtitle")}</p>
						<Link
							to="/register"
							className="btn btn--primary btn--lg"
						>
							{t("cta.button")}
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="footer">
				<div className="container">
					<div className="footer-top">
						<div className="footer-brand">
							<Link to="/" className="layout-logo">
								<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
									<g transform="translate(-164, -2239)">
										<path fill="currentColor" d="M180.408,2250.776 C178.985,2252.601 177.497,2254.062 175.774,2255.404 C177.201,2256.228 180.549,2257.722 181.634,2256.637 C182.375,2255.897 182.034,2253.581 180.408,2250.776 M174.002,2254.251 C175.984,2252.802 177.798,2250.988 179.247,2249.006 C177.804,2247.032 175.991,2245.216 174.002,2243.761 C172.005,2245.22 170.195,2247.038 168.755,2249.006 C170.204,2250.989 172.019,2252.802 174.002,2254.251 M172.228,2255.404 C170.501,2254.058 169.013,2252.597 167.594,2250.776 C165.968,2253.581 165.627,2255.897 166.368,2256.637 C167.443,2257.711 170.762,2256.252 172.228,2255.404 M167.594,2247.236 C169.016,2245.411 170.504,2243.952 172.228,2242.609 C170.803,2241.784 167.454,2240.29 166.368,2241.375 C165.627,2242.116 165.968,2244.431 167.594,2247.236 M175.774,2242.609 C177.501,2243.954 178.988,2245.414 180.408,2247.236 C184.018,2241.009 181.288,2239.422 175.774,2242.609 M181.664,2249.006 C187.098,2257.497 182.428,2262.065 174.002,2256.674 C165.595,2262.052 160.886,2257.525 166.339,2249.006 C160.942,2240.574 165.492,2235.895 174.002,2241.338 C182.425,2235.95 187.103,2240.508 181.664,2249.006 M175.065,2247.946 C175.649,2248.53 175.649,2249.478 175.065,2250.062 C174.481,2250.646 173.532,2250.646 172.948,2250.062 C172.363,2249.478 172.363,2248.53 172.948,2247.946 C173.532,2247.361 174.481,2247.361 175.065,2247.946" />
									</g>
								</svg>
								ViaQuiz
							</Link>
							<p className="footer-desc">
								{t("footer.description")}
							</p>
						</div>
						<div className="footer-links">
							<div className="footer-col">
								<h4>{t("footer.product")}</h4>
								<a href="#features">{t("footer.features")}</a>
								<a href="#pricing">{t("footer.pricing")}</a>
							</div>
							<div className="footer-col">
								<h4>{t("footer.company")}</h4>
								<a href="#about">{t("footer.about")}</a>
								<a href="#blog">{t("footer.blog")}</a>
							</div>
							<div className="footer-col">
								<h4>{t("footer.legal")}</h4>
								<a href="#privacy">{t("footer.privacy")}</a>
								<a href="#terms">{t("footer.terms")}</a>
							</div>
						</div>
						<div className="footer-social">
							<a href="#github" aria-label="GitHub">
								<svg width="20" height="20">
									<use href="/icons.svg#github-icon" />
								</svg>
							</a>
							<a href="#discord" aria-label="Discord">
								<svg width="20" height="20">
									<use href="/icons.svg#discord-icon" />
								</svg>
							</a>
							<a href="#x" aria-label="X">
								<svg width="20" height="20">
									<use href="/icons.svg#x-icon" />
								</svg>
							</a>
							<a href="#bluesky" aria-label="Bluesky">
								<svg width="20" height="20">
									<use href="/icons.svg#bluesky-icon" />
								</svg>
							</a>
						</div>
					</div>
					<div className="footer-bottom">
						<p>{t("footer.rights")}</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
