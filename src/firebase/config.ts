/**
 * Firebase Configuration
 * 
 * Note: While Firebase API keys are intended to be public for client-side use,
 * GitHub's security scanners often flag them. We use environment variables
 * to keep the configuration clean and satisfy security rules.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC4WPVA6tvaFc1pnc2JRp3OTD3GLIW77-0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-8837636834-85102.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-8837636834-85102",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-8837636834-85102.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "165495298092",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:165495298092:web:a2af86cfd1502f5241d989"
};
