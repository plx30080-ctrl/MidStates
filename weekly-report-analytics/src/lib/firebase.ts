import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBG6i96dj7ZkDDTHD5y6bG7q4LOipj_URg",
  authDomain: "midstatesreport.firebaseapp.com",
  projectId: "midstatesreport",
  storageBucket: "midstatesreport.firebasestorage.app",
  messagingSenderId: "933561658980",
  appId: "1:933561658980:web:961f5ea0fa465584963971",
  measurementId: "G-DKS17XPVKS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
