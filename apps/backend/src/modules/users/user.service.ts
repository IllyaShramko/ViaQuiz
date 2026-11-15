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

function normalizeNullableName(value?: string | null): string | null {
	const trimmed = value?.trim();
	return trimmed ? trimmed : null;
}

function signTeacherToken(user: { id: number; email: string }): string {
	return jwt.sign(
		{ userId: user.id, email: user.email, role: "TEACHER" },
		JWT_SECRET,
		{ expiresIn: "7d" },
	);
}

async function validatePasswordChangeInputs(
	userId: number,
	currentPassword: string,
	newPassword: string,
): Promise<UserWithPassword> {
	const userWithPassword = await UserRepository.findByIdWithPassword(userId);

	const isCurrentValid = await bcrypt.compare(
		currentPassword,
		userWithPassword.password,
	);
	if (!isCurrentValid) {
		throw new BadRequestError("Current password is incorrect");
	}

	const isSamePassword = await bcrypt.compare(
		newPassword,
		userWithPassword.password,
	);
	if (isSamePassword) {
		throw new BadRequestError(
			"New password must be different from current password",
		);
	}

	return userWithPassword;
}

async function ensureEmailAvailable(email: string): Promise<void> {
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
}

async function issueVerificationCode(
	email: string,
	mailContent: { subject: string; heading: string; intro: string },
) {
	try {
		const existingCodeRecord =
			await UserRepository.findVerificationCodeByEmail(email);
		const secondsPassed =
			(Date.now() - new Date(existingCodeRecord.createdAt).getTime()) /
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
		await transporter.sendMail({
			from: `"ViaQuiz" <${env.BREVO_SMTP_SENDER}>`,
			to: email,
			subject: mailContent.subject,
			text: `Your verification code is: ${rawCode}. It expires in 10 minutes.`,
			html: `
				<div style="font-family: sans-serif; padding: 20px;">
					<h2>${mailContent.heading}</h2>
					<p>${mailContent.intro}</p>
					<h1 style="font-size: 32px; letter-spacing: 4px; color: #4F46E5;">${rawCode}</h1>
					<p>This code will expire in 10 minutes.</p>
				</div>
			`,
		});
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
}

async function verifyEmailCode(email: string, rawCode: string): Promise<void> {
	let verificationRecord: VerificationCode;
	try {
		verificationRecord =
			await UserRepository.findVerificationCodeByEmail(email);
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

	const isCodeValid = await bcrypt.compare(rawCode, verificationRecord.code);
	if (!isCodeValid) {
		const updatedRecord =
			await UserRepository.incrementVerificationCodeAttempts(email);
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
}

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
		await ensureEmailAvailable(email);
		return await issueVerificationCode(email, {
			subject: "ViaQuiz - Email Verification Code",
			heading: "Welcome to ViaQuiz!",
			intro: "Your 6-digit verification code is:",
		});
	},

	async register(credentials) {
		await verifyEmailCode(credentials.email, credentials.code);

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
			firstName: normalizeNullableName(credentials.firstName),
			lastName: normalizeNullableName(credentials.lastName),
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

		const token = signTeacherToken(user);

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
		const token = signTeacherToken(user);

		return { token, user: { ...user, role: "TEACHER" } };
	},

	async me(userId) {
		return await UserRepository.findById(userId);
	},

	async updateProfile(userId, data) {
		const updatedUser = await UserRepository.updateProfile(userId, {
			firstName: normalizeNullableName(data.firstName),
			lastName: normalizeNullableName(data.lastName),
		});

		return {
			...updatedUser,
			role: "TEACHER",
		};
	},

	async sendEmailChangeCode(userId, { email }) {
		const currentUser = await UserRepository.findById(userId);
		if (currentUser.email.toLowerCase() === email) {
			throw new BadRequestError("New email matches your current email");
		}

		await ensureEmailAvailable(email);

		return await issueVerificationCode(email, {
			subject: "ViaQuiz - Email Change Verification Code",
			heading: "Confirm your new email address",
			intro: "Enter this 6-digit verification code to update your ViaQuiz account email:",
		});
	},

	async changeEmail(userId, { email, code }) {
		const currentUser = await UserRepository.findById(userId);
		if (currentUser.email.toLowerCase() === email) {
			throw new BadRequestError("New email matches your current email");
		}

		await ensureEmailAvailable(email);
		await verifyEmailCode(email, code);

		const updatedUser = await UserRepository.updateEmail(userId, email);
		await UserRepository.deleteVerificationCode(email);

		const token = signTeacherToken(updatedUser);

		return {
			token,
			user: { ...updatedUser, role: "TEACHER" },
		};
	},

	async sendPasswordChangeCode(userId, { currentPassword, newPassword }) {
		const userWithPassword = await validatePasswordChangeInputs(
			userId,
			currentPassword,
			newPassword,
		);

		return await issueVerificationCode(userWithPassword.email, {
			subject: "ViaQuiz - Password Change Verification Code",
			heading: "Confirm password change",
			intro: "Enter this 6-digit verification code to confirm changing your ViaQuiz account password:",
		});
	},

	async changePassword(userId, { currentPassword, newPassword, code }) {
		const userWithPassword = await validatePasswordChangeInputs(
			userId,
			currentPassword,
			newPassword,
		);

		await verifyEmailCode(userWithPassword.email, code);

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await UserRepository.updatePassword(userId, hashedPassword);
		await UserRepository.deleteVerificationCode(userWithPassword.email);

		return { message: "Password updated successfully" };
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

	async getPublicProfile(uuid: string) {
		const userRecord = await PRISMA_CLIENT.user.findUnique({
			where: { uuid },
			select: {
				id: true,
				uuid: true,
				login: true,
				firstName: true,
				lastName: true,
				createdAt: true,
			},
		});

		if (!userRecord) {
			throw new NotFoundError("User not found");
		}

		const [totalQuizzes, gamesCount, quizzes] = await Promise.all([
			PRISMA_CLIENT.quiz.count({
				where: {
					authorId: userRecord.id,
					isDraft: false,
				},
			}),
			PRISMA_CLIENT.room.count({
				where: {
					status: "FINISHED",
					OR: [
						{ hostId: userRecord.id },
						{ classroom: { teacherId: userRecord.id } },
						{ course: { classroom: { teacherId: userRecord.id } } },
					],
				},
			}),
			PRISMA_CLIENT.quiz.findMany({
				where: {
					authorId: userRecord.id,
					isDraft: false,
				},
				orderBy: { createdAt: "desc" },
				include: {
					author: {
						select: {
							id: true,
							uuid: true,
							login: true,
							firstName: true,
							lastName: true,
						},
					},
					keywords: true,
					_count: {
						select: { questions: true, views: true, likes: true },
					},
				},
			}),
		]);

		return {
			user: userRecord,
			stats: {
				totalQuizzes: totalQuizzes || 0,
				gamesCount: gamesCount || 0,
			},
			quizzes: quizzes || [],
		};
	},
};
