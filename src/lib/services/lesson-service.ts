import { db } from '@/config/firebase';
import type { Lesson, LessonStatus } from '@/lib/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const LESSONS_COLLECTION = 'lessons';

// Get all lessons for a course
export const getCourseLessons = async (courseId: string) => {
  const q = query(
    collection(db, LESSONS_COLLECTION),
    where('courseId', '==', courseId),
    orderBy('order', 'asc')
  );

  const querySnapshot = await getDocs(q);
  const lessons: Lesson[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    lessons.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    } as Lesson);
  });

  return lessons;
};

// Get a specific lesson
export const getLessonById = async (lessonId: string) => {
  const lessonDoc = await getDoc(doc(db, LESSONS_COLLECTION, lessonId));
  
  if (!lessonDoc.exists()) {
    return null;
  }

  const data = lessonDoc.data();
  return {
    id: lessonDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
  } as Lesson;
};

// Create a new lesson
export const createLesson = async (lessonData: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, LESSONS_COLLECTION), {
    ...lessonData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

// Update a lesson
export const updateLesson = async (lessonId: string, updates: Partial<Lesson>) => {
  const lessonRef = doc(db, LESSONS_COLLECTION, lessonId);
  
  await updateDoc(lessonRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  return true;
};

// Delete a lesson
export const deleteLesson = async (lessonId: string) => {
  await deleteDoc(doc(db, LESSONS_COLLECTION, lessonId));
  return true;
};

// Track lesson completion for a user
export const trackLessonCompletion = async (userId: string, lessonId: string, completed: boolean) => {
  const completionRef = doc(db, 'lesson_completions', `${userId}_${lessonId}`);
  
  if (completed) {
    await updateDoc(completionRef, {
      userId,
      lessonId,
      completedAt: serverTimestamp(),
    });
  } else {
    await deleteDoc(completionRef);
  }

  return true;
};

// Get completed lessons for a user in a course
export const getUserCompletedLessons = async (userId: string, courseId: string) => {
  const q = query(
    collection(db, 'lesson_completions'),
    where('userId', '==', userId),
    where('courseId', '==', courseId)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data().lessonId);
};

// Update lesson order
export const updateLessonOrder = async (lessonId: string, newOrder: number) => {
  const lessonRef = doc(db, LESSONS_COLLECTION, lessonId);
  
  await updateDoc(lessonRef, {
    order: newOrder,
    updatedAt: serverTimestamp(),
  });

  return true;
};

