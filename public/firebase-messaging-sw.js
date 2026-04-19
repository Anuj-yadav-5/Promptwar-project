// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
// We use generic env vars fallback for dynamic SW injection
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "pulsearena-ai-493808.firebaseapp.com",
  projectId: "pulsearena-ai-493808",
  storageBucket: "pulsearena-ai-493808.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || 'System Alert';
    const notificationOptions = {
      body: payload.notification?.body || 'New alert from PulseArena AI.',
      icon: '/vite.svg',
      badge: '/vite.svg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.log("Firebase SW init failed", error);
}
