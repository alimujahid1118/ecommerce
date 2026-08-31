import { useEffect, useState } from "react";

const AUTO_DISMISS_MS = 5000;
const TRANSITION_MS = 300;

export default function NotificationToast({ toasts, onDismiss }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onDismiss }) {
    const [show, setShow] = useState(false);

    const close = () => {
        setShow(false);
        setTimeout(onDismiss, TRANSITION_MS);
    };

    useEffect(() => {
        const enter = requestAnimationFrame(() => setShow(true));
        const autoClose = setTimeout(close, AUTO_DISMISS_MS);

        return () => {
            cancelAnimationFrame(enter);
            clearTimeout(autoClose);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-xl transition-all duration-300 ease-out ${
                show ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
            }`}
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#104185]/10 text-lg">
                🔔
            </div>

            <div className="min-w-0 flex-1">
                {toast.title && (
                    <p className="truncate text-sm font-semibold text-[#132A36]">{toast.title}</p>
                )}
                {toast.body && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{toast.body}</p>
                )}
            </div>

            <button
                onClick={close}
                aria-label="Dismiss notification"
                className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
            >
                ✕
            </button>
        </div>
    );
}
