import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

const app = express();

// Configs
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

//Routes
app.use(('/api'), authRouter)
app.use(('/api'), dashboardRouter)

export default app;