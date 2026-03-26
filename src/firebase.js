import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAgMhncW-5aatQYICwJ0vNgEClZPeZdmjs",
  authDomain: "lahore-race-club-e22b4.firebaseapp.com",
  projectId: "lahore-race-club-e22b4",
  storageBucket: "lahore-race-club-e22b4.firebasestorage.app",
  messagingSenderId: "338332055579",
  appId: "1:338332055579:web:bc89c06380358c9310a0be"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
