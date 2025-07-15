import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from '@next-auth/firebase-adapter';

import * as admin from 'firebase-admin';
import { cert, getApps, initializeApp } from 'firebase-admin/app';

// ─── Initialise Firebase Admin once ─────────────────────────────────────────────
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process
        .env
        .FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// ─── NextAuth config (Google only for now) ─────────────────────────────────────
export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  adapter: FirestoreAdapter(admin.firestore()),
  callbacks: {
    async session({ session, token, user }) {
      // Attach Firestore role document
      const uid = user ? user.id : token.id;
      const roleSnap = await admin.firestore().collection('roles').doc(uid).get();
      // Ensure session.user always exists
      session.user = session.user || {};
      session.user.id = uid;
      let firestoreRole;
      if (roleSnap.exists) {
        firestoreRole = roleSnap.data()?.role;
      } else {
        // Create a default role document for new users
        firestoreRole = 'student';
        try {
          await admin.firestore().collection('roles').doc(uid).set({ role: firestoreRole }, { merge: true });
        } catch (e) {
          console.warn('Unable to create default role document:', e);
        }
      }
      session.user.role = firestoreRole ?? user?.role ?? token.role ?? 'student';
      // Ensure a users document exists (or update basic fields)
      try {
        const userRef = admin.firestore().collection('users').doc(uid);
        const userSnap = await userRef.get();
        const now = admin.firestore.FieldValue.serverTimestamp();
        if (!userSnap.exists) {
          await userRef.set({
            uid,
            email: session.user.email ?? token.email ?? user?.email ?? null,
            displayName: session.user.name ?? user?.name ?? null,
            role: session.user.role,
            createdAt: now,
            updatedAt: now,
          });
        } else {
          await userRef.set({
            email: session.user.email ?? token.email ?? user?.email ?? null,
            displayName: session.user.name ?? user?.name ?? null,
            role: session.user.role,
            updatedAt: now,
          }, { merge: true });
        }
      } catch (e) {
        console.warn('Unable to create/update user document:', e);
      }
      // Pass the Firebase custom token to the browser so that it can sign in
      if (token && token.firebaseToken) {
        session.firebaseToken = token.firebaseToken;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Persist the user id / role on every request
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // Resolve role from Firestore (or default)
        try {
          const roleSnap = await admin.firestore().collection('roles').doc(user.id).get();
          token.role = roleSnap.exists ? roleSnap.data()?.role : 'student';
        } catch (e) {
          console.warn('Unable to fetch role in JWT callback:', e);
          token.role = 'student';
        }

        // ------------------------------------------------------------
        // IMPORTANT: create a Firebase custom token once per login.
        // ------------------------------------------------------------
        try {
          // The Firebase Admin SDK is already initialised above.
          // Include the user's role as a custom claim so that Firestore security
      // rules can rely on `request.auth.token.role` without requiring an extra
      // read from the `roles` collection.
      token.firebaseToken = await admin.auth().createCustomToken(token.id, { role: token.role });
        } catch (err) {
          console.error('Failed to generate Firebase custom token:', err);
        }
      }

      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };