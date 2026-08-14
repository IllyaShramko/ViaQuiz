import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useLocale } from "../../shared/i18n/useLocale";
import {
	apiRegister,
	apiCheckUnique,
	apiSendCode,
	setToken,
} from "../../shared/api/client";
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
			const { loginIsTaken, emailIsTaken } = await apiCheckUnique({
				login,
				email,
			});

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
			setServerError(err.message || t("register.error_default"));
		} finally {
			setIsCheckingUnique(false);
		}
	};

	const moveToStep3 = async () => {
		const { email } = getValues();
		try {
			setIsSendingCode(true);
			setServerError(null);
			const response = await apiSendCode({ email });
			setTargetEmail(email);
			setCooldown(response.cooldownSeconds || 60);
			setCurrentStep(2);
		} catch (err: any) {
			setServerError(err.message || t("register.error_default"));
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
			const response = await apiSendCode({ email });
			setCooldown(response.cooldownSeconds || 60);
		} catch (err: any) {
			setServerError(err.message || t("register.error_default"));
		}
	};

	const onSubmit = async (data: RegisterFormInputs) => {
		if (currentStep !== 2) return;
		try {
			setServerError(null);
			const response = await apiRegister(data);
			setToken(response.token);
			navigate("/");
		} catch (err: any) {
			setServerError(err.message || t("register.error_default"));
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
					<svg viewBox="0 0 48 46">
						<path
							fill="currentColor"
							d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
						/>
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
									{showPassword ? "🙈" : "👁️"}
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
									{showConfirmPassword ? "🙈" : "👁️"}
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
								className="btn btn--ghost"
								onClick={handleSkipStep2}
								disabled={isSendingCode}
							>
								{t("register.skip")}
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
