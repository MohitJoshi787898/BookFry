/**
 * Firebase Web Client SDK initialization for BookFry
 * Used for push notifications (FCM) on the frontend.
 *
 * ⚠️  This file is CLIENT-ONLY. Do NOT import in server components or API routes.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** Singleton Firebase app (SSR-safe guard via getApps()) */
function getFirebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

/** Returns a Firebase Messaging instance (client-only) */
export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null;
  try {
    const app = getFirebaseApp();
    return getMessaging(app);
  } catch (err) {
    console.warn('[Firebase Messaging] Failed to initialize:', err);
    return null;
  }
}

export { getFirebaseApp };
