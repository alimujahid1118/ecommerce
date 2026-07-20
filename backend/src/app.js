import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import cors from "cors"

const app = express();

// Configs
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors({
    origin: ['https://ecommerce-ten-zeta-91.vercel.app'],
    credentials: true
}));

//Routes
app.use(('/api'), authRouter)

export default app;