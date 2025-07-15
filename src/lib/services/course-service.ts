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

// Check if we're in demo mode
// Demo mode disabled by default; enable by setting NEXT_PUBLIC_DEMO_MODE=true
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Import demo data if in demo mode
let demoCoursesData: Course[] = [];
if (isDemoMode) {
  try {
    if (typeof window !== 'undefined') {
      // In the browser, fetch the data
      fetch('/api/demo/courses')
        .then(res => res.json())
        .then(data => {
          demoCoursesData = data;
        })
        .catch(err => {
          console.error('Error loading demo courses data:', err);
        });
    } else {
      // In Node.js - for SSR
      try {
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(process.cwd(), 'src/data/courses.json');
        if (fs.existsSync(dataPath)) {
          const rawData = fs.readFileSync(dataPath, 'utf8');
          demoCoursesData = JSON.parse(rawData);
        }
      } catch (e) {
        console.error('Error loading server-side demo data:', e);
      }
    }
  } catch (e) {
    console.error('Error initializing demo courses data:', e);
  }
}

const COURSES_COLLECTION = 'courses';

// Get all courses with optional pagination
export async function getCourses(options: {
  pageSize?: number;
  lastVisible?: DocumentSnapshot;
  level?: CourseLevel;
  format?: CourseFormat;
  schedule?: CourseSchedule;
  status?: CourseStatus;
  sortBy?: keyof Course;
  sortDirection?: 'asc' | 'desc';
} = {}) {
  // Demo mode implementation
  if (isDemoMode) {
    console.log('Using demo courses data');

    // Apply filters
    let filteredCourses = [...demoCoursesData];

    if (options?.level) {
      filteredCourses = filteredCourses.filter(c => c.level === options.level);
    }

    if (options?.format) {
      filteredCourses = filteredCourses.filter(c => c.format === options.format);
    }

    if (options?.schedule) {
      filteredCourses = filteredCourses.filter(c => c.schedule === options.schedule);
    }

    if (options?.status) {
      filteredCourses = filteredCourses.filter(c => c.status === options.status);
    }

    // Apply sorting
    const sortBy = options?.sortBy || 'startDate';
    const sortDirection = options?.sortDirection || 'desc';

    filteredCourses.sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];

      if (valueA < valueB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    // Apply pagination
    const pageSize = options?.pageSize || 10;
    let startIndex = 0;

    const paginatedCourses = filteredCourses.slice(startIndex, startIndex + pageSize);

    return {
      courses: paginatedCourses,
      lastVisible: null, // In demo mode, we don't need this for pagination
      hasMore: filteredCourses.length > paginatedCourses.length
    };
  }

  // Real Firebase implementation
  const {
    pageSize = 10,
    lastVisible,
    level,
    format,
    schedule,
    status,
    sortBy = 'startDate',
    sortDirection = 'desc'
  } = options;

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
  constraints.push(limit(pageSize));

  // Add pagination if lastVisible is provided
  if (lastVisible) {
    constraints.push(startAfter(lastVisible));
  }

  // Execute query with all constraints
  const queryWithConstraints = query(coursesQuery, ...constraints);
  const querySnapshot = await getDocs(queryWithConstraints);

  // Convert documents to Course objects
  const courses: Course[] = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Determine if there are more pages
  const hasMore = querySnapshot.docs.length === pageSize;

  // Return the results and the last document for pagination
  return {
    courses,
    lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1]
  };
};

// Get a course by ID
export const getCourseById = async (courseId: string) => {
  if (isDemoMode) {
    console.log('Using demo courses data for course ID:', courseId);
    const course = demoCoursesData.find(c => c.id === courseId);
    return course || null;
  }

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
  if (isDemoMode) {
    console.log('Creating demo course (simulated):', courseData.title);
    const newCourse: Course = {
      id: `demo-course-${Date.now()}`,
      ...courseData,
      enrolledStudents: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to demo data (temporary, will be lost on refresh)
    demoCoursesData = [...demoCoursesData, newCourse];

    return newCourse;
  }

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
  if (isDemoMode) {
    console.log('Updating demo course (simulated):', courseId);
    const courseIndex = demoCoursesData.findIndex(c => c.id === courseId);

    if (courseIndex !== -1) {
      const updatedCourse = {
        ...demoCoursesData[courseIndex],
        ...courseData,
        updatedAt: new Date().toISOString()
      };

      // Update demo data
      demoCoursesData[courseIndex] = updatedCourse;

      return updatedCourse;
    }

    return null;
  }

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
  if (isDemoMode) {
    console.log('Deleting demo course (simulated):', courseId);
    demoCoursesData = demoCoursesData.filter(c => c.id !== courseId);
    return true;
  }

  const courseRef = doc(db, COURSES_COLLECTION, courseId);
  await deleteDoc(courseRef);
  return true;
};

// Get courses by level
export const getCoursesByLevel = async (level: CourseLevel) => {
  if (isDemoMode) {
    console.log('Getting demo courses by level:', level);
    return demoCoursesData.filter(c => c.level === level);
  }

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
  if (isDemoMode) {
    console.log('Updating demo course enrollment (simulated):', courseId, increment ? 'increment' : 'decrement');
    const courseIndex = demoCoursesData.findIndex(c => c.id === courseId);

    if (courseIndex !== -1) {
      const currentEnrollment = demoCoursesData[courseIndex].enrolledStudents || 0;
      const newEnrollment = increment ? currentEnrollment + 1 : Math.max(0, currentEnrollment - 1);

      demoCoursesData[courseIndex] = {
        ...demoCoursesData[courseIndex],
        enrolledStudents: newEnrollment,
        updatedAt: new Date().toISOString()
      };

      return true;
    }

    return false;
  }

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

