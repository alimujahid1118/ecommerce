import { Server } from "socket.io";
import { envConfig } from "../config.js";
import { resolveUserFromToken } from "../middleware/auth.js";
import * as chatService from "../services/chat.service.js";
import * as presence from "../services/presence.service.js";

/**
 * Socket.IO layer. Responsibilities are deliberately narrow:
 *   - authenticate the handshake (same token verification as REST),
 *   - manage room membership (rooms are keyed by conversationId, NEVER socket.id),
 *   - relay events in real time.
 * All persistence goes through chat.service.js — the database is the source
 * of truth, so nothing is lost when the other party is offline.
 *
 * Client → server events:  conversation:join, conversation:leave,
 *                          message:send, messages:read
 * Server → client events:  conversation:ready, message:new, messages:read,
 *                          conversation:updated, presence:update
 */
export default function initChatSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: envConfig.CLIENT_URLS,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Handshake authentication. The client sends the chat bearer token via
    // socket.handshake.auth.token; identity and role are resolved server-side.
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Missing chat token."));
            }

            socket.data.user = await resolveUserFromToken(token);
            next();
        } catch (error) {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", async (socket) => {
        const user = socket.data.user;

        const wentOnline = presence.addSocket(user.id, socket.id);
        if (wentOnline) {
            io.to("admins").emit("presence:update", { userId: user.id, online: true });
        }

        if (user.isAdmin) {
            // Admins live in a broadcast room for sidebar updates
            // (conversation:updated, presence:update) and join individual
            // conversation rooms on demand via conversation:join.
            socket.join("admins");
        } else {
            // Customers are attached to their own conversation room for the
            // lifetime of the socket. Because this runs on every connection,
            // refresh/reconnect re-joins automatically — the conversation and
            // its room name never change, only the socket id does.
            try {
                const conversation = await chatService.findOrCreateConversation(user.id);
                socket.data.conversationId = conversation._id.toString();
                socket.join(chatService.roomName(conversation._id));
                socket.emit("conversation:ready", { conversationId: conversation._id.toString() });
            } catch (error) {
                console.error("Failed to prepare conversation on connect:", error);
                socket.emit("chat:error", { message: "Failed to load your conversation." });
            }
        }

        // Admin opens a conversation from the sidebar.
        socket.on("conversation:join", async (payload, ack) => {
            try {
                if (!user.isAdmin) {
                    throw chatService.httpError(403, "Only admins can join other conversations.");
                }

                const conversation = await chatService.getConversationForViewer(payload?.conversationId, user);
                socket.join(chatService.roomName(conversation._id));

                if (chatService.conversationMode(conversation) !== "human") {
                    await chatService.updateConversationMode(conversation._id, "human");
                    const summary = await chatService.buildConversationSummary(conversation._id);
                    if (summary) io.to("admins").emit("conversation:updated", summary);
                }

                if (typeof ack === "function") ack({ ok: true });
            } catch (error) {
                if (typeof ack === "function") {
                    ack({ ok: false, message: error.expose ? error.message : "Failed to join conversation." });
                }
            }
        });

        socket.on("conversation:leave", (payload) => {
            const conversationId = payload?.conversationId;

            // Customers never leave their own room; admins leave rooms they
            // switch away from.
            if (!user.isAdmin || typeof conversationId !== "string") return;
            if (conversationId === socket.data.conversationId) return;

            socket.leave(chatService.roomName(conversationId));
        });

        // The core flow: validate → persist → update conversation → relay.
        socket.on("message:send", async (payload, ack) => {
            try {
                const text = chatService.validateMessageText(payload?.text);

                // A customer can only ever write into their own conversation,
                // regardless of what conversationId the client claims.
                const conversation = user.isAdmin
                    ? await chatService.getConversationForViewer(payload?.conversationId, user)
                    : await chatService.findOrCreateConversation(user.id);

                const message = await chatService.saveMessage({
                    conversation,
                    sender: user,
                    text
                });

                if (!user.isAdmin && chatService.conversationMode(conversation) === "ai") {
                    if (chatService.isHumanSupportRequest(text)) {
                        await chatService.updateConversationMode(conversation._id, "waiting_for_admin");
                        const summary = await chatService.buildConversationSummary(conversation._id);
                        if (summary) io.to("admins").emit("conversation:updated", summary);
                        if (typeof ack === "function") ack({
                            ok: true,
                            message,
                            messages: [message],
                            mode: "waiting_for_admin"
                        });
                        return;
                    }

                    try {
                        const replyText = await chatService.getLlmReply(conversation._id);
                        const assistantMessage = await chatService.saveAssistantMessage({
                            conversation,
                            text: replyText
                        });
                        if (typeof ack === "function") ack({
                            ok: true,
                            message,
                            aiMessage: assistantMessage,
                            messages: [message, assistantMessage],
                            mode: "ai"
                        });
                    } catch (error) {
                        console.error("LLM response failed:", error);
                        if (typeof ack === "function") ack({
                            ok: false,
                            message: "Your message was saved, but the assistant is temporarily unavailable.",
                            userMessage: message,
                            mode: "ai"
                        });
                    }
                    return;
                }

                // Real-time relay to everyone else in the room (the sender gets
                // the saved message back through the ack instead).
                socket.to(chatService.roomName(conversation._id)).emit("message:new", message);

                // Keep every admin's sidebar fresh even if they are not in
                // this conversation's room right now.
                const summary = await chatService.buildConversationSummary(conversation._id);
                if (summary) io.to("admins").emit("conversation:updated", summary);

                if (typeof ack === "function") ack({ ok: true, message });
            } catch (error) {
                if (typeof ack === "function") {
                    ack({ ok: false, message: error.expose ? error.message : "Failed to send message." });
                }
            }
        });

        // Reader marks the OTHER party's messages as read.
        socket.on("messages:read", async (payload, ack) => {
            try {
                const conversation = user.isAdmin
                    ? await chatService.getConversationForViewer(payload?.conversationId, user)
                    : await chatService.findOrCreateConversation(user.id);

                const { modifiedCount, readAt } = await chatService.markMessagesRead({
                    conversationId: conversation._id,
                    readerIsAdmin: user.isAdmin
                });

                if (modifiedCount > 0) {
                    io.to(chatService.roomName(conversation._id)).emit("messages:read", {
                        conversationId: conversation._id.toString(),
                        readerRole: user.isAdmin ? "admin" : "user",
                        readAt
                    });

                    if (user.isAdmin) {
                        const summary = await chatService.buildConversationSummary(conversation._id);
                        if (summary) io.to("admins").emit("conversation:updated", summary);
                    }
                }

                if (typeof ack === "function") ack({ ok: true, updated: modifiedCount });
            } catch (error) {
                if (typeof ack === "function") {
                    ack({ ok: false, message: error.expose ? error.message : "Failed to mark messages as read." });
                }
            }
        });

        socket.on("disconnect", () => {
            const wentOffline = presence.removeSocket(user.id, socket.id);
            if (wentOffline) {
                io.to("admins").emit("presence:update", { userId: user.id, online: false });
            }
        });
    });

    return io;
}
