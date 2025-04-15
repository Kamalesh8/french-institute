import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/config/firebase";
import type { Certificate } from "@/lib/types";
import { generateCertificatePDF } from "@/lib/utils/certificate-generator";

const CERTIFICATES_COLLECTION = "certificates";

export const generateCertificate = async (
  userId: string,
  courseId: string,
  userName: string,
  courseName: string
) => {
  try {
    // Generate PDF certificate
    const pdfBlob = await generateCertificatePDF(userName, courseName);
    
    // Upload to Firebase Storage
    const certificateRef = ref(
      storage,
      `certificates/${courseId}/${userId}/${new Date().getTime()}.pdf`
    );
    await uploadBytes(certificateRef, pdfBlob);
    
    // Get download URL
    const certificateURL = await getDownloadURL(certificateRef);
    
    // Create certificate record
    const certificateData = {
      userId,
      courseId,
      issueDate: new Date().toISOString(),
      certificateURL,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(
      collection(db, CERTIFICATES_COLLECTION),
      certificateData
    );
    
    return {
      id: docRef.id,
      ...certificateData,
    };
  } catch (error) {
    throw error;
  }
};

export const getCertificate = async (certificateId: string) => {
  try {
    const docRef = doc(db, CERTIFICATES_COLLECTION, certificateId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Certificate;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const getUserCertificates = async (userId: string) => {
  try {
    const q = query(
      collection(db, CERTIFICATES_COLLECTION),
      where("userId", "==", userId),
      orderBy("issueDate", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Certificate)
    );
  } catch (error) {
    throw error;
  }
};

export const getCourseCertificates = async (courseId: string) => {
  try {
    const q = query(
      collection(db, CERTIFICATES_COLLECTION),
      where("courseId", "==", courseId),
      orderBy("issueDate", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Certificate)
    );
  } catch (error) {
    throw error;
  }
};

export const verifyCertificate = async (certificateId: string) => {
  try {
    const certificate = await getCertificate(certificateId);
    if (!certificate) {
      return {
        valid: false,
        message: "Certificate not found",
      };
    }

    return {
      valid: true,
      certificate,
    };
  } catch (error) {
    throw error;
  }
};
