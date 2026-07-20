import envConfig from "../config/config.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: envConfig.GOOGLE_USER,
        clientId: envConfig.CLIENT_ID,
        clientSecret: envConfig.CLIENT_SECRET,
        refreshToken: envConfig.GOOGLE_REFRESH_TOKEN
    }
})

async function sendEmail(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from: `E Shop <${envConfig.GOOGLE_USER}>`,
            to,
            subject,
            text,
            html
        })
    } catch (error) {
        console.log(error)
    }
}

export default sendEmail;