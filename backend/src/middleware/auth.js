import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { envConfig } from "../config/config.js";

export async function requireAuth(req, res, next) {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: "Please log in to continue." });

    try {
        const decoded = jwt.verify(token, envConfig.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select("_id is_admin").lean();
        if (!user) return res.status(401).json({ message: "Invalid access token." });
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: error.name === "TokenExpiredError" ? "Access token expired." : "Invalid access token." });
    }
}

export function requireAdmin(req, res, next) {
    if (!req.user?.is_admin) return res.status(403).json({ message: "Access denied. Only admins can perform this action." });
    next();
}