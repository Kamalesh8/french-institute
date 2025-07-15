import { db, storage } from '@/config/firebase';
import type { Certificate } from '@/lib/types';
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
  Timestamp
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getUserById } from './user-service';
import { getCourseById } from './course-service';
import { getEnrollmentById, updateEnrollment } from './enrollment-service';

const CERTIFICATES_COLLECTION = 'certificates';

// Create a new certificate
export const createCertificate = async ({
  userId,
  courseId,
  enrollmentId
}: {
  userId: string;
  courseId: string;
  enrollmentId: string;
}) => {
  try {
    // Check if certificate already exists
    const existingCertificate = await getCertificateByUserAndCourse(userId, courseId);
    if (existingCertificate) {
      return existingCertificate;
    }

    // Get user, course, and enrollment data
    const [user, course, enrollment] = await Promise.all([
      getUserById(userId),
      getCourseById(courseId),
      getEnrollmentById(enrollmentId)
    ]);

    if (!user || !course || !enrollment) {
      throw new Error('User, course, or enrollment not found');
    }

    // Create certificate data
    const certificateData = {
      userId,
      courseId,
      enrollmentId,
      studentName: user.displayName || 'Student',
      courseName: course.title,
      courseLevel: course.level,
      issueDate: new Date().toISOString(),
      createdAt: serverTimestamp()
    };

    // Generate certificate URL
    const certificateId = `${userId}-${courseId}-${Date.now()}`;
    const certificateURL = await generateCertificateImage(certificateId, certificateData);

    // Save certificate to Firestore
    const newCertificate = {
      ...certificateData,
      certificateURL,
      certificateId
    };

    const certificateRef = await addDoc(collection(db, CERTIFICATES_COLLECTION), newCertificate);

    // Update enrollment with certificate information
    await updateEnrollment(enrollmentId, {
      certificate: certificateRef.id,
      certificateIssueDate: new Date().toISOString(),
      completionDate: new Date().toISOString(),
      status: 'completed'
    });

    return {
      id: certificateRef.id,
      ...newCertificate,
      createdAt: new Date().toISOString(),
    } as Certificate;
  } catch (error) {
    console.error('Error creating certificate:', error);
    throw error;
  }
};

// Get certificate by ID
export const getCertificateById = async (certificateId: string) => {
  try {
    const certificateRef = doc(db, CERTIFICATES_COLLECTION, certificateId);
    const certificateSnap = await getDoc(certificateRef);

    if (certificateSnap.exists()) {
      const data = certificateSnap.data();
      return {
        id: certificateSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Certificate;
    }

    return null;
  } catch (error) {
    console.error('Error fetching certificate:', error);
    throw error;
  }
};

// Get certificates for a user
export const getUserCertificates = async (userId: string) => {
  try {
    const q = query(
      collection(db, CERTIFICATES_COLLECTION),
      where('userId', '==', userId),
      orderBy('issueDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const certificates: Certificate[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      certificates.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Certificate);
    });

    return certificates;
  } catch (error) {
    console.error('Error fetching user certificates:', error);
    throw error;
  }
};

// Get certificate by user and course
export const getCertificateByUserAndCourse = async (userId: string, courseId: string) => {
  try {
    const q = query(
      collection(db, CERTIFICATES_COLLECTION),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
    } as Certificate;
  } catch (error) {
    console.error('Error fetching certificate by user and course:', error);
    throw error;
  }
};

// Check if user has completed a course and is eligible for certificate
export const isCertificateEligible = async (userId: string, courseId: string) => {
  try {
    // Get all enrollments for this user and course
    const q = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return false;
    }

    // Check if progress is 100% or status is 'completed'
    let isEligible = false;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.progress >= 100 || data.progressStatus === 'completed') {
        isEligible = true;
      }
    });

    return isEligible;
  } catch (error) {
    console.error('Error checking certificate eligibility:', error);
    throw error;
  }
};

// Generate certificate image (mock function for now)
const generateCertificateImage = async (certificateId: string, certificateData: any) => {
  try {
    // In a real implementation, this would generate an actual certificate image
    // For now, we'll just return a placeholder URL

    // This would be replaced with actual certificate generation code
    // For example, using a HTML template and converting it to an image
    // Then uploading to Firebase Storage

    // Mock upload to Firebase Storage
    const certificateRef = ref(storage, `certificates/${certificateId}.png`);

    // This is where we would upload the actual generated certificate
    // For now, just return a placeholder URL
    return `https://placehold.co/800x600/85368b/ffffff?text=Certificate+of+Completion%0A%0A${encodeURIComponent(certificateData.studentName)}%0A${encodeURIComponent(certificateData.courseName)}`;
  } catch (error) {
    console.error('Error generating certificate image:', error);
    throw error;
  }
};

// Get recent certificates (for admin dashboard)
export const getRecentCertificates = async (limit: number = 10) => {
  try {
    const q = query(
      collection(db, CERTIFICATES_COLLECTION),
      orderBy('issueDate', 'desc'),
      limit(limit)
    );

    const querySnapshot = await getDocs(q);
    const certificates: Certificate[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      certificates.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Certificate);
    });

    return certificates;
  } catch (error) {
    console.error('Error fetching recent certificates:', error);
    throw error;
  }
};

// Verify certificate by ID
export const verifyCertificate = async (certificateId: string) => {
  try {
    const certificate = await getCertificateById(certificateId);

    if (!certificate) {
      return { isValid: false, message: 'Certificate not found' };
    }

    return {
      isValid: true,
      message: 'Certificate is valid',
      certificate: {
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        courseLevel: certificate.courseLevel,
        issueDate: certificate.issueDate
      }
    };
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return { isValid: false, message: 'Error verifying certificate' };
  }
};

