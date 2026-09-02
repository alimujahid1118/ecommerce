import jwt from "jsonwebtoken";
import { envConfig } from "../config.js";
import userModel from "../models/user.model.js";

/**
 * Verifies a chat bearer token and resolves the real user from the shared
 * `users` collection. Used by both the REST middleware and the Socket.IO
 * handshake middleware, so identity and role are ALWAYS server-derived:
 * the client never gets to claim a userId or a role.
 *
 * The token is issued by the e-commerce backend (GET /api/chat/token), is
 * signed with the same JWT_SECRET, and carries { id, scope: "chat" }.
 * is_admin is re-read from the database on every authentication, so revoking
 * admin rights takes effect immediately.
 */
export async function resolveUserFromToken(token) {
    const decoded = jwt.verify(token, envConfig.JWT_SECRET);

    if (decoded.scope !== "chat") {
        const error = new Error("Token is not a chat token.");
        error.name = "JsonWebTokenError";
        throw error;
    }

    const user = await userModel
        .findById(decoded.id)
        .select("firstName lastName username email is_admin")
        .lean();

    if (!user) {
        const error = new Error("User not found.");
        error.name = "JsonWebTokenError";
        throw error;
    }

    return {
        id: user._id.toString(),
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin === true
    };
}

export async function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Missing chat token." });
    }

    try {
        req.user = await resolveUserFromToken(token);
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Chat token expired." });
        }
        return res.status(401).json({ message: "Invalid chat token." });
    }
}

export function requireAdmin(req, res, next) {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Access denied. Only admins can perform this action." });
    }
    next();
}
