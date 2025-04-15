import { db } from '@/config/firebase';
import type { Enrollment, EnrollmentStatus, ProgressStatus } from '@/lib/types';
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
  Timestamp,
  limit
} from 'firebase/firestore';
import { updateCourseEnrollment } from './course-service';

const ENROLLMENTS_COLLECTION = 'enrollments';

// Get enrollments for a specific user
export const getUserEnrollments = async (userId: string) => {
  const q = query(
    collection(db, ENROLLMENTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('enrollmentDate', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const enrollments: Enrollment[] = [];

  for (const doc of querySnapshot.docs) {
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
  }

  return enrollments;
};

// Get enrollments for a specific course
export const getCourseEnrollments = async (courseId: string) => {
  const q = query(
    collection(db, ENROLLMENTS_COLLECTION),
    where('courseId', '==', courseId),
    orderBy('enrollmentDate', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const enrollments: Enrollment[] = [];

  for (const doc of querySnapshot.docs) {
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
  }

  return enrollments;
};

// Get a specific enrollment by ID
export const getEnrollmentById = async (enrollmentId: string) => {
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
};

// Check if a user is already enrolled in a course
export const isUserEnrolledInCourse = async (userId: string, courseId: string) => {
  const q = query(
    collection(db, ENROLLMENTS_COLLECTION),
    where('userId', '==', userId),
    where('courseId', '==', courseId),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

// Create a new enrollment
export const createEnrollment = async (
  userId: string,
  courseId: string,
  paymentAmount: number,
  paymentId?: string
) => {
  // First check if the user is already enrolled
  const alreadyEnrolled = await isUserEnrolledInCourse(userId, courseId);
  if (alreadyEnrolled) {
    throw new Error('User is already enrolled in this course');
  }

  const now = new Date();

  const newEnrollment = {
    userId,
    courseId,
    enrollmentDate: serverTimestamp(),
    status: 'active' as EnrollmentStatus,
    paymentId,
    paymentAmount,
    paymentDate: paymentId ? serverTimestamp() : null,
    progress: 0,
    progressStatus: 'not-started' as ProgressStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const enrollmentRef = await addDoc(collection(db, ENROLLMENTS_COLLECTION), newEnrollment);

  // Update the course enrollment count
  await updateCourseEnrollment(courseId, true);

  return {
    id: enrollmentRef.id,
    ...newEnrollment,
    enrollmentDate: now.toISOString(),
    paymentDate: paymentId ? now.toISOString() : null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  } as Enrollment;
};

// Update an enrollment
export const updateEnrollment = async (
  enrollmentId: string,
  updates: Partial<Enrollment>
) => {
  const enrollmentRef = doc(db, ENROLLMENTS_COLLECTION, enrollmentId);

  // Create update object
  const updateData: any = {
    ...updates,
    updatedAt: serverTimestamp()
  };

  // Convert date strings to Firestore timestamps
  if (updates.paymentDate) {
    updateData.paymentDate = Timestamp.fromDate(new Date(updates.paymentDate));
  }
  if (updates.completionDate) {
    updateData.completionDate = Timestamp.fromDate(new Date(updates.completionDate));
  }
  if (updates.certificateIssueDate) {
    updateData.certificateIssueDate = Timestamp.fromDate(new Date(updates.certificateIssueDate));
  }

  await updateDoc(enrollmentRef, updateData);

  return getEnrollmentById(enrollmentId);
};

// Cancel an enrollment
export const cancelEnrollment = async (enrollmentId: string) => {
  const enrollment = await getEnrollmentById(enrollmentId);

  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  // Update enrollment status
  await updateEnrollment(enrollmentId, {
    status: 'cancelled' as EnrollmentStatus,
  });

  // Update course enrollment count
  await updateCourseEnrollment(enrollment.courseId, false);

  return getEnrollmentById(enrollmentId);
};

// Update progress for an enrollment
export const updateEnrollmentProgress = async (
  enrollmentId: string,
  progress: number
) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  // Determine progress status
  let progressStatus: ProgressStatus = 'not-started';
  if (normalizedProgress >= 100) {
    progressStatus = 'completed';
  } else if (normalizedProgress > 0) {
    progressStatus = 'in-progress';
  }

  // Update the enrollment
  const updates: Partial<Enrollment> = {
    progress: normalizedProgress,
    progressStatus
  };

  // If completed, add completion date
  if (progressStatus === 'completed') {
    updates.completionDate = new Date().toISOString();
  }

  return updateEnrollment(enrollmentId, updates);
};

// Issue a certificate for a completed enrollment
export const issueCertificate = async (
  enrollmentId: string,
  certificateUrl: string
) => {
  const enrollment = await getEnrollmentById(enrollmentId);

  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  if (enrollment.progress < 100 || enrollment.progressStatus !== 'completed') {
    throw new Error('Course must be completed before issuing a certificate');
  }

  return updateEnrollment(enrollmentId, {
    certificate: certificateUrl,
    certificateIssueDate: new Date().toISOString()
  });
};
