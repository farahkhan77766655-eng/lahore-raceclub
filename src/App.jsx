// App.jsx
import { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, set, get, child, onValue } from "firebase/database";

// ─── ADMIN CREDENTIALS ─────────────────────────────────────────────
const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };

// ─── MAIN APP ──────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null); // logged in user
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState({ name: "", age: "" });
  const [usersData, setUsersData] = useState({});

  // ─── LOGIN FUNCTION ──────────────────────────────────────────────
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setUser({ username });
    } else {
      alert("Invalid credentials");
    }
  };

  // ─── LOGOUT FUNCTION ─────────────────────────────────────────────
  const handleLogout = () => setUser(null);

  // ─── SAVE USER TO FIREBASE ───────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age) return alert("Fill all fields");

    const newId = Date.now(); // simple unique ID
    await set(ref(db, "users/" + newId), formData);
    setFormData({ name: "", age: "" });
    alert("Saved to Firebase!");
  };

  // ─── FETCH USERS FROM FIREBASE ──────────────────────────────────
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        setUsersData(snapshot.val());
      } else {
        setUsersData({});
      }
    });
  }, []);

  // ─── RENDER ─────────────────────────────────────────────────────
  if (!user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ margin: "0.5rem" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ margin: "0.5rem" }}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Welcome, {user.username}</h2>
      <button onClick={handleLogout}>Logout</button>

      <hr style={{ margin: "1rem 0" }} />

      <h3>Add New User</h3>
      <form onSubmit={handleSave}>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ margin: "0.5rem" }}
        />
        <input
          type="number"
          placeholder="Age"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          style={{ margin: "0.5rem" }}
        />
        <button type="submit">Save</button>
      </form>

      <hr style={{ margin: "1rem 0" }} />

      <h3>All Users</h3>
      {Object.keys(usersData).length === 0 ? (
        <p>No users yet</p>
      ) : (
        <table border="1" cellPadding="5" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(usersData).map(([id, data]) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{data.name}</td>
                <td>{data.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
