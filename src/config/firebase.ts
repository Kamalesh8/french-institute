// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA_DEMO_KEY_FOR_DEVELOPMENT",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
};

// Log config in development but not in production (excluding sensitive info)
if (process.env.NODE_ENV !== 'production' && isBrowser) {
  console.log("Firebase config (development):", {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? "PRESENT" : "MISSING", // Don't log actual key
    appId: firebaseConfig.appId ? "PRESENT" : "MISSING",   // Don't log actual ID
  });
}

// Initialize Firebase
let app;
let auth;
let db;
let storage;

try {
  // Initialize Firebase
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error("Firebase initialization error:", error);

  // Still define the variables to prevent further errors, but they won't work
  if (!app) app = {} as any;
  if (!auth) auth = {} as any;
  if (!db) db = {} as any;
  if (!storage) storage = {} as any;
}

export { app, auth, db, storage };
