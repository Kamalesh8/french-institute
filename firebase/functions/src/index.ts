import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const createUserRole = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();
  const rolesRef = db.collection('roles');
  
  // Set default role to 'user'
  await rolesRef.doc(user.uid).set({
    role: 'user'
  });
});
