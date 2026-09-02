import express from "express";
import cors from "cors";
import { envConfig } from "./config.js";
import chatRouter from "./routes/chat.routes.js";

const app = express();

app.use(express.json());

app.use(cors({
    origin(origin, callback) {
        // Allow non-browser requests (health checks, curl) which send no Origin.
        if (!origin || envConfig.CLIENT_URLS.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS."));
    },
    credentials: true
}));

// Render health check target.
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "chat-service" });
});

app.use("/api/chat", chatRouter);

// Express 5 forwards rejected async handlers here automatically.
app.use((error, req, res, next) => {
    if (error.expose && error.status) {
        return res.status(error.status).json({ message: error.message });
    }

    console.error(error);
    return res.status(500).json({ message: "Something went wrong." });
});

export default app;
