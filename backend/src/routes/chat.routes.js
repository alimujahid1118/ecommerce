import express from "express";
import { issueChatToken } from "../controllers/chat.controller.js";

const chatRouter = express.Router();

// GET /api/chat/token
chatRouter.get('/chat/token', issueChatToken);

export default chatRouter;
