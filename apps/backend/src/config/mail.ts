import { env } from "./env";
import { createTransport } from "nodemailer";

export const transporter = createTransport({
	host: "smtp-relay.brevo.com",
	port: 587,
	secure: false,
	auth: {
		user: env.BREVO_SMTP_LOGIN,
		pass: env.BREVO_SMTP_KEY,
	},
});
