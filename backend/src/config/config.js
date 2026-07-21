import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not found in environment variables.");
}

if (!process.env.PORT) {
    throw new Error("PORT not found in environment variables.");
}

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not found in environment variables.");
}

if (!process.env.CLIENT_SECRET) {
    throw new Error("CLIENT_SECRET not found in environment variables.");
}

if (!process.env.CLIENT_ID) {
    throw new Error("CLIENT_ID not found in environment variables.");
}

if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error("GOOGLE_REFRESH_TOKEN not found in environment variables.");
}

if (!process.env.GOOGLE_USER) {
    throw new Error("GOOGLE_USER not found in environment variables.");
}

const envConfig = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    GOOGLE_USER: process.env.GOOGLE_USER,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    BREVO_LOGIN: process.env.BREVO_LOGIN,
    BREVO_SMTP_KEY: process.env.BREVO_SMTP_KEY
}

export default envConfig;