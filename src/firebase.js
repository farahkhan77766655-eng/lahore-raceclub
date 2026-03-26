import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAgMhncW-5aatQYICwJ0vNgEClZPeZdmjs",
  authDomain: "lahore-race-club-e22b4.firebaseapp.com",
  databaseURL: "https://lahore-race-club-e22b4-default-rtdb.firebaseio.com",
  projectId: "lahore-race-club-e22b4",
  storageBucket: "lahore-race-club-e22b4.appspot.com",
  messagingSenderId: "338332055579",
  appId: "1:338332055579:web:bc89c06380358c9310a0be"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
