import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    'conversationId': {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chat_conversations",
        required: [true, "conversationId is required."]
    },
    // Always the server-authenticated sender — never taken from the client.
    'senderId': {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "senderId is required."]
    },
    'senderRole': {
        type: String,
        enum: ["user", "admin"],
        required: [true, "senderRole is required."]
    },
    'message': {
        type: String,
        required: [true, "message is required."],
        trim: true,
        maxlength: [2000, "Message cannot exceed 2000 characters."]
    },
    'read': {
        type: Boolean,
        default: false
    },
    'readAt': {
        type: Date,
        default: null
    }
}, { timestamps: true, collection: "chat_messages" });

// History pagination: newest-first scans within a conversation.
messageSchema.index({ conversationId: 1, createdAt: -1 });
// Unread counts: count of unread messages per conversation per sender role.
messageSchema.index({ conversationId: 1, senderRole: 1, read: 1 });

const messageModel = mongoose.model("chat_messages", messageSchema);

export default messageModel;
