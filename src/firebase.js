import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "billionaire-signals-b89c1",
  appId: "1:444624529760:web:4b1167b9be617c0e6e9605",
  storageBucket: "billionaire-signals-b89c1.firebasestorage.app",
  apiKey: "AIzaSyCNLBMWHipV59qJH2IMEP2dzNS4MyQNUnY",
  authDomain: "billionaire-signals-b89c1.firebaseapp.com",
  messagingSenderId: "444624529760",
  measurementId: "G-E9EYYJB0F9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
