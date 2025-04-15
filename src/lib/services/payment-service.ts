import { db } from '@/config/firebase';
import type { Payment } from '@/lib/types';
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
  serverTimestamp,
  Timestamp,
  limit
} from 'firebase/firestore';

const PAYMENTS_COLLECTION = 'payments';

// Create a new payment
export const createPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const newPayment = {
      ...paymentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Convert date strings to Firestore timestamps
    if (newPayment.paymentDate) {
      newPayment.paymentDate = Timestamp.fromDate(new Date(newPayment.paymentDate));
    }

    const paymentRef = await addDoc(collection(db, PAYMENTS_COLLECTION), newPayment);

    // Fetch the created payment to return
    const paymentDoc = await getDoc(paymentRef);
    if (paymentDoc.exists()) {
      const data = paymentDoc.data();
      return {
        id: paymentDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        paymentDate: data.paymentDate?.toDate?.() ? data.paymentDate.toDate().toISOString() : data.paymentDate,
      } as Payment;
    }

    return { id: paymentRef.id, ...paymentData } as Payment;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Get a payment by ID
export const getPaymentById = async (paymentId: string) => {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    const paymentSnap = await getDoc(paymentRef);

    if (paymentSnap.exists()) {
      const data = paymentSnap.data();
      return {
        id: paymentSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        paymentDate: data.paymentDate?.toDate?.() ? data.paymentDate.toDate().toISOString() : data.paymentDate,
      } as Payment;
    }

    return null;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
};

// Get all payments for a user
export const getUserPayments = async (userId: string) => {
  try {
    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const payments: Payment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      payments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        paymentDate: data.paymentDate?.toDate?.() ? data.paymentDate.toDate().toISOString() : data.paymentDate,
      } as Payment);
    });

    return payments;
  } catch (error) {
    console.error('Error fetching user payments:', error);
    throw error;
  }
};

// Get all payments for a course
export const getCoursePayments = async (courseId: string) => {
  try {
    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      where('courseId', '==', courseId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const payments: Payment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      payments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        paymentDate: data.paymentDate?.toDate?.() ? data.paymentDate.toDate().toISOString() : data.paymentDate,
      } as Payment);
    });

    return payments;
  } catch (error) {
    console.error('Error fetching course payments:', error);
    throw error;
  }
};

// Update a payment status (e.g., for refunds or payment completion)
export const updatePaymentStatus = async (paymentId: string, status: 'pending' | 'completed' | 'failed' | 'refunded') => {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);

    await updateDoc(paymentRef, {
      status,
      updatedAt: serverTimestamp()
    });

    return getPaymentById(paymentId);
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

// Get recent payments (for admin dashboard)
export const getRecentPayments = async (limit: number = 10) => {
  try {
    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const querySnapshot = await getDocs(q);
    const payments: Payment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      payments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        paymentDate: data.paymentDate?.toDate?.() ? data.paymentDate.toDate().toISOString() : data.paymentDate,
      } as Payment);
    });

    return payments;
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    throw error;
  }
};

// Get payment statistics for analytics
export const getPaymentStatistics = async () => {
  try {
    const allPaymentsQuery = query(collection(db, PAYMENTS_COLLECTION));
    const successfulPaymentsQuery = query(
      collection(db, PAYMENTS_COLLECTION),
      where('status', '==', 'completed')
    );
    const refundedPaymentsQuery = query(
      collection(db, PAYMENTS_COLLECTION),
      where('status', '==', 'refunded')
    );

    const [allPaymentsSnapshot, successfulPaymentsSnapshot, refundedPaymentsSnapshot] = await Promise.all([
      getDocs(allPaymentsQuery),
      getDocs(successfulPaymentsQuery),
      getDocs(refundedPaymentsQuery)
    ]);

    let totalRevenue = 0;
    successfulPaymentsSnapshot.forEach(doc => {
      const data = doc.data();
      totalRevenue += data.amount || 0;
    });

    let totalRefunded = 0;
    refundedPaymentsSnapshot.forEach(doc => {
      const data = doc.data();
      totalRefunded += data.amount || 0;
    });

    return {
      totalTransactions: allPaymentsSnapshot.size,
      successfulTransactions: successfulPaymentsSnapshot.size,
      refundedTransactions: refundedPaymentsSnapshot.size,
      totalRevenue,
      totalRefunded,
      netRevenue: totalRevenue - totalRefunded
    };
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    throw error;
  }
};
