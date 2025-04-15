import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, getDoc, where, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/auth-context';

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  format: string;
  price: number;
  imageUrl?: string;
  lessons: Lesson[];
  enrolledStudents?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  content: string;
  order: number;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesRef = collection(db, 'courses');
      const querySnapshot = await getDocs(coursesRef);
      const coursesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setCourses(coursesData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single course by ID
  const fetchCourseById = async (courseId: string) => {
    try {
      setLoading(true);
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      if (courseDoc.exists()) {
        return { id: courseDoc.id, ...courseDoc.data() } as Course;
      }
      return null;
    } catch (err) {
      setError('Failed to fetch course');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new course (admin only)
  const createCourse = async (courseData: Omit<Course, 'id'>) => {
    try {
      if (user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      const coursesRef = collection(db, 'courses');
      const docRef = await addDoc(coursesRef, {
        ...courseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await fetchCourses();
      return docRef.id;
    } catch (err) {
      setError('Failed to create course');
      console.error(err);
      return null;
    }
  };

  // Update a course (admin only)
  const updateCourse = async (courseId: string, courseData: Partial<Course>) => {
    try {
      if (user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        ...courseData,
        updatedAt: new Date().toISOString(),
      });
      await fetchCourses();
      return true;
    } catch (err) {
      setError('Failed to update course');
      console.error(err);
      return false;
    }
  };

  // Delete a course (admin only)
  const deleteCourse = async (courseId: string) => {
    try {
      if (user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      const courseRef = doc(db, 'courses', courseId);
      await deleteDoc(courseRef);
      await fetchCourses();
      return true;
    } catch (err) {
      setError('Failed to delete course');
      console.error(err);
      return false;
    }
  };

  // Enroll in a course
  const enrollInCourse = async (courseId: string) => {
    try {
      if (!user) {
        throw new Error('Must be logged in to enroll');
      }
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      
      if (!courseDoc.exists()) {
        throw new Error('Course not found');
      }

      const course = courseDoc.data() as Course;
      const enrolledStudents = course.enrolledStudents || [];

      if (enrolledStudents.includes(user.uid)) {
        throw new Error('Already enrolled in this course');
      }

      await updateDoc(courseRef, {
        enrolledStudents: [...enrolledStudents, user.uid],
      });

      // Create enrollment record
      await addDoc(collection(db, 'enrollments'), {
        userId: user.uid,
        courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completedLessons: [],
      });

      return true;
    } catch (err) {
      setError('Failed to enroll in course');
      console.error(err);
      return false;
    }
  };

  // Get enrolled courses for current user
  const getEnrolledCourses = async () => {
    try {
      if (!user) {
        return [];
      }
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, where('enrolledStudents', 'array-contains', user.uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
    } catch (err) {
      setError('Failed to fetch enrolled courses');
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    getEnrolledCourses,
  };
};
