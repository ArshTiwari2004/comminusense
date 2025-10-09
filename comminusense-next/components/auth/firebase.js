// firebase.js

import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyACqB_atpMYhvV0Kxs69dzlyornNkQqCzM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "comminusense.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "comminusense",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "comminusense.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "926131114381",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:926131114381:web:5bc994e53fc0f1f057edc4",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-WDW37NBKD5",
};

// ✅ Initialize Firebase (avoid re-initialization)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// ✅ Initialize Analytics (only on client side)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// ✅ Initialize Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ✅ Authentication functions
export const signInWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const signInWithGoogle = () =>
  signInWithPopup(auth, googleProvider);

export const signOut = () => fbSignOut(auth);

export { app, analytics };