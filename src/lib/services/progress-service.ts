import { getFirestoreDb } from '@/config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { updateEnrollment } from './enrollment-service';
import { createCertificate, isCertificateEligible } from './certificate-service';

const PROGRESS_COLLECTION = 'progress';
const LESSON_COLLECTION = 'lessons';
const MODULE_COLLECTION = 'modules';

export interface ProgressRecord {
  id?: string;
  userId: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  enrollmentId: string;
  timeSpent: number;
  completionDate: string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface TrackLessonCompletionParams {
  userId: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  enrollmentId: string;
  timeSpent: number;
  completionDate?: string;
}

export const trackLessonCompletion = async ({
  userId,
  courseId,
  moduleId,
  lessonId,
  enrollmentId,
  timeSpent,
  completionDate = new Date().toISOString()
}: TrackLessonCompletionParams): Promise<ProgressRecord> => {
  const db = getFirestoreDb();
  
  try {
    // Check if progress already exists for this lesson
    const progressQuery = query(
      collection(db, PROGRESS_COLLECTION),
      where('userId', '==', userId),
      where('lessonId', '==', lessonId)
    );
    
    const querySnapshot = await getDocs(progressQuery);
    
    if (!querySnapshot.empty) {
      // Update existing progress
      const progressDoc = querySnapshot.docs[0];
      const existingData = progressDoc.data() as ProgressRecord;
      const updatedTimeSpent = (existingData.timeSpent || 0) + timeSpent;
      
      await updateDoc(progressDoc.ref, {
        timeSpent: updatedTimeSpent,
        completionDate,
        updatedAt: serverTimestamp()
      });
      
      // Update course progress
      await updateCourseProgress(userId, courseId, enrollmentId);
      
      return {
        id: progressDoc.id,
        ...existingData,
        timeSpent: updatedTimeSpent,
        completionDate,
        updatedAt: new Date().toISOString()
      };
    }
    
    // Create new progress record
    const newProgress: Omit<ProgressRecord, 'id'> = {
      userId,
      courseId,
      moduleId,
      lessonId,
      enrollmentId,
      timeSpent,
      completionDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const progressRef = await addDoc(collection(db, PROGRESS_COLLECTION), newProgress);
    
    // Update course progress
    await updateCourseProgress(userId, courseId, enrollmentId);
    
    return {
      id: progressRef.id,
      ...newProgress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error tracking lesson completion:', error);
    throw error;
  }
};

export const getUserLessonProgress = async (userId: string, lessonId: string): Promise<ProgressRecord | null> => {
  const db = getFirestoreDb();
  try {
    const q = query(
      collection(db, PROGRESS_COLLECTION),
      where('userId', '==', userId),
      where('lessonId', '==', lessonId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data() as ProgressRecord;

    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      completionDate: data.completionDate
    };
  } catch (error) {
    console.error('Error getting user lesson progress:', error);
    throw error;
  }
};

export const getUserCourseProgress = async (userId: string, courseId: string): Promise<ProgressRecord[]> => {
  const db = getFirestoreDb();
  try {
    const q = query(
      collection(db, PROGRESS_COLLECTION),
      where('userId', '==', userId),
      where('courseId', '==', courseId),
      orderBy('completionDate', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const progress: ProgressRecord[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as ProgressRecord;
      progress.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        completionDate: data.completionDate
      });
    });

    return progress;
  } catch (error) {
    console.error('Error getting user course progress:', error);
    throw error;
  }
};

export const updateCourseProgress = async (userId: string, courseId: string, enrollmentId: string): Promise<number> => {
  const db = getFirestoreDb();
  try {
    // Get all lesson IDs for the course
    const modulesQuery = query(
      collection(db, MODULE_COLLECTION),
      where('courseId', '==', courseId)
    );

    const modulesSnapshot = await getDocs(modulesQuery);
    const moduleIds = modulesSnapshot.docs.map(doc => doc.id);

    // Get lesson count for each module
    const lessonsQuery = query(
      collection(db, LESSON_COLLECTION),
      where('moduleId', 'in', moduleIds.length > 0 ? moduleIds : ['dummy-id'])
    );

    const lessonsSnapshot = await getDocs(lessonsQuery);
    const totalLessons = lessonsSnapshot.size;

    if (totalLessons === 0) {
      return 0;
    }

    // Get completed lessons for the user in this course
    const progressQuery = query(
      collection(db, PROGRESS_COLLECTION),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );

    const progressSnapshot = await getDocs(progressQuery);
    const completedLessons = progressSnapshot.size;

    // Calculate progress percentage
    const progressPercentage = Math.min(100, Math.round((completedLessons / totalLessons) * 100));

    // Update enrollment record with new progress
    await updateEnrollment(enrollmentId, {
      progress: progressPercentage,
      progressStatus: progressPercentage === 100 ? 'completed' : 'in-progress',
      updatedAt: new Date().toISOString()
    });

    // If course is completed, generate certificate
    if (progressPercentage === 100) {
      const isEligible = await isCertificateEligible(userId, courseId);

      if (isEligible) {
        try {
          await createCertificate({
            userId,
            courseId,
            enrollmentId
          });
        } catch (certError) {
          console.error('Error generating certificate:', certError);
        }
      }
    }

    return progressPercentage;
  } catch (error) {
    console.error('Error updating course progress:', error);
    throw error;
  }
};

export interface LearningStatistics {
  totalTimeSpent: number;
  totalLessonsCompleted: number;
  totalCoursesWithProgress: number;
  courseProgress: Record<string, { lessonsCompleted: number; timeSpent: number }>;
  moduleProgress: Record<string, { lessonsCompleted: number; timeSpent: number }>;
}

export const getUserLearningStatistics = async (userId: string): Promise<LearningStatistics> => {
  const db = getFirestoreDb();
  try {
    // Get all progress records for the user
    const progressQuery = query(
      collection(db, PROGRESS_COLLECTION),
      where('userId', '==', userId)
    );

    const progressSnapshot = await getDocs(progressQuery);

    let totalTimeSpent = 0;
    const courseProgress: Record<string, { lessonsCompleted: number; timeSpent: number }> = {};
    const lessonsCompleted = new Set<string>();
    const moduleProgress: Record<string, { lessonsCompleted: number; timeSpent: number }> = {};

    progressSnapshot.forEach((doc) => {
      const data = doc.data() as ProgressRecord;
      const timeSpent = data.timeSpent || 0;

      // Sum total time spent
      totalTimeSpent += timeSpent;

      // Track unique completed lessons
      if (data.lessonId) {
        lessonsCompleted.add(data.lessonId);
      }

      // Track course progress
      if (data.courseId) {
        courseProgress[data.courseId] = courseProgress[data.courseId] || {
          lessonsCompleted: 0,
          timeSpent: 0
        };
        courseProgress[data.courseId].lessonsCompleted += 1;
        courseProgress[data.courseId].timeSpent += timeSpent;
      }

      // Track module progress
      if (data.moduleId) {
        moduleProgress[data.moduleId] = moduleProgress[data.moduleId] || {
          lessonsCompleted: 0,
          timeSpent: 0
        };
        moduleProgress[data.moduleId].lessonsCompleted += 1;
        moduleProgress[data.moduleId].timeSpent += timeSpent;
      }
    });

    return {
      totalTimeSpent,
      totalLessonsCompleted: lessonsCompleted.size,
      totalCoursesWithProgress: Object.keys(courseProgress).length,
      courseProgress,
      moduleProgress
    };
  } catch (error) {
    console.error('Error getting user learning statistics:', error);
    throw error;
  }
};

export interface WeeklyActivity {
  date: string;
  lessonsCompleted: number;
  timeSpent: number;
}

export const getUserWeeklyActivity = async (userId: string): Promise<WeeklyActivity[]> => {
  const db = getFirestoreDb();
  try {
    // Get all progress records for the user from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const progressQuery = query(
      collection(db, PROGRESS_COLLECTION),
      where('userId', '==', userId),
      where('completionDate', '>=', sevenDaysAgo.toISOString()),
      orderBy('completionDate', 'asc')
    );

    const progressSnapshot = await getDocs(progressQuery);

    // Initialize activity data for each day
    const activityData: Record<string, WeeklyActivity> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      activityData[dateString] = {
        date: dateString,
        lessonsCompleted: 0,
        timeSpent: 0
      };
    }

    // Populate data from progress records
    progressSnapshot.forEach((doc) => {
      const data = doc.data() as ProgressRecord;
      if (data.completionDate) {
        const dateString = data.completionDate.split('T')[0];
        if (activityData[dateString]) {
          activityData[dateString].lessonsCompleted += 1;
          activityData[dateString].timeSpent += data.timeSpent || 0;
        }
      }
    });

    // Convert to array and sort by date (oldest first)
    return Object.values(activityData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    console.error('Error getting user weekly activity:', error);
    throw error;
  }
};

