import jwt from "jsonwebtoken";
import { envConfig } from "../config/config.js";
import tokenModel from "../models/token.model.js";
import { messaging } from "../../firebase-admin.js";

export async function registerToken(req, res) {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Token is required." });
    }

    // Auth is optional here: logged-out visitors can still register for
    // topic-based notifications (promotions, new products). If a valid
    // access token is present we additionally associate the FCM token with
    // that user so personal notifications (order updates) can reach them.
    let userId = null;
    const accessToken = req.cookies.accessToken;

    if (accessToken) {
        try {
            userId = jwt.verify(accessToken, envConfig.JWT_SECRET).id;
        } catch (error) {
            // Missing/expired access token: fall back to anonymous registration
            // rather than failing outright, and never clear an existing
            // association below just because this particular request has no
            // valid session.
        }
    }

    const setFields = {
        token: token,
        userAgent: req.headers['user-agent']
    };

    if (userId) {
        setFields.user = userId;
    }

    await tokenModel.findOneAndUpdate(
        { token: token },
        { $set: setFields },
        { upsert: true, new: true }
    );

    try {
        await Promise.all([
            messaging.subscribeToTopic([token], "all_users"),
            messaging.subscribeToTopic([token], "promotions")
        ]);
    } catch (error) {
        console.error("Failed to subscribe token to topics:", error);
    }

    return res.status(200).json({ message: "Token registered successfully." });
}

export async function unregisterToken(req, res) {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Token is required." });
        }

        await tokenModel.findOneAndDelete({ token: token });

        return res.status(200).json({ message: "Token removed successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong." });
    }
}
