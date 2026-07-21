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

if (!process.env.BREVO_LOGIN) {
    throw new Error("BREVO_LOGIN not found in environment variables.");
}

if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY not found in environment variables.");
}

const envConfig = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT,
    BREVO_LOGIN: process.env.BREVO_LOGIN,
    BREVO_API_KEY: process.env.BREVO_API_KEY
}

export default envConfig;