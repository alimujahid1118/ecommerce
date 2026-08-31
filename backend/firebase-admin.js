import { cert, initializeApp } from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging"
import { envConfig } from "./src/config/config.js"

initializeApp({
    credential: cert({
        projectId: envConfig.FIREBASE_PROJECT_ID,
        clientEmail: envConfig.FIREBASE_CLIENT_EMAIL,
        privateKey: envConfig.FIREBASE_PRIVATE_KEY
    })
})

export const messaging = getMessaging()