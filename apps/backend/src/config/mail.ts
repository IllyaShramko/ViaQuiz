import { env } from "./env";

const nodemailer = require("nodemailer");

export const transporter = nodemailer.createTransport({
	host: "smtp-relay.brevo.com",
	port: 587,
	secure: false,
	auth: {
		user: env.BREVO_SMTP_LOGIN,
		pass: env.BREVO_SMTP_KEY,
	},
});
