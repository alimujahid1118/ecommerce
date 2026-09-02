import jwt from "jsonwebtoken";
import { envConfig } from "../config/config.js";
import userModel from "../models/user.model.js";

// Exchanges the httpOnly accessToken cookie for a short-lived bearer token the
// browser can hand to the separately deployed chat service. This is required
// because httpOnly cookies are scoped to THIS backend's domain — the chat
// service on Render never receives them and frontend JS cannot read them.
// The chat token is signed with the same JWT_SECRET; the chat service verifies
// it and re-checks the user (including is_admin) against the shared database.
export async function issueChatToken(req, res) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({ message: "Invalid Access Token." });
    }

    try {
        const decoded = jwt.verify(accessToken, envConfig.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select("_id").lean();

        if (!user) {
            return res.status(401).json({ message: "Invalid Access Token." });
        }

        const expiresInSeconds = 60 * 60; // 1 hour

        const chatToken = jwt.sign(
            { id: decoded.id, scope: "chat" },
            envConfig.JWT_SECRET,
            { expiresIn: expiresInSeconds }
        );

        return res.status(200).json({ chatToken, expiresIn: expiresInSeconds });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Access Token Expired."
            });
        }
        return res.status(401).json({
            message: "Invalid Access Token."
        });
    }
}
