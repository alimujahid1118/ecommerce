import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not found in environment variables.");
}

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not found in environment variables.");
}

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID not found in environment variables.");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET not found in environment variables.");
}

if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error("GOOGLE_REFRESH_TOKEN not found in environment variables.");
}

if (!process.env.GOOGLE_USER) {
    throw new Error("GOOGLE_USER not found in environment variables.");
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

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY not found.");
}

if (!process.env.CLIENT_URL) {
    throw new Error("CLIENT_URL not found.");
}

export const envConfig = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT,
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    CLIENT_URL: process.env.CLIENT_URL,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_USER: process.env.GOOGLE_USER,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export default cloudinary;

const storage = multer.memoryStorage();

export const upload = multer({ storage: storage })