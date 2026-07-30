import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import cors from "cors"
import dotenv from "dotenv";

const app = express();
const client_url = process.env.CLIENT_URL

// Configs
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors({
    origin:
        client_url,
    credentials: true
}));

//Routes
app.use(('/api'), authRouter)

export default app;