export const generateToken = async () => {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
        return null;
    }

    const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
    )

    const { getToken } = await import("firebase/messaging");
    const { getMessagingInstance } = await import("./firebase");
    const messaging = await getMessagingInstance();
    const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
    })

    return token
}
