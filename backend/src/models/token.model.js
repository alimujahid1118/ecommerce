import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    'token': {
        type: String,
        required: [true, "Token is a required field."],
        unique: [true, "Token must be unique."]
    },
    'user': {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null
    },
    'userAgent': {
        type: String
    }
}, { timestamps: true });

tokenSchema.index({ user: 1 });

const tokenModel = mongoose.model("tokens", tokenSchema);

export default tokenModel;
