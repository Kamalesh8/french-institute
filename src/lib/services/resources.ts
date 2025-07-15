import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getFirestoreDb } from '@/config/firebase';

export interface Resource {
  title: string;
  content: string; // Markdown or HTML
  updatedAt?: Date | any;
}

const COLLECTION = 'resources';

/**
 * Fetch resource by category id (e.g. "vocabulary", "grammar").
 */
export async function getResource(category: string): Promise<Resource | null> {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  const ref = doc(db, COLLECTION, category);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    title: data.title || category,
    content: data.content || '',
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
  };
}

/**
 * Save or update resource (teacher only).
 */
export async function saveResource(category: string, resource: Resource): Promise<void> {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  const ref = doc(db, COLLECTION, category);
  await setDoc(ref, { ...resource, updatedAt: serverTimestamp() }, { merge: true });
}
