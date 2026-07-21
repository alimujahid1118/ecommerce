import { BrevoClient } from "@getbrevo/brevo";
import envConfig from "../config/config.js";

const client = new BrevoClient({
    apiKey: envConfig.BREVO_API_KEY,
});

async function sendEmail(to, subject, text, html) {
    try {
        const response = await client.transactionalEmails.sendTransacEmail({
            sender: {
                name: "E Shop",
                email: envConfig.BREVO_LOGIN, // verified sender
            },

            to: [
                {
                    email: to,
                },
            ],

            subject,
            htmlContent: html,
            textContent: text,
        });

        console.log(response);

        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export default sendEmail;