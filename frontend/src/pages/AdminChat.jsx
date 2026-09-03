import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import DashboardAside from "../components/DashboardAside";
import { useAppContext } from "../context/AppContext";
import chatApi from "../chat/chatApi";
import { closeChatSocket, getChatSocket } from "../chat/chatSocket";

function displayName(conversation) {
    const user = conversation.user;
    if (!user) return "Unknown user";
    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    return name || user.username || user.email || "Unknown user";
}

function formatTime(value) {
    if (!value) return "";
    const date = new Date(value);
    const today = new Date();
    const sameDay = date.toDateString() === today.toDateString();
    return sameDay
        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString();
}

function sortByActivity(conversations) {
    return [...conversations].sort(
        (a, b) =>
            new Date(b.lastMessageAt || b.updatedAt || 0) -
            new Date(a.lastMessageAt || a.updatedAt || 0)
    );
}

export default function AdminChat() {

    const { isAuthenticated, isAuthLoading, userData } = useAppContext();

    const [conversations, setConversations] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

    const activeIdRef = useRef(null);
    const skipScrollRef = useRef(false);
    const listRef = useRef(null);

    const isAdmin = isAuthenticated && userData.is_admin;

    const loadConversations = useCallback(async () => {
        try {
            const { data } = await chatApi.get("/conversations");
            setConversations(sortByActivity(data.conversations));
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingList(false);
        }
    }, []);

    useEffect(() => {
        if (!isAdmin) return;

        const socket = getChatSocket();

        const handleConnect = () => {
            // Initial load and every reconnect: refresh the sidebar from the
            // database and re-join the open conversation's room (server-side
            // room membership does not survive a reconnect).
            loadConversations();

            if (activeIdRef.current) {
                socket.emit("conversation:join", { conversationId: activeIdRef.current });
            }
        };

        const handleConversationUpdated = (summary) => {
            setConversations((prev) => {
                const next = prev.filter((c) => c._id !== summary._id);
                // Keep the unread badge at zero for the conversation the admin
                // is looking at right now — reads are being emitted live.
                if (summary._id === activeIdRef.current) {
                    summary = { ...summary, unreadCount: 0 };
                }
                return sortByActivity([...next, summary]);
            });
        };

        const handleNewMessage = (message) => {
            if (message.conversationId !== activeIdRef.current) return;

            setMessages((prev) => [...prev, message]);

            if (message.senderRole === "user") {
                socket.emit("messages:read", { conversationId: message.conversationId });
            }
        };

        const handleMessagesRead = ({ conversationId, readerRole, readAt }) => {
            if (conversationId !== activeIdRef.current || readerRole !== "user") return;

            setMessages((prev) =>
                prev.map((message) =>
                    message.senderRole === "admin" && !message.read
                        ? { ...message, read: true, readAt }
                        : message
                )
            );
        };

        const handlePresence = ({ userId, online }) => {
            setConversations((prev) =>
                prev.map((conversation) =>
                    conversation.user?._id === userId
                        ? { ...conversation, online }
                        : conversation
                )
            );
        };

        socket.on("connect", handleConnect);
        socket.on("conversation:updated", handleConversationUpdated);
        socket.on("message:new", handleNewMessage);
        socket.on("messages:read", handleMessagesRead);
        socket.on("presence:update", handlePresence);

        if (socket.connected) {
            handleConnect();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("conversation:updated", handleConversationUpdated);
            socket.off("message:new", handleNewMessage);
            socket.off("messages:read", handleMessagesRead);
            socket.off("presence:update", handlePresence);
            closeChatSocket();
        };
    }, [isAdmin, loadConversations]);

    useEffect(() => {
        if (skipScrollRef.current) {
            skipScrollRef.current = false;
            return;
        }
        // Scroll only the messages pane — scrollIntoView would also scroll
        // every ancestor, yanking the whole page down on each message.
        const list = listRef.current;
        if (list) {
            list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
        }
    }, [messages]);

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-xl font-semibold">
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (!userData.is_admin) {
        return <Navigate to="/dashboard" replace />;
    }

    const selectConversation = async (conversation) => {
        if (conversation._id === activeId) return;

        const socket = getChatSocket();
        const previousId = activeIdRef.current;

        if (previousId) {
            socket.emit("conversation:leave", { conversationId: previousId });
        }

        activeIdRef.current = conversation._id;
        setActiveId(conversation._id);
        setMessages([]);
        setHasMore(false);
        setLoadingMessages(true);

        socket.emit("conversation:join", { conversationId: conversation._id });

        try {
            const { data } = await chatApi.get(`/conversations/${conversation._id}/messages`, {
                params: { limit: 30 }
            });

            // Ignore stale responses if the admin already switched again.
            if (activeIdRef.current !== conversation._id) return;

            setMessages(data.messages);
            setHasMore(data.hasMore);

            socket.emit("messages:read", { conversationId: conversation._id });
            setConversations((prev) =>
                prev.map((c) =>
                    c._id === conversation._id ? { ...c, unreadCount: 0 } : c
                )
            );
        } catch (error) {
            console.log(error);
        } finally {
            if (activeIdRef.current === conversation._id) {
                setLoadingMessages(false);
            }
        }
    };

    const handleSend = (event) => {
        event.preventDefault();
        const value = text.trim();
        if (!value || sending || !activeId) return;

        setSending(true);
        getChatSocket().emit(
            "message:send",
            { conversationId: activeId, text: value },
            (ack) => {
                setSending(false);
                if (ack?.ok) {
                    setMessages((prev) => [...prev, ack.message]);
                    setText("");
                } else {
                    console.log(ack?.message || "Failed to send message.");
                }
            }
        );
    };

    const handleLoadOlder = async () => {
        if (!activeId || messages.length === 0 || loadingOlder) return;

        setLoadingOlder(true);
        try {
            const { data } = await chatApi.get(`/conversations/${activeId}/messages`, {
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

    const handleClearConversation = async () => {
        if (!activeId || !window.confirm("Clear this chat history for both the user and admin?")) return;

        try {
            await chatApi.delete(`/conversations/${activeId}/messages`);
            setMessages([]);
            setHasMore(false);
        } catch (error) {
            console.log(error);
        }
    };

    const handleCloseConnection = async () => {
        if (!activeId || !window.confirm("Close this admin connection and return the user to AI support?")) return;

        try {
            await chatApi.post(`/conversations/${activeId}/close`);
        } catch (error) {
            console.log(error);
        }
    };

    const activeConversation = conversations.find((c) => c._id === activeId);

    return (
        <div className="flex flex-col md:flex-row border-t border-slate-300 py-4 bg-slate-100 min-h-screen">
            <DashboardAside />

            <main className="flex flex-1 flex-col md:mr-10 md:my-10 m-6">
                <h1 className="mb-4 text-2xl font-semibold text-center md:text-start text-[#132A36]">
                    SUPPORT CHAT
                </h1>

                <div className="flex h-[70vh] overflow-hidden rounded-lg border border-slate-300 bg-white">
                    {/* Sidebar */}
                    <div className="flex w-2/5 max-w-xs flex-col border-r border-slate-300">
                        <div className="border-b border-slate-300 px-4 py-3 font-semibold text-[#132A36]">
                            Conversations
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loadingList && (
                                <p className="p-4 text-sm text-slate-500">Loading...</p>
                            )}

                            {!loadingList && conversations.length === 0 && (
                                <p className="p-4 text-sm text-slate-500">No conversations yet.</p>
                            )}

                            {conversations.map((conversation) => (
                                <button
                                    key={conversation._id}
                                    onClick={() => selectConversation(conversation)}
                                    className={`block w-full border-b border-slate-200 px-4 py-3 text-left hover:bg-slate-50 ${
                                        conversation._id === activeId ? "bg-slate-100" : ""
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="flex items-center gap-2 truncate font-medium text-[#132A36]">
                                            <span
                                                className={`h-2 w-2 shrink-0 rounded-full ${
                                                    conversation.online ? "bg-green-500" : "bg-slate-300"
                                                }`}
                                            />
                                            {displayName(conversation)}
                                        </span>
                                        {conversation.unreadCount > 0 && (
                                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                                                {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-1 flex items-center justify-between gap-2">
                                        <p className="truncate text-xs text-slate-500">
                                            {conversation.lastMessage || "No messages yet"}
                                        </p>
                                        <span className="shrink-0 text-[10px] text-slate-400">
                                            {conversation.mode === "waiting_for_admin" ? "Waiting" : formatTime(conversation.lastMessageAt)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Thread */}
                    <div className="flex flex-1 flex-col">
                        {!activeId ? (
                            <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
                                Select a conversation to start chatting.
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between border-b border-slate-300 px-4 py-3">
                                    <div>
                                        <span className="font-semibold text-[#132A36]">
                                            {activeConversation ? displayName(activeConversation) : ""}
                                        </span>
                                        <span className="ml-3 text-xs text-slate-400">
                                            {activeConversation?.mode === "waiting_for_admin"
                                                ? "Waiting for admin"
                                                : activeConversation?.mode === "ai"
                                                    ? "AI support"
                                                    : activeConversation?.online ? "Online" : "Offline"}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleClearConversation}
                                            className="rounded-md border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                                        >
                                            Clear chat
                                        </button>
                                        {activeConversation?.mode !== "ai" && (
                                            <button
                                                type="button"
                                                onClick={handleCloseConnection}
                                                className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-[#132A36] hover:bg-slate-50"
                                            >
                                                Close connection
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div ref={listRef} className="flex-1 overflow-y-auto bg-slate-50 px-4 py-3">
                                    {hasMore && (
                                        <button
                                            onClick={handleLoadOlder}
                                            disabled={loadingOlder}
                                            className="mx-auto mb-2 block text-xs text-[#104185] underline"
                                        >
                                            {loadingOlder ? "Loading..." : "Load older messages"}
                                        </button>
                                    )}

                                    {loadingMessages && (
                                        <p className="text-center text-sm text-slate-500">Loading...</p>
                                    )}

                                    {messages.map((message) => (
                                        <div
                                            key={message._id}
                                            className={`mb-2 flex ${
                                                message.senderRole === "admin" ? "justify-end" : "justify-start"
                                            }`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                                                    message.senderRole === "admin"
                                                        ? "bg-[#104185] text-white"
                                                        : "border border-slate-300 bg-white text-slate-800"
                                                }`}
                                            >
                                                <p className="whitespace-pre-wrap break-words">{message.message}</p>
                                                <p
                                                    className={`mt-1 text-[10px] ${
                                                        message.senderRole === "admin"
                                                            ? "text-slate-300"
                                                            : "text-slate-400"
                                                    }`}
                                                >
                                                    {formatTime(message.createdAt)}
                                                    {message.senderRole === "admin" && message.read && " · Seen"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-300 p-3">
                                    <input
                                        value={text}
                                        onChange={(event) => setText(event.target.value)}
                                        placeholder="Type message..."
                                        maxLength={2000}
                                        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#104185]"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !text.trim()}
                                        className="rounded-md bg-[#104185] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                    >
                                        Send
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
