import { useCallback, useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import chatApi from "./chatApi";
import { closeChatSocket, getChatSocket } from "./chatSocket";

function formatTime(value) {
    if (!value) return "";
    return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Floating support-chat widget for customers. Renders nothing for guests and
// admins (admins use /dashboard/chat instead).
export default function ChatWidget() {

    const { isAuthenticated, userData } = useAppContext();

    const [open, setOpen] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [mode, setMode] = useState("ai");
    const [hasMore, setHasMore] = useState(false);
    const [unread, setUnread] = useState(0);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);

    const openRef = useRef(false);
    const initializedRef = useRef(false);
    const skipScrollRef = useRef(false);
    const listRef = useRef(null);

    const eligible = isAuthenticated && !userData.is_admin;

    useEffect(() => {
        openRef.current = open;
    }, [open]);

    const loadLatest = useCallback(async () => {
        const { data: convData } = await chatApi.get("/me/conversation");
        const id = convData.conversation._id;
        setConversationId(id);
        setMode(convData.conversation.mode || "ai");
        setUnread(openRef.current ? 0 : convData.unreadCount);

        const { data: msgData } = await chatApi.get(`/conversations/${id}/messages`, {
            params: { limit: 30 }
        });
        setMessages(msgData.messages);
        setHasMore(msgData.hasMore);
    }, []);

    useEffect(() => {
        if (!eligible) return;

        const socket = getChatSocket();

        const handleConnect = () => {
            // First page load AND every reconnect: re-sync from MongoDB so
            // messages that arrived while disconnected are never missed.
            loadLatest().catch((error) => console.log(error));

            if (openRef.current) {
                socket.emit("messages:read", {});
            }
        };

        const handleNewMessage = (message) => {
            setMessages((prev) => [...prev, message]);

            if (openRef.current) {
                socket.emit("messages:read", {});
            } else {
                setUnread((prev) => prev + 1);
            }
        };

        const handleMessagesRead = ({ readerRole, readAt }) => {
            // Admin read our messages — show it on our bubbles.
            if (readerRole === "admin") {
                setMessages((prev) =>
                    prev.map((message) =>
                        message.senderRole === "user" && !message.read
                            ? { ...message, read: true, readAt }
                            : message
                    )
                );
            }
        };

        const handleConversationCleared = ({ conversationId: clearedId }) => {
            if (!clearedId) return;
            setMessages([]);
            setHasMore(false);
            setUnread(0);
        };

        const handleConversationModeUpdated = ({ conversationId: updatedId, mode: updatedMode }) => {
            if (updatedId && updatedMode) setMode(updatedMode);
        };

        socket.on("connect", handleConnect);
        socket.on("message:new", handleNewMessage);
        socket.on("messages:read", handleMessagesRead);
        socket.on("conversation:cleared", handleConversationCleared);
        socket.on("conversation:mode-updated", handleConversationModeUpdated);

        if (socket.connected && !initializedRef.current) {
            handleConnect();
        }
        initializedRef.current = true;

        return () => {
            socket.off("connect", handleConnect);
            socket.off("message:new", handleNewMessage);
            socket.off("messages:read", handleMessagesRead);
            socket.off("conversation:cleared", handleConversationCleared);
            socket.off("conversation:mode-updated", handleConversationModeUpdated);
            initializedRef.current = false;
            closeChatSocket();
        };
    }, [eligible, loadLatest]);

    useEffect(() => {
        if (!open) return;
        if (skipScrollRef.current) {
            skipScrollRef.current = false;
            return;
        }
        // Scroll only the messages pane — scrollIntoView would also scroll
        // every ancestor, moving the page underneath the widget.
        const list = listRef.current;
        if (list) {
            list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
        }
    }, [messages, open]);

    if (!eligible) return null;

    const handleOpen = () => {
        setOpen(true);
        setUnread(0);
        getChatSocket().emit("messages:read", {});
    };

    const handleSend = (event) => {
        event.preventDefault();
        const value = text.trim();
        if (!value || sending) return;

        setSending(true);
        getChatSocket().emit("message:send", { text: value }, (ack) => {
            setSending(false);
            if (ack?.messages) {
                setMessages((prev) => {
                    const existing = new Set(prev.map((message) => message._id));
                    return [...prev, ...ack.messages.filter((message) => !existing.has(message._id))];
                });
                setMode(ack.mode || mode);
                setText("");
            } else if (!ack?.ok && ack?.userMessage) {
                setMessages((prev) => [...prev, ack.userMessage]);
            } else {
                console.log(ack?.message || "Failed to send message.");
            }
        });
    };

    const handleLoadOlder = async () => {
        if (!conversationId || messages.length === 0 || loadingOlder) return;

        setLoadingOlder(true);
        try {
            const { data } = await chatApi.get(`/conversations/${conversationId}/messages`, {
                params: { limit: 30, before: messages[0]._id }
            });
            skipScrollRef.current = true;
            setMessages((prev) => [...data.messages, ...prev]);
            setHasMore(data.hasMore);
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingOlder(false);
        }
    };

    const lastOwnRead = [...messages].reverse().find((m) => m.senderRole === "user");

    return (
        <div className="fixed bottom-2 right-2 z-50 flex max-w-[calc(100vw-1rem)] flex-col items-end sm:bottom-5 sm:right-5">
            {open && (
            <div className="mb-3 flex h-[min(28rem,calc(100vh-5rem))] max-h-[calc(100vh-5rem)] w-[calc(100vw-1rem)] max-w-80 flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl">
                    <div className="flex items-center justify-between bg-[#132A36] px-4 py-3 text-white">
                        <span className="truncate pr-2 font-semibold">
                            {mode === "ai" ? "AI Support" : mode === "waiting_for_admin" ? "Waiting for support" : "Support Chat"}
                        </span>
                        <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-lg leading-none">
                            ✕
                        </button>
                    </div>

                    <div ref={listRef} className="flex-1 overflow-y-auto bg-slate-50 px-3 py-2">
                        {hasMore && (
                            <button
                                onClick={handleLoadOlder}
                                disabled={loadingOlder}
                                className="mx-auto mb-2 block text-xs text-[#104185] underline"
                            >
                                {loadingOlder ? "Loading..." : "Load older messages"}
                            </button>
                        )}

                        {messages.length === 0 && (
                            <p className="mt-6 text-center text-sm text-slate-500">
                                How can we help you today?
                            </p>
                        )}

                        {messages.map((message) => (
                            <div
                                key={message._id}
                                className={`mb-2 flex ${message.senderRole === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                        message.senderRole === "user"
                                            ? "bg-[#104185] text-white"
                                            : "border border-slate-300 bg-white text-slate-800"
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap break-words">{message.message}</p>
                                    <p className={`mt-1 text-[10px] ${message.senderRole === "user" ? "text-slate-300" : "text-slate-400"}`}>
                                        {formatTime(message.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {lastOwnRead?.read && (
                            <p className="mb-1 text-right text-[10px] text-slate-400">Seen</p>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-300 p-2">
                        <input
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            placeholder="Type message..."
                            maxLength={2000}
                            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#104185]"
                        />
                        <button
                            type="submit"
                            disabled={sending || !text.trim()}
                            className="shrink-0 rounded-md bg-[#104185] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}

            <button
                onClick={() => (open ? setOpen(false) : handleOpen())}
                className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#132A36] text-2xl text-white shadow-lg"
                aria-label="Open support chat"
            >
                💬
                {!open && unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold">
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </button>
        </div>
    );
}
