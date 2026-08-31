import jwt from "jsonwebtoken";
import { envConfig } from "../config/config.js";
import userModel from "../models/user.model.js";
import promotionModel from "../models/promotion.model.js";
import notificationModel from "../models/notification.model.js";
import { sendToTopic } from "../services/notification.service.js";

async function authenticate(req) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        throw Object.assign(new Error("Invalid Access Token."), { status: 401 });
    }

    try {
        return jwt.verify(accessToken, envConfig.JWT_SECRET).id;
    } catch (error) {
        const message = error.name === "TokenExpiredError" ? "Token Expired." : "Invalid Access Token.";
        throw Object.assign(new Error(message), { status: 401 });
    }
}

export async function createPromotion(req, res) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({ message: "Invalid Access Token." });
    }

    try {
        const decoded = jwt.verify(accessToken, envConfig.JWT_SECRET);
        const user = await userModel.findById(decoded.id).lean();

        if (!user || !user.is_admin) {
            return res.status(403).json({ message: "Access denied. Only admins can perform this action." });
        }

        const { title, body } = req.body;

        if (!title || !body) {
            return res.status(400).json({ message: "Title and body are required." });
        }

        const promotion = await promotionModel.create({
            title: title,
            body: body,
            createdBy: user._id
        });

        await sendToTopic("promotions", { title, body }, undefined, { type: "promotion", link: "/products" });

        return res.status(201).json(promotion);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token Expired." });
        }
        return res.status(401).json({ message: "Invalid Access Token." });
    }
}

export async function getPromotions(req, res) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({ message: "Invalid Access Token." });
    }

    try {
        const decoded = jwt.verify(accessToken, envConfig.JWT_SECRET);
        const user = await userModel.findById(decoded.id).lean();

        if (!user || !user.is_admin) {
            return res.status(403).json({ message: "Access denied. Only admins can perform this action." });
        }

        const promotions = await promotionModel.find().sort({ createdAt: -1 }).lean();

        return res.status(200).json(promotions);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token Expired." });
        }
        return res.status(401).json({ message: "Invalid Access Token." });
    }
}

export async function getNotifications(req, res) {
    try {
        const userId = await authenticate(req);
        const scope = { $or: [{ user: userId }, { user: null }] };

        const notifications = await notificationModel
            .find(scope)
            .sort({ createdAt: -1 })
            .limit(30)
            .lean();

        const unreadCount = await notificationModel.countDocuments({
            ...scope,
            readBy: { $ne: userId }
        });

        return res.status(200).json({
            notifications: notifications.map((notification) => ({
                ...notification,
                read: notification.readBy.some((id) => id.toString() === userId)
            })),
            unreadCount
        });
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Something went wrong." });
    }
}

export async function markNotificationRead(req, res) {
    try {
        const userId = await authenticate(req);

        await notificationModel.updateOne(
            { _id: req.params.id, $or: [{ user: userId }, { user: null }] },
            { $addToSet: { readBy: userId } }
        );

        return res.status(200).json({ message: "Notification marked as read." });
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Something went wrong." });
    }
}

export async function markAllNotificationsRead(req, res) {
    try {
        const userId = await authenticate(req);

        await notificationModel.updateMany(
            { $or: [{ user: userId }, { user: null }], readBy: { $ne: userId } },
            { $addToSet: { readBy: userId } }
        );

        return res.status(200).json({ message: "All notifications marked as read." });
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Something went wrong." });
    }
}
