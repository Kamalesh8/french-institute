import { db } from '@/config/firebase';
import type { Message } from '@/lib/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';

const MESSAGES_COLLECTION = 'messages';
const CONVERSATIONS_COLLECTION = 'conversations';

// Create or get conversation ID
export const getConversationId = (userIds: string[]) => {
  return userIds.sort().join('_');
};

// Send a message
export const sendMessage = async (
  senderId: string,
  recipientId: string,
  content: string,
  courseId?: string,
  attachmentURLs?: string[]
) => {
  const conversationId = getConversationId([senderId, recipientId]);
  
  // Create message
  const messageRef = await addDoc(collection(db, MESSAGES_COLLECTION), {
    senderId,
    recipientId,
    courseId,
    content,
    attachmentURLs,
    read: false,
    conversationId,
    createdAt: serverTimestamp(),
  });

  // Update or create conversation
  const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  await updateDoc(conversationRef, {
    lastMessage: content,
    lastMessageAt: serverTimestamp(),
    participants: [senderId, recipientId],
    courseId,
  }, { merge: true });

  return messageRef.id;
};

// Get conversation messages
export const getConversationMessages = async (
  userId1: string,
  userId2: string,
  limit = 50
) => {
  const conversationId = getConversationId([userId1, userId2]);
  
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'desc'),
    limit(limit)
  );

  const querySnapshot = await getDocs(q);
  const messages: Message[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    messages.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
    } as Message);
  });

  return messages.reverse();
};

// Get user conversations
export const getUserConversations = async (userId: string) => {
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const conversations = [];

  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    const otherUserId = data.participants.find((id: string) => id !== userId);
    
    // Get other user's details
    const userDoc = await getDoc(doc(db, 'users', otherUserId));
    const userData = userDoc.data();

    conversations.push({
      id: doc.id,
      ...data,
      otherUser: {
        id: otherUserId,
        displayName: userData?.displayName,
        photoURL: userData?.photoURL,
      },
      lastMessageAt: data.lastMessageAt?.toDate?.() ? data.lastMessageAt.toDate().toISOString() : data.lastMessageAt,
    });
  }

  return conversations;
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('conversationId', '==', conversationId),
    where('recipientId', '==', userId),
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

// Get unread message count
export const getUnreadMessageCount = async (userId: string) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('recipientId', '==', userId),
    where('read', '==', false)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
};

// Subscribe to new messages
export const subscribeToMessages = (
  userId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('recipientId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Message);
    });
    callback(messages);
  });
};
