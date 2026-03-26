import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore"; 

// ─── Firebase Config ──────────────────────────────────────────────────────────
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

// ─── Fonts & Global Styles ────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Barlow+Condensed:wght@300;400;600;700;800&family=Barlow:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

const gs = document.createElement("style");
gs.textContent = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#09090b;--bg2:#111109;--bg3:#1a1a14;--card:#13130e;
    --gold:#c9a84c;--gold2:#e8c97a;--gold3:#f5e4a0;
    --red:#c0392b;--green:#27ae60;--blue:#2471a3;
    --text:#e8e0cc;--muted:#7a7060;--border:#222218;--radius:4px;
  }
  body{background:var(--bg);color:var(--text);font-family:'Barlow',sans-serif;min-height:100vh}
  input,select,textarea{background:var(--bg3);border:1px solid var(--border);color:var(--text);
    padding:9px 13px;border-radius:var(--radius);font-family:'Barlow',sans-serif;
    font-size:13px;width:100%;outline:none;transition:border 0.2s}
  input:focus,select:focus{border-color:var(--gold)}
  button{cursor:pointer;font-family:'Barlow Condensed',sans-serif;letter-spacing:0.05em}
  select option{background:var(--bg3)}
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:var(--bg2)}
  ::-webkit-scrollbar-thumb{background:var(--gold);border-radius:3px}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  @keyframes livePulse{0%,100%{opacity:1}50%{opacity:0.35}}
  .fade-in{animation:fadeIn 0.3s ease both}
  .live-dot{width:8px;height:8px;border-radius:50%;background:#e74c3c;display:inline-block;animation:livePulse 1.2s ease-in-out infinite}
`;
document.head.appendChild(gs);

// ─── Firestore Helpers ────────────────────────────────────────────────────────
async function getUsers() {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function setUser(user) {
  await setDoc(doc(db, "users", String(user.id)), user);
}
async function updateUser(user) {
  await updateDoc(doc(db, "users", String(user.id)), user);
}
async function getRaces() {
  const snapshot = await getDocs(collection(db, "races"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function setRace(race) {
  await setDoc(doc(db, "races", String(race.id)), race);
}
async function updateRace(race) {
  await updateDoc(doc(db, "races", String(race.id)), race);
}

// ─── UI Components ────────────────────────────────────────────────────────────
function Btn({children,onClick,variant="gold",style={},disabled=false,size="md"}){
  const sz = {sm:{p:"5px 13px",fs:"11px"},md:{p:"9px 20px",fs:"13px"},lg:{p:"13px 30px",fs:"15px"}}[size];
  const vs = {
    gold:{background:"linear-gradient(135deg,#c9a84c,#e8c97a)",color:"#09090b"},
    red:{background:"#c0392b",color:"#fff"},
    ghost:{background:"transparent",color:"var(--gold)",border:"1px solid var(--gold)"},
    dark:{background:"var(--bg3)",color:"var(--text)",border:"1px solid var(--border)"},
    green:{background:"#27ae60",color:"#fff"},
    blue:{background:"#2471a3",color:"#fff"},
  };
  return <button onClick={disabled?undefined:onClick} style={{border:"none",borderRadius:2,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",transition:"all 0.2s",cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,padding:sz.p,fontSize:sz.fs,...vs[variant],...style}}>{children}</button>;
}

function Card({children,style={}}){return <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:6,padding:20,...style}}>{children}</div>}
function Badge({children,color="gold"}){
  const cs={gold:{bg:"#2a2310",t:"var(--gold)"},green:{bg:"#0d2416",t:"#27ae60"},red:{bg:"#2a0d0d",t:"#e74c3c"},muted:{bg:"var(--bg3)",t:"var(--muted)"}};
  const c=cs[color]||cs.gold;
  return <span style={{background:c.bg,color:c.t,padding:"3px 10px",borderRadius:2,fontSize:"10px",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"Barlow Condensed"}}>{children}</span>;
}
function Divider({label}){return <div style={{display:"flex",alignItems:"center",gap:12,margin:"16px 0"}}><div style={{flex:1,height:1,background:"var(--border)"}}/>{label&&<span style={{color:"var(--muted)",fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase"}}>{label}</span>}<div style={{flex:1,height:1,background:"var(--border)"}}/></div>}
function FI({label,value,onChange,type="text",placeholder,disabled=false}){
  return <div>{label&&<label style={{fontSize:10,color:"var(--muted)",letterSpacing:"0.15em",textTransform:"uppercase",display:"block",marginBottom:5}}>{label}</label>}<input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} style={disabled?{opacity:0.5,cursor:"not-allowed"}:{}}/></div>;
}
function SH({title,subtitle,noMargin,style={}}){
  return <div style={{marginBottom:noMargin?0:8,...style}}><h2 style={{fontFamily:"Playfair Display",fontSize:24,fontWeight:900,color:"var(--text)"}}>{title}</h2>{subtitle&&<p style={{color:"var(--muted)",fontSize:12,marginTop:3}}>{subtitle}</p>}</div>;
}
function Alert({text,type="ok"}){
  if(!text) return null;
  return <div style={{padding:"9px 14px",background:type==="ok"?"#0d2416":"#2a0d0d",border:`1px solid ${type==="ok"?"#27ae60":"#c0392b"}`,color:type==="ok"?"#27ae60":"#e74c3c",borderRadius:4,marginBottom:14,fontSize:12}}>{text}</div>;
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({user,onLogout,onNav,page}){
  const links = user?.role==="admin"
    ? [["dashboard","Dashboard"],["admin_races","Races"],["admin_users","Users"]]
    : [["races","Races"],["mybets","My Bets"]];
  return(
    <header style={{background:"#0d0d0a",borderBottom:"1px solid var(--border)",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:58,position:"sticky",top:0,zIndex:200}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontFamily:"Playfair Display",fontSize:20,fontWeight:900,color:"var(--gold)"}}>🏇 LRC</span>
        <div style={{width:1,height:26,background:"var(--border)"}}/>
        <span style={{fontFamily:"Barlow Condensed",fontSize:11,color:"var(--muted)",letterSpacing:"0.2em",textTransform:"uppercase"}}>Lahore Race Club</span>
      </div>
      {user&&(
        <nav style={{display:"flex",alignItems:"center",gap:4}}>
          {links.map(([k,l])=>(
            <button key={k} onClick={()=>onNav(k)} style={{background:page===k?"rgba(201,168,76,0.1)":"transparent",color:page===k?"var(--gold)":"var(--muted)",border:page===k?"1px solid rgba(201,168,76,0.2)":"1px solid transparent",padding:"5px 14px",borderRadius:2,fontSize:12,fontFamily:"Barlow Condensed",letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}>{l}</button>
          ))}
          <div style={{width:1,height:20,background:"var(--border)",margin:"0 6px"}}/>
          {user.role==="user"&&<span style={{fontFamily:"Barlow Condensed",fontSize:15,color:"var(--gold2)",marginRight:6}}>₨{user.balance.toLocaleString()}</span>}
          <span style={{fontSize:12,color:"var(--muted)",marginRight:6}}>{user.username}</span>
          <Badge color={user.role==="admin"?"red":"gold"}>{user.role}</Badge>
          <Btn onClick={onLogout} variant="ghost" size="sm" style={{marginLeft:6}}>Logout</Btn>
        </nav>
      )}
    </header>
  );
}

// ─── Rest of the App (AuthPage, RacesPage, MyBetsPage, etc.) ─────────────────────
// You can now replace all localStorage get/set calls with Firestore helpers (getUsers, setUser, updateUser, getRaces, setRace, updateRace)

// ─── Export db helpers for use in components ───────────────────────────────────
export {
  db,
  getUsers,
  setUser,
  updateUser,
  getRaces,
  setRace,
  updateRace,
  Btn, Card, Badge, Divider, FI, SH, Alert, Header
};
