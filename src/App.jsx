// FIRESTORE-INTEGRATED App.jsx FOR MULTI-DEVICE LOGIN & PERSISTENCE
import { useState, useEffect, useRef } from "react";
import { db, collection, getDocs, setDoc, doc, updateDoc } from './firebase.js';

// ─── INITIAL DATA ─────────────────────────────────────────────
const ADMIN_CREDENTIALS = { username: "admin", password: "lrc2024" };

// ─── GLOBAL STYLES ─────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{background:#0a0a0f;color:#e8d5a3;font-family:'Rajdhani',sans-serif;}
  `}</style>
);

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [users, setUsers] = useState([]);
  const [races, setRaces] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('home');

  // Load users and races from Firestore on app start
  useEffect(() => {
    async function loadData() {
      const usersSnap = await getDocs(collection(db, 'users'));
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const racesSnap = await getDocs(collection(db, 'races'));
      setRaces(racesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    loadData();
  }, []);

  // Example: Register new user
  const handleRegister = async (username, password) => {
    if (!username || !password) return;
    if (users.find(u => u.username === username)) return;

    const newUser = { username, password, balance: 1000, bets: [], role: 'user' };
    const docRef = doc(collection(db, 'users'));
    await setDoc(docRef, newUser);
    setUsers([...users, { id: docRef.id, ...newUser }]);
  };

  // Example: Login
  const handleLogin = ({ username, password }, setErr) => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setCurrentUser({ username: 'admin', role: 'admin' });
      setView('dashboard');
      return;
    }
    const user = users.find(u => u.username === username && u.password === password);
    if (user) setCurrentUser(user);
    else setErr('Invalid username or password.');
  };

  // Sync currentUser with users updates
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      const updated = users.find(u => u.id === currentUser.id);
      if (updated) setCurrentUser(updated);
    }
  }, [users]);

  // Render login if no user
  if (!currentUser) return <><GlobalStyle />{/* Insert your LoginScreen component with handleLogin/handleRegister */}</>;

  const isAdmin = currentUser.role === 'admin';

  return (
    <>
      <GlobalStyle />
      <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
        {/* Insert your TopBar component */}
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {isAdmin && view === 'dashboard' && <>{/* AdminDashboard component with races and users */}</>}
          {isAdmin && view === 'races' && <>{/* AdminRaces component with races state */}</>}
          {isAdmin && view === 'users' && <>{/* AdminUsers component with users state */}</>}
          {!isAdmin && view === 'home' && <>{/* PlayerHome component with races and currentUser */}</>}
          {!isAdmin && view === 'my-bets' && <>{/* PlayerBets component with currentUser */}</>}
        </div>
      </div>
    </>
  );
}
