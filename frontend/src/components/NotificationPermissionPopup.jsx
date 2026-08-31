import { useEffect, useState } from "react";
import api from "../api/axios";
import { generateToken } from "../firebase/generateToken";
import { syncTokenIfGranted } from "../firebase/tokenSync";

const DISMISSED_KEY = "fcm_prompt_dismissed";

export default function NotificationPermissionPopup() {
    const [showPopup, setShowPopup] = useState(false);

    // Runs for every visitor, logged in or not — promotions and product
    // updates go out over an FCM topic, which only needs the device token,
    // not an account. registerToken() additionally links the token to a
    // user when one is logged in, for personal notifications like orders.
    useEffect(() => {
        if (!("Notification" in window)) return;

        if (Notification.permission === "granted") {
            syncTokenIfGranted();
            return;
        }

        if (Notification.permission === "default" && !localStorage.getItem(DISMISSED_KEY)) {
            setShowPopup(true);
        }
    }, []);

    const handleAllow = async () => {
        setShowPopup(false);

        try {
            const token = await generateToken();

            if (token) {
                await api.post("/tokens/register", { token });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleDismiss = () => {
        setShowPopup(false);
        localStorage.setItem(DISMISSED_KEY, "1");
    };

    if (!showPopup) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 px-4 pb-6 md:pb-0">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
                <div className="text-4xl">🔔</div>

                <div>
                    <h2 className="text-lg font-semibold text-[#132A36]">
                        Stay in the loop
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Get notified about new products, promotions, and updates on your orders.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleDismiss}
                        className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-600 font-semibold"
                    >
                        Not now
                    </button>
                    <button
                        onClick={handleAllow}
                        className="flex-1 py-2 rounded-lg bg-[#104185] text-white font-semibold"
                    >
                        Allow
                    </button>
                </div>
            </div>
        </div>
    );
}
