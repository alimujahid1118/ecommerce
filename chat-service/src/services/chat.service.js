import mongoose from "mongoose";
import conversationModel from "../models/conversation.model.js";
import messageModel from "../models/message.model.js";
import * as presence from "./presence.service.js";
import { envConfig } from "../config.js";

// Single source of truth for room naming. Rooms are keyed by the STABLE
// conversationId — never by socket.id, which changes on every reconnect.
export function roomName(conversationId) {
    return `conversation-${conversationId}`;
}

export function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    error.expose = true;
    return error;
}

export function validateMessageText(raw) {
    if (typeof raw !== "string") {
        throw httpError(400, "Message text is required.");
    }
    const text = raw.trim();
    if (!text) {
        throw httpError(400, "Message cannot be empty.");
    }
    if (text.length > 2000) {
        throw httpError(400, "Message cannot exceed 2000 characters.");
    }
    return text;
}

export function isHumanSupportRequest(text) {
    return /\b(admin|human|real person|customer support|support agent|agent)\b/i.test(text)
        && /\b(want|need|speak|talk|connect|contact|chat|transfer|please|can|could)\b/i.test(text);
}

export function conversationMode(conversation) {
    return conversation.mode || "ai";
}

export async function getLlmReply(conversationId) {
    const messages = await messageModel
        .find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(envConfig.LLM_HISTORY_LIMIT)
        .lean();

    const history = messages.reverse().map((message) => ({
        role: message.senderRole === "user" ? "user" : "assistant",
        content: message.message
    }));

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${envConfig.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: envConfig.GROQ_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are a helpful customer support assistant for an e-commerce store. Give concise, accurate answers. Do not claim to access order information unless it is provided in the conversation."
                },
                ...history
            ],
            temperature: 0.3,
            max_tokens: 500
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();

        console.error("Groq API error:", {
            status: response.status,
            body: errorBody
        });

        throw new Error(
            `Groq request failed with status ${response.status}: ${errorBody}`
        );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error("Groq returned an empty response.");
    return reply.trim();
}

/**
 * One active support conversation per user. The unique index on `userId`
 * plus the atomic upsert makes this race-safe: two simultaneous connects
 * (e.g. two tabs, or a fast reconnect) always resolve to the same document
 * instead of creating duplicates.
 */
export async function findOrCreateConversation(userId) {
    return conversationModel.findOneAndUpdate(
        { userId: userId },
        { $setOnInsert: { userId: userId, status: "open" } },
        { upsert: true, returnDocument: "after" }
    ).lean();
}

/**
 * Loads a conversation and enforces access: admins can open any conversation,
 * a normal user can only ever open their own.
 */
export async function getConversationForViewer(conversationId, viewer) {
    if (!mongoose.isValidObjectId(conversationId)) {
        throw httpError(400, "Invalid conversation id.");
    }

    const conversation = await conversationModel.findById(conversationId).lean();

    if (!conversation) {
        throw httpError(404, "Conversation not found.");
    }

    if (!viewer.isAdmin && conversation.userId.toString() !== viewer.id) {
        throw httpError(403, "You do not have access to this conversation.");
    }

    return conversation;
}

/**
 * Cursor-based history pagination, newest page first, returned in
 * chronological order. The cursor is the oldest loaded message's _id
 * (ObjectIds are time-ordered), which stays stable while new messages arrive
 * — unlike skip/limit pagination.
 */
export async function getMessages(conversationId, { before, limit } = {}) {
    const pageSize = Math.min(Math.max(Number(limit) || 30, 1), 100);

    const query = { conversationId: conversationId };

    if (before) {
        if (!mongoose.isValidObjectId(before)) {
            throw httpError(400, "Invalid pagination cursor.");
        }
        query._id = { $lt: new mongoose.Types.ObjectId(before) };
    }

    const docs = await messageModel
        .find(query)
        .sort({ _id: -1 })
        .limit(pageSize + 1)
        .lean();

    const hasMore = docs.length > pageSize;
    const page = hasMore ? docs.slice(0, pageSize) : docs;

    return { messages: page.reverse(), hasMore };
}

/**
 * Persists a message and updates the conversation summary. MongoDB is the
 * source of truth — this runs regardless of who is connected; Socket.IO
 * delivery afterwards is best-effort real-time on top.
 */
export async function saveMessage({ conversation, sender, text }) {
    const message = await messageModel.create({
        conversationId: conversation._id,
        senderId: sender.id,
        senderRole: sender.isAdmin ? "admin" : "user",
        message: text
    });

    const update = {
        lastMessage: message.message,
        lastMessageAt: message.createdAt,
        // A new user message re-opens a closed conversation.
        status: "open"
    };

    if (sender.isAdmin && !conversation.adminId) {
        update.adminId = sender.id;
    }

    await conversationModel.updateOne({ _id: conversation._id }, { $set: update });

    return message.toObject();
}

export async function saveAssistantMessage({ conversation, text }) {
    const message = await messageModel.create({
        conversationId: conversation._id,
        senderId: null,
        senderRole: "assistant",
        message: text
    });

    await conversationModel.updateOne(
        { _id: conversation._id },
        { $set: { lastMessage: message.message, lastMessageAt: message.createdAt } }
    );

    return message.toObject();
}

export async function updateConversationMode(conversationId, mode) {
    return conversationModel.findByIdAndUpdate(
        conversationId,
        { $set: { mode } },
        { returnDocument: "after" }
    ).lean();
}

export async function clearConversationHistory(conversationId) {
    await messageModel.deleteMany({ conversationId });

    return conversationModel.findByIdAndUpdate(
        conversationId,
        {
            $set: {
                lastMessage: "",
                lastMessageAt: null
            }
        },
        { returnDocument: "after" }
    ).lean();
}

/**
 * Marks the OTHER party's messages as read. An admin reading marks user
 * messages; a user reading marks admin messages. Callers have already
 * verified access to the conversation.
 */
export async function markMessagesRead({ conversationId, readerIsAdmin }) {
    const senderRole = readerIsAdmin ? "user" : "admin";
    const readAt = new Date();

    const result = await messageModel.updateMany(
        { conversationId: conversationId, senderRole: senderRole, read: false },
        { $set: { read: true, readAt: readAt } }
    );

    return { modifiedCount: result.modifiedCount, readAt };
}

export async function unreadCount(conversationId, { forAdmin }) {
    const conversation = await conversationModel.findById(conversationId).select("mode").lean();
    if (forAdmin && conversationMode(conversation || {}) === "ai") return 0;

    return messageModel.countDocuments({
        conversationId: conversationId,
        senderRole: forAdmin ? "user" : "admin",
        read: false
    });
}

function toSummary(conversation, unread) {
    const user = conversation.userId && typeof conversation.userId === "object"
        ? conversation.userId
        : null;

    return {
        _id: conversation._id,
        userId: user ? user._id : conversation.userId,
        user: user,
        adminId: conversation.adminId,
        status: conversation.status,
        mode: conversationMode(conversation),
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        unreadCount: unread,
        online: user ? presence.isOnline(user._id) : false
    };
}

/**
 * Admin sidebar: every conversation, most recent activity first, with the
 * customer's identity, unread count, and live presence.
 */
export async function listConversationsForAdmin() {
    const conversations = await conversationModel
        .find()
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .populate("userId", "firstName lastName username email")
        .lean();

    const counts = await messageModel.aggregate([
        { $match: { senderRole: "user", read: false } },
        { $group: { _id: "$conversationId", count: { $sum: 1 } } }
    ]);

    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    return conversations.map((conversation) =>
        toSummary(
            conversation,
            conversationMode(conversation) === "ai" ? 0 : countMap.get(conversation._id.toString()) || 0
        )
    );
}

/** Fresh summary for one conversation — payload of `conversation:updated`. */
export async function buildConversationSummary(conversationId) {
    const conversation = await conversationModel
        .findById(conversationId)
        .populate("userId", "firstName lastName username email")
        .lean();

    if (!conversation) return null;

    const unread = await unreadCount(conversation._id, { forAdmin: true });

    return toSummary(conversation, unread);
}
