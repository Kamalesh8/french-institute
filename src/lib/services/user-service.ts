﻿import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/config/firebase";
import type { User } from "@/lib/types";

export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, { displayName });

    // Create user document
    await setDoc(doc(db, "users", user.uid), {
      email,
      displayName,
      role: "student",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return user;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const auth = getFirebaseAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: "student",
        createdAt: new Date().toISOString(),
      });
    }

    return user;
  } catch (error) {
    throw error;
  }
};

export const signOut = async () => {
  try {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<User>) => {
  try {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();
    
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    if (auth.currentUser && data.displayName) {
      await updateProfile(auth.currentUser, { displayName: data.displayName });
    }
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const db = getFirestoreDb();
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return null;
    const userData = userDoc.data();
    return {
      uid: userData.uid || userDoc.id,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL || null,
      role: userData.role || 'student',
      createdAt: userData.createdAt || new Date().toISOString(),
      phoneNumber: userData.phoneNumber,
      address: userData.address,
      bio: userData.bio,
    } as User;
  } catch (error) {
    throw error;
  }
};

export const getUsersByRole = async (role: string): Promise<User[]> => {
  try {
    const db = getFirestoreDb();
    const q = query(collection(db, "users"), where("role", "==", role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const userData = doc.data();
      return {
        uid: userData.uid || doc.id,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL || null,
        role: userData.role || 'student',
        createdAt: userData.createdAt || new Date().toISOString(),
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        bio: userData.bio,
      } as User;
    });
  } catch (error) {
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: string) => {
  try {
    const db = getFirestoreDb();
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role, updatedAt: new Date().toISOString() });
  } catch (error) {
    throw error;
  }
};

