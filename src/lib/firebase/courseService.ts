import { db } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Types
type VocabularyItem = {
  id: string;
  word: string;
  translation: string;
  example: string;
};

type GrammarItem = {
  id: string;
  title: string;
  explanation: string;
  examples: string[];
};

type QuizItem = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

type LessonContent = {
  vocabulary: VocabularyItem[];
  grammar: GrammarItem[];
  quizzes: QuizItem[];
};

type Course = {
  id: string;
  title: string;
  description: string;
  lessons: Record<string, LessonContent>;
};

// Course Service
export const courseService = {
  // Get course by ID
  getCourse: async (courseId: string): Promise<Course | null> => {
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as Course) : null;
  },

  // Update vocabulary
  updateVocabulary: async (courseId: string, lessonId: string, vocabulary: VocabularyItem[]) => {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      [`lessons.${lessonId}.vocabulary`]: vocabulary
    });
  },

  // Update grammar
  updateGrammar: async (courseId: string, lessonId: string, grammar: GrammarItem[]) => {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      [`lessons.${lessonId}.grammar`]: grammar
    });
  },

  // Update quizzes
  updateQuizzes: async (courseId: string, lessonId: string, quizzes: QuizItem[]) => {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      [`lessons.${lessonId}.quizzes`]: quizzes
    });
  },

  // Update entire lesson
  updateLesson: async (courseId: string, lessonId: string, content: LessonContent) => {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      [`lessons.${lessonId}`]: content
    });
  }
};
