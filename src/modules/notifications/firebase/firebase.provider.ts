import { Provider } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin'
import { getMessaging } from 'firebase-admin/messaging';

export const FIREBASE_MESSAGING = 'FIREBASE_MESSAGING'

export const FirebaseProvider: Provider = {
  provide: FIREBASE_MESSAGING,
  useFactory: () => {
    const app =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });

      return getMessaging(app);
  },
};