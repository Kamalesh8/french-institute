import { db } from '@/config/firebase';
import type { Course, CourseLevel, CourseFormat, CourseSchedule, CourseStatus } from '@/lib/types';
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
  limit,
  startAfter,
  type DocumentSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const COURSES_COLLECTION = 'courses';

// Get all courses with optional pagination
export const getCourses = async (options?: {
  pageSize?: number;
  lastVisible?: DocumentSnapshot;
  level?: CourseLevel;
  format?: CourseFormat;
  schedule?: CourseSchedule;
  status?: CourseStatus;
  sortBy?: 'startDate' | 'price' | 'level' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}) => {
  const {
    pageSize = 10,
    lastVisible,
    level,
    format,
    schedule,
    status,
    sortBy = 'startDate',
    sortDirection = 'desc'
  } = options || {};

  const coursesQuery = collection(db, COURSES_COLLECTION);
  const constraints = [];

  // Add filters if provided
  if (level) {
    constraints.push(where('level', '==', level));
  }
  if (format) {
    constraints.push(where('format', '==', format));
  }
  if (schedule) {
    constraints.push(where('schedule', '==', schedule));
  }
  if (status) {
    constraints.push(where('status', '==', status));
  }

  // Add sorting
  constraints.push(orderBy(sortBy, sortDirection));

  // Add pagination
  if (lastVisible) {
    constraints.push(startAfter(lastVisible));
  }
  constraints.push(limit(pageSize));

  // Create the query
  const q = query(coursesQuery, ...constraints);

  // Execute the query
  const querySnapshot = await getDocs(q);

  // Parse the results
  const courses: Course[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    courses.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      startDate: data.startDate?.toDate?.() ? data.startDate.toDate().toISOString() : data.startDate,
      endDate: data.endDate?.toDate?.() ? data.endDate.toDate().toISOString() : data.endDate,
    } as Course);
  });

  // Return the results and the last document for pagination
  return {
    courses,
    lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1]
  };
};

// Get a course by ID
export const getCourseById = async (courseId: string) => {
  const courseRef = doc(db, COURSES_COLLECTION, courseId);
  const courseSnap = await getDoc(courseRef);

  if (courseSnap.exists()) {
    const data = courseSnap.data();
    return {
      id: courseSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      startDate: data.startDate?.toDate?.() ? data.startDate.toDate().toISOString() : data.startDate,
      endDate: data.endDate?.toDate?.() ? data.endDate.toDate().toISOString() : data.endDate,
    } as Course;
  }

  return null;
};

// Create a new course
export const createCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newCourse = {
    ...courseData,
    enrolledStudents: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // Convert date strings to Firestore timestamps
  if (newCourse.startDate) {
    newCourse.startDate = Timestamp.fromDate(new Date(newCourse.startDate));
  }
  if (newCourse.endDate) {
    newCourse.endDate = Timestamp.fromDate(new Date(newCourse.endDate));
  }

  const courseRef = await addDoc(collection(db, COURSES_COLLECTION), newCourse);
  return { id: courseRef.id, ...courseData } as Course;
};

// Update an existing course
export const updateCourse = async (courseId: string, courseData: Partial<Course>) => {
  const courseRef = doc(db, COURSES_COLLECTION, courseId);

  // Create updated course data
  const updates = {
    ...courseData,
    updatedAt: serverTimestamp()
  };

  // Convert date strings to Firestore timestamps if they exist
  if (updates.startDate) {
    updates.startDate = Timestamp.fromDate(new Date(updates.startDate));
  }
  if (updates.endDate) {
    updates.endDate = Timestamp.fromDate(new Date(updates.endDate));
  }

  await updateDoc(courseRef, updates);

  // Get the updated course
  return getCourseById(courseId);
};

// Delete a course
export const deleteCourse = async (courseId: string) => {
  const courseRef = doc(db, COURSES_COLLECTION, courseId);
  await deleteDoc(courseRef);
  return true;
};

// Get courses by level
export const getCoursesByLevel = async (level: CourseLevel) => {
  const q = query(
    collection(db, COURSES_COLLECTION),
    where('level', '==', level),
    orderBy('startDate', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const courses: Course[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    courses.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      startDate: data.startDate?.toDate?.() ? data.startDate.toDate().toISOString() : data.startDate,
      endDate: data.endDate?.toDate?.() ? data.endDate.toDate().toISOString() : data.endDate,
    } as Course);
  });

  return courses;
};

// Update course enrollment count
export const updateCourseEnrollment = async (courseId: string, increment: boolean) => {
  const courseRef = doc(db, COURSES_COLLECTION, courseId);
  const courseSnap = await getDoc(courseRef);

  if (courseSnap.exists()) {
    const currentData = courseSnap.data();
    const currentEnrollment = currentData.enrolledStudents || 0;

    const newEnrollment = increment
      ? currentEnrollment + 1
      : Math.max(0, currentEnrollment - 1);

    await updateDoc(courseRef, {
      enrolledStudents: newEnrollment,
      updatedAt: serverTimestamp()
    });

    return true;
  }

  return false;
};
