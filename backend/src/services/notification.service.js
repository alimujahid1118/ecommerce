import { messaging } from "../../firebase-admin.js";
import tokenModel from "../models/token.model.js";
import notificationModel from "../models/notification.model.js";

const INVALID_TOKEN_ERRORS = [
    "messaging/registration-token-not-registered",
    "messaging/invalid-registration-token",
    "messaging/invalid-argument"
];

// Persisted separately from the push itself so a notification still shows up
// in a user's notification menu even if the push fails or they have no
// device token registered at all.
async function persistNotification(user, notification, meta) {
    if (!meta) return;

    try {
        await notificationModel.create({
            user,
            title: notification.title,
            body: notification.body,
            type: meta.type,
            link: meta.link
        });
    } catch (error) {
        console.error("Failed to persist notification:", error);
    }
}

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

export async function sendToUser(userId, notification, data, meta) {
    const tokenDocs = await tokenModel.find({ user: userId }).select("token").lean();
    const tokens = tokenDocs.map((doc) => doc.token);

    await sendToTokens(tokens, notification, data);
    await persistNotification(userId, notification, meta);
}

export async function sendToTopic(topic, notification, data, meta) {
    try {
        await messaging.send({
            topic,
            notification,
            ...(data ? { data } : {})
        });
    } catch (error) {
        console.error(`Failed to send FCM notification to topic "${topic}":`, error);
    }

    await persistNotification(null, notification, meta);
}
