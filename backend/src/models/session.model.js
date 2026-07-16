import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    'user': {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, "User ID is a required field."]
    },
    'refreshTokenHash': {
        type: String,
        required: [true, "User ID is a required field."]
    },
    'ip': {
        type: String,
        required: [true, "IP Address is a required field."]
    },
    'userAgent': {
        type: String,
        required: [true, "User Agent is a required field."]
    },
    'isRevoked': {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

const sessionModel = mongoose.model("sessions", sessionSchema);

export default sessionModel;