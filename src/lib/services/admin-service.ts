import { db } from '@/config/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { addDays, subDays, format, subMonths, subWeeks, subYears, eachDayOfInterval } from 'date-fns';

// Get user statistics for admin dashboard
export const getUserStatistics = async () => {
  try {
    // In a real implementation, we would query Firestore
    // For now, return mock data until we have real data
    return {
      totalStudents: 128,
      newStudentsThisMonth: 24,
      activeStudents: 96,
      inactiveStudents: 32,
      topCountries: [
        { country: 'United States', count: 42 },
        { country: 'France', count: 28 },
        { country: 'Canada', count: 18 },
        { country: 'United Kingdom', count: 15 },
        { country: 'Australia', count: 8 }
      ],
      registrationsByMonth: [
        { month: 'Jan', count: 8 },
        { month: 'Feb', count: 12 },
        { month: 'Mar', count: 15 },
        { month: 'Apr', count: 10 },
        { month: 'May', count: 18 },
        { month: 'Jun', count: 22 },
        { month: 'Jul', count: 17 },
        { month: 'Aug', count: 14 },
        { month: 'Sep', count: 19 },
        { month: 'Oct', count: 24 },
        { month: 'Nov', count: 16 },
        { month: 'Dec', count: 11 }
      ]
    };
  } catch (error) {
    console.error('Error getting user statistics:', error);
    throw error;
  }
};

// Get course statistics for admin dashboard
export const getCourseStatistics = async () => {
  try {
    // In a real implementation, we would query Firestore
    // For now, return mock data until we have real data
    return {
      totalCourses: 14,
      activeCourses: 8,
      upcomingCourses: 4,
      completedCourses: 2,
      totalRevenue: 25680,
      averageRating: 4.7,
      popularLevels: [
        { level: 'A1', count: 42 },
        { level: 'A2', count: 35 },
        { level: 'B1', count: 28 },
        { level: 'B2', count: 22 },
        { level: 'C1', count: 14 },
        { level: 'C2', count: 8 }
      ],
      coursesByFormat: [
        { format: 'online', count: 8 }
      ]
    };
  } catch (error) {
    console.error('Error getting course statistics:', error);
    throw error;
  }
};

// Get enrollment statistics for admin dashboard
export const getEnrollmentStatistics = async (period: 'week' | 'month' | 'year' = 'month') => {
  try {
    // In a real implementation, we would query Firestore
    // For now, generate mock data for the chart

    let startDate;
    let endDate = new Date();

    switch (period) {
      case 'week':
        startDate = subWeeks(endDate, 1);
        break;
      case 'month':
        startDate = subMonths(endDate, 1);
        break;
      case 'year':
        startDate = subYears(endDate, 1);
        break;
      default:
        startDate = subMonths(endDate, 1);
    }

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Generate random enrollment data for each day
    const enrollmentData: Record<string, number> = {};
    days.forEach(day => {
      const dateString = format(day, 'yyyy-MM-dd');

      // Generate more realistic data with weekend dips and random variations
      const isWeekend = [0, 6].includes(day.getDay());
      const baseValue = isWeekend ? 2 : 5;

      // Add some randomness but ensure a positive value
      const randomVariation = Math.floor(Math.random() * 6);
      enrollmentData[dateString] = Math.max(1, baseValue + randomVariation);
    });

    return enrollmentData;
  } catch (error) {
    console.error('Error getting enrollment statistics:', error);
    throw error;
  }
};

// Get system analytics for admin dashboard
export const getSystemAnalytics = async () => {
  try {
    // In a real implementation, we would query Firestore and aggregate data
    // For now, return mock data until we have real data
    return {
      performance: {
        averagePageLoadTime: 1.2, // in seconds
        serverResponseTime: 0.8, // in seconds
        errorRate: 0.05, // 5%
        requestsPerMinute: 42
      },
      engagement: {
        activeUsers: 86,
        averageSessionDuration: 28, // in minutes
        pageViews: 1240,
        bounceRate: 0.25, // 25%
        averageCompletionRate: 78, // percentage
        activeTime: 840 // in minutes
      },
      devices: {
        desktop: 65, // percentage
        mobile: 30, // percentage
        tablet: 5 // percentage
      },
      browsers: {
        chrome: 68, // percentage
        safari: 15, // percentage
        firefox: 10, // percentage
        edge: 5, // percentage
        other: 2 // percentage
      }
    };
  } catch (error) {
    console.error('Error getting system analytics:', error);
    throw error;
  }
};

// Get payment and revenue data for admin dashboard
export const getRevenueData = async (period: 'week' | 'month' | 'year' = 'month') => {
  try {
    // In a real implementation, we would query Firestore
    // For now, generate mock data for the chart

    let startDate;
    let endDate = new Date();

    switch (period) {
      case 'week':
        startDate = subWeeks(endDate, 1);
        break;
      case 'month':
        startDate = subMonths(endDate, 1);
        break;
      case 'year':
        startDate = subYears(endDate, 1);
        break;
      default:
        startDate = subMonths(endDate, 1);
    }

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Generate random revenue data for each day
    const revenueData = days.map(day => {
      const dateString = format(day, 'yyyy-MM-dd');

      // Generate more realistic data with weekend variations
      const isWeekend = [0, 6].includes(day.getDay());
      const baseRevenue = isWeekend ? 150 : 350;

      // Add some randomness
      const randomVariation = Math.floor(Math.random() * 200);

      return {
        date: dateString,
        revenue: baseRevenue + randomVariation,
        enrollments: Math.max(1, Math.floor((baseRevenue + randomVariation) / 100))
      };
    });

    return revenueData;
  } catch (error) {
    console.error('Error getting revenue data:', error);
    throw error;
  }
};

// Get most popular courses for admin dashboard
export const getPopularCourses = async (limit: number = 5) => {
  try {
    // In a real implementation, we would query Firestore
    // For now, return mock data until we have real data
    return [
      { id: 'course1', title: 'French for Beginners - A1', enrollments: 42, level: 'A1', instructor: 'Marie Laurent' },
      { id: 'course2', title: 'Elementary French - A2', enrollments: 35, level: 'A2', instructor: 'Jean Dupont' },
      { id: 'course3', title: 'Intermediate French - B1', enrollments: 28, level: 'B1', instructor: 'Sophie Renaud' },
      { id: 'course4', title: 'Business French for Professionals', enrollments: 24, level: 'B2', instructor: 'Pierre Moreau' },
      { id: 'course5', title: 'French Conversation Practice', enrollments: 22, level: 'B1', instructor: 'Isabelle Clement' }
    ];
  } catch (error) {
    console.error('Error getting popular courses:', error);
    throw error;
  }
};

// Get recent activities for admin dashboard
export const getRecentActivities = async (limit: number = 10) => {
  try {
    // In a real implementation, we would query Firestore
    // For now, return mock data until we have real data
    return [
      { type: 'enrollment', userId: 'user1', userName: 'John Smith', courseId: 'course1', courseName: 'French for Beginners - A1', timestamp: subDays(new Date(), 1).toISOString() },
      { type: 'course_completion', userId: 'user2', userName: 'Emily Johnson', courseId: 'course3', courseName: 'Intermediate French - B1', timestamp: subDays(new Date(), 2).toISOString() },
      { type: 'payment', userId: 'user3', userName: 'Daniel Lee', courseId: 'course2', courseName: 'Elementary French - A2', amount: 199, timestamp: subDays(new Date(), 2).toISOString() },
      { type: 'enrollment', userId: 'user4', userName: 'Sophia Garcia', courseId: 'course4', courseName: 'Business French for Professionals', timestamp: subDays(new Date(), 3).toISOString() },
      { type: 'quiz_completion', userId: 'user5', userName: 'James Wilson', courseId: 'course1', courseName: 'French for Beginners - A1', score: 92, timestamp: subDays(new Date(), 3).toISOString() },
      { type: 'certificate_issued', userId: 'user6', userName: 'Olivia Martinez', courseId: 'course2', courseName: 'Elementary French - A2', timestamp: subDays(new Date(), 4).toISOString() },
      { type: 'enrollment', userId: 'user7', userName: 'William Anderson', courseId: 'course5', courseName: 'French Conversation Practice', timestamp: subDays(new Date(), 4).toISOString() },
      { type: 'payment', userId: 'user8', userName: 'Ava Thomas', courseId: 'course1', courseName: 'French for Beginners - A1', amount: 199, timestamp: subDays(new Date(), 5).toISOString() },
      { type: 'quiz_completion', userId: 'user9', userName: 'Michael Brown', courseId: 'course3', courseName: 'Intermediate French - B1', score: 86, timestamp: subDays(new Date(), 5).toISOString() },
      { type: 'course_completion', userId: 'user10', userName: 'Emma Davis', courseId: 'course2', courseName: 'Elementary French - A2', timestamp: subDays(new Date(), 6).toISOString() }
    ];
  } catch (error) {
    console.error('Error getting recent activities:', error);
    throw error;
  }
};

// Function to get student statistics by level
export const getStudentLevelDistribution = async () => {
  try {
    // Mock data for now
    return [
      { level: 'A1', count: 48 },
      { level: 'A2', count: 36 },
      { level: 'B1', count: 26 },
      { level: 'B2', count: 18 },
      { level: 'C1', count: 8 },
      { level: 'C2', count: 4 }
    ];
  } catch (error) {
    console.error('Error getting student level distribution:', error);
    throw error;
  }
};

