'use client';

import { useEffect, useState } from 'react';
import { getFirebaseAuth, getFirestoreDb } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';

// This is a client component that tests Firebase connectivity

const FirebaseTest = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<{
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
  } | null>(null);
  const [envVars, setEnvVars] = useState<any>(null);

  useEffect(() => {
    try {
      // Get Firebase config
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      // Store environment variables for display
      setEnvVars({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0, 5) + '...',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.slice(0, 8) + '...',
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      });

      setConfig(firebaseConfig);

      // Check if services are available
      try {
        const auth = getFirebaseAuth();
        const db = getFirestoreDb();
        setIsInitialized(!!auth && !!db);
      } catch (err) {
        setError('Firebase services are not available: ' + (err as Error).message);
        return;
      }

      // Try a simple Firestore read
      const testFirestoreConnection = async () => {
        try {
          const db = getFirestoreDb();
          const querySnapshot = await getDocs(collection(db, 'test'));
          console.log('Firestore connection successful');
          console.log('Test collection documents:', querySnapshot.docs.map(doc => doc.data()));
          setIsInitialized(true);
        } catch (error) {
          console.error('Firestore connection error:', error);
          setError(`Failed to connect to Firestore: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setIsInitialized(false);
        }
      };

      testFirestoreConnection();
    } catch (err) {
      console.error('Firebase initialization error:', err);
      setError(`Initialization error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-2">Firebase Status</h2>
      {error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : isInitialized ? (
        <p className="text-green-600">Firebase is initialized and connected successfully</p>
      ) : (
        <p className="text-yellow-600">Initializing Firebase...</p>
      )}
      {envVars && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-1">Environment Variables:</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>
      )}
      {config && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-1">Firebase Configuration:</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FirebaseTest;

