import { db } from '@/config/firebase';
import type { Quiz, QuizQuestion, QuizAttempt, QuizAnswer } from '@/lib/types';
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

const QUIZZES_COLLECTION = 'quizzes';
const ATTEMPTS_COLLECTION = 'quiz_attempts';

// Create a new quiz
export const createQuiz = async (quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => {
  const quizRef = await addDoc(collection(db, QUIZZES_COLLECTION), {
    ...quizData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return quizRef.id;
};

// Get a quiz by ID
export const getQuizById = async (quizId: string) => {
  const quizDoc = await getDoc(doc(db, QUIZZES_COLLECTION, quizId));
  
  if (!quizDoc.exists()) {
    return null;
  }

  const data = quizDoc.data();
  return {
    id: quizDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
  } as Quiz;
};

// Update a quiz
export const updateQuiz = async (quizId: string, updates: Partial<Quiz>) => {
  const quizRef = doc(db, QUIZZES_COLLECTION, quizId);
  
  await updateDoc(quizRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  return true;
};

// Delete a quiz
export const deleteQuiz = async (quizId: string) => {
  await deleteDoc(doc(db, QUIZZES_COLLECTION, quizId));
  return true;
};

// Get quizzes for a course
export const getCourseQuizzes = async (courseId: string) => {
  const q = query(
    collection(db, QUIZZES_COLLECTION),
    where('courseId', '==', courseId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const quizzes: Quiz[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    quizzes.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    } as Quiz);
  });

  return quizzes;
};

// Start a quiz attempt
export const startQuizAttempt = async (quizId: string, userId: string) => {
  const attemptRef = await addDoc(collection(db, ATTEMPTS_COLLECTION), {
    quizId,
    userId,
    startTime: new Date().toISOString(),
    score: 0,
    maxScore: 0,
    passed: false,
    answers: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return attemptRef.id;
};

// Submit a quiz attempt
export const submitQuizAttempt = async (
  attemptId: string,
  answers: QuizAnswer[],
  endTime: string
) => {
  const attemptRef = doc(db, ATTEMPTS_COLLECTION, attemptId);
  const attemptDoc = await getDoc(attemptRef);
  
  if (!attemptDoc.exists()) {
    throw new Error('Quiz attempt not found');
  }

  const attempt = attemptDoc.data() as QuizAttempt;
  const quiz = await getQuizById(attempt.quizId);
  
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Calculate score
  let score = 0;
  const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  answers.forEach((answer) => {
    const question = quiz.questions.find(q => q.id === answer.questionId);
    if (!question) return;

    const isCorrect = Array.isArray(question.correctAnswer)
      ? arraysEqual(answer.answer as string[], question.correctAnswer)
      : answer.answer === question.correctAnswer;

    if (isCorrect) {
      score += question.points;
    }
  });

  const passed = (score / maxScore) * 100 >= quiz.passingScore;

  await updateDoc(attemptRef, {
    endTime,
    score,
    maxScore,
    passed,
    answers,
    updatedAt: serverTimestamp(),
  });

  return { score, maxScore, passed };
};

// Get quiz attempts for a user
export const getUserQuizAttempts = async (userId: string, quizId?: string) => {
  let q = query(
    collection(db, ATTEMPTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  if (quizId) {
    q = query(q, where('quizId', '==', quizId));
  }

  const querySnapshot = await getDocs(q);
  const attempts: QuizAttempt[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    attempts.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    } as QuizAttempt);
  });

  return attempts;
};

// Helper function to compare arrays
const arraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
};
