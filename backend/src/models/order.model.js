import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },

        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        stripeSessionId: {
            type: String,
            required: true,
            unique: true,
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products",
                    required: true,
                },

                name: {
                    type: String,
                    required: true,
                },

                imageUrl: {
                    type: String,
                    required: true,
                },

                price: {
                    type: Number,
                    required: true,
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],

        shippingAddress: {
            fullName: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },

            phoneNo: {
                type: Number,
                required: true,
            },

            address: {
                type: String,
                required: true,
            },

            city: {
                type: String,
                required: true,
            },

            state: {
                type: String,
                required: true,
            },

            country: {
                type: String,
                required: true,
            },

            orderNote: {
                type: String,
                required: true,
            },
        },

        payment: {
            paymentIntentId: {
                type: String,
                required: true,
            },

            status: {
                type: String,
                enum: ["pending", "paid", "failed", "refunded"],
                default: "pending",
            },

            method: {
                type: String,
                default: "card",
            },
        },

        total: {
            type: Number,
            required: true,
        },

        orderStatus: {
            type: String,
            enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ],
            default: "pending",
        },
    },
    { timestamps: true }
);

const orderModel = mongoose.model("orders", orderSchema);

export default orderModel;