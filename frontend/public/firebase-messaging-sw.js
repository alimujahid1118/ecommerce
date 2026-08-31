importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAhBfpJVL9Zx0B-vsbtf8OBzRuQG2ODJNg",
    authDomain: "eshop-e977b.firebaseapp.com",
    projectId: "eshop-e977b",
    storageBucket: "eshop-e977b.firebasestorage.app",
    messagingSenderId: "688702125379",
    appId: "1:688702125379:web:9b81109710a4e9488a6bf6"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || "New notification"
    const notificationOptions = payload.notification?.body || "You have a new message"

    console.log("notificationTitle: ", notificationTitle)
    console.log("notificationOptions: ", notificationOptions)

    self.registration.showNotification(
        notificationTitle,
        notificationOptions
    )
})