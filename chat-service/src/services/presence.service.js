// Temporary in-memory presence map: userId -> Set of active socket ids.
// This is intentionally NOT persisted — socket ids are ephemeral and change on
// every refresh/reconnect. It only answers "does this user currently have at
// least one live Socket.IO connection?". Conversations and messages never
// reference socket ids.
const onlineSockets = new Map();

/** @returns {boolean} true if the user just came online (first socket). */
export function addSocket(userId, socketId) {
    let sockets = onlineSockets.get(userId);
    if (!sockets) {
        sockets = new Set();
        onlineSockets.set(userId, sockets);
    }
    sockets.add(socketId);
    return sockets.size === 1;
}

/** @returns {boolean} true if the user just went offline (last socket gone). */
export function removeSocket(userId, socketId) {
    const sockets = onlineSockets.get(userId);
    if (!sockets) return false;

    sockets.delete(socketId);
    if (sockets.size === 0) {
        onlineSockets.delete(userId);
        return true;
    }
    return false;
}

export function isOnline(userId) {
    return onlineSockets.has(String(userId));
}
