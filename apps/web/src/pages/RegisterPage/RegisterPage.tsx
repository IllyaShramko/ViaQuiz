import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useLocale } from "../../shared/i18n/useLocale";
import {
	useRegisterMutation,
	useCheckUniqueMutation,
	useSendCodeMutation,
} from "../../modules/auth/api/authApi";
import "./RegisterPage.css";
import "../LoginPage/LoginPage.css"; // Reuse common auth styles

interface RegisterFormInputs {
	login: string;
	email: string;
	password: string;
	confirmPassword: string;
	firstName?: string;
	lastName?: string;
	code: string;
}

export function RegisterPage() {
	const { t } = useLocale();
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(0);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [isCheckingUnique, setIsCheckingUnique] = useState(false);
	const [isSendingCode, setIsSendingCode] = useState(false);
	const [cooldown, setCooldown] = useState(0);
	const [targetEmail, setTargetEmail] = useState("");

	const [registerApi] = useRegisterMutation();
	const [checkUnique] = useCheckUniqueMutation();
	const [sendCode] = useSendCodeMutation();

	const {
		register,
		handleSubmit,
		trigger,
		getValues,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormInputs>({
		mode: "onTouched",
	});

	useEffect(() => {
		let timer: number;
		if (cooldown > 0) {
			timer = window.setInterval(() => {
				setCooldown((prev) => prev - 1);
			}, 1000);
		}
		return () => {
			if (timer) clearInterval(timer);
		};
	}, [cooldown]);

	const handleNextStep1 = async () => {
		const isValid = await trigger([
			"login",
			"email",
			"password",
			"confirmPassword",
		]);
		if (!isValid) return;

		const { login, email } = getValues();
		try {
			setIsCheckingUnique(true);
			setServerError(null);
			const { loginIsTaken, emailIsTaken } = await checkUnique({
				login,
				email,
			}).unwrap();

			let hasError = false;
			if (loginIsTaken) {
				setError("login", {
					type: "manual",
					message: t("register.error_login_taken"),
				});
				hasError = true;
			}
			if (emailIsTaken) {
				setError("email", {
					type: "manual",
					message: t("register.error_email_taken"),
				});
				hasError = true;
			}

			if (!hasError) {
				setCurrentStep(1);
			}
		} catch (err: any) {
			setServerError(err.data?.message || err.message || t("register.error_default"));
		} finally {
			setIsCheckingUnique(false);
		}
	};

	const moveToStep3 = async () => {
		const { email } = getValues();
		try {
			setIsSendingCode(true);
			setServerError(null);
			const response = await sendCode({ email }).unwrap();
			setTargetEmail(email);
			setCooldown(response.cooldownSeconds || 60);
			setCurrentStep(2);
		} catch (err: any) {
			setServerError(err.data?.message || err.message || t("register.error_default"));
		} finally {
			setIsSendingCode(false);
		}
	};

	const handleNextStep2 = async () => {
		const isValid = await trigger(["firstName", "lastName"]);
		if (isValid) {
			moveToStep3();
		}
	};

	const handleSkipStep2 = () => {
		moveToStep3();
	};

	const handleResendCode = async () => {
		if (cooldown > 0) return;
		const { email } = getValues();
		try {
			setServerError(null);
			const response = await sendCode({ email }).unwrap();
			setCooldown(response.cooldownSeconds || 60);
		} catch (err: any) {
			setServerError(err.data?.message || err.message || t("register.error_default"));
		}
	};

	const onSubmit = async (data: RegisterFormInputs) => {
		if (currentStep !== 2) return;
		try {
			setServerError(null);
			const response = await registerApi(data).unwrap();
			localStorage.setItem("viaquiz-token", response.token);
			navigate("/");
		} catch (err: any) {
			setServerError(err.data?.message || err.message || t("register.error_default"));
		}
	};

	const renderSteps = () => (
		<div
			className="register-steps-container"
			style={{ marginBottom: "32px" }}
		>
			{[0, 1, 2].map((step) => {
				const isActive = currentStep === step;
				const isCompleted = currentStep > step;
				const isUpcoming = currentStep < step;

				let className = "register-step-wrapper";
				if (isActive) className += " active";
				if (isCompleted) className += " completed";
				if (isUpcoming) className += " upcoming";

				let innerClass = "register-step__number";
				if (isActive) innerClass += " register-step--active";
				if (isCompleted) innerClass += " register-step--completed";
				if (isUpcoming) innerClass += " register-step--upcoming";

				const labels = [
					t("register.step_credentials"),
					t("register.step_profile"),
					t("register.step_verification"),
				];

				return (
					<div key={step} className={className}>
						<div
							className={`register-step ${isActive ? "register-step--active" : ""} ${isCompleted ? "register-step--completed" : ""} ${isUpcoming ? "register-step--upcoming" : ""}`}
						>
							<div className="register-step__number">
								{isCompleted ? "✓" : step + 1}
							</div>
							<div className="register-step__label">
								{labels[step]}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);

	return (
		<div className="auth-page">
			<div className="auth-card">
				<Link to="/" className="auth-logo">
					<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
						<g transform="translate(-164, -2239)">
							<path fill="currentColor" d="M180.408,2250.776 C178.985,2252.601 177.497,2254.062 175.774,2255.404 C177.201,2256.228 180.549,2257.722 181.634,2256.637 C182.375,2255.897 182.034,2253.581 180.408,2250.776 M174.002,2254.251 C175.984,2252.802 177.798,2250.988 179.247,2249.006 C177.804,2247.032 175.991,2245.216 174.002,2243.761 C172.005,2245.22 170.195,2247.038 168.755,2249.006 C170.204,2250.989 172.019,2252.802 174.002,2254.251 M172.228,2255.404 C170.501,2254.058 169.013,2252.597 167.594,2250.776 C165.968,2253.581 165.627,2255.897 166.368,2256.637 C167.443,2257.711 170.762,2256.252 172.228,2255.404 M167.594,2247.236 C169.016,2245.411 170.504,2243.952 172.228,2242.609 C170.803,2241.784 167.454,2240.29 166.368,2241.375 C165.627,2242.116 165.968,2244.431 167.594,2247.236 M175.774,2242.609 C177.501,2243.954 178.988,2245.414 180.408,2247.236 C184.018,2241.009 181.288,2239.422 175.774,2242.609 M181.664,2249.006 C187.098,2257.497 182.428,2262.065 174.002,2256.674 C165.595,2262.052 160.886,2257.525 166.339,2249.006 C160.942,2240.574 165.492,2235.895 174.002,2241.338 C182.425,2235.95 187.103,2240.508 181.664,2249.006 M175.065,2247.946 C175.649,2248.53 175.649,2249.478 175.065,2250.062 C174.481,2250.646 173.532,2250.646 172.948,2250.062 C172.363,2249.478 172.363,2248.53 172.948,2247.946 C173.532,2247.361 174.481,2247.361 175.065,2247.946" />
						</g>
					</svg>
					ViaQuiz
				</Link>
				<h1 className="auth-title">{t("register.title")}</h1>
				<p className="auth-subtitle">{t("register.subtitle")}</p>

				{renderSteps()}

				{serverError && <div className="auth-error">{serverError}</div>}

				<form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
					{/* STEP 1: Credentials */}
					<div
						style={{
							display: currentStep === 0 ? "flex" : "none",
							flexDirection: "column",
							gap: "var(--space-4)",
						}}
					>
						<div className="input-group">
							<label className="input-label" htmlFor="login">
								{t("register.login_label")}
							</label>
							<input
								id="login"
								type="text"
								className={`input-field ${errors.login ? "input--error" : ""}`}
								placeholder={t("register.login_placeholder")}
								{...register("login", {
									required: t(
										"register.error_login_required",
									),
									minLength: {
										value: 3,
										message: t("register.error_login_min"),
									},
									maxLength: {
										value: 20,
										message: t("register.error_login_max"),
									},
									pattern: {
										value: /^[a-zA-Z0-9_-]+$/,
										message: t(
											"register.error_login_pattern",
										),
									},
								})}
							/>
							{errors.login && (
								<span className="input-error">
									{errors.login.message}
								</span>
							)}
						</div>

						<div className="input-group">
							<label className="input-label" htmlFor="email">
								{t("register.email_label")}
							</label>
							<input
								id="email"
								type="email"
								className={`input-field ${errors.email ? "input--error" : ""}`}
								placeholder={t("register.email_placeholder")}
								{...register("email", {
									required: t(
										"register.error_email_required",
									),
									pattern: {
										value: /^\S+@\S+\.\S+$/,
										message: t(
											"register.error_email_invalid",
										),
									},
								})}
							/>
							{errors.email && (
								<span className="input-error">
									{errors.email.message}
								</span>
							)}
						</div>

						<div className="input-group">
							<label className="input-label" htmlFor="password">
								{t("register.password_label")}
							</label>
							<div className="password-container">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									className={`input-field ${errors.password ? "input--error" : ""}`}
									placeholder={t(
										"register.password_placeholder",
									)}
									{...register("password", {
										required: t(
											"register.error_password_required",
										),
										minLength: {
											value: 6,
											message: t(
												"register.error_password_min",
											),
										},
										maxLength: {
											value: 64,
											message: t(
												"register.error_password_max",
											),
										},
									})}
								/>
								<button
									type="button"
									className="password-toggle"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									aria-label={
										showPassword
											? t("register.hide_password")
											: t("register.show_password")
									}
								>
									{showPassword ? (
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
									) : (
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
									)}
								</button>
							</div>
							{errors.password && (
								<span className="input-error">
									{errors.password.message}
								</span>
							)}
						</div>

						<div className="input-group">
							<label
								className="input-label"
								htmlFor="confirmPassword"
							>
								{t("register.confirm_password_label")}
							</label>
							<div className="password-container">
								<input
									id="confirmPassword"
									type={
										showConfirmPassword
											? "text"
											: "password"
									}
									className={`input-field ${errors.confirmPassword ? "input--error" : ""}`}
									placeholder={t(
										"register.confirm_password_placeholder",
									)}
									{...register("confirmPassword", {
										required: t(
											"register.error_confirm_password_required",
										),
										validate: (val) =>
											val === getValues("password") ||
											t("register.error_passwords_match"),
									})}
								/>
								<button
									type="button"
									className="password-toggle"
									onClick={() =>
										setShowConfirmPassword(
											!showConfirmPassword,
										)
									}
									aria-label={
										showConfirmPassword
											? t("register.hide_password")
											: t("register.show_password")
									}
								>
									{showConfirmPassword ? (
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
									) : (
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
									)}
								</button>
							</div>
							{errors.confirmPassword && (
								<span className="input-error">
									{errors.confirmPassword.message}
								</span>
							)}
						</div>

						<button
							type="button"
							className="btn btn--primary"
							onClick={handleNextStep1}
							disabled={isCheckingUnique}
						>
							{isCheckingUnique
								? t("register.checking")
								: t("register.next")}
						</button>
					</div>

					{/* STEP 2: Profile */}
					<div
						style={{
							display: currentStep === 1 ? "flex" : "none",
							flexDirection: "column",
							gap: "var(--space-4)",
						}}
					>
						<div className="input-group">
							<label className="input-label" htmlFor="firstName">
								{t("register.first_name_label")} (
								{t("register.optional")})
							</label>
							<input
								id="firstName"
								type="text"
								className="input-field"
								placeholder={t(
									"register.first_name_placeholder",
								)}
								{...register("firstName")}
							/>
						</div>

						<div className="input-group">
							<label className="input-label" htmlFor="lastName">
								{t("register.last_name_label")} (
								{t("register.optional")})
							</label>
							<input
								id="lastName"
								type="text"
								className="input-field"
								placeholder={t(
									"register.last_name_placeholder",
								)}
								{...register("lastName")}
							/>
						</div>

						<div className="button-group">
							<button
								type="button"
								className="btn btn--secondary"
								onClick={() => setCurrentStep(0)}
								disabled={isSendingCode}
							>
								{t("register.back")}
							</button>
							<button
								type="button"
								className="btn btn--primary"
								onClick={handleNextStep2}
								disabled={isSendingCode}
							>
								{isSendingCode
									? t("register.sending_code")
									: t("register.next")}
							</button>
						</div>
						<div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
							<button
								type="button"
								className="btn btn--ghost"
								onClick={handleSkipStep2}
								disabled={isSendingCode}
								style={{ height: "auto", padding: "8px 16px" }}
							>
								{t("register.skip")}
							</button>
						</div>
					</div>

					{/* STEP 3: Verification */}
					<div
						style={{
							display: currentStep === 2 ? "flex" : "none",
							flexDirection: "column",
							gap: "var(--space-4)",
						}}
					>
						<div className="verification-container">
							<p>
								{t("register.code_sent_to")} {targetEmail}
							</p>

							<div
								className="input-group"
								style={{ width: "100%", alignItems: "center" }}
							>
								<input
									type="text"
									className={`input-field verification-input ${errors.code ? "input--error" : ""}`}
									placeholder="000000"
									maxLength={6}
									{...register("code", {
										required: t(
											"register.error_code_required",
										),
										minLength: {
											value: 6,
											message: t(
												"register.error_code_length",
											),
										},
										maxLength: {
											value: 6,
											message: t(
												"register.error_code_length",
											),
										},
									})}
								/>
								{errors.code && (
									<span className="input-error">
										{errors.code.message}
									</span>
								)}
							</div>

							<div className="resend-container">
								<button
									type="button"
									className="btn btn--secondary"
									onClick={handleResendCode}
									disabled={cooldown > 0}
								>
									{t("register.resend_code")}
								</button>
								{cooldown > 0 && (
									<span className="resend-timer">
										{cooldown}
										{t("register.resend_cooldown")}
									</span>
								)}
							</div>
						</div>

						<div className="button-group">
							<button
								type="button"
								className="btn btn--secondary"
								onClick={() => setCurrentStep(1)}
								disabled={isSubmitting}
							>
								{t("register.back")}
							</button>
							<button
								type="submit"
								className="btn btn--primary"
								disabled={isSubmitting}
							>
								{isSubmitting
									? t("register.registering")
									: t("register.submit")}
							</button>
						</div>
					</div>
				</form>

				<div className="auth-footer">
					{t("register.have_account")}{" "}
					<Link to="/login">{t("register.log_in_link")}</Link>
				</div>
			</div>
		</div>
	);
}
