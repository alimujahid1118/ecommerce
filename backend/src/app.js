import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import tokenRouter from "./routes/token.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import chatRouter from "./routes/chat.routes.js";
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
app.use(('/api'), tokenRouter)
app.use(('/api'), notificationRouter)
app.use(('/api'), chatRouter)

app.use((error, _req, res, next) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Each image must be 10 MB or smaller." });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ message: "You can upload up to 10 images." });
    }
    if (error.message === "Only image files are allowed.") {
        return res.status(400).json({ message: error.message });
    }
    if (error.message === "Please upload a CSV file.") {
        return res.status(400).json({ message: error.message });
    }
    return next(error);
});

export default app;