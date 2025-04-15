import { useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { useAuth } from '@/context/auth-context';

interface ProfileData {
  displayName: string;
  photoURL?: string;
  bio?: string;
  language?: {
    speaking: string;
    writing: string;
    listening: string;
    reading: string;
  };
  preferences?: {
    emailNotifications: boolean;
    lessonReminders: boolean;
  };
}

export const useProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = async () => {
    try {
      if (!user) throw new Error('No user logged in');
      
      setLoading(true);
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      return userDoc.data() as ProfileData;
    } catch (err) {
      setError('Failed to fetch profile');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<ProfileData>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      setLoading(true);
      const userDocRef = doc(db, 'users', user.uid);
      
      // Update Firestore document
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });

      // Update Firebase Auth profile if display name is changed
      if (data.displayName || data.photoURL) {
        await updateUserProfile(data.displayName, data.photoURL);
      }

      return true;
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePhoto = async (file: File) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      setLoading(true);
      const fileRef = ref(storage, `profile-photos/${user.uid}/${file.name}`);
      
      // Upload file to Firebase Storage
      await uploadBytes(fileRef, file);
      
      // Get download URL
      const photoURL = await getDownloadURL(fileRef);
      
      // Update profile with new photo URL
      await updateProfile({ photoURL });
      
      return photoURL;
    } catch (err) {
      setError('Failed to upload profile photo');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateLanguageProficiency = async (language: ProfileData['language']) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      setLoading(true);
      await updateProfile({ language });
      return true;
    } catch (err) {
      setError('Failed to update language proficiency');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationPreferences = async (preferences: ProfileData['preferences']) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      setLoading(true);
      await updateProfile({ preferences });
      return true;
    } catch (err) {
      setError('Failed to update notification preferences');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getProfile,
    updateProfile,
    uploadProfilePhoto,
    updateLanguageProficiency,
    updateNotificationPreferences,
  };
};
