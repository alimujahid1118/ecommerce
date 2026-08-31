import { cert, initializeApp } from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" with { type: "json" }
import { getMessaging } from "firebase-admin/messaging"

initializeApp({
    credential: cert(serviceAccount)
})

export const messaging = getMessaging()