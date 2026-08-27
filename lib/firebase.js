import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured() {
  return Boolean(config.apiKey && config.projectId);
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) return null;
  if (!getApps().length) return initializeApp(config);
  return getApps()[0];
}

export function getFirebaseAuth() {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export const googleProvider = new GoogleAuthProvider();

export async function registerFcmToken() {
  if (typeof window === "undefined") return null;
  const vapid = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapid || !isFirebaseConfigured()) return null;
  if (!(await isSupported())) return null;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;
  const messaging = getMessaging(getFirebaseApp());
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  return getToken(messaging, { vapidKey: vapid, serviceWorkerRegistration: registration });
}
