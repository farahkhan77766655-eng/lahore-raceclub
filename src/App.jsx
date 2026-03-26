import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, setDoc, doc } from './firebase.js';

const ADMIN_CREDENTIALS = { username: "admin", password: "lrc2024" };

export default function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  // Load users from Firestore
  useEffect(() => {
    async function loadUsers() {
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    loadUsers();
  }, []);

  const handleLogin = () => {
    if(username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password){
      setCurrentUser({ username: "admin", role: "admin" });
      setMsg("Admin logged in!");
      return;
    }
    const user = users.find(u => u.username === username && u.password === password);
    if(user){
      setCurrentUser(user);
      setMsg("Login successful!");
    }else{
      setMsg("Invalid username or password.");
    }
  };

  const handleRegister = async () => {
    if(!username || !password) return setMsg("Fill username & password");
    if(users.find(u => u.username === username)) return setMsg("Username exists");

    const newUser = { username, password, balance: 1000, bets: [], role: "user" };
    const docRef = doc(collection(db, "users"));
    await setDoc(docRef, newUser);
    setUsers([...users, { id: docRef.id, ...newUser }]);
    setMsg("User registered!");
  };

  if(!currentUser){
    return (
      <div style={{ padding:50 }}>
        <h2>Lahore Race Club</h2>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleRegister}>Register</button>
        <p>{msg}</p>
      </div>
    )
  }

  return (
    <div style={{ padding:50 }}>
      <h2>Welcome {currentUser.username}</h2>
      <p>Role: {currentUser.role || "user"}</p>
      <button onClick={()=>setCurrentUser(null)}>Logout</button>
    </div>
  )
}
