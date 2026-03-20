import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMTO770ME46jQCovZ-EEvV5FGJlb8YD0k",
  authDomain: "searchtop-laptop.firebaseapp.com",
  projectId: "searchtop-laptop",
  storageBucket: "searchtop-laptop.firebasestorage.app",
  messagingSenderId: "150051269213",
  appId: "1:150051269213:web:5d73c2f399dfa40c03fbb4",
  measurementId: "G-TD87JYBGF1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
