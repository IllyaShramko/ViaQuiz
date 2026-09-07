import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
	BadRequestError,
	ConflictError,
	NotFoundError,
	UnauthorizedError,
} from "../../errors/customErrors";
import { UserRepository } from "./user.repository";
import { QuizRepository } from "../quizzes/quiz.repository";
import { ClassroomRepository } from "../classrooms/classroom.repository";
import type { UserServiceContract } from "./types/users.contracts";
import type { UserWithPassword } from "./types/users.types";
import type { VerificationCode } from "../../generated/prisma";
import { transporter } from "../../config/mail";
import { logger } from "../../tools/logger";
import { env } from "../../config/env";
import { PRISMA_CLIENT } from "../../config/database";

const JWT_SECRET = env.JWT_SECRET;
const COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

export const UserService: UserServiceContract = {
	async checkUnique({ login, email }) {
		const [loginIsTaken, emailIsTaken] = await Promise.all([
			UserRepository.findByLogin(login)
				.then(() => true)
				.catch(() => false),
			UserRepository.findByEmail(email)
				.then(() => true)
				.catch(() => false),
		]);

		return {
			loginIsTaken,
			emailIsTaken,
		};
	},

	async sendCode({ email }) {
		let existingUser = false;
		try {
			await UserRepository.findByEmail(email);
			existingUser = true;
		} catch (err) {
			if (!(err instanceof NotFoundError)) {
				throw err;
			}
		}

		if (existingUser) {
			throw new ConflictError("User with this email already exists");
		}

		try {
			const existingCodeRecord =
				await UserRepository.findVerificationCodeByEmail(email);
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
		} catch (err) {
			if (err instanceof BadRequestError) {
				throw err;
			}
			if (!(err instanceof NotFoundError)) {
				throw err;
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
		let verificationRecord: VerificationCode;
		try {
			verificationRecord =
				await UserRepository.findVerificationCodeByEmail(
					credentials.email,
				);
		} catch (err) {
			if (err instanceof NotFoundError) {
				throw new BadRequestError(
					"Verification code not found. Please request a new code",
				);
			}
			throw err;
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

		const [loginExists, emailExists] = await Promise.all([
			UserRepository.findByLogin(credentials.login)
				.then(() => true)
				.catch((err) => {
					if (err instanceof NotFoundError) return false;
					throw err;
				}),
			UserRepository.findByEmail(credentials.email)
				.then(() => true)
				.catch((err) => {
					if (err instanceof NotFoundError) return false;
					throw err;
				}),
		]);

		if (loginExists) {
			throw new ConflictError("User with this login already exists");
		}
		if (emailExists) {
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

		if (credentials.inviteToken) {
			try {
				const invite = await PRISMA_CLIENT.courseInvitation.findUnique({
					where: { token: credentials.inviteToken },
				});

				if (
					invite &&
					invite.status === "PENDING" &&
					new Date(invite.expiresAt) > new Date()
				) {
					await PRISMA_CLIENT.$transaction([
						PRISMA_CLIENT.courseInvitation.update({
							where: { id: invite.id },
							data: {
								status: "ACCEPTED",
								receiverId: user.id,
							},
						}),
						PRISMA_CLIENT.course.update({
							where: { id: invite.courseId },
							data: {
								teacherId: user.id,
							},
						}),
					]);
				}
			} catch (inviteErr) {
				logger.error(
					"Failed to auto-accept course invitation on register:",
					inviteErr,
				);
			}
		}

		const token = jwt.sign(
			{ userId: user.id, email: user.email, role: "TEACHER" },
			JWT_SECRET,
			{
				expiresIn: "7d",
			},
		);

		return { token, user: { ...user, role: "TEACHER" } };
	},

	async login(credentials) {
		let userWithPassword: UserWithPassword;
		try {
			userWithPassword = await UserRepository.findByEmail(
				credentials.email,
			);
		} catch (err) {
			if (err instanceof NotFoundError) {
				try {
					userWithPassword = await UserRepository.findByLogin(
						credentials.email,
					);
				} catch (loginErr) {
					if (loginErr instanceof NotFoundError) {
						throw new UnauthorizedError(
							"Invalid email or password",
						);
					}
					throw loginErr;
				}
			} else {
				throw err;
			}
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
			{ userId: user.id, email: user.email, role: "TEACHER" },
			JWT_SECRET,
			{
				expiresIn: "7d",
			},
		);

		return { token, user: { ...user, role: "TEACHER" } };
	},

	async me(userId) {
		return await UserRepository.findById(userId);
	},

	async getProfileStats(userId) {
		const [totalQuizzes, activeClassesCount, gamesCount] = await Promise.all([
			QuizRepository.countUserQuizzes({ authorId: userId, isDraft: false }),
			ClassroomRepository.countActiveTeacherClassrooms(userId),
			PRISMA_CLIENT.room.count({
				where: {
					status: "FINISHED",
					OR: [
						{ hostId: userId },
						{ classroom: { teacherId: userId } },
						{ course: { classroom: { teacherId: userId } } },
					],
				},
			}),
		]);

		return {
			totalQuizzes: totalQuizzes || 0,
			activeClassesCount: activeClassesCount || 0,
			gamesCount: gamesCount || 0,
		};
	},

	async getUsers(pagination) {
		const [users, total] = await Promise.all([
			UserRepository.findUsers(pagination),
			UserRepository.countUsers(),
		]);

		return { users, total };
	},
};
