import { collection, getDocs, doc, setDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { getFirestoreDb } from '@/config/firebase';

export interface PronunciationExample {
  text: string;
  phonetic: string;
  example: string;
  translation: string;
}

export interface PronunciationGuide {
  id: string; // vowels, consonants, etc
  title: string;
  description: string;
  examples: PronunciationExample[];
  updatedAt?: string;
}

const COLLECTION = 'pronunciation_guides';

export const getPronunciationGuides = async (): Promise<PronunciationGuide[]> => {
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => ({ ...(d.data() as Omit<PronunciationGuide,'id'>), id: d.id }));
};

export const savePronunciationGuide = async (guide: PronunciationGuide) => {
  const db = getFirestoreDb();
  const ref = doc(db, COLLECTION, guide.id);
  await setDoc(ref, { ...guide, updatedAt: serverTimestamp() });
};

export const updatePronunciationGuide = async (id: string, data: Partial<PronunciationGuide>) => {
  const db = getFirestoreDb();
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

export const deletePronunciationGuide = async (id: string) => {
  const db = getFirestoreDb();
  await deleteDoc(doc(db, COLLECTION, id));
};
