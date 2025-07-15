import { db } from './firebaseService';
import { COLLECTIONS } from './firebaseService';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, limit, arrayUnion } from 'firebase/firestore';
import { CourseProgress } from '../../types/course';
import { LanguageExchangePartner } from '../../types/languageExchange';

// Course Progress Collection
export const courseProgressCollection = collection(db, COLLECTIONS.PROGRESS);

export const getCourseProgress = async (userId: string, courseId: string) => {
  const progressRef = doc(courseProgressCollection, `${userId}_${courseId}`);
  const progressDoc = await getDoc(progressRef);
  return progressDoc.exists() ? progressDoc.data() as CourseProgress : null;
};

export const updateCourseProgress = async (userId: string, courseId: string, progress: CourseProgress) => {
  const progressRef = doc(courseProgressCollection, `${userId}_${courseId}`);
  await setDoc(progressRef, progress);
};

// Language Exchange Collection
export const languageExchangeCollection = collection(db, COLLECTIONS.LANGUAGE_EXCHANGE);

export const searchLanguagePartners = async (filters: {
  language?: string;
  location?: string;
  interests?: string[];
}) => {
  const q = query(
    languageExchangeCollection,
    where('isAvailable', '==', true),
    ...(filters.language ? [where('language', '==', filters.language)] : []),
    ...(filters.location ? [where('location', '==', filters.location)] : []),
    orderBy('lastActive', 'desc'),
    limit(10)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LanguageExchangePartner));
};

export const updateLanguageExchangeProfile = async (userId: string, profile: Partial<LanguageExchangePartner>) => {
  const profileRef = doc(languageExchangeCollection, userId);
  await updateDoc(profileRef, {
    ...profile,
    lastActive: new Date()
  });
};

// Messages Collection
export const messagesCollection = collection(db, COLLECTIONS.MESSAGES);

export const sendMessage = async (chatId: string, message: {
  senderId: string;
  content: string;
  timestamp: Date;
}) => {
  const messageRef = doc(messagesCollection, chatId);
  await updateDoc(messageRef, {
    messages: arrayUnion(message)
  });
};

export const getMessages = async (chatId: string) => {
  const messageRef = doc(messagesCollection, chatId);
  const messageDoc = await getDoc(messageRef);
  return messageDoc.exists() ? messageDoc.data()?.messages || [] : [];
};

