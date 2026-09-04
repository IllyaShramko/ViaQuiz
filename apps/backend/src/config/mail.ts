import { env } from "./env";
import { createTransport } from "nodemailer";

export const transporter = createTransport({
	host: "smtp-relay.brevo.com",
	port: env.BREVO_SMTP_PORT,
	secure: false,
	auth: {
		user: env.BREVO_SMTP_LOGIN,
		pass: env.BREVO_SMTP_KEY,
	},
	connectionTimeout: 10000,
	greetingTimeout: 10000,
	socketTimeout: 15000,
});
