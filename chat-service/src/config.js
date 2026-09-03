import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not found in environment variables.");
}

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not found in environment variables. It must match the e-commerce backend's JWT_SECRET.");
}

if (!process.env.CLIENT_URL) {
    throw new Error("CLIENT_URL not found in environment variables.");
}

if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not found in environment variables.");
}

export const envConfig = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT || 5001,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GROQ_MODEL: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    LLM_HISTORY_LIMIT: Number(process.env.LLM_HISTORY_LIMIT) || 20,
    // CLIENT_URL supports a comma-separated list so dev + prod origins can
    // coexist, e.g. "http://localhost:5173,https://my-ecommerce-site.com"
    CLIENT_URLS: process.env.CLIENT_URL.split(",").map((url) => url.trim()).filter(Boolean)
};
