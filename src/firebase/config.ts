/**
 * Firebase Configuration
 * 
 * Note: While Firebase API keys are intended to be public for client-side use,
 * GitHub's security scanners often flag them. We use environment variables
 * to keep the configuration clean and satisfy security rules.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCbEgSXCCaUJW8tIj2RYvwoJp1HI8_R5To",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gemma-s-gulayan.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gemma-s-gulayan",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gemma-s-gulayan.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "124342894779",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:124342894779:web:45702df84df5a1c77f699e",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MBFPZDCKX6"
};
