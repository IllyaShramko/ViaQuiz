import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
	BadRequestError,
	ConflictError,
	NotFoundError,
	UnauthorizedError,
} from "../../errors/customErrors";
import { UserRepository } from "./user.repository";
import type { UserServiceContract } from "./types/users.contracts";
import { transporter } from "../../config/mail";
import { logger } from "../../tools/logger";
import { env } from "../../config/env";

const JWT_SECRET = env.JWT_SECRET;
const COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

export const UserService: UserServiceContract = {
	async checkUnique({ login, email }) {
		const [userByLogin, userByEmail] = await Promise.all([
			UserRepository.findByLogin(login),
			UserRepository.findByEmail(email),
		]);

		return {
			loginIsTaken: !!userByLogin,
			emailIsTaken: !!userByEmail,
		};
	},

	async sendCode({ email }) {
		const existingUser = await UserRepository.findByEmail(email);
		if (existingUser) {
			throw new ConflictError("User with this email already exists");
		}

		const existingCodeRecord =
			await UserRepository.findVerificationCodeByEmail(email);
		if (existingCodeRecord) {
			const secondsPassed =
				(Date.now() -
					new Date(existingCodeRecord.createdAt).getTime()) /
				1000;
			if (secondsPassed < COOLDOWN_SECONDS) {
				const remainingCooldown = Math.ceil(
					COOLDOWN_SECONDS - secondsPassed,
				);
				throw new BadRequestError(
					`Please wait ${remainingCooldown} seconds before requesting a new code`,
					{
						cooldownSeconds: remainingCooldown,
					},
				);
			}
		}

		const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
		const hashedCode = await bcrypt.hash(rawCode, 10);
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes TTL

		await UserRepository.upsertVerificationCode({
			email,
			code: hashedCode,
			expiresAt,
		});

		try {
			const response = await transporter.sendMail({
				from: `"ViaQuiz" <${env.BREVO_SMTP_SENDER}>`,
				to: email,
				subject: "ViaQuiz - Email Verification Code",
				text: `Your verification code is: ${rawCode}. It expires in 10 minutes.`,
				html: `
					<div style="font-family: sans-serif; padding: 20px;">
						<h2>Welcome to ViaQuiz!</h2>
						<p>Your 6-digit verification code is:</p>
						<h1 style="font-size: 32px; letter-spacing: 4px; color: #4F46E5;">${rawCode}</h1>
						<p>This code will expire in 10 minutes.</p>
					</div>
				`,
			});
			console.log(response);
		} catch (mailError) {
			logger.error(`Failed to send email to ${email}:`, mailError);
			if (env.NODE_ENV === "development") {
				logger.info(
					`[DEV MODE ONLY] Verification code for ${email} is: ${rawCode}`,
				);
			}
		}

		return {
			message: "Verification code sent to email",
			cooldownSeconds: COOLDOWN_SECONDS,
		};
	},

	async register(credentials) {
		const verificationRecord =
			await UserRepository.findVerificationCodeByEmail(credentials.email);
		if (!verificationRecord) {
			throw new BadRequestError(
				"Verification code not found. Please request a new code",
			);
		}

		if (new Date(verificationRecord.expiresAt) < new Date()) {
			throw new BadRequestError(
				"Verification code has expired. Please request a new code",
			);
		}

		if (verificationRecord.attempts >= MAX_ATTEMPTS) {
			throw new BadRequestError(
				"Maximum verification attempts exceeded. Please request a new code",
			);
		}

		const isCodeValid = await bcrypt.compare(
			credentials.code,
			verificationRecord.code,
		);
		if (!isCodeValid) {
			const updatedRecord =
				await UserRepository.incrementVerificationCodeAttempts(
					credentials.email,
				);
			const remainingAttempts = MAX_ATTEMPTS - updatedRecord.attempts;

			if (remainingAttempts <= 0) {
				throw new BadRequestError(
					"Maximum verification attempts exceeded. Please request a new code",
					{
						remainingAttempts: 0,
					},
				);
			}

			throw new BadRequestError(
				`Invalid verification code. Remaining attempts: ${remainingAttempts}`,
				{
					remainingAttempts,
				},
			);
		}

		const [userByLogin, userByEmail] = await Promise.all([
			UserRepository.findByLogin(credentials.login),
			UserRepository.findByEmail(credentials.email),
		]);

		if (userByLogin) {
			throw new ConflictError("User with this login already exists");
		}
		if (userByEmail) {
			throw new ConflictError("User with this email already exists");
		}

		const hashedPassword = await bcrypt.hash(credentials.password, 10);
		const user = await UserRepository.create({
			login: credentials.login,
			email: credentials.email,
			password: hashedPassword,
			firstName: credentials.firstName,
			lastName: credentials.lastName,
		});

		await UserRepository.deleteVerificationCode(credentials.email);

		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			JWT_SECRET,
			{
				expiresIn: "7d",
			},
		);

		return { token, user };
	},

	async login(credentials) {
		const userWithPassword =
			(await UserRepository.findByEmail(credentials.email)) ||
			(await UserRepository.findByLogin(credentials.email));
		if (!userWithPassword) {
			throw new UnauthorizedError("Invalid email or password");
		}

		const isPasswordValid = await bcrypt.compare(
			credentials.password,
			userWithPassword.password,
		);
		if (!isPasswordValid) {
			throw new UnauthorizedError("Invalid email or password");
		}

		const { password: _p, ...user } = userWithPassword;

		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			JWT_SECRET,
			{
				expiresIn: "7d",
			},
		);

		return { token, user };
	},

	async me(userId) {
		const user = await UserRepository.findById(userId);
		if (!user) {
			throw new NotFoundError("User not found");
		}
		return user;
	},

	async getUsers(pagination) {
		const [users, total] = await Promise.all([
			UserRepository.findUsers(pagination),
			UserRepository.countUsers(),
		]);

		return { users, total };
	},
};
