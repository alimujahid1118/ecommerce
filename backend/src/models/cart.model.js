import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true,
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
    },

    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
    }
}, { timestamps: true });

cartSchema.index({ user: 1, product: 1 }, { unique: true });

const cartModel = mongoose.model("cart", cartSchema);

export default cartModel;