import { useState, type FormEvent } from "react";
import { useLocale } from "../../shared/i18n/useLocale";
import { Link } from "react-router-dom";
import "./HomePage.css";

interface QuizPreview {
	id: string;
	titleKey: string;
	author: string;
	descriptionUk: string;
	descriptionEn: string;
	questionsCount: number;
	viewsCount: number;
	previewEquation?: string;
	category: string;
	gradient: string;
}

const SAMPLE_QUIZZES: QuizPreview[] = [
	{
		id: "1",
		titleKey: "quizzes.mathSample",
		author: "Олександр Шевченко",
		descriptionUk: "Дроби, рівняння та базові алгебраїчні задачі для перевірки логічного мислення.",
		descriptionEn: "Fractions, equations and basic algebraic problems to test logical reasoning.",
		questionsCount: 12,
		viewsCount: 284,
		previewEquation: "2/3 + 1/6 = ?",
		category: "Math",
		gradient: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
	},
	{
		id: "2",
		titleKey: "quizzes.itSample",
		author: "Ілля Шрамко",
		descriptionUk: "HTML, CSS, базовий JavaScript та сучасні принципи веброзробки.",
		descriptionEn: "HTML, CSS, core JavaScript, and modern web application development principles.",
		questionsCount: 15,
		viewsCount: 412,
		previewEquation: "const [state] = useState()",
		category: "Code",
		gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
	},
	{
		id: "3",
		titleKey: "quizzes.historySample",
		author: "Марія Ковальчук",
		descriptionUk: "Ключові історичні події, видатні постаті та знакові дати України.",
		descriptionEn: "Key historical milestones, prominent figures, and landmark events.",
		questionsCount: 10,
		viewsCount: 195,
		previewEquation: "1991 • 1918 • 1648",
		category: "History",
		gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
	},
	{
		id: "4",
		titleKey: "quizzes.scienceSample",
		author: "Дмитро Мельник",
		descriptionUk: "Фізика, хімія та закони природи у простих і захопливих запитаннях.",
		descriptionEn: "Physics, chemistry, and laws of nature presented in engaging questions.",
		questionsCount: 14,
		viewsCount: 167,
		previewEquation: "E = mc² • H₂O",
		category: "Science",
		gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
	},
	{
		id: "5",
		titleKey: "quizzes.geoSample",
		author: "Олена Бондар",
		descriptionUk: "Столиці країн, прапори, гірські системи та визначні географічні об'єкти.",
		descriptionEn: "World capitals, flags, mountain ranges, and prominent geographical landmarks.",
		questionsCount: 16,
		viewsCount: 220,
		previewEquation: "48°51'N 2°21'E",
		category: "Geo",
		gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
	},
	{
		id: "6",
		titleKey: "quizzes.langSample",
		author: "Анна Кравченко",
		descriptionUk: "Граматичні конструкції, фразові дієслова та розширена лексика.",
		descriptionEn: "Grammar structures, phrasal verbs, idioms, and advanced vocabulary.",
		questionsCount: 20,
		viewsCount: 389,
		previewEquation: "Present Perfect vs Past",
		category: "English",
		gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
	},
];

export function HomePage() {
	const { t, locale } = useLocale();
	const [code, setCode] = useState("");

	const handleCodeSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (code.trim()) {
			// Code entry handler
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

	return (
		<div className="homepage">
			{/* Hero Section */}
			<section className="hero">
				<div className="hero__orb"></div>
				<div className="hero__content">
					<div className="hero__badge">
						<span>⚡ {t("hero.title")}</span>
					</div>
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
					<div className="quizzes-grid">
						{SAMPLE_QUIZZES.map((quiz) => (
							<div key={quiz.id} className="quiz-card card card--interactive">
								<div className="quiz-card__header" style={{ background: quiz.gradient }}>
									<span className="quiz-card__category-badge">{quiz.category}</span>
									<span className="quiz-card__equation">{quiz.previewEquation}</span>
								</div>
								<div className="quiz-card__body">
									<h3 className="quiz-card__title">{t(quiz.titleKey)}</h3>
									<p className="quiz-card__author">
										{t("quizzes.author")}: <span>{quiz.author}</span>
									</p>
									<p className="quiz-card__desc">
										{locale === "uk" ? quiz.descriptionUk : quiz.descriptionEn}
									</p>
									<div className="quiz-card__footer">
										<span className="quiz-card__stat">
											📝 {quiz.questionsCount} {t("quizzes.questions")}
										</span>
										<span className="quiz-card__stat">
											👁️ {quiz.viewsCount} {t("quizzes.views")}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
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
								<svg
									viewBox="0 0 48 46"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill="currentColor"
										d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
									/>
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
