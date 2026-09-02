import { transporter } from "../../config/mail";
import { env } from "../../config/env";
import { logger } from "../../tools/logger";

interface SendCourseInvitationOptions {
	toEmail: string;
	courseName: string;
	classroomName: string;
	inviterName: string;
	isRegistered: boolean;
	token: string;
}

export async function sendCourseInvitationEmail({
	toEmail,
	courseName,
	classroomName,
	inviterName,
	isRegistered,
	token,
}: SendCourseInvitationOptions): Promise<void> {
	const actionUrl = isRegistered
		? `${env.CLIENT_URL}/classes?inviteToken=${token}`
		: `${env.CLIENT_URL}/register?inviteToken=${token}`;

	const actionButtonText = isRegistered
		? "Переглянути та прийняти запрошення"
		: "Зареєструватися та стати викладачем";

	const html = `
		<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #12121a; color: #f0f0f5; padding: 32px; border-radius: 16px; border: 1px solid #2a2a3a;">
			<div style="text-align: center; margin-bottom: 24px;">
				<h1 style="color: #863bff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">ViaQuiz</h1>
				<p style="color: #9090a8; font-size: 14px; margin-top: 4px;">Платформа для інтерактивних вікторин та навчання</p>
			</div>

			<div style="background-color: #1a1a26; border-radius: 12px; padding: 24px; border: 1px solid #2a2a3a; margin-bottom: 24px;">
				<h2 style="color: #ffffff; font-size: 20px; margin-top: 0; margin-bottom: 12px;">Запрошення на керівництво курсом</h2>
				<p style="color: #c4c4d4; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
					Викладач <strong>${inviterName}</strong> запрошує вас стати ведучим викладачем курсу:
				</p>
				<div style="background-color: #242436; padding: 14px 18px; border-radius: 8px; border-left: 4px solid #863bff; margin-bottom: 16px;">
					<div style="font-size: 16px; font-weight: 700; color: #ffffff;">${courseName}</div>
					<div style="font-size: 13px; color: #9090a8; margin-top: 4px;">Клас: ${classroomName}</div>
				</div>
				<p style="color: #9090a8; font-size: 14px; line-height: 1.5; margin: 0;">
					${
						isRegistered
							? "Після прийняття запрошення ви зможете проводити вікторини, керувати учнями та відстежувати успішність у цьому курсі."
							: "Зареєструйтеся за посиланням нижче, щоб автоматично отримати права викладача на цей курс."
					}
				</p>
			</div>

			<div style="text-align: center; margin: 32px 0;">
				<a href="${actionUrl}" style="background-color: #863bff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 15px rgba(134, 59, 255, 0.4);">
					${actionButtonText}
				</a>
			</div>

			<div style="border-top: 1px solid #2a2a3a; padding-top: 16px; text-align: center; color: #606078; font-size: 12px;">
				<p style="margin: 0 0 4px 0;">Запрошення дійсне протягом 7 днів.</p>
				<p style="margin: 0;">Якщо ви отримали цей лист помилково, просто проігноруйте його.</p>
			</div>
		</div>
	`;

	try {
		await transporter.sendMail({
			from: `"ViaQuiz" <${env.BREVO_SMTP_SENDER}>`,
			to: toEmail,
			subject: `Запрошення на керівництво курсом "${courseName}" - ViaQuiz`,
			text: `Викладач ${inviterName} запросив вас стати ведучим викладачем курсу "${courseName}" у класі "${classroomName}". Перейдіть за посиланням: ${actionUrl}`,
			html,
		});
	} catch (error) {
		logger.error(`Failed to send course invitation email to ${toEmail}:`, error);
	}
}
