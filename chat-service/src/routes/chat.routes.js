import express from "express";
import * as chatController from "../controllers/chat.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const chatRouter = express.Router();

// Every chat endpoint requires a valid chat bearer token.
chatRouter.use(requireAuth);

// GET /api/chat/me/conversation — customer: find-or-create own conversation
chatRouter.get("/me/conversation", chatController.getMyConversation);

// GET /api/chat/conversations — admin: sidebar list with unread counts
chatRouter.get("/conversations", requireAdmin, chatController.listConversations);

// GET /api/chat/conversations/:conversationId — admin or owner
chatRouter.get("/conversations/:conversationId", chatController.getConversation);

// GET /api/chat/conversations/:conversationId/messages — paginated history
chatRouter.get("/conversations/:conversationId/messages", chatController.getMessages);

// POST /api/chat/conversations/:conversationId/accept — admin handoff
chatRouter.post("/conversations/:conversationId/accept", requireAdmin, chatController.acceptConversation);

// DELETE /api/chat/conversations/:conversationId/messages — clear both sides' history
chatRouter.delete("/conversations/:conversationId/messages", requireAdmin, chatController.clearConversation);

// POST /api/chat/conversations/:conversationId/close — return the user to AI mode
chatRouter.post("/conversations/:conversationId/close", requireAdmin, chatController.closeConversation);

// POST /api/chat/conversations/:conversationId/messages — REST send fallback
chatRouter.post("/conversations/:conversationId/messages", chatController.postMessage);

// PATCH /api/chat/conversations/:conversationId/read — mark as read
chatRouter.patch("/conversations/:conversationId/read", chatController.markRead);

export default chatRouter;
