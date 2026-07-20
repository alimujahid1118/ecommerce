import envConfig from "../config/config.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        type: "OAuth2",
        user: envConfig.GOOGLE_USER,
        clientId: envConfig.CLIENT_ID,
        clientSecret: envConfig.CLIENT_SECRET,
        refreshToken: envConfig.GOOGLE_REFRESH_TOKEN,
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
        from: `E Shop <${envConfig.GOOGLE_USER}>`,
        to,
        subject,
        text,
        html,
    });

    console.log("Email sent:", info.messageId);

    return info;
}

export default sendEmail;