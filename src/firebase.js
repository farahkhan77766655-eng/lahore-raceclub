// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc } from "firebase/firestore";

// Paste your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyAgMhncW-5aatQYICwJ0vNgEClZPeZdmjs",
  authDomain: "lahore-race-club-e22b4.firebaseapp.com",
  databaseURL: "https://lahore-race-club-e22b4-default-rtdb.firebaseio.com",
  projectId: "lahore-race-club-e22b4",
  storageBucket: "lahore-race-club-e22b4.firebasestorage.app",
  messagingSenderId: "338332055579",
  appId: "1:338332055579:web:bc89c06380358c9310a0be"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export Firestore functions
export { db, collection, getDocs, setDoc, doc, updateDoc };
