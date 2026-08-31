import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

if (!import.meta.env.VITE_FIREBASE_VAPID_KEY) {
    console.log("VITE_FIREBASE_VAPID_KEY not found.")
}

export const generateToken = async () => {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
        return null;
    }

    const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
    )

    const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
    })

    return token
}
