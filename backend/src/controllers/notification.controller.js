import jwt from "jsonwebtoken";
import { envConfig } from "../config/config.js";
import userModel from "../models/user.model.js";
import promotionModel from "../models/promotion.model.js";
import { sendToTopic } from "../services/notification.service.js";

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

        await sendToTopic("promotions", { title, body });

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
