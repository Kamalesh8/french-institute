"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  updateDoc 
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { FirebaseError } from 'firebase/app';

// Import Firebase services
import { getFirebaseAuth, getFirestoreDb } from '@/config/firebase';

type UserRole = 'student' | 'teacher' | 'admin';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  photoURL?: string | null;
  emailVerified?: boolean;
  createdAt?: Date | any; // Allow Firestore Timestamp
  updatedAt?: Date | any; // Allow Firestore Timestamp
  lastLoginAt?: Date | any; // Allow Firestore Timestamp
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{user: UserData | null, credential: UserCredential}>;
  register: (email: string, password: string, displayName: string, role?: UserRole) => Promise<UserCredential>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Map Firebase user to our UserData type
  const mapFirebaseUser = useCallback(async (firebaseUser: FirebaseUser | null): Promise<UserData | null> => {
    if (!firebaseUser) return null;
    
    try {
      const { db } = getServices();
      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      } catch (error) {
        console.warn('Error fetching user document, using minimal user data:', error);
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL || null,
          role: 'student',
          emailVerified: firebaseUser.emailVerified,
          createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
          updatedAt: new Date(),
          lastLoginAt: new Date()
        };
      }
      
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || data.displayName || null,
          photoURL: firebaseUser.photoURL || data.photoURL || null,
          role: data.role || 'student',
          emailVerified: firebaseUser.emailVerified,
          createdAt: safeGetDate(data.createdAt),
          updatedAt: safeGetDate(data.updatedAt),
          lastLoginAt: safeGetDate(data.lastLoginAt)
        };
      } else {
        // Create user document if it doesn't exist
        const now = new Date();
        const newUser: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL || null,
          role: 'student',
          emailVerified: firebaseUser.emailVerified,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now
        };
        
        // Create initial user document
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newUser,
                      createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
        
                  });
        } catch (fireErr) {
          console.warn('Unable to create initial user document:', fireErr);
        }
        return newUser;
      }
    } catch (error) {
      console.error('Error mapping Firebase user:', error);
      return null;
    }
  }, []);

  // Set up auth state listener
  useEffect(() => {
    const { auth } = getServices();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser);
      try {
        if (firebaseUser) {
          // Build user data and fetch role from the separate roles collection
          let role: UserRole = 'student';
          try {
            const { db } = getServices();
            const roleSnap = await getDoc(doc(db, 'roles', firebaseUser.uid));
            if (roleSnap.exists()) {
              const data = roleSnap.data() as { role?: UserRole };
              if (data?.role) role = data.role;
            }
          } catch (err) {
            console.warn('Unable to fetch role document:', err);
          }

          const userData: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL || null,
            role,
            emailVerified: firebaseUser.emailVerified,
            createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
            updatedAt: new Date(),
            lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now())
          };
          setUser(userData);
          const tokenResult = await firebaseUser.getIdTokenResult();
          Cookies.set('auth-token', tokenResult.token, { expires: 7, path: '/' });
          Cookies.set('user-role', role, { expires: 7, path: '/' });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const safeGetDate = (date: any): Date => {
    if (date === undefined || date === null) {
      return new Date();
    }
    return typeof date.toDate === 'function' ? date.toDate() : new Date(date);
  };

  const login = async (email: string, password: string): Promise<{user: UserData | null, credential: UserCredential}> => {
    console.log('Login attempt with email:', email);
    const { auth, db } = getServices();
    
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user) {
        throw new Error('No user found with these credentials');
      }
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      
      // Update last login time; if the document doesn't exist yet, create/merge it.
      try {
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp()
        });
      } catch (err) {
        if (err instanceof FirebaseError && err.code === 'not-found') {
          await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
        } else if (err instanceof Error && err.message.includes('No document to update')) {
          // Fallback for emulator/legacy string error
          await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
        } else {
          throw err;
        }
      }
      
      // Build and return mapped user immediately so UI has data right after login
      const mappedUser = await mapFirebaseUser(userCredential.user);
      return { user: mappedUser, credential: userCredential };
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Failed to log in. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('wrong-password') || 
            error.message.includes('user-not-found')) {
          errorMessage = 'Invalid email or password.';
        } else if (error.message.includes('too-many-requests')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (error.message.includes('user-disabled')) {
          errorMessage = 'This account has been disabled.';
        }
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string, role: UserRole = 'student'): Promise<UserCredential> => {
    setLoading(true);
    
    try {
      const { auth, db } = getServices();
      
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user) {
        throw new Error('Failed to create user account');
      }
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        // ignore await so offline mode won't reject
      
        displayName,
        photoURL: null // Set to null initially, can be updated later
      });
      
      // Create user data object
      const now = new Date();
      const newUser: UserData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        displayName: displayName.trim(),
        photoURL: null, // Set to null initially, can be updated later
        role,
        emailVerified: userCredential.user.emailVerified,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now
      };
      
      // Attempt to create user document (skip errors when offline)
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          ...newUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        });
      } catch (fireErr) {
        console.warn('Unable to create user document:', fireErr);
      }
      
      // Remove manual state and cookie updates
      // The onAuthStateChanged listener will handle setting the user and cookies
      
      return userCredential;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('email-already-in-use')) {
          errorMessage = 'This email is already in use. Please use a different email or log in.';
        } else if (error.message.includes('weak-password')) {
          errorMessage = 'The password is too weak. Please use a stronger password.';
        } else if (error.message.includes('invalid-email')) {
          errorMessage = 'The email address is not valid.';
        }
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const { auth } = getServices();
    
    if (!auth.currentUser) {
      // If no user is logged in, just redirect to login
      router.push('/auth/login');
      return;
    }
    
    try {
      // Sign out from Firebase Auth
      await signOut(auth);
      
      // Clear local user state
      setUser(null);
      // Remove auth cookies
      Cookies.remove('auth-token', { path: '/' });
      Cookies.remove('user-role', { path: '/' });
      
      // Redirect to login page
      router.push('/auth/login');
      
      // Force a page reload to ensure all auth state is cleared
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to log out. Please try again.');
    }
  };

  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }): Promise<void> => {
    const { auth } = getServices();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    try {
      // Ensure we have the latest user data
      const userRef = doc(getFirestoreDb(), 'users', currentUser.uid);
      
      // Update Firebase Auth profile
      await updateProfile(currentUser, updates);
      
      // Update Firestore user document
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Convert Firestore timestamps to Date objects if needed
      const safeGetDate = (date: any): Date => {
        if (date === undefined || date === null) {
          return new Date();
        }
        return typeof date.toDate === 'function' ? date.toDate() : new Date(date);
      };

      // Update local state with the complete user data
      const updatedUser: UserData = {
        ...user, // replaced userData with user
        ...updates,
        updatedAt: new Date(),
        // Ensure required fields are preserved
        uid: currentUser.uid,
        email: currentUser.email || user?.email || null,
        role: user?.role || 'student',
        emailVerified: currentUser.emailVerified,
        createdAt: safeGetDate(user?.createdAt),
        lastLoginAt: safeGetDate(user?.lastLoginAt)
      };
      
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Export the auth context and hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to get Firebase services
const getServices = () => {
  try {
    // Skip if running on server
    if (typeof window === 'undefined') {
      throw new Error('Firebase services are not available on the server');
    }
    
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();
    
    if (!auth) {
      throw new Error('Firebase Auth is not properly initialized');
    }
    
    if (!db) {
      throw new Error('Firestore is not properly initialized');
    }
    
    return { auth, db };
  } catch (error) {
    console.error('Error getting Firebase services:', error);
    throw new Error('Failed to initialize Firebase services. Please check your configuration.');
  }
};

export default AuthProvider;

