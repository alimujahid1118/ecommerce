import envConfig from "../config/config.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,

    logger: true,
    debug: true,

    auth: {
        user: process.env.BREVO_LOGIN,
        pass: process.env.BREVO_SMTP_KEY,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log("SMTP Ready");
    }
});

async function sendEmail(to, subject, text, html) {
    const info = await transporter.sendMail({
        from: `E Shop <${envConfig.BREVO_LOGIN}>`,
        to,
        subject,
        text,
        html,
    });

    console.log("Email sent:", info.messageId);

    return info;
}

export default sendEmail;