import { db } from '@/config/firebase';
import type { Notification, NotificationType } from '@/lib/types';
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
  serverTimestamp,
} from 'firebase/firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';

// Create a new notification
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) => {
  const notificationRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    userId,
    type,
    title,
    message,
    link,
    read: false,
    createdAt: serverTimestamp(),
  });

  return notificationRef.id;
};

// Get all notifications for a user
export const getUserNotifications = async (userId: string, limit = 50) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limit)
  );

  const querySnapshot = await getDocs(q);
  const notifications: Notification[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    notifications.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
    } as Notification);
  });

  return notifications;
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId: string) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    where('read', '==', false)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(notificationRef, {
    read: true,
  });
  return true;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    where('read', '==', false)
  );

  const querySnapshot = await getDocs(q);
  const batch = [];

  querySnapshot.forEach((doc) => {
    batch.push(updateDoc(doc.ref, { read: true }));
  });

  await Promise.all(batch);
  return true;
};

// Delete a notification
export const deleteNotification = async (notificationId: string) => {
  await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
  return true;
};

// Delete all read notifications
export const deleteReadNotifications = async (userId: string) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    where('read', '==', true)
  );

  const querySnapshot = await getDocs(q);
  const batch = [];

  querySnapshot.forEach((doc) => {
    batch.push(deleteDoc(doc.ref));
  });

  await Promise.all(batch);
  return true;
};

// Create course-related notifications
export const createCourseNotification = async (
  courseId: string,
  type: NotificationType,
  title: string,
  message: string
) => {
  // Get all enrolled students
  const enrollmentsRef = collection(db, 'enrollments');
  const q = query(enrollmentsRef, where('courseId', '==', courseId));
  const enrollments = await getDocs(q);

  const notifications = enrollments.docs.map((doc) => {
    const userId = doc.data().userId;
    return createNotification(userId, type, title, message, `/courses/${courseId}`);
  });

  await Promise.all(notifications);
  return true;
};
