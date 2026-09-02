import * as chatService from "../services/chat.service.js";

/**
 * GET /api/chat/me/conversation
 * A customer's entry point: find-or-create their single active conversation
 * and report how many admin messages they haven't read yet.
 */
export async function getMyConversation(req, res) {
    if (req.user.isAdmin) {
        return res.status(400).json({ message: "Admins use GET /api/chat/conversations instead." });
    }

    const conversation = await chatService.findOrCreateConversation(req.user.id);
    const unread = await chatService.unreadCount(conversation._id, { forAdmin: false });

    return res.status(200).json({ conversation, unreadCount: unread });
}

/**
 * GET /api/chat/conversations  (admin only)
 * Sidebar data: all conversations, newest activity first, with user info,
 * unread counts, and presence.
 */
export async function listConversations(req, res) {
    const conversations = await chatService.listConversationsForAdmin();
    return res.status(200).json({ conversations });
}

/**
 * GET /api/chat/conversations/:conversationId  (admin or owner)
 */
export async function getConversation(req, res) {
    const conversation = await chatService.getConversationForViewer(req.params.conversationId, req.user);
    const unread = await chatService.unreadCount(conversation._id, { forAdmin: req.user.isAdmin });

    return res.status(200).json({ conversation, unreadCount: unread });
}

/**
 * GET /api/chat/conversations/:conversationId/messages?limit=30&before=<messageId>
 * (admin or owner) — chronological page of history with a cursor for older
 * messages.
 */
export async function getMessages(req, res) {
    const conversation = await chatService.getConversationForViewer(req.params.conversationId, req.user);

    const { messages, hasMore } = await chatService.getMessages(conversation._id, {
        before: req.query.before,
        limit: req.query.limit
    });

    return res.status(200).json({ messages, hasMore });
}

/**
 * POST /api/chat/conversations/:conversationId/messages  (admin or owner)
 * REST fallback for sending — the primary path is the `message:send` socket
 * event, but both funnel into the same service functions, and this one also
 * broadcasts to the conversation room so connected clients stay live.
 */
export async function postMessage(req, res) {
    const conversation = await chatService.getConversationForViewer(req.params.conversationId, req.user);
    const text = chatService.validateMessageText(req.body?.message);

    const message = await chatService.saveMessage({
        conversation,
        sender: req.user,
        text
    });

    const io = req.app.get("io");
    if (io) {
        io.to(chatService.roomName(conversation._id)).emit("message:new", message);
        const summary = await chatService.buildConversationSummary(conversation._id);
        if (summary) io.to("admins").emit("conversation:updated", summary);
    }

    return res.status(201).json({ message });
}

/**
 * PATCH /api/chat/conversations/:conversationId/read  (admin or owner)
 * Marks the other party's messages as read and notifies the room so the
 * sender can render read receipts.
 */
export async function markRead(req, res) {
    const conversation = await chatService.getConversationForViewer(req.params.conversationId, req.user);

    const { modifiedCount, readAt } = await chatService.markMessagesRead({
        conversationId: conversation._id,
        readerIsAdmin: req.user.isAdmin
    });

    const io = req.app.get("io");
    if (io && modifiedCount > 0) {
        io.to(chatService.roomName(conversation._id)).emit("messages:read", {
            conversationId: conversation._id.toString(),
            readerRole: req.user.isAdmin ? "admin" : "user",
            readAt
        });

        if (req.user.isAdmin) {
            const summary = await chatService.buildConversationSummary(conversation._id);
            if (summary) io.to("admins").emit("conversation:updated", summary);
        }
    }

    return res.status(200).json({ updated: modifiedCount, readAt });
}
