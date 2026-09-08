import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
    rating: { type: Number, min: 1, max: 5, default: null },
    imageUrls: { type: [String], default: [] },
    imagePublicIds: { type: [String], default: [] }
}, { timestamps: true });

commentSchema.index({ product: 1, createdAt: -1 });

export default mongoose.model("comments", commentSchema);