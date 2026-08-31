import { messaging } from "../../firebase-admin.js";
import tokenModel from "../models/token.model.js";

const INVALID_TOKEN_ERRORS = [
    "messaging/registration-token-not-registered",
    "messaging/invalid-registration-token",
    "messaging/invalid-argument"
];

async function sendToTokenBatch(tokens, notification, data) {
    if (tokens.length === 0) return;

    const response = await messaging.sendEachForMulticast({
        tokens,
        notification,
        ...(data ? { data } : {})
    });

    const deadTokens = [];

    response.responses.forEach((result, index) => {
        if (!result.success && INVALID_TOKEN_ERRORS.includes(result.error?.code)) {
            deadTokens.push(tokens[index]);
        }
    });

    if (deadTokens.length > 0) {
        await tokenModel.deleteMany({ token: { $in: deadTokens } });
    }
}

export async function sendToTokens(tokens, notification, data) {
    try {
        for (let i = 0; i < tokens.length; i += 500) {
            await sendToTokenBatch(tokens.slice(i, i + 500), notification, data);
        }
    } catch (error) {
        console.error("Failed to send FCM notification to tokens:", error);
    }
}

export async function sendToUser(userId, notification, data) {
    const tokenDocs = await tokenModel.find({ user: userId }).select("token").lean();
    const tokens = tokenDocs.map((doc) => doc.token);

    await sendToTokens(tokens, notification, data);
}

export async function sendToTopic(topic, notification, data) {
    try {
        await messaging.send({
            topic,
            notification,
            ...(data ? { data } : {})
        });
    } catch (error) {
        console.error(`Failed to send FCM notification to topic "${topic}":`, error);
    }
}
