import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getFirestoreDb } from '../config/firebase';

export default function FirestoreTest() {
  const [message, setMessage] = useState('Checking Firestore connection...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testFirestore = async () => {
      try {
        const db = getFirestoreDb();
        const querySnapshot = await getDocs(collection(db, 'test'));
        
        if (querySnapshot.empty) {
          setMessage('Firestore connection is working. No documents found in test collection.');
        } else {
          setMessage(`Firestore connection is working. Found ${querySnapshot.size} documents in test collection.`);
        }
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    testFirestore();
  }, []);

  return (
    <div>
      <p>{message}</p>
      {loading && <p>Loading...</p>}
    </div>
  );
}

