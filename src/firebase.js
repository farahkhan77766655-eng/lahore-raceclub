// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // ← add this

// Your web app's Firebase configuration
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

// Initialize Realtime Database and export it
export const db = getDatabase(app);
