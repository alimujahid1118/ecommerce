import { io } from "socket.io-client";
import { clearChatToken, getChatToken } from "./chatToken";

// One shared socket per tab. Identity comes from the chat token in the
// handshake — the server maps it to the real MongoDB user, so socket.id is
// only ever the transport id and can change freely on refresh/reconnect.
let socket = null;

export function getChatSocket() {
    if (socket) return socket;

    socket = io(import.meta.env.VITE_CHAT_SERVER_URL, {
        // `auth` as a function runs on EVERY (re)connection attempt, so
        // reconnects automatically pick up a fresh token when the old one
        // has expired.
        auth: (cb) => {
            getChatToken()
                .then((token) => cb({ token }))
                .catch(() => cb({ token: null }));
        }
    });

    socket.on("connect_error", () => {
        // Likely an expired/invalid token — drop the cache so the next
        // automatic reconnection attempt fetches a fresh one.
        clearChatToken();
    });

    return socket;
}

export function closeChatSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
