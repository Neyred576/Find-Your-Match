import * as admin from 'firebase-admin';

export const initializeFirebase = () => {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('Firebase Credentials not fully provided in .env. Firebase will not initialize.');
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    
    console.log('Firebase Admin SDK Initialized Successfully');
  } catch (error) {
    console.error('Firebase Initialization Error:', error);
  }
};

export const getFirestore = () => {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }
  return null;
};
