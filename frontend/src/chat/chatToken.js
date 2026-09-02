import api from "../api/axios";

// In-memory cache of the short-lived chat token. The real session still lives
// in the httpOnly cookies owned by the main backend — this token is only the
// bridge that lets the browser authenticate against the separately deployed
// chat service. Requesting it goes through the main axios instance, so the
// existing 401 → refresh-token interceptor keeps it working after the access
// token expires.
let cached = null; // { token, expiresAt }

export async function getChatToken(forceRefresh = false) {
    const notExpiringSoon = cached && cached.expiresAt > Date.now() + 30_000;

    if (!forceRefresh && notExpiringSoon) {
        return cached.token;
    }

    const response = await api.get("/chat/token");
    const { chatToken, expiresIn } = response.data;

    cached = {
        token: chatToken,
        expiresAt: Date.now() + expiresIn * 1000
    };

    return chatToken;
}

export function clearChatToken() {
    cached = null;
}
