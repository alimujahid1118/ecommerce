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

if (!process.env.CLIENT_ID) {
    throw new Error("CLIENT_ID not found in environment variables.");
}

if (!process.env.CLIENT_SECRET) {
    throw new Error("CLIENT_SECRET not found in environment variables.");
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

export const envConfig = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_USER: process.env.GOOGLE_USER
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export default cloudinary;

const storage = multer.memoryStorage();

export const upload = multer({ storage: storage })