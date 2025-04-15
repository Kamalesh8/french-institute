"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type UserCredential,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import Cookies from 'js-cookie';

type UserRole = 'student' | 'admin';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  photoURL?: string | null;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<UserCredential | null>;
  login: (email: string, password: string) => Promise<UserCredential | null>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  isDemoMode: boolean;
}

// Check if we're in demo mode
const isDemoMode = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('DEMO') ||
                  process.env.NEXT_PUBLIC_FIREBASE_API_KEY === undefined;

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In demo mode, set up a demo user after a short delay
    if (isDemoMode) {
      const timer = setTimeout(() => {
        // Set demo user
        const demoUser: UserData = {
          uid: 'demo-user-123',
          email: 'demo@example.com',
          displayName: 'Demo User',
          role: 'student',
          photoURL: null
        };

        setUser(demoUser);

        // Set demo cookies
        Cookies.set('auth-token', 'demo-token', { expires: 1 });
        Cookies.set('user-role', 'student', { expires: 1 });

        setLoading(false);
        console.log('Running in DEMO mode with simulated authentication');
      }, 1000);

      return () => clearTimeout(timer);
    }

    // Real Firebase auth
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch additional user info from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          let userData: UserData;

          if (userDoc.exists()) {
            const userDocData = userDoc.data();

            userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              role: userDocData.role || 'student',
            };

            // Set cookies for middleware
            Cookies.set('auth-token', await user.getIdToken(), { expires: 7 });
            Cookies.set('user-role', userData.role, { expires: 7 });
          } else {
            userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              role: 'student',
            };

            // Set cookies for middleware
            Cookies.set('auth-token', await user.getIdToken(), { expires: 7 });
            Cookies.set('user-role', 'student', { expires: 7 });
          }

          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Set basic user data from auth object
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'student',
          });
        }
      } else {
        setUser(null);
        // Remove cookies when signed out
        Cookies.remove('auth-token');
        Cookies.remove('user-role');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, name: string, role: UserRole = 'student') => {
    if (isDemoMode) {
      console.log('Demo mode: Simulating registration for:', email);
      // Simulate successful registration
      const demoUser: UserData = {
        uid: 'demo-user-' + Date.now(),
        email: email,
        displayName: name,
        role: role,
        photoURL: null
      };

      setUser(demoUser);

      // Set demo cookies
      Cookies.set('auth-token', 'demo-token', { expires: 1 });
      Cookies.set('user-role', role, { expires: 1 });

      return null;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update the user profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }

      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName: name,
        role,
        createdAt: new Date().toISOString(),
      });

      return userCredential;
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    if (isDemoMode) {
      console.log('Demo mode: Simulating login for:', email);
      // Simulate successful login
      const demoUser: UserData = {
        uid: 'demo-user-123',
        email: email,
        displayName: email.split('@')[0],
        role: 'student',
        photoURL: null
      };

      setUser(demoUser);

      // Set demo cookies
      Cookies.set('auth-token', 'demo-token', { expires: 1 });
      Cookies.set('user-role', 'student', { expires: 1 });

      return null;
    }

    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    // Remove cookies before signout
    Cookies.remove('auth-token');
    Cookies.remove('user-role');

    if (isDemoMode) {
      console.log('Demo mode: Simulating logout');
      setUser(null);
      return;
    }

    return signOut(auth);
  };

  const updateUserProfile = async (displayName?: string, photoURL?: string) => {
    if (isDemoMode) {
      console.log('Demo mode: Simulating profile update');
      if (user) {
        const updatedUser = {
          ...user,
          ...(displayName && { displayName }),
          ...(photoURL && { photoURL })
        };
        setUser(updatedUser);
      }
      return;
    }

    if (!auth.currentUser) throw new Error('No authenticated user');

    const updates: { displayName?: string; photoURL?: string } = {};
    if (displayName) updates.displayName = displayName;
    if (photoURL) updates.photoURL = photoURL;

    await updateProfile(auth.currentUser, updates);

    // Update Firestore user data
    if (Object.keys(updates).length > 0) {
      await setDoc(doc(db, 'users', auth.currentUser.uid), updates, { merge: true });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      register,
      login,
      logout,
      updateUserProfile,
      isDemoMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
