import { initializeApp } from "firebase/app"
import { getMessaging } from "firebase/messaging"

if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    console.log("VITE_FIREBASE_API_KEY not found.")
}

if (!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) {
    console.log("VITE_FIREBASE_AUTH_DOMAIN not found.")
}

if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    console.log("VITE_FIREBASE_PROJECT_ID not found.")
}

if (!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) {
    console.log("VITE_FIREBASE_STORAGE_BUCKET not found.")
}

if (!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) {
    console.log("VITE_FIREBASE_MESSAGING_SENDER_ID not found.")
}

if (!import.meta.env.VITE_FIREBASE_APP_ID) {
    console.log("VITE_FIREBASE_APP_ID not found.")
}

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig)
export const messaging = getMessaging(app)