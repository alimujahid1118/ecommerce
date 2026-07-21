import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

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

if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("CLOUDINARY_CLOUD_NAME not found.");
}

if (!process.env.CLOUDINARY_API_KEY) {
    throw new Error("CLOUDINARY_API_KEY not found.");
}

if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error("CLOUDINARY_API_SECRET not found.");
}

export const envConfig = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT,
    BREVO_LOGIN: process.env.BREVO_LOGIN,
    BREVO_API_KEY: process.env.BREVO_API_KEY
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export default cloudinary;

const storage = multer.memoryStorage();

export const upload = multer({ storage: storage })