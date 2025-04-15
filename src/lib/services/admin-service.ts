import { db } from '@/config/firebase';
import type { User, Course, Enrollment, Payment } from '@/lib/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentSnapshot,
} from 'firebase/firestore';

// Get all users with pagination
export const getUsers = async (options?: {
  pageSize?: number;
  lastVisible?: DocumentSnapshot;
  role?: string;
  sortBy?: 'createdAt' | 'displayName';
  sortDirection?: 'asc' | 'desc';
}) => {
  const {
    pageSize = 10,
    lastVisible,
    role,
    sortBy = 'createdAt',
    sortDirection = 'desc'
  } = options || {};

  let q = query(
    collection(db, 'users'),
    orderBy(sortBy, sortDirection),
    limit(pageSize)
  );

  if (role) {
    q = query(q, where('role', '==', role));
  }

  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }

  const querySnapshot = await getDocs(q);
  const users: User[] = [];
  let lastVisibleDoc = null;

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    users.push({
      uid: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
    } as User);
    lastVisibleDoc = doc;
  });

  return { users, lastVisible: lastVisibleDoc };
};

// Get user statistics
export const getUserStatistics = async () => {
  const usersRef = collection(db, 'users');
  const studentsQuery = query(usersRef, where('role', '==', 'student'));
  const adminsQuery = query(usersRef, where('role', '==', 'admin'));

  const [studentsSnapshot, adminsSnapshot] = await Promise.all([
    getDocs(studentsQuery),
    getDocs(adminsQuery)
  ]);

  return {
    totalStudents: studentsSnapshot.size,
    totalAdmins: adminsSnapshot.size,
    total: studentsSnapshot.size + adminsSnapshot.size,
  };
};

// Get course statistics
export const getCourseStatistics = async () => {
  const coursesRef = collection(db, 'courses');
  const coursesSnapshot = await getDocs(coursesRef);
  
  let totalEnrollments = 0;
  let totalRevenue = 0;
  let activeCoursesCount = 0;

  coursesSnapshot.forEach((doc) => {
    const data = doc.data() as Course;
    totalEnrollments += data.enrolledStudents;
    if (data.status === 'ongoing') {
      activeCoursesCount++;
    }
  });

  // Calculate revenue from payments
  const paymentsRef = collection(db, 'payments');
  const paymentsSnapshot = await getDocs(
    query(paymentsRef, where('status', '==', 'completed'))
  );

  paymentsSnapshot.forEach((doc) => {
    const data = doc.data() as Payment;
    totalRevenue += data.amount;
  });

  return {
    totalCourses: coursesSnapshot.size,
    activeCourses: activeCoursesCount,
    totalEnrollments,
    totalRevenue,
  };
};

// Get enrollment statistics
export const getEnrollmentStatistics = async (period: 'week' | 'month' | 'year') => {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  const enrollmentsRef = collection(db, 'enrollments');
  const enrollmentsQuery = query(
    enrollmentsRef,
    where('enrollmentDate', '>=', startDate.toISOString())
  );

  const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
  const enrollmentsByDate: { [date: string]: number } = {};

  enrollmentsSnapshot.forEach((doc) => {
    const data = doc.data() as Enrollment;
    const date = data.enrollmentDate.split('T')[0];
    enrollmentsByDate[date] = (enrollmentsByDate[date] || 0) + 1;
  });

  return enrollmentsByDate;
};

// Update user role
export const updateUserRole = async (userId: string, role: 'student' | 'admin') => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    role,
    updatedAt: serverTimestamp(),
  });
  return true;
};

// Delete user account
export const deleteUserAccount = async (userId: string) => {
  // Delete user document
  await deleteDoc(doc(db, 'users', userId));

  // Delete user's enrollments
  const enrollmentsQuery = query(
    collection(db, 'enrollments'),
    where('userId', '==', userId)
  );
  const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
  const deleteEnrollments = enrollmentsSnapshot.docs.map(doc => deleteDoc(doc.ref));

  // Delete user's messages
  const messagesQuery = query(
    collection(db, 'messages'),
    where('senderId', '==', userId)
  );
  const messagesSnapshot = await getDocs(messagesQuery);
  const deleteMessages = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));

  // Delete user's notifications
  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('userId', '==', userId)
  );
  const notificationsSnapshot = await getDocs(notificationsQuery);
  const deleteNotifications = notificationsSnapshot.docs.map(doc => deleteDoc(doc.ref));

  await Promise.all([
    ...deleteEnrollments,
    ...deleteMessages,
    ...deleteNotifications,
  ]);

  return true;
};

// Get system analytics
export const getSystemAnalytics = async () => {
  const [userStats, courseStats] = await Promise.all([
    getUserStatistics(),
    getCourseStatistics(),
  ]);

  // Calculate engagement metrics
  const now = new Date();
  const lastMonth = new Date(now.setMonth(now.getMonth() - 1));

  const activeUsersQuery = query(
    collection(db, 'users'),
    where('lastLoginAt', '>=', lastMonth.toISOString())
  );
  const activeUsersSnapshot = await getDocs(activeUsersQuery);

  return {
    users: userStats,
    courses: courseStats,
    engagement: {
      activeUsers: activeUsersSnapshot.size,
      averageCompletionRate: courseStats.totalEnrollments > 0
        ? (courseStats.totalEnrollments / courseStats.totalCourses) * 100
        : 0,
    },
  };
};
