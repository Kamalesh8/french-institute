import { db } from '@/config/firebase';
import type { Enrollment, EnrollmentStatus, ProgressStatus, Course } from '@/lib/types';
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
  Timestamp
} from 'firebase/firestore';
import { getCourseById } from './course-service';

// Type definitions
interface EnrollmentData {
  userId: string;
  courseId: string;
  enrollmentDate?: string;
  status: EnrollmentStatus;
  paymentId?: string;
  paymentAmount: number;
  paymentDate?: string;
  completionDate?: string;
  progress: number;
  progressStatus: ProgressStatus;
  certificate?: string;
  certificateIssueDate?: string;
}

// Check if we're in demo mode
const isDemoMode = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('DEMO') ||
                   process.env.NEXT_PUBLIC_FIREBASE_API_KEY === undefined;

// Helper functions
const formatTimestamp = (timestamp: Timestamp | undefined): string => {
  return timestamp?.toDate().toISOString() || new Date().toISOString();
};
                  process.env.NEXT_PUBLIC_FIREBASE_API_KEY === undefined;

// Import demo data if in demo mode
let demoEnrollmentsData: Enrollment[] = [];
if (isDemoMode) {
  try {
    if (typeof window !== 'undefined') {
      // In the browser, fetch the data
      fetch('/api/demo/enrollments')
        .then(res => res.json())
        .then(data => {
          demoEnrollmentsData = data;
        })
        .catch(err => {
          console.error('Error loading demo enrollments data:', err);
        });
    } else {
      // In Node.js - for SSR
      try {
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(process.cwd(), 'src/data/enrollments.json');
        if (fs.existsSync(dataPath)) {
          const rawData = fs.readFileSync(dataPath, 'utf8');
          demoEnrollmentsData = JSON.parse(rawData);
        }
      } catch (e) {
        console.error('Error loading server-side demo enrollment data:', e);
      }
    }
  } catch (e) {
    console.error('Error initializing demo enrollments data:', e);
  }
}

const ENROLLMENTS_COLLECTION = 'enrollments';

export const createEnrollment = async (enrollmentData: Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (isDemoMode) {
    console.log('Creating demo enrollment (simulated):', enrollmentData.courseId);

    const newEnrollment: Enrollment = {
      id: `demo-enrollment-${Date.now()}`,
      ...enrollmentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to demo data
    demoEnrollmentsData = [...demoEnrollmentsData, newEnrollment];

    return newEnrollment;
  }

  try {
    // Get the course details
    const course = await getCourseById(enrollmentData.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Validate enrollment date
    const enrollmentDate = new Date(enrollmentData.enrollmentDate || new Date());
    const courseStartDate = new Date(course.startDate);
    const courseEndDate = new Date(course.endDate);

    if (enrollmentDate < courseStartDate) {
      throw new Error('Enrollment date cannot be before course start date');
    }

    if (enrollmentDate > courseEndDate) {
      throw new Error('Enrollment date cannot be after course end date');
    }

    // Set initial status based on dates
    const status = enrollmentDate <= courseStartDate ? 'upcoming' : 'active';

    const newEnrollment = {
      ...enrollmentData,
      status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Convert date strings to Firestore timestamps
    if (newEnrollment.enrollmentDate) {
      newEnrollment.enrollmentDate = Timestamp.fromDate(new Date(newEnrollment.enrollmentDate));
    }
    if (newEnrollment.paymentDate) {
      newEnrollment.paymentDate = Timestamp.fromDate(new Date(newEnrollment.paymentDate));
    }

    const enrollmentRef = await addDoc(collection(db, ENROLLMENTS_COLLECTION), newEnrollment);

    // Fetch the created enrollment to return
    const enrollmentDoc = await getDoc(enrollmentRef);
    if (enrollmentDoc.exists()) {
      const data = enrollmentDoc.data();
      return {
        id: enrollmentDoc.id,
        ...data,
        createdAt: formatTimestamp(data.createdAt),
        updatedAt: formatTimestamp(data.updatedAt),
        enrollmentDate: formatTimestamp(data.enrollmentDate),
        paymentDate: data.paymentDate ? formatTimestamp(data.paymentDate) : null,
        status: data.status as EnrollmentStatus
      } as Enrollment;
    }

    return { id: enrollmentRef.id, ...enrollmentData } as Enrollment;
  } catch (error) {
    console.error('Error creating enrollment:', error);
    throw error;
  }
};

export const getEnrollmentById = async (enrollmentId: string) => {
  if (isDemoMode) {
    console.log('Getting demo enrollment by ID:', enrollmentId);
    return demoEnrollmentsData.find(e => e.id === enrollmentId) || null;
  }

  try {
    const enrollmentRef = doc(db, ENROLLMENTS_COLLECTION, enrollmentId);
    const enrollmentSnap = await getDoc(enrollmentRef);

    if (enrollmentSnap.exists()) {
      const data = enrollmentSnap.data();
      return {
        id: enrollmentSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        enrollmentDate: data.enrollmentDate?.toDate?.() ? data.enrollmentDate.toDate().toISOString() : data.enrollmentDate,
        paymentDate: data.paymentDate?.toDate?.() ? data.paymentDate.toDate().toISOString() : data.paymentDate,
        completionDate: data.completionDate?.toDate?.() ? data.completionDate.toDate().toISOString() : data.completionDate,
        certificateIssueDate: data.certificateIssueDate?.toDate?.() ? data.certificateIssueDate.toDate().toISOString() : data.certificateIssueDate,
      } as Enrollment;
    }

    return null;
  } catch (error) {
    console.error('Error getting enrollment by ID:', error);
    throw error;
  }
};

export const getUserEnrollments = async (userId: string) => {
  if (isDemoMode) {
    console.log('Getting demo enrollments for user:', userId);
    return demoEnrollmentsData.filter(e => e.userId === userId);
  }

  try {
    const q = query(collection(db, ENROLLMENTS_COLLECTION), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const enrollments: Enrollment[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      enrollments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        enrollmentDate: data.enrollmentDate?.toDate?.() ? data.enrollmentDate.toDate().toISOString() : data.enrollmentDate,
        paymentDate: data.paymentDate?.toDate?.() ? data.paymentDate.toDate().toISOString() : data.paymentDate,
        completionDate: data.completionDate?.toDate?.() ? data.completionDate.toDate().toISOString() : data.completionDate,
        certificateIssueDate: data.certificateIssueDate?.toDate?.() ? data.certificateIssueDate.toDate().toISOString() : data.certificateIssueDate,
      } as Enrollment);
    });

    return enrollments;
  } catch (error) {
    console.error('Error getting user enrollments:', error);
    throw error;
  }
};

export const getCourseEnrollments = async (courseId: string) => {
  if (isDemoMode) {
    console.log('Getting demo enrollments for course:', courseId);
    return demoEnrollmentsData.filter(e => e.courseId === courseId);
  }

  try {
    const q = query(collection(db, ENROLLMENTS_COLLECTION), where('courseId', '==', courseId));
    const querySnapshot = await getDocs(q);

    const enrollments: Enrollment[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      enrollments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        enrollmentDate: data.enrollmentDate?.toDate?.() ? data.enrollmentDate.toDate().toISOString() : data.enrollmentDate,
        paymentDate: data.paymentDate?.toDate?.() ? data.paymentDate.toDate().toISOString() : data.paymentDate,
        completionDate: data.completionDate?.toDate?.() ? data.completionDate.toDate().toISOString() : data.completionDate,
        certificateIssueDate: data.certificateIssueDate?.toDate?.() ? data.certificateIssueDate.toDate().toISOString() : data.certificateIssueDate,
      } as Enrollment);
    });

    return enrollments;
  } catch (error) {
    console.error('Error getting course enrollments:', error);
    throw error;
  }
};

export const updateEnrollment = async (enrollmentId: string, enrollmentData: Partial<Enrollment>) => {
  if (isDemoMode) {
    console.log('Updating demo enrollment (simulated):', enrollmentId);

    const enrollmentIndex = demoEnrollmentsData.findIndex(e => e.id === enrollmentId);

    if (enrollmentIndex !== -1) {
      const updatedEnrollment = {
        ...demoEnrollmentsData[enrollmentIndex],
        ...enrollmentData,
        updatedAt: new Date().toISOString()
      };

      // Update demo data
      demoEnrollmentsData[enrollmentIndex] = updatedEnrollment;

      return updatedEnrollment;
    }

    return null;
  }

  try {
    const enrollmentRef = doc(db, ENROLLMENTS_COLLECTION, enrollmentId);

    // Create updated enrollment data
    const updates = {
      ...enrollmentData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(enrollmentRef, updates);

    // Get the updated enrollment
    return getEnrollmentById(enrollmentId);
  } catch (error) {
    console.error('Error updating enrollment:', error);
    throw error;
  }
};

export const isUserEnrolledInCourse = async (userId: string, courseId: string) => {
  if (isDemoMode) {
    console.log('Checking if user is enrolled in course (demo):', userId, courseId);
    return demoEnrollmentsData.some(e => e.userId === userId && e.courseId === courseId);
  }

  try {
    const q = query(
      collection(db, ENROLLMENTS_COLLECTION),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking enrollment:', error);
    throw error;
  }
};

export const deleteEnrollment = async (enrollmentId: string) => {
  if (isDemoMode) {
    console.log('Deleting demo enrollment (simulated):', enrollmentId);
    demoEnrollmentsData = demoEnrollmentsData.filter(e => e.id !== enrollmentId);
    return true;
  }

  try {
    const enrollmentRef = doc(db, ENROLLMENTS_COLLECTION, enrollmentId);
    await deleteDoc(enrollmentRef);
    return true;
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    throw error;
  }
};

export const updateEnrollmentStatus = async (enrollmentId: string, status: EnrollmentStatus) => {
  if (isDemoMode) {
    console.log('Updating demo enrollment status (simulated):', enrollmentId, status);

    const enrollmentIndex = demoEnrollmentsData.findIndex(e => e.id === enrollmentId);

    if (enrollmentIndex !== -1) {
      demoEnrollmentsData[enrollmentIndex] = {
        ...demoEnrollmentsData[enrollmentIndex],
        status,
        updatedAt: new Date().toISOString()
      };

      return demoEnrollmentsData[enrollmentIndex];
    }

    return null;
  }

  try {
    const enrollmentRef = doc(db, ENROLLMENTS_COLLECTION, enrollmentId);

    await updateDoc(enrollmentRef, {
      status,
      updatedAt: serverTimestamp()
    });

    return getEnrollmentById(enrollmentId);
  } catch (error) {
    console.error('Error updating enrollment status:', error);
    throw error;
  }
};

export const updateEnrollmentProgress = async (enrollmentId: string, progress: number) => {
  if (isDemoMode) {
    console.log('Updating demo enrollment progress (simulated):', enrollmentId, progress);

    const enrollmentIndex = demoEnrollmentsData.findIndex(e => e.id === enrollmentId);

    if (enrollmentIndex !== -1) {
      // Determine progress status
      let progressStatus = demoEnrollmentsData[enrollmentIndex].progressStatus;

      if (progress === 0) {
        progressStatus = 'not-started';
      } else if (progress >= 100) {
        progressStatus = 'completed';
      } else {
        progressStatus = 'in-progress';
      }

      demoEnrollmentsData[enrollmentIndex] = {
        ...demoEnrollmentsData[enrollmentIndex],
        progress,
        progressStatus,
        updatedAt: new Date().toISOString()
      };

      return demoEnrollmentsData[enrollmentIndex];
    }

    return null;
  }

  try {
    const enrollmentRef = doc(db, ENROLLMENTS_COLLECTION, enrollmentId);
    const enrollmentSnap = await getDoc(enrollmentRef);

    if (enrollmentSnap.exists()) {
      // Determine progress status
      let progressStatus = 'in-progress';

      if (progress === 0) {
        progressStatus = 'not-started';
      } else if (progress >= 100) {
        progressStatus = 'completed';
      }

      await updateDoc(enrollmentRef, {
        progress,
        progressStatus,
        updatedAt: serverTimestamp()
      });

      return getEnrollmentById(enrollmentId);
    }

    return null;
  } catch (error) {
    console.error('Error updating enrollment progress:', error);
    throw error;
  }
};

