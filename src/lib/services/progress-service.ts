import { db } from '@/config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  increment,
  serverTimestamp,
} from 'firebase/firestore';

interface Progress {
  userId: string;
  courseId: string;
  lessonId: string;
  progress: number;
  timeSpent: number;
  lastAccessedAt: string;
  completedAt?: string;
  score?: number;
  notes?: string;
}

const PROGRESS_COLLECTION = 'progress';

// Track user's progress in a lesson
export const trackLessonProgress = async (
  userId: string,
  courseId: string,
  lessonId: string,
  progress: number,
  timeSpent: number,
  score?: number,
  notes?: string
) => {
  const progressRef = doc(db, PROGRESS_COLLECTION, `${userId}_${lessonId}`);
  const now = new Date().toISOString();

  await setDoc(progressRef, {
    userId,
    courseId,
    lessonId,
    progress,
    timeSpent,
    lastAccessedAt: now,
    completedAt: progress === 100 ? now : null,
    score,
    notes,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  // Update overall course progress
  await updateCourseProgress(userId, courseId);

  return true;
};

// Get user's progress for a specific lesson
export const getLessonProgress = async (userId: string, lessonId: string) => {
  const progressRef = doc(db, PROGRESS_COLLECTION, `${userId}_${lessonId}`);
  const progressDoc = await getDoc(progressRef);

  if (!progressDoc.exists()) {
    return null;
  }

  return progressDoc.data() as Progress;
};

// Get user's progress for all lessons in a course
export const getCourseProgress = async (userId: string, courseId: string) => {
  const q = query(
    collection(db, PROGRESS_COLLECTION),
    where('userId', '==', userId),
    where('courseId', '==', courseId)
  );

  const querySnapshot = await getDocs(q);
  const progress: Progress[] = [];

  querySnapshot.forEach((doc) => {
    progress.push(doc.data() as Progress);
  });

  return progress;
};

// Calculate and update overall course progress
export const updateCourseProgress = async (userId: string, courseId: string) => {
  const progress = await getCourseProgress(userId, courseId);
  
  if (progress.length === 0) return;

  const totalProgress = progress.reduce((sum, p) => sum + p.progress, 0);
  const averageProgress = Math.round(totalProgress / progress.length);

  const enrollmentRef = doc(db, 'enrollments', `${userId}_${courseId}`);
  await updateDoc(enrollmentRef, {
    progress: averageProgress,
    updatedAt: serverTimestamp(),
  });

  return averageProgress;
};

// Get user's total time spent on a course
export const getCourseTimeSpent = async (userId: string, courseId: string) => {
  const progress = await getCourseProgress(userId, courseId);
  return progress.reduce((sum, p) => sum + p.timeSpent, 0);
};

// Get user's average score for completed lessons
export const getCourseAverageScore = async (userId: string, courseId: string) => {
  const progress = await getCourseProgress(userId, courseId);
  const completedLessons = progress.filter(p => p.score !== undefined);
  
  if (completedLessons.length === 0) return null;

  const totalScore = completedLessons.reduce((sum, p) => sum + (p.score || 0), 0);
  return Math.round(totalScore / completedLessons.length);
};

// Get user's study streak (consecutive days)
export const getStudyStreak = async (userId: string) => {
  const q = query(
    collection(db, PROGRESS_COLLECTION),
    where('userId', '==', userId),
    where('lastAccessedAt', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  );

  const querySnapshot = await getDocs(q);
  const dates = new Set<string>();

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    dates.add(data.lastAccessedAt.split('T')[0]);
  });

  const sortedDates = Array.from(dates).sort();
  let currentStreak = 1;
  let maxStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
};
