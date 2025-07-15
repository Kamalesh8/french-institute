import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, Firestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator, FirebaseStorage } from "firebase/storage";

// Demo mode configuration
// Demo mode disabled by default; enable by setting NEXT_PUBLIC_DEMO_MODE=true
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Firebase services
let firebaseApp: FirebaseApp | null = null;
// Explicitly export placeholders so other modules can perform type-safe imports.
export let auth: Auth | null = null;
export let db: Firestore | null = null;
export let storage: FirebaseStorage | null = null;

// Initialize Firebase (works in both browser and server environments)
try {
  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);

    // Configure persistence and other settings
    // Note: Offline persistence is commented out because it requires async and we are in a synchronous context.
    // If you want to enable it, you must do it asynchronously and handle the promise appropriately.
    // But note: we are in a synchronous context here, so we cannot use async/await.
    // If you want to enable offline persistence, you might need to do it in a separate async function and call it from a component.
    /*
    if (db) {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Offline persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser doesn\'t support offline persistence.');
        }
      });
    }
    */
    
    // Connect to emulators if enabled
    const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment && useEmulators) {
      try {
        if (auth) connectAuthEmulator(auth, 'http://localhost:9099');
        if (db) connectFirestoreEmulator(db, 'localhost', 8080);
        if (storage) connectStorageEmulator(storage, 'localhost', 9199);
        console.log('Connected to Firebase emulators');
      } catch (error) {
        console.warn('Failed to connect to Firebase emulators:', error);
      }
    } else if (isDemoMode) {
      console.warn('Running in demo mode. Emulators are not connected.');
    }

    console.log('Firebase initialized successfully');

  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }

export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    throw new Error('Firebase auth not initialized');
  }
  return auth;
};

export const getFirestoreDb = (): Firestore => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return db;
};

export const getFirebaseStorage = (): FirebaseStorage => {
  if (!storage) {
    throw new Error('Firebase storage not initialized');
  }
  return storage;
};

// Log configuration in development
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  console.log('Firebase Config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    isDemoMode,
    usingEmulator: process.env.NEXT_PUBLIC_USE_EMULATORS === 'true',
    environment: process.env.NODE_ENV
  });
}

