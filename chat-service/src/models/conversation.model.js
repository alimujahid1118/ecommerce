import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    // The customer this conversation belongs to. Unique: one active support
    // conversation per user, and the unique index makes the find-or-create
    // upsert race-safe across reconnects and parallel requests.
    'userId': {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "userId is required."],
        unique: true
    },
    // Set when an admin first replies in / handles the conversation.
    'adminId': {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null
    },
    'status': {
        type: String,
        enum: ["open", "closed"],
        default: "open"
    },
    'mode': {
        type: String,
        enum: ["ai", "waiting_for_admin", "human"],
        default: "ai"
    },
    'lastMessage': {
        type: String,
        default: ""
    },
    'lastMessageAt': {
        type: Date,
        default: null
    }
}, { timestamps: true, collection: "chat_conversations" });

// Admin sidebar sorts by most recent activity.
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ status: 1, lastMessageAt: -1 });

const conversationModel = mongoose.model("chat_conversations", conversationSchema);

export default conversationModel;
