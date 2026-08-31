import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

function formatRelativeTime(dateString) {
    const minutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationMenu() {
    const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useAppContext();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (notification) => {
        markNotificationRead(notification._id);
        setOpen(false);
        navigate(notification.link);
    };

    return (
        <div ref={menuRef}>
            <button onClick={() => setOpen((prev) => !prev)} className="relative" aria-label="Notifications">
                <i className="fi fi-rr-bell text-2xl text-[#104185] hover:cursor-pointer"></i>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-10 z-50 w-80 max-w-[90vw] rounded-lg border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <p className="font-semibold text-[#132A36]">Notifications</p>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllNotificationsRead}
                                className="text-xs font-semibold text-[#104185] hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="px-4 py-8 text-center text-sm text-slate-500">
                                No notifications yet.
                            </p>
                        ) : (
                            notifications.map((notification) => (
                                <button
                                    key={notification._id}
                                    onClick={() => handleSelect(notification)}
                                    className={`flex w-full flex-col gap-1 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50 ${
                                        notification.read ? "" : "bg-[#104185]/5"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-semibold text-[#132A36]">{notification.title}</p>
                                        {!notification.read && (
                                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#104185]"></span>
                                        )}
                                    </div>
                                    <p className="line-clamp-2 text-sm text-slate-500">{notification.body}</p>
                                    <p className="text-xs text-slate-400">{formatRelativeTime(notification.createdAt)}</p>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
