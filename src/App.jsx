import { useState, useEffect, useRef } from "react";

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const ADMIN_CREDENTIALS = { username: "admin", password: "lrc2024" };

const initialUsers = [
  { id: 1, username: "ali_raza", password: "1234", balance: 5000, bets: [], role: "user" },
  { id: 2, username: "sara_khan", password: "1234", balance: 3000, bets: [], role: "user" },
];

const initialRaces = [
  {
    id: 1, name: "Race 1 - Golden Cup", status: "open", horses: [
      { id: 1, name: "Thunder Bolt", jockey: "Ahmed Ali", odds: 2.5, totalBets: 0 },
      { id: 2, name: "Desert Storm", jockey: "Bilal Khan", odds: 3.2, totalBets: 0 },
      { id: 3, name: "Lahore Pride", jockey: "Kamran Shah", odds: 4.0, totalBets: 0 },
      { id: 4, name: "Punjab Star", jockey: "Farhan Malik", odds: 5.5, totalBets: 0 },
    ],
    winner: null, place: null, handicapImg: null,
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function calcOdds(horse, allHorses) {
  const total = allHorses.reduce((s, h) => s + h.totalBets, 0);
  if (total === 0 || horse.totalBets === 0) return horse.odds;
  const implied = horse.totalBets / total;
  return Math.max(1.1, +(1 / implied * 0.85).toFixed(2));
}

// ─── FONTS & GLOBAL CSS ───────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{background:#0a0a0f;color:#e8d5a3;font-family:'Rajdhani',sans-serif;}
    ::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:#111;}::-webkit-scrollbar-thumb{background:#8b6914;border-radius:3px;}
    .gold{color:#d4a017;}
    .playfair{font-family:'Playfair Display',serif;}
    input,select,textarea{font-family:'Rajdhani',sans-serif;}
    button{cursor:pointer;font-family:'Rajdhani',sans-serif;}
  `}</style>
);

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function TopBar({ view, setView, currentUser, onLogout }) {
  return (
    <div style={{ background: "linear-gradient(90deg,#1a0e00,#2d1a00,#1a0e00)", borderBottom: "2px solid #8b6914", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 28 }}>🏇</span>
        <span className="playfair gold" style={{ fontSize: 20, letterSpacing: 1 }}>Lahore Race Club</span>
      </div>
      {currentUser && (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {currentUser.role === "admin" ? (
            <>
              {["dashboard", "races", "users", "live"].map(v => (
                <button key={v} onClick={() => setView(v)} style={{ background: view === v ? "#8b6914" : "transparent", border: "1px solid #8b6914", color: "#e8d5a3", padding: "6px 14px", borderRadius: 4, fontSize: 13, textTransform: "capitalize" }}>{v === "live" ? "📺 Live Stream" : v.charAt(0).toUpperCase() + v.slice(1)}</button>
              ))}
            </>
          ) : (
            <>
              {["home", "my-bets", "live"].map(v => (
                <button key={v} onClick={() => setView(v)} style={{ background: view === v ? "#8b6914" : "transparent", border: "1px solid #8b6914", color: "#e8d5a3", padding: "6px 14px", borderRadius: 4, fontSize: 13, textTransform: "capitalize" }}>{v === "live" ? "📺 Live" : v === "my-bets" ? "My Bets" : "Home"}</button>
              ))}
            </>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8, padding: "4px 12px", background: "#1a1000", border: "1px solid #5a4000", borderRadius: 20 }}>
            <span style={{ fontSize: 13, color: "#aaa" }}>{currentUser.username}</span>
            {currentUser.role !== "admin" && <span className="gold" style={{ fontSize: 13, fontWeight: 700 }}>PKR {currentUser.balance?.toLocaleString()}</span>}
          </div>
          <button onClick={onLogout} style={{ background: "#3a0000", border: "1px solid #8b0000", color: "#ff8888", padding: "6px 12px", borderRadius: 4, fontSize: 12 }}>Logout</button>
        </div>
      )}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at center, #1a0e00 0%, #0a0600 60%, #050300 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 380, background: "linear-gradient(145deg,#1a1000,#0f0a00)", border: "1px solid #8b6914", borderRadius: 16, padding: 40, boxShadow: "0 0 60px rgba(139,105,20,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>🏇</div>
          <h1 className="playfair gold" style={{ fontSize: 28 }}>Lahore Race Club</h1>
          <p style={{ color: "#888", fontSize: 13, marginTop: 6 }}>Premium Horse Racing & Betting</p>
        </div>
        {err && <div style={{ background: "#3a0000", border: "1px solid #ff4444", color: "#ff8888", padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: 13 }}>{err}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Username" style={{ background: "#0f0a00", border: "1px solid #5a4000", color: "#e8d5a3", padding: "12px 16px", borderRadius: 8, fontSize: 15, outline: "none" }} />
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" onKeyDown={e => e.key === "Enter" && onLogin(form, setErr)} style={{ background: "#0f0a00", border: "1px solid #5a4000", color: "#e8d5a3", padding: "12px 16px", borderRadius: 8, fontSize: 15, outline: "none" }} />
          <button onClick={() => onLogin(form, setErr)} style={{ background: "linear-gradient(90deg,#8b6914,#d4a017,#8b6914)", border: "none", color: "#000", padding: "14px", borderRadius: 8, fontSize: 16, fontWeight: 700, marginTop: 4, letterSpacing: 1 }}>ENTER THE TRACK</button>
        </div>
        <p style={{ color: "#555", fontSize: 11, textAlign: "center", marginTop: 20 }}>Admin: admin / lrc2024 &nbsp;|&nbsp; Demo: ali_raza / 1234</p>
      </div>
    </div>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ background: "linear-gradient(145deg,#1a1200,#0f0c00)", border: "1px solid #3a2800", borderRadius: 12, padding: 20, ...style }}>{children}</div>;
}

function StatCard({ icon, label, value, color = "#d4a017" }) {
  return (
    <Card style={{ textAlign: "center", flex: 1 }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{label}</div>
    </Card>
  );
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
function AdminDashboard({ races, users }) {
  const totalBets = users.reduce((s, u) => s + u.bets.length, 0);
  const totalBalance = users.reduce((s, u) => s + u.balance, 0);
  return (
    <div style={{ padding: 24 }}>
      <h2 className="playfair gold" style={{ fontSize: 24, marginBottom: 20 }}>Dashboard Overview</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard icon="🏇" label="Total Races" value={races.length} />
        <StatCard icon="👥" label="Registered Users" value={users.length} />
        <StatCard icon="🎯" label="Total Bets Placed" value={totalBets} />
        <StatCard icon="💰" label="Total Balance (PKR)" value={totalBalance.toLocaleString()} color="#4caf50" />
      </div>
      <Card>
        <h3 style={{ color: "#d4a017", marginBottom: 14, fontSize: 16 }}>Recent Activity</h3>
        {users.flatMap(u => u.bets.map(b => ({ ...b, username: u.username }))).slice(-6).reverse().map((b, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #2a1a00", fontSize: 13 }}>
            <span style={{ color: "#aaa" }}>{b.username}</span>
            <span>{b.raceName} - <span className="gold">{b.horseName}</span></span>
            <span style={{ color: "#4caf50" }}>PKR {b.amount}</span>
            <span style={{ color: b.betType === "win" ? "#64b5f6" : "#ff9800" }}>{b.betType?.toUpperCase()}</span>
            <span style={{ color: b.status === "won" ? "#4caf50" : b.status === "lost" ? "#f44336" : "#aaa" }}>{b.status || "pending"}</span>
          </div>
        ))}
        {users.flatMap(u => u.bets).length === 0 && <p style={{ color: "#555", fontSize: 13 }}>No bets placed yet.</p>}
      </Card>
    </div>
  );
}

// ─── ADMIN RACES ─────────────────────────────────────────────────────────────
function AdminRaces({ races, setRaces }) {
  const [activeRace, setActiveRace] = useState(null);
  const [newHorse, setNewHorse] = useState({ name: "", jockey: "", odds: "" });
  const [newRaceName, setNewRaceName] = useState("");
  const [resultForm, setResultForm] = useState({ winner: "", place: "" });
  const [handicapPreview, setHandicapPreview] = useState({});
  const fileRefs = useRef({});

  const addRace = () => {
    if (!newRaceName.trim()) return;
    const race = { id: Date.now(), name: newRaceName, status: "open", horses: [], winner: null, place: null, handicapImg: null };
    setRaces(r => [...r, race]);
    setNewRaceName("");
  };

  const addHorse = (raceId) => {
    if (!newHorse.name || !newHorse.odds) return;
    setRaces(r => r.map(race => race.id === raceId ? { ...race, horses: [...race.horses, { id: Date.now(), name: newHorse.name, jockey: newHorse.jockey, odds: parseFloat(newHorse.odds), totalBets: 0 }] } : race));
    setNewHorse({ name: "", jockey: "", odds: "" });
  };

  const deleteHorse = (raceId, horseId) => {
    setRaces(r => r.map(race => race.id === raceId ? { ...race, horses: race.horses.filter(h => h.id !== horseId) } : race));
  };

  const setResult = (raceId) => {
    setRaces(r => r.map(race => race.id === raceId ? { ...race, status: "finished", winner: resultForm.winner, place: resultForm.place } : race));
    setResultForm({ winner: "", place: "" });
  };

  const handleHandicap = (raceId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const imgData = ev.target.result;
      setHandicapPreview(p => ({ ...p, [raceId]: imgData }));
      // Parse race/horse names from filename pattern: "Race1-Horse1,Horse2,Horse3.jpg"
      const fname = file.name.replace(/\.[^/.]+$/, "");
      const parts = fname.split("-");
      if (parts.length >= 2) {
        const horseNames = parts[1].split(",").map(s => s.trim()).filter(Boolean);
        if (horseNames.length > 0) {
          setRaces(r => r.map(race => {
            if (race.id !== raceId) return race;
            const newHorses = horseNames.map((name, i) => ({ id: Date.now() + i, name, jockey: "TBD", odds: +(2 + i * 0.8).toFixed(1), totalBets: 0 }));
            return { ...race, horses: newHorses, handicapImg: imgData };
          }));
        } else {
          setRaces(r => r.map(race => race.id === raceId ? { ...race, handicapImg: imgData } : race));
        }
      } else {
        setRaces(r => r.map(race => race.id === raceId ? { ...race, handicapImg: imgData } : race));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 className="playfair gold" style={{ fontSize: 24, marginBottom: 20 }}>Race Management</h2>
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ color: "#d4a017", marginBottom: 12, fontSize: 15 }}>➕ Create New Race</h3>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={newRaceName} onChange={e => setNewRaceName(e.target.value)} placeholder="Race Name (e.g. Race 2 - Silver Cup)" style={inputStyle} />
          <button onClick={addRace} style={btnGold}>Create Race</button>
        </div>
      </Card>

      {races.map(race => (
        <Card key={race.id} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <h3 className="playfair" style={{ color: "#d4a017", fontSize: 18 }}>{race.name}</h3>
              <span style={{ fontSize: 12, color: race.status === "open" ? "#4caf50" : race.status === "finished" ? "#f44336" : "#ff9800", background: "#1a1000", padding: "2px 8px", borderRadius: 10 }}>
                {race.status === "open" ? "🟢 Open" : race.status === "finished" ? "🔴 Finished" : "🟡 " + race.status}
              </span>
            </div>
            <button onClick={() => setActiveRace(activeRace === race.id ? null : race.id)} style={{ ...btnOutline, fontSize: 12 }}>{activeRace === race.id ? "Collapse ▲" : "Manage ▼"}</button>
          </div>

          {/* Horses Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #3a2800" }}>
                  {["#", "Horse Name", "Jockey", "Base Odds", "Live Odds", "Total Bets", "Action"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", color: "#8b6914", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {race.horses.map((horse, i) => (
                  <tr key={horse.id} style={{ borderBottom: "1px solid #1a1000" }}>
                    <td style={{ padding: "8px 10px", color: "#888" }}>{i + 1}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 600 }}>{horse.name}</td>
                    <td style={{ padding: "8px 10px", color: "#aaa" }}>{horse.jockey}</td>
                    <td style={{ padding: "8px 10px", color: "#d4a017" }}>{horse.odds}x</td>
                    <td style={{ padding: "8px 10px", color: "#4caf50", fontWeight: 700 }}>{calcOdds(horse, race.horses).toFixed(2)}x</td>
                    <td style={{ padding: "8px 10px", color: "#aaa" }}>PKR {horse.totalBets.toLocaleString()}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <button onClick={() => deleteHorse(race.id, horse.id)} style={{ background: "#3a0000", border: "1px solid #8b0000", color: "#ff6666", padding: "3px 8px", borderRadius: 4, fontSize: 11 }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {activeRace === race.id && (
            <div style={{ marginTop: 16, borderTop: "1px solid #2a1a00", paddingTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Add Horse */}
              <div>
                <p style={{ color: "#8b6914", fontSize: 13, marginBottom: 8 }}>Add Horse</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input value={newHorse.name} onChange={e => setNewHorse({ ...newHorse, name: e.target.value })} placeholder="Horse Name" style={{ ...inputStyle, flex: 1 }} />
                  <input value={newHorse.jockey} onChange={e => setNewHorse({ ...newHorse, jockey: e.target.value })} placeholder="Jockey" style={{ ...inputStyle, flex: 1 }} />
                  <input value={newHorse.odds} onChange={e => setNewHorse({ ...newHorse, odds: e.target.value })} placeholder="Base Odds (e.g. 3.5)" style={{ ...inputStyle, width: 140 }} type="number" min="1.1" step="0.1" />
                  <button onClick={() => addHorse(race.id)} style={btnGold}>Add Horse</button>
                </div>
              </div>

              {/* Handicap Upload */}
              <div>
                <p style={{ color: "#8b6914", fontSize: 13, marginBottom: 8 }}>📋 Upload Handicap Card (auto-creates horses from filename: "RaceName-Horse1,Horse2.jpg")</p>
                <input type="file" accept="image/*" ref={el => fileRefs.current[race.id] = el} onChange={e => handleHandicap(race.id, e)} style={{ display: "none" }} />
                <button onClick={() => fileRefs.current[race.id]?.click()} style={btnOutline}>📤 Upload Handicap Image</button>
                {handicapPreview[race.id] && <img src={handicapPreview[race.id]} alt="Handicap" style={{ maxWidth: 400, marginTop: 10, borderRadius: 8, border: "1px solid #5a4000" }} />}
              </div>

              {/* Set Result */}
              {race.status !== "finished" && race.horses.length >= 2 && (
                <div>
                  <p style={{ color: "#8b6914", fontSize: 13, marginBottom: 8 }}>🏆 Set Race Result</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <select value={resultForm.winner} onChange={e => setResultForm({ ...resultForm, winner: e.target.value })} style={selectStyle}>
                      <option value="">1st Place (Win)</option>
                      {race.horses.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                    </select>
                    <select value={resultForm.place} onChange={e => setResultForm({ ...resultForm, place: e.target.value })} style={selectStyle}>
                      <option value="">2nd Place</option>
                      {race.horses.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                    </select>
                    <button onClick={() => setResult(race.id)} style={{ ...btnGold, background: "linear-gradient(90deg,#155215,#2e7d32)" }} disabled={!resultForm.winner || !resultForm.place}>
                      ✅ Declare Result
                    </button>
                  </div>
                </div>
              )}

              {race.status === "finished" && (
                <div style={{ background: "#0a1a0a", border: "1px solid #2e7d32", borderRadius: 8, padding: 12 }}>
                  <span style={{ color: "#4caf50" }}>🏆 Winner: <b>{race.winner}</b> &nbsp; 🥈 Place: <b>{race.place}</b></span>
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ─── ADMIN USERS ─────────────────────────────────────────────────────────────
function AdminUsers({ users, setUsers }) {
  const [newUser, setNewUser] = useState({ username: "", password: "", balance: "" });
  const [addBalForm, setAddBalForm] = useState({ userId: "", amount: "" });
  const [msg, setMsg] = useState("");

  const createUser = () => {
    if (!newUser.username || !newUser.password) return;
    const u = { id: Date.now(), ...newUser, balance: parseFloat(newUser.balance) || 0, bets: [], role: "user" };
    setUsers(us => [...us, u]);
    setNewUser({ username: "", password: "", balance: "" });
    setMsg("✅ User created successfully!");
    setTimeout(() => setMsg(""), 2500);
  };

  const addBalance = () => {
    const amt = parseFloat(addBalForm.amount);
    if (!addBalForm.userId || !amt || amt <= 0) return;
    setUsers(us => us.map(u => u.id === parseInt(addBalForm.userId) ? { ...u, balance: u.balance + amt } : u));
    setMsg(`✅ Balance added successfully!`);
    setAddBalForm({ userId: "", amount: "" });
    setTimeout(() => setMsg(""), 2500);
  };

  const deleteUser = (id) => setUsers(us => us.filter(u => u.id !== id));

  return (
    <div style={{ padding: 24 }}>
      <h2 className="playfair gold" style={{ fontSize: 24, marginBottom: 20 }}>User Management</h2>
      {msg && <div style={{ background: "#0a1a0a", border: "1px solid #2e7d32", color: "#4caf50", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{msg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <h3 style={{ color: "#d4a017", marginBottom: 12, fontSize: 15 }}>➕ Create New User</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} placeholder="Username" style={inputStyle} />
            <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Password" style={inputStyle} />
            <input type="number" value={newUser.balance} onChange={e => setNewUser({ ...newUser, balance: e.target.value })} placeholder="Initial Balance (PKR)" style={inputStyle} />
            <button onClick={createUser} style={btnGold}>Create User</button>
          </div>
        </Card>
        <Card>
          <h3 style={{ color: "#d4a017", marginBottom: 12, fontSize: 15 }}>💰 Add Balance to User</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <select value={addBalForm.userId} onChange={e => setAddBalForm({ ...addBalForm, userId: e.target.value })} style={selectStyle}>
              <option value="">Select User</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.username} (PKR {u.balance.toLocaleString()})</option>)}
            </select>
            <input type="number" value={addBalForm.amount} onChange={e => setAddBalForm({ ...addBalForm, amount: e.target.value })} placeholder="Amount to Add (PKR)" style={inputStyle} min="1" />
            <button onClick={addBalance} style={{ ...btnGold, background: "linear-gradient(90deg,#155215,#2e7d32)" }}>Add Balance</button>
          </div>
        </Card>
      </div>

      <Card>
        <h3 style={{ color: "#d4a017", marginBottom: 14, fontSize: 15 }}>All Users</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #3a2800" }}>
              {["ID", "Username", "Balance (PKR)", "Total Bets", "W/L", "Action"].map(h => (
                <th key={h} style={{ padding: "8px 10px", color: "#8b6914", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const won = u.bets.filter(b => b.status === "won").length;
              const lost = u.bets.filter(b => b.status === "lost").length;
              return (
                <tr key={u.id} style={{ borderBottom: "1px solid #1a1000" }}>
                  <td style={{ padding: "8px 10px", color: "#555" }}>#{u.id}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 600 }}>{u.username}</td>
                  <td style={{ padding: "8px 10px", color: "#4caf50", fontWeight: 700 }}>PKR {u.balance.toLocaleString()}</td>
                  <td style={{ padding: "8px 10px", color: "#aaa" }}>{u.bets.length}</td>
                  <td style={{ padding: "8px 10px" }}><span style={{ color: "#4caf50" }}>{won}W</span> / <span style={{ color: "#f44336" }}>{lost}L</span></td>
                  <td style={{ padding: "8px 10px" }}>
                    <button onClick={() => deleteUser(u.id)} style={{ background: "#3a0000", border: "1px solid #8b0000", color: "#ff6666", padding: "3px 8px", borderRadius: 4, fontSize: 11 }}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── LIVE STREAM ─────────────────────────────────────────────────────────────
function LiveStream({ isAdmin, races }) {
  const ytUrl = "https://www.youtube.com/@LahoreRaceClub/live";
  return (
    <div style={{ padding: 24 }}>
      <h2 className="playfair gold" style={{ fontSize: 24, marginBottom: 20 }}>📺 Live Stream – Lahore Race Club</h2>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 8 }}>
          <iframe
            src="https://www.youtube.com/embed/live_stream?channel=UCLahoreRaceClub&autoplay=1"
            title="Lahore Race Club Live"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 8 }}
          />
        </div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ background: "#c62828", color: "#fff", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>● LIVE</span>
          <span style={{ color: "#888", fontSize: 13 }}>Official Lahore Race Club YouTube Stream</span>
          <a href={ytUrl} target="_blank" rel="noreferrer" style={{ marginLeft: "auto", color: "#d4a017", fontSize: 12, textDecoration: "none" }}>Open in YouTube ↗</a>
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
        {races.filter(r => r.status === "open").map(r => (
          <Card key={r.id} style={{ borderColor: "#4caf50" }}>
            <div style={{ color: "#4caf50", fontSize: 12, marginBottom: 4 }}>🟢 OPEN NOW</div>
            <div className="playfair" style={{ color: "#d4a017", fontSize: 15 }}>{r.name}</div>
            <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>{r.horses.length} horses registered</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── PLAYER HOME ─────────────────────────────────────────────────────────────
function PlayerHome({ races, currentUser, setUsers }) {
  const [betForm, setBetForm] = useState({ raceId: "", horseId: "", betType: "win", amount: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });

  const openRaces = races.filter(r => r.status === "open");

  const placeBet = () => {
    const race = races.find(r => r.id === parseInt(betForm.raceId));
    const horse = race?.horses.find(h => h.id === parseInt(betForm.horseId));
    const amount = parseFloat(betForm.amount);
    if (!race || !horse || !amount || amount <= 0) return setMsg({ text: "Please fill all fields correctly.", type: "err" });
    if (amount > currentUser.balance) return setMsg({ text: "Insufficient balance!", type: "err" });

    setUsers(us => us.map(u => {
      if (u.id !== currentUser.id) return u;
      const newBet = { id: Date.now(), raceId: race.id, raceName: race.name, horseId: horse.id, horseName: horse.name, betType: betForm.betType, amount, odds: calcOdds(horse, race.horses), status: "pending", placedAt: new Date().toLocaleString() };
      return { ...u, balance: u.balance - amount, bets: [...u.bets, newBet] };
    }));

    // Update horse totalBets
    race.horses.find(h => h.id === horse.id).totalBets += amount;
    setMsg({ text: `✅ Bet placed on ${horse.name} (${betForm.betType.toUpperCase()}) for PKR ${amount}!`, type: "ok" });
    setBetForm({ raceId: "", horseId: "", betType: "win", amount: "" });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const selectedRace = races.find(r => r.id === parseInt(betForm.raceId));

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 className="playfair gold" style={{ fontSize: 24 }}>🏇 Place Your Bet</h2>
        <div style={{ background: "#1a1000", border: "1px solid #5a4000", borderRadius: 10, padding: "8px 20px", textAlign: "center" }}>
          <div style={{ color: "#888", fontSize: 12 }}>Your Balance</div>
          <div style={{ color: "#4caf50", fontSize: 22, fontWeight: 700 }}>PKR {currentUser.balance.toLocaleString()}</div>
        </div>
      </div>

      {msg.text && <div style={{ background: msg.type === "ok" ? "#0a1a0a" : "#1a0000", border: `1px solid ${msg.type === "ok" ? "#2e7d32" : "#8b0000"}`, color: msg.type === "ok" ? "#4caf50" : "#ff6666", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{msg.text}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <h3 style={{ color: "#d4a017", marginBottom: 16, fontSize: 16 }}>💎 Betting Slip</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelStyle}>Select Race</label>
              <select value={betForm.raceId} onChange={e => setBetForm({ ...betForm, raceId: e.target.value, horseId: "" })} style={selectStyle}>
                <option value="">-- Choose Race --</option>
                {openRaces.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            {selectedRace && (
              <div>
                <label style={labelStyle}>Select Horse</label>
                <select value={betForm.horseId} onChange={e => setBetForm({ ...betForm, horseId: e.target.value })} style={selectStyle}>
                  <option value="">-- Choose Horse --</option>
                  {selectedRace.horses.map(h => <option key={h.id} value={h.id}>{h.name} ({calcOdds(h, selectedRace.horses).toFixed(2)}x odds)</option>)}
                </select>
              </div>
            )}
            <div>
              <label style={labelStyle}>Bet Type</label>
              <div style={{ display: "flex", gap: 10 }}>
                {["win", "place"].map(t => (
                  <button key={t} onClick={() => setBetForm({ ...betForm, betType: t })}
                    style={{ flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${betForm.betType === t ? "#d4a017" : "#3a2800"}`, background: betForm.betType === t ? "#2a1a00" : "transparent", color: betForm.betType === t ? "#d4a017" : "#888", fontWeight: 700, fontSize: 14 }}>
                    {t === "win" ? "🥇 WIN" : "🥈 PLACE (2nd)"}
                  </button>
                ))}
              </div>
              <p style={{ color: "#666", fontSize: 11, marginTop: 5 }}>WIN = 1st place only &nbsp;|&nbsp; PLACE = 1st or 2nd place</p>
            </div>
            <div>
              <label style={labelStyle}>Bet Amount (PKR)</label>
              <input type="number" value={betForm.amount} onChange={e => setBetForm({ ...betForm, amount: e.target.value })} placeholder="Enter amount..." style={inputStyle} min="100" />
            </div>
            {betForm.amount && betForm.horseId && selectedRace && (() => {
              const h = selectedRace.horses.find(hh => hh.id === parseInt(betForm.horseId));
              const odds = h ? calcOdds(h, selectedRace.horses) : 0;
              const payout = betForm.betType === "place" ? odds * 0.4 : odds;
              const potential = +(parseFloat(betForm.amount) * payout).toFixed(0);
              return (
                <div style={{ background: "#0a1500", border: "1px solid #2e7d32", borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#888" }}>Odds:</span><span className="gold">{odds.toFixed(2)}x {betForm.betType === "place" ? "(×0.4 for place)" : ""}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, marginTop: 6 }}>
                    <span style={{ color: "#aaa" }}>Potential Win:</span><span style={{ color: "#4caf50" }}>PKR {potential.toLocaleString()}</span>
                  </div>
                </div>
              );
            })()}
            <button onClick={placeBet} style={{ ...btnGold, padding: "14px", fontSize: 16, marginTop: 4 }}>🎯 PLACE BET</button>
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {openRaces.map(race => (
            <Card key={race.id} style={{ borderColor: "#3a4000" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h4 className="playfair" style={{ color: "#d4a017", fontSize: 15 }}>{race.name}</h4>
                <span style={{ color: "#4caf50", fontSize: 11, background: "#0a1a0a", padding: "2px 8px", borderRadius: 8 }}>🟢 Open</span>
              </div>
              {race.handicapImg && <img src={race.handicapImg} alt="Handicap" style={{ width: "100%", borderRadius: 6, marginBottom: 8, border: "1px solid #3a2800" }} />}
              <table style={{ width: "100%", fontSize: 12 }}>
                <thead><tr style={{ borderBottom: "1px solid #2a1800" }}>
                  <th style={{ color: "#888", textAlign: "left", padding: "4px 6px" }}>Horse</th>
                  <th style={{ color: "#888", padding: "4px 6px" }}>Jockey</th>
                  <th style={{ color: "#8b6914", padding: "4px 6px" }}>Odds</th>
                </tr></thead>
                <tbody>{race.horses.map(h => (
                  <tr key={h.id} style={{ borderBottom: "1px solid #1a1000" }}>
                    <td style={{ padding: "5px 6px", fontWeight: 600 }}>{h.name}</td>
                    <td style={{ padding: "5px 6px", color: "#aaa", textAlign: "center" }}>{h.jockey}</td>
                    <td style={{ padding: "5px 6px", color: "#d4a017", fontWeight: 700, textAlign: "center" }}>{calcOdds(h, race.horses).toFixed(2)}x</td>
                  </tr>
                ))}</tbody>
              </table>
            </Card>
          ))}
          {openRaces.length === 0 && <Card><p style={{ color: "#555", textAlign: "center" }}>No open races right now. Check back soon!</p></Card>}
        </div>
      </div>
    </div>
  );
}

// ─── PLAYER BETS ─────────────────────────────────────────────────────────────
function PlayerBets({ currentUser }) {
  const bets = [...(currentUser.bets || [])].reverse();
  return (
    <div style={{ padding: 24 }}>
      <h2 className="playfair gold" style={{ fontSize: 24, marginBottom: 20 }}>My Bets History</h2>
      {bets.length === 0 ? <Card><p style={{ color: "#555", textAlign: "center", padding: 20 }}>You haven't placed any bets yet.</p></Card> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bets.map(b => {
            const isWon = b.status === "won";
            const isLost = b.status === "lost";
            const payout = b.betType === "place" ? b.odds * 0.4 : b.odds;
            return (
              <Card key={b.id} style={{ borderColor: isWon ? "#2e7d32" : isLost ? "#8b0000" : "#3a2800" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div className="playfair" style={{ color: "#d4a017", fontSize: 15 }}>{b.raceName}</div>
                    <div style={{ color: "#aaa", fontSize: 13, marginTop: 3 }}>{b.horseName} — <span style={{ color: b.betType === "win" ? "#64b5f6" : "#ff9800" }}>{b.betType?.toUpperCase()}</span></div>
                    <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>{b.placedAt}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, color: "#aaa" }}>Staked: <span style={{ color: "#e8d5a3" }}>PKR {b.amount.toLocaleString()}</span></div>
                    <div style={{ fontSize: 13, color: "#aaa" }}>Odds: <span className="gold">{b.odds?.toFixed(2)}x</span></div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4, color: isWon ? "#4caf50" : isLost ? "#f44336" : "#888" }}>
                      {isWon ? `+PKR ${(b.amount * payout).toFixed(0)}` : isLost ? `-PKR ${b.amount}` : "⏳ Pending"}
                    </div>
                  </div>
                  <div style={{ padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: isWon ? "#0a1a0a" : isLost ? "#1a0000" : "#1a1000", color: isWon ? "#4caf50" : isLost ? "#f44336" : "#d4a017", border: `1px solid ${isWon ? "#2e7d32" : isLost ? "#8b0000" : "#5a4000"}` }}>
                    {isWon ? "✅ WON" : isLost ? "❌ LOST" : "🎯 PENDING"}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const inputStyle = { background: "#0f0a00", border: "1px solid #5a4000", color: "#e8d5a3", padding: "10px 14px", borderRadius: 8, fontSize: 14, outline: "none", width: "100%" };
const selectStyle = { ...inputStyle };
const labelStyle = { display: "block", color: "#8b6914", fontSize: 12, marginBottom: 5, letterSpacing: 0.5 };
const btnGold = { background: "linear-gradient(90deg,#8b6914,#d4a017,#8b6914)", border: "none", color: "#000", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 700, letterSpacing: 0.5, whiteSpace: "nowrap" };
const btnOutline = { background: "transparent", border: "1px solid #8b6914", color: "#d4a017", padding: "8px 16px", borderRadius: 8, fontSize: 13 };

// ─── RESULT SETTLEMENT HOOK ───────────────────────────────────────────────────
function useSettlement(races, users, setUsers) {
  const settledRef = useRef(new Set());
  useEffect(() => {
    races.filter(r => r.status === "finished").forEach(race => {
      if (settledRef.current.has(race.id)) return;
      settledRef.current.add(race.id);
      setUsers(us => us.map(u => {
        let balance = u.balance;
        const updatedBets = u.bets.map(b => {
          if (b.raceId !== race.id || b.status !== "pending") return b;
          const payout = b.betType === "place" ? b.odds * 0.4 : b.odds;
          const isWin = b.betType === "win" && b.horseName === race.winner;
          const isPlace = b.betType === "place" && (b.horseName === race.winner || b.horseName === race.place);
          if (isWin || isPlace) {
            balance += +(b.amount * payout).toFixed(0);
            return { ...b, status: "won" };
          }
          return { ...b, status: "lost" };
        });
        return { ...u, balance, bets: updatedBets };
      }));
    });
  }, [races]);
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [users, setUsers] = useState(initialUsers);
  const [races, setRaces] = useState(initialRaces);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("home");

  useSettlement(races, users, setUsers);

  // Sync currentUser with users state
  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      const updated = users.find(u => u.id === currentUser.id);
      if (updated) setCurrentUser(updated);
    }
  }, [users]);

  const handleLogin = ({ username, password }, setErr) => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setCurrentUser({ username: "admin", role: "admin" });
      setView("dashboard");
      return;
    }
    const user = users.find(u => u.username === username && u.password === password);
    if (user) { setCurrentUser(user); setView("home"); }
    else setErr("Invalid username or password.");
  };

  if (!currentUser) return (<><GlobalStyle /><LoginScreen onLogin={handleLogin} /></>);

  const isAdmin = currentUser.role === "admin";

  return (
    <>
      <GlobalStyle />
      <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
        <TopBar view={view} setView={setView} currentUser={currentUser} onLogout={() => { setCurrentUser(null); setView("home"); }} />
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {isAdmin && view === "dashboard" && <AdminDashboard races={races} users={users} />}
          {isAdmin && view === "races" && <AdminRaces races={races} setRaces={setRaces} />}
          {isAdmin && view === "users" && <AdminUsers users={users} setUsers={setUsers} />}
          {view === "live" && <LiveStream isAdmin={isAdmin} races={races} />}
          {!isAdmin && view === "home" && <PlayerHome races={races} currentUser={currentUser} setUsers={setUsers} />}
          {!isAdmin && view === "my-bets" && <PlayerBets currentUser={currentUser} />}
        </div>
      </div>
    </>
  );
}
