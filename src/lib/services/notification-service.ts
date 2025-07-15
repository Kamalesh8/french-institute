import { db } from '@/config/firebase';
import type { Notification } from '@/lib/types';
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
  serverTimestamp
} from 'firebase/firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';

// Create a new notification
export const createNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
  try {
    const newNotification = {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp()
    };

    const notificationRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), newNotification);

    return {
      id: notificationRef.id,
      ...newNotification,
      createdAt: new Date().toISOString()
    } as Notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get a single notification by ID
export const getNotificationById = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    const notificationSnap = await getDoc(notificationRef);

    if (notificationSnap.exists()) {
      const data = notificationSnap.data();
      return {
        id: notificationSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt
      } as Notification;
    }

    return null;
  } catch (error) {
    console.error('Error fetching notification:', error);
    throw error;
  }
};

// Get all notifications for a user
export const getUserNotifications = async (userId: string, options?: {
  limit?: number;
  onlyUnread?: boolean;
}) => {
  try {
    const { limit: limitCount = 50, onlyUnread = false } = options || {};

    let notificationsQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (onlyUnread) {
      notificationsQuery = query(
        notificationsQuery,
        where('read', '==', false)
      );
    }

    notificationsQuery = query(
      notificationsQuery,
      limit(limitCount)
    );

    const querySnapshot = await getDocs(notificationsQuery);
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt
      } as Notification);
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, { read: true });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications for a user as read
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const unreadQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(unreadQuery);

    const updates = querySnapshot.docs.map((doc) => {
      const notificationRef = doc.ref;
      return updateDoc(notificationRef, { read: true });
    });

    await Promise.all(updates);

    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await deleteDoc(notificationRef);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Delete all notifications for a user
export const deleteAllUserNotifications = async (userId: string) => {
  try {
    const userNotificationsQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(userNotificationsQuery);

    const deletions = querySnapshot.docs.map((doc) => {
      return deleteDoc(doc.ref);
    });

    await Promise.all(deletions);

    return true;
  } catch (error) {
    console.error('Error deleting all user notifications:', error);
    throw error;
  }
};

// Get unread notification count for a user
export const getUnreadNotificationCount = async (userId: string) => {
  try {
    const unreadQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(unreadQuery);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    throw error;
  }
};

// Create a course announcement notification for all enrolled students
export const createCourseAnnouncement = async (
  courseId: string,
  title: string,
  message: string,
  enrolledUserIds: string[]
) => {
  try {
    const notifications = enrolledUserIds.map((userId) => {
      return createNotification({
        userId,
        type: 'course',
        title,
        message,
        link: `/courses/${courseId}`
      });
    });

    await Promise.all(notifications);

    return true;
  } catch (error) {
    console.error('Error creating course announcement:', error);
    throw error;
  }
};

// Create a system-wide announcement for all users
export const createSystemAnnouncement = async (
  title: string,
  message: string,
  userIds: string[]
) => {
  try {
    const notifications = userIds.map((userId) => {
      return createNotification({
        userId,
        type: 'system',
        title,
        message
      });
    });

    await Promise.all(notifications);

    return true;
  } catch (error) {
    console.error('Error creating system announcement:', error);
    throw error;
  }
};

// Create an assignment reminder notification
export const createAssignmentReminder = async (
  userId: string,
  courseId: string,
  assignmentId: string,
  courseName: string,
  assignmentName: string,
  dueDate: string
) => {
  try {
    await createNotification({
      userId,
      type: 'assignment',
      title: `Assignment Due: ${assignmentName}`,
      message: `Your assignment for ${courseName} is due on ${new Date(dueDate).toLocaleDateString()}. Don't forget to submit it!`,
      link: `/courses/${courseId}/assignments/${assignmentId}`
    });

    return true;
  } catch (error) {
    console.error('Error creating assignment reminder:', error);
    throw error;
  }
};

// Create a new message notification
export const createMessageNotification = async (
  recipientId: string,
  senderId: string,
  senderName: string,
  messageId: string
) => {
  try {
    await createNotification({
      userId: recipientId,
      type: 'message',
      title: `New Message from ${senderName}`,
      message: `You have received a new message from ${senderName}. Click to view.`,
      link: `/messages/${senderId}?message=${messageId}`
    });

    return true;
  } catch (error) {
    console.error('Error creating message notification:', error);
    throw error;
  }
};

