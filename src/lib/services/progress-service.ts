import { db } from '@/config/firebase';
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
  serverTimestamp
} from 'firebase/firestore';
import { updateEnrollment } from './enrollment-service';
import { createCertificate, isCertificateEligible } from './certificate-service';

const PROGRESS_COLLECTION = 'progress';
const LESSON_COLLECTION = 'lessons';
const MODULE_COLLECTION = 'modules';

// Track a completed lesson for a user
export const trackLessonCompletion = async ({
  userId,
  courseId,
  moduleId,
  lessonId,
  enrollmentId,
  timeSpent,
  completionDate = new Date().toISOString()
}: {
  userId: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  enrollmentId: string;
  timeSpent: number;
  completionDate?: string;
}) => {
  try {
    // Check if this lesson completion is already tracked
    const existingProgress = await getUserLessonProgress(userId, lessonId);

    if (existingProgress) {
      // Update existing progress
      const progressRef = doc(db, PROGRESS_COLLECTION, existingProgress.id);

      await updateDoc(progressRef, {
        timeSpent: existingProgress.timeSpent + timeSpent,
        completionDate,
        updatedAt: serverTimestamp()
      });

      // Calculate new course progress percentage
      await updateCourseProgress(userId, courseId, enrollmentId);

      return {
        id: existingProgress.id,
        userId,
        courseId,
        moduleId,
        lessonId,
        timeSpent: existingProgress.timeSpent + timeSpent,
        completionDate,
        updatedAt: new Date().toISOString()
      };
    }

    // Create new progress record
    const progressData = {
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

    const progressRef = await addDoc(collection(db, PROGRESS_COLLECTION), progressData);

    // Calculate new course progress percentage
    await updateCourseProgress(userId, courseId, enrollmentId);

    return {
      id: progressRef.id,
      ...progressData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error tracking lesson completion:', error);
    throw error;
  }
};

// Get progress for a specific user and lesson
export const getUserLessonProgress = async (userId: string, lessonId: string) => {
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
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      completionDate: data.completionDate
    };
  } catch (error) {
    console.error('Error getting user lesson progress:', error);
    throw error;
  }
};

// Get all progress for a user in a course
export const getUserCourseProgress = async (userId: string, courseId: string) => {
  try {
    const q = query(
      collection(db, PROGRESS_COLLECTION),
      where('userId', '==', userId),
      where('courseId', '==', courseId),
      orderBy('completionDate', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const progress = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      progress.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        completionDate: data.completionDate
      });
    });

    return progress;
  } catch (error) {
    console.error('Error getting user course progress:', error);
    throw error;
  }
};

// Calculate and update course progress percentage
export const updateCourseProgress = async (userId: string, courseId: string, enrollmentId: string) => {
  try {
    // Get all lesson IDs for the course
    const modulesQuery = query(
      collection(db, MODULE_COLLECTION),
      where('courseId', '==', courseId)
    );

    const modulesSnapshot = await getDocs(modulesQuery);

    let totalLessons = 0;
    const moduleIds = [];

    modulesSnapshot.forEach((moduleDoc) => {
      moduleIds.push(moduleDoc.id);
    });

    // Get lesson count for each module
    const lessonsQuery = query(
      collection(db, LESSON_COLLECTION),
      where('moduleId', 'in', moduleIds.length > 0 ? moduleIds : ['dummy-id'])
    );

    const lessonsSnapshot = await getDocs(lessonsQuery);
    totalLessons = lessonsSnapshot.size;

    if (totalLessons === 0) {
      // No lessons in course yet
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
          // Continue even if certificate generation fails
        }
      }
    }

    return progressPercentage;
  } catch (error) {
    console.error('Error updating course progress:', error);
    throw error;
  }
};

// Get learning statistics for a user
export const getUserLearningStatistics = async (userId: string) => {
  try {
    // Get all progress records for the user
    const progressQuery = query(
      collection(db, PROGRESS_COLLECTION),
      where('userId', '==', userId)
    );

    const progressSnapshot = await getDocs(progressQuery);

    let totalTimeSpent = 0;
    const courseProgress = {};
    const lessonsCompleted = new Set();
    const moduleProgress = {};

    progressSnapshot.forEach((doc) => {
      const data = doc.data();

      // Sum total time spent
      totalTimeSpent += data.timeSpent || 0;

      // Track unique completed lessons
      lessonsCompleted.add(data.lessonId);

      // Track course progress
      courseProgress[data.courseId] = courseProgress[data.courseId] || {
        lessonsCompleted: 0,
        timeSpent: 0
      };
      courseProgress[data.courseId].lessonsCompleted += 1;
      courseProgress[data.courseId].timeSpent += data.timeSpent || 0;

      // Track module progress
      moduleProgress[data.moduleId] = moduleProgress[data.moduleId] || {
        lessonsCompleted: 0,
        timeSpent: 0
      };
      moduleProgress[data.moduleId].lessonsCompleted += 1;
      moduleProgress[data.moduleId].timeSpent += data.timeSpent || 0;
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

// Get weekly learning activity for a user
export const getUserWeeklyActivity = async (userId: string) => {
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
    const activityData = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      activityData[dateString] = {
        lessonsCompleted: 0,
        timeSpent: 0,
        date: dateString
      };
    }

    // Populate data from progress records
    progressSnapshot.forEach((doc) => {
      const data = doc.data();
      const dateString = data.completionDate.split('T')[0];

      if (activityData[dateString]) {
        activityData[dateString].lessonsCompleted += 1;
        activityData[dateString].timeSpent += data.timeSpent || 0;
      }
    });

    // Convert to array format for charts
    return Object.values(activityData).reverse();
  } catch (error) {
    console.error('Error getting user weekly activity:', error);
    throw error;
  }
};
