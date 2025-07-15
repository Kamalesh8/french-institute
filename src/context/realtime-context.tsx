"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import { getFirestoreDb } from "@/config/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import type { Message, Notification } from "@/lib/types";

interface RealtimeContextType {
  unreadMessages: number;
  unreadNotifications: number;
  latestMessage: Message | null;
  latestNotification: Notification | null;
  courseUpdates: any[];
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  const [courseUpdates, setCourseUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    let unsubscribeMessages = () => {};
    let unsubscribeNotifications = () => {};
    let unsubscribeEnrollments = () => {};

    try {
      const db = getFirestoreDb();
      
      // Subscribe to unread messages
      const messagesQuery = query(
        collection(db, "messages"),
        where("recipientId", "==", user.uid),
        where("read", "==", false),
        orderBy("createdAt", "desc")
      );

      unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        setUnreadMessages(snapshot.size);
        if (snapshot.docs[0]) {
          setLatestMessage({
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data(),
          } as Message);
        }
      });

      // Subscribe to unread notifications
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        where("read", "==", false),
        orderBy("createdAt", "desc")
      );

      unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        setUnreadNotifications(snapshot.size);
        if (snapshot.docs[0]) {
          setLatestNotification({
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data(),
          } as Notification);
        }
      });

      // Subscribe to course updates for enrolled courses
      const enrollmentsQuery = query(
        collection(db, "enrollments"),
        where("userId", "==", user.uid)
      );

      unsubscribeEnrollments = onSnapshot(enrollmentsQuery, (snapshot) => {
        const courseIds = snapshot.docs.map((doc) => doc.data().courseId);

        if (courseIds.length > 0) {
          const coursesQuery = query(
            collection(db, "course_updates"),
            where("courseId", "in", courseIds),
            orderBy("createdAt", "desc"),
            limit(10)
          );

          const unsubscribeCourses = onSnapshot(coursesQuery, (updateSnapshot) => {
            const updates = updateSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setCourseUpdates(updates);
          });

          return () => {
            unsubscribeCourses();
          };
        }
      });
    } catch (error) {
      console.error('Error setting up realtime listeners:', error);
    }

    return () => {
      unsubscribeMessages();
      unsubscribeNotifications();
      unsubscribeEnrollments();
    };
  }, [user]);

  return (
    <RealtimeContext.Provider
      value={{
        unreadMessages,
        unreadNotifications,
        latestMessage,
        latestNotification,
        courseUpdates,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
};

