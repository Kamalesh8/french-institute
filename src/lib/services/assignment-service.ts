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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Assignment, AssignmentSubmission } from "@/lib/types";

const ASSIGNMENTS_COLLECTION = "assignments";
const SUBMISSIONS_COLLECTION = "assignment_submissions";

export const createAssignment = async (
  assignmentData: Omit<Assignment, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const docRef = await addDoc(collection(db, ASSIGNMENTS_COLLECTION), {
      ...assignmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getAssignment = async (assignmentId: string) => {
  try {
    const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Assignment;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const getCourseAssignments = async (courseId: string) => {
  try {
    const q = query(
      collection(db, ASSIGNMENTS_COLLECTION),
      where("courseId", "==", courseId),
      orderBy("dueDate", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Assignment)
    );
  } catch (error) {
    throw error;
  }
};

export const updateAssignment = async (
  assignmentId: string,
  data: Partial<Assignment>
) => {
  try {
    const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteAssignment = async (assignmentId: string) => {
  try {
    await deleteDoc(doc(db, ASSIGNMENTS_COLLECTION, assignmentId));
  } catch (error) {
    throw error;
  }
};

export const submitAssignment = async (
  submissionData: Omit<AssignmentSubmission, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), {
      ...submissionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getAssignmentSubmission = async (
  assignmentId: string,
  userId: string
) => {
  try {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where("assignmentId", "==", assignmentId),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as AssignmentSubmission;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const getAllSubmissions = async (assignmentId: string) => {
  try {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where("assignmentId", "==", assignmentId),
      orderBy("submissionDate", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as AssignmentSubmission)
    );
  } catch (error) {
    throw error;
  }
};

export const gradeSubmission = async (
  submissionId: string,
  grade: number,
  feedback: string,
  gradedBy: string
) => {
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    await updateDoc(docRef, {
      grade,
      feedback,
      gradedBy,
      gradedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};
