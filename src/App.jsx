import { useState, useEffect, useRef } from "react";

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

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_USERS = [
  {id:1,username:"admin",password:"admin123",role:"admin",balance:0,bets:[]},
  {id:2,username:"ahmed",password:"user123",role:"user",balance:5000,bets:[]},
  {id:3,username:"sara",password:"user123",role:"user",balance:3000,bets:[]},
];
const SEED_RACES = [
  {id:1,name:"Lahore Gold Cup",date:"2026-04-15",time:"15:00",status:"live",
   youtubeChannel:"@LahoreRaceClubofficial",customStreamUrl:"",
   horses:[
     {id:1,name:"Desert Storm",jockey:"Asif Khan",weight:"56kg",age:4,odds:2.5,autoOdds:true},
     {id:2,name:"Silk Road",jockey:"Raza Ali",weight:"54kg",age:5,odds:4.0,autoOdds:true},
     {id:3,name:"Punjab Pride",jockey:"Tariq Mehmood",weight:"55kg",age:3,odds:3.2,autoOdds:true},
     {id:4,name:"Shalimar Star",jockey:"Bilal Shah",weight:"57kg",age:6,odds:6.5,autoOdds:false},
   ],winner:null},
  {id:2,name:"Ravi River Stakes",date:"2026-04-20",time:"14:30",status:"upcoming",
   youtubeChannel:"@LahoreRaceClubofficial",customStreamUrl:"",
   horses:[
     {id:1,name:"Thunder Bolt",jockey:"Usman Javed",weight:"55kg",age:4,odds:1.8,autoOdds:true},
     {id:2,name:"Golden Hoof",jockey:"Kamran Akber",weight:"56kg",age:5,odds:5.5,autoOdds:true},
     {id:3,name:"Mughal King",jockey:"Faisal Noon",weight:"54kg",age:3,odds:3.8,autoOdds:false},
   ],winner:null},
  {id:3,name:"Spring Classic",date:"2026-03-10",time:"16:00",status:"finished",
   youtubeChannel:"",customStreamUrl:"",
   horses:[
     {id:1,name:"Zephyr Wind",jockey:"Ali Hassan",weight:"55kg",age:4,odds:3.0,autoOdds:false},
     {id:2,name:"Champion's Run",jockey:"Saeed Iqbal",weight:"54kg",age:5,odds:2.2,autoOdds:false},
     {id:3,name:"Royal Lahore",jockey:"Naeem Baig",weight:"56kg",age:3,odds:4.5,autoOdds:false},
   ],winner:2},
];

// ─── Storage ──────────────────────────────────────────────────────────────────
const getUsers = () => JSON.parse(localStorage.getItem("lrc_users")||"null") || SEED_USERS;
const setUsers = u => localStorage.setItem("lrc_users", JSON.stringify(u));
const getRaces = () => JSON.parse(localStorage.getItem("lrc_races")||"null") || SEED_RACES;
const setRaces = r => localStorage.setItem("lrc_races", JSON.stringify(r));

// ─── UI Primitives ────────────────────────────────────────────────────────────
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
  const cs={gold:{bg:"#2a2310",t:"var(--gold)"},green:{bg:"#0d2416",t:"#27ae60"},red:{bg:"#2a0d0d",t:"#e74c3c"},muted:{bg:"var(--bg3)",t:"var(--muted)"},blue:{bg:"#0d1a2a",t:"#5dade2"}};
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

// ─── Auth Page ────────────────────────────────────────────────────────────────
function AuthPage({onLogin}){
  const [tab,setTab]=useState("login");
  const [form,setForm]=useState({username:"",password:"",role:"user"});
  const [err,setErr]=useState(""); const [ok,setOk]=useState("");
  const f=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  const login=()=>{const u=getUsers().find(u=>u.username===form.username&&u.password===form.password);if(!u){setErr("Invalid credentials.");return;}onLogin(u);};
  const register=()=>{if(!form.username||!form.password){setErr("All fields required.");return;}const users=getUsers();if(users.find(u=>u.username===form.username)){setErr("Username taken.");return;}setUsers([...users,{id:Date.now(),username:form.username,password:form.password,role:form.role,balance:form.role==="user"?2000:0,bets:[]}]);setOk("Account created! Sign in.");setTab("login");setErr("");};
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at 55% 35%,#1c1507 0%,#09090b 70%)",padding:20}}>
      <div style={{width:"100%",maxWidth:420}} className="fade-in">
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:52,marginBottom:10}}>🏇</div>
          <h1 style={{fontFamily:"Playfair Display",fontSize:32,fontWeight:900,color:"var(--gold)"}}>Lahore Race Club</h1>
          <p style={{color:"var(--muted)",fontSize:11,letterSpacing:"0.25em",textTransform:"uppercase",marginTop:5}}>Official Betting Platform</p>
        </div>
        <Card>
          <div style={{display:"flex",marginBottom:22,borderBottom:"1px solid var(--border)"}}>
            {["login","register"].map(t=>(
              <button key={t} onClick={()=>{setTab(t);setErr("");setOk("");}} style={{flex:1,padding:"8px 0",background:"none",border:"none",borderBottom:tab===t?"2px solid var(--gold)":"2px solid transparent",color:tab===t?"var(--gold)":"var(--muted)",fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",marginBottom:-1,transition:"all 0.2s"}}>{t}</button>
            ))}
          </div>
          {err&&<Alert text={err} type="err"/>}{ok&&<Alert text={ok} type="ok"/>}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <FI label="Username" value={form.username} onChange={f("username")} placeholder="Enter username"/>
            <FI label="Password" value={form.password} onChange={f("password")} type="password" placeholder="Enter password"/>
            {tab==="register"&&<div><label style={{fontSize:10,color:"var(--muted)",letterSpacing:"0.15em",textTransform:"uppercase",display:"block",marginBottom:5}}>Role</label><select value={form.role} onChange={f("role")}><option value="user">User (Bettor)</option><option value="admin">Admin</option></select></div>}
            <Btn onClick={tab==="login"?login:register} variant="gold" size="lg" style={{marginTop:4}}>{tab==="login"?"Sign In":"Create Account"}</Btn>
          </div>
          <Divider label="Demo Accounts"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["Admin","admin","admin123"],["User","ahmed","user123"]].map(([l,u])=>(
              <button key={u} onClick={()=>{const usr=getUsers().find(x=>x.username===u);if(usr)onLogin(usr);}} style={{background:"var(--bg3)",border:"1px solid var(--border)",color:"var(--muted)",padding:"7px 12px",borderRadius:4,fontSize:11,cursor:"pointer",fontFamily:"Barlow Condensed"}}>
                {l}: <span style={{color:"var(--gold)"}}>{u}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Live Stream ──────────────────────────────────────────────────────────────
// YouTube live stream embed using channel handle
// IMPORTANT: Replace LRC_CHANNEL_ID below with the real YouTube Channel ID
// Get it from: youtube.com/@LahoreRaceClubofficial → About → Share Channel → Copy Channel ID
const LRC_CHANNEL_ID = "UCGkJ7hj8qBsKwfR5LKEC3Ag"; // ← Replace this with real ID

function LiveStream({race}){
  const [show,setShow]=useState(true);
  const [muted,setMuted]=useState(true);
  // Build embed URL - uses channel ID for live_stream embed
  const embedSrc = race.customStreamUrl
    ? race.customStreamUrl
    : `https://www.youtube.com/embed/live_stream?channel=${LRC_CHANNEL_ID}&autoplay=1&mute=${muted?1:0}&rel=0`;

  return(
    <div style={{marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span className="live-dot"/>
          <span style={{fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,letterSpacing:"0.15em",color:"#e74c3c",textTransform:"uppercase"}}>Live Stream</span>
          <span style={{fontSize:12,color:"var(--muted)"}}>· {race.youtubeChannel||"@LahoreRaceClubofficial"}</span>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn onClick={()=>setMuted(m=>!m)} variant="dark" size="sm">{muted?"🔇 Unmute":"🔊 Mute"}</Btn>
          <Btn onClick={()=>setShow(s=>!s)} variant="dark" size="sm">{show?"Hide":"Show Stream"}</Btn>
          <a href={`https://www.youtube.com/${race.youtubeChannel||"@LahoreRaceClubofficial"}/live`} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
            <Btn variant="red" size="sm">▶ Open on YouTube</Btn>
          </a>
        </div>
      </div>
      {show&&(
        <div style={{position:"relative",paddingBottom:"42%",height:0,borderRadius:8,overflow:"hidden",border:"2px solid rgba(231,76,60,0.3)",background:"#000"}}>
          <iframe
            key={`${muted}-${race.id}`}
            src={embedSrc}
            style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}}
            allow="autoplay;encrypted-media;picture-in-picture;fullscreen"
            allowFullScreen
            title="LRC Live"
          />
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"8px 14px",background:"linear-gradient(transparent,rgba(0,0,0,0.85))",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>Stream not loading? Click "Open on YouTube" button above</span>
            <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontFamily:"Barlow Condensed",letterSpacing:"0.1em"}}>LAHORE RACE CLUB LIVE</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Auto Odds Hook ────────────────────────────────────────────────────────────
function useAutoOdds(races, setRacesState){
  useEffect(()=>{
    const iv = setInterval(()=>{
      setRacesState(prev=>{
        let changed=false;
        const updated = prev.map(r=>{
          if(r.status==="finished") return r;
          const newHorses = r.horses.map(h=>{
            if(!h.autoOdds) return h;
            const delta=(Math.random()-0.48)*0.25;
            const newOdds=Math.max(1.1,Math.round((h.odds+delta)*10)/10);
            if(newOdds!==h.odds) changed=true;
            return {...h,odds:newOdds};
          });
          return changed?{...r,horses:newHorses}:r;
        });
        if(changed){ setRaces(updated); return updated; }
        return prev;
      });
    },7000);
    return ()=>clearInterval(iv);
  },[]);
}

// ─── Races Page (User) ────────────────────────────────────────────────────────
function RacesPage({user,onUserUpdate}){
  const [races,setRacesState]=useState(getRaces());
  const [selected,setSelected]=useState(null);
  const [betForm,setBetForm]=useState({horseId:"",amount:""});
  const [msg,setMsg]=useState("");
  useAutoOdds(races,setRacesState);

  // Keep selected race in sync when odds update
  useEffect(()=>{
    if(selected) setSelected(s=>races.find(r=>r.id===s.id)||s);
  },[races]);

  const liveRaces=races.filter(r=>r.status==="live");
  const upcomingRaces=races.filter(r=>r.status==="upcoming");
  const finishedRaces=races.filter(r=>r.status==="finished");

  const placeBet=race=>{
    const amount=parseInt(betForm.amount);
    if(!betForm.horseId){setMsg("⚠ Please select a horse.");return;}
    if(!amount||amount<100){setMsg("⚠ Minimum bet ₨100.");return;}
    if(amount>user.balance){setMsg("⚠ Insufficient balance.");return;}
    const horse=race.horses.find(h=>h.id===parseInt(betForm.horseId));
    const users=getUsers();const idx=users.findIndex(u=>u.id===user.id);
    const bet={id:Date.now(),raceId:race.id,raceName:race.name,horseName:horse.name,horseId:horse.id,odds:horse.odds,amount,status:"pending",payout:null};
    users[idx].balance-=amount;
    users[idx].bets=[...(users[idx].bets||[]),bet];
    setUsers(users);onUserUpdate(users[idx]);
    setMsg(`✓ Bet placed on ${horse.name} @ ×${horse.odds} for ₨${amount.toLocaleString()}`);
    setBetForm({horseId:"",amount:""});
    setTimeout(()=>setMsg(""),5000);
  };

  const selectRace=r=>{setSelected(r);setBetForm({horseId:"",amount:""});setMsg("");};

  return(
    <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 20px"}} className="fade-in">
      {/* Live Races */}
      {liveRaces.map(race=>(
        <div key={race.id}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <span className="live-dot"/><h2 style={{fontFamily:"Playfair Display",fontSize:22,fontWeight:900,color:"#e74c3c"}}>Live Now — {race.name}</h2>
          </div>
          <LiveStream race={race}/>
          <Card style={{borderColor:"rgba(231,76,60,0.2)",marginBottom:24,cursor:"pointer"}} onClick={()=>selectRace(race)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div><p style={{fontSize:12,color:"var(--muted)"}}>{race.date} · {race.time}</p></div>
              <Badge color="red">🔴 Betting Open</Badge>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:10}}>
              {race.horses.map(h=><HorseCard key={h.id} horse={h} selected={betForm.horseId===String(h.id)&&selected?.id===race.id} onClick={e=>{e.stopPropagation();setSelected(race);setBetForm(p=>({...p,horseId:String(h.id)}));}}/>)}
            </div>
          </Card>
        </div>
      ))}

      {/* Upcoming */}
      {upcomingRaces.length>0&&(
        <>
          <SH title="Upcoming Races" subtitle="Click a race to bet" style={{marginBottom:14}}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14,marginBottom:28}}>
            {upcomingRaces.map(r=><RaceCard key={r.id} race={r} isSelected={selected?.id===r.id} onClick={()=>selectRace(r)}/>)}
          </div>
        </>
      )}

      {/* Bet Panel */}
      {selected&&selected.status!=="finished"&&(
        <Card style={{marginBottom:28,borderColor:"rgba(201,168,76,0.2)"}} className="fade-in">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div><h2 style={{fontFamily:"Playfair Display",fontSize:20,color:"var(--gold)"}}>{selected.name}</h2><p style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{selected.date} · {selected.time}</p></div>
            <Badge color={selected.status==="live"?"red":"green"}>{selected.status==="live"?"🔴 Live":"Open"}</Badge>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:10,marginBottom:18}}>
            {selected.horses.map(h=><HorseCard key={h.id} horse={h} selected={betForm.horseId===String(h.id)} onClick={()=>setBetForm(p=>({...p,horseId:String(h.id)}))}/>)}
          </div>
          <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:150}}>
              <label style={{fontSize:10,color:"var(--muted)",letterSpacing:"0.15em",textTransform:"uppercase",display:"block",marginBottom:5}}>Bet Amount (₨)</label>
              <input type="number" value={betForm.amount} onChange={e=>setBetForm(p=>({...p,amount:e.target.value}))} placeholder="Min ₨100"/>
            </div>
            {betForm.horseId&&parseInt(betForm.amount)>=100&&(
              <div style={{fontSize:12,color:"var(--muted)",paddingBottom:10}}>
                Win: <span style={{color:"var(--gold)",fontWeight:700,fontFamily:"Barlow Condensed",fontSize:18}}>
                  ₨{(parseInt(betForm.amount)*(selected.horses.find(h=>h.id===parseInt(betForm.horseId))?.odds||0)).toLocaleString()}
                </span>
              </div>
            )}
            <Btn onClick={()=>placeBet(selected)} variant="gold" size="lg">Place Bet</Btn>
          </div>
          {msg&&<div style={{marginTop:12,padding:"8px 13px",borderRadius:4,fontSize:12,background:msg.startsWith("✓")?"#0d2416":"#2a0d0d",color:msg.startsWith("✓")?"#27ae60":"#e74c3c",border:`1px solid ${msg.startsWith("✓")?"#27ae60":"#c0392b"}`}}>{msg}</div>}
        </Card>
      )}

      {/* Finished */}
      {finishedRaces.length>0&&(
        <>
          <SH title="Past Races" style={{marginBottom:14}}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14}}>
            {finishedRaces.map(r=><RaceCard key={r.id} race={r} finished/>)}
          </div>
        </>
      )}
    </div>
  );
}

function RaceCard({race,isSelected,onClick,finished}){
  return(
    <div onClick={onClick} style={{background:isSelected?"rgba(201,168,76,0.04)":"var(--card)",border:isSelected?"1px solid rgba(201,168,76,0.35)":"1px solid var(--border)",borderRadius:6,padding:16,cursor:onClick?"pointer":"default",transition:"all 0.2s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <h3 style={{fontFamily:"Playfair Display",fontSize:15,color:finished?"var(--muted)":"var(--text)",fontWeight:700}}>{race.name}</h3>
        <Badge color={race.status==="live"?"red":race.status==="upcoming"?"gold":"muted"}>{race.status==="live"?"🔴 Live":race.status}</Badge>
      </div>
      <p style={{fontSize:11,color:"var(--muted)",marginBottom:10}}>📅 {race.date} · ⏰ {race.time}</p>
      {race.horses.map(h=>(
        <div key={h.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
          <span style={{fontSize:12,color:race.winner===h.id?"var(--gold)":"var(--text)"}}>{race.winner===h.id&&"🏆 "}{h.name}</span>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            {h.autoOdds&&race.status!=="finished"&&<span style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em"}}>🔄</span>}
            <span style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:"var(--gold2)"}}>×{h.odds}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function HorseCard({horse,selected,onClick}){
  return(
    <div onClick={onClick} style={{background:selected?"rgba(201,168,76,0.07)":"var(--bg3)",border:selected?"2px solid var(--gold)":"2px solid transparent",borderRadius:6,padding:13,cursor:"pointer",transition:"all 0.2s"}}>
      <div style={{fontFamily:"Playfair Display",fontSize:14,fontWeight:700,color:selected?"var(--gold)":"var(--text)",marginBottom:2}}>{horse.name}</div>
      <div style={{fontSize:11,color:"var(--muted)",marginBottom:1}}>🏇 {horse.jockey}</div>
      {horse.weight&&<div style={{fontSize:11,color:"var(--muted)",marginBottom:6}}>⚖️ {horse.weight} · Age {horse.age}</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.1em"}}>Odds {horse.autoOdds?"🔄":""}</span>
        <span style={{fontFamily:"Barlow Condensed",fontSize:22,fontWeight:800,color:"var(--gold2)"}}>×{horse.odds}</span>
      </div>
    </div>
  );
}

// ─── My Bets ──────────────────────────────────────────────────────────────────
function MyBetsPage({user}){
  const u=getUsers().find(x=>x.id===user.id);
  const bets=u?.bets||[];
  const won=bets.filter(b=>b.status==="won").reduce((s,b)=>s+(b.payout||0),0);
  const lost=bets.filter(b=>b.status==="lost").reduce((s,b)=>s+b.amount,0);
  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:"24px 20px"}} className="fade-in">
      <SH title="My Bets" subtitle={`Balance: ₨${u?.balance.toLocaleString()}`}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,margin:"18px 0 24px"}}>
        {[["Bets Placed",bets.length,"gold"],["Total Won","₨"+won.toLocaleString(),"green"],["Total Lost","₨"+lost.toLocaleString(),"red"]].map(([l,v,c])=>(
          <Card key={l} style={{textAlign:"center",padding:14}}><div style={{fontFamily:"Barlow Condensed",fontSize:22,fontWeight:700,color:`var(--${c})`}}>{v}</div><div style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.1em",marginTop:3}}>{l}</div></Card>
        ))}
      </div>
      {bets.length===0?(<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:36,marginBottom:12}}>🎯</div><p style={{color:"var(--muted)"}}>No bets yet. Head to Races!</p></Card>):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[...bets].reverse().map(b=>(
            <Card key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,padding:"12px 16px"}}>
              <div><div style={{fontFamily:"Playfair Display",fontSize:14,fontWeight:700,marginBottom:2}}>{b.raceName}</div><div style={{fontSize:11,color:"var(--muted)"}}>🐎 {b.horseName} · ×{b.odds}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:"Barlow Condensed",fontSize:17,fontWeight:700}}>₨{b.amount.toLocaleString()}</div>{b.status==="won"&&<div style={{color:"#27ae60",fontSize:11}}>+₨{b.payout?.toLocaleString()}</div>}<Badge color={b.status==="pending"?"gold":b.status==="won"?"green":"red"}>{b.status}</Badge></div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard(){
  const races=getRaces(); const users=getUsers().filter(u=>u.role==="user");
  const allBets=users.flatMap(u=>u.bets||[]);
  const stats=[["🏁","Races",races.length,"gold"],["🔴","Live",races.filter(r=>r.status==="live").length,"red"],["📅","Upcoming",races.filter(r=>r.status==="upcoming").length,"blue"],["👤","Users",users.length,"gold"],["🎰","Bets",allBets.length,"gold"],["💰","Wagered","₨"+allBets.reduce((s,b)=>s+b.amount,0).toLocaleString(),"green"]];
  return(
    <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 20px"}} className="fade-in">
      <SH title="Admin Dashboard" subtitle="Lahore Race Club Overview"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:12,marginTop:18}}>
        {stats.map(([ic,l,v,c])=>(
          <Card key={l} style={{textAlign:"center",padding:16}}><div style={{fontSize:24,marginBottom:5}}>{ic}</div><div style={{fontFamily:"Barlow Condensed",fontSize:22,fontWeight:700,color:`var(--${c})`}}>{v}</div><div style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.1em",marginTop:3}}>{l}</div></Card>
        ))}
      </div>
      <SH title="Recent Bets" style={{marginTop:32,marginBottom:12}}/>
      {allBets.length===0?(<Card style={{textAlign:"center",padding:24,color:"var(--muted)"}}>No bets yet.</Card>):(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {allBets.slice(-10).reverse().map(bet=>{
            const bu=users.find(u=>(u.bets||[]).some(b=>b.id===bet.id));
            return(
              <Card key={bet.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",flexWrap:"wrap",gap:8}}>
                <span style={{fontSize:12,color:"var(--muted)",width:80}}>{bu?.username}</span>
                <span style={{fontSize:12,flex:1}}>{bet.raceName}</span>
                <span style={{fontSize:12,color:"var(--gold)"}}>{bet.horseName}</span>
                <span style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:700}}>₨{bet.amount.toLocaleString()}</span>
                <Badge color={bet.status==="pending"?"gold":bet.status==="won"?"green":"red"}>{bet.status}</Badge>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Admin Races (Full Edit + Auto Odds + Inline Odds) ───────────────────────
function AdminRaces(){
  const [races,setR]=useState(getRaces());
  const [showForm,setShowForm]=useState(false);
  const [editId,setEditId]=useState(null);
  const [msg,setMsg]=useState({text:"",type:"ok"});
  const emptyForm={name:"",date:"",time:"",status:"upcoming",youtubeChannel:"@LahoreRaceClubofficial",customStreamUrl:"",
    horses:[{name:"",jockey:"",weight:"",age:"",odds:"",autoOdds:true}]};
  const [form,setForm]=useState(emptyForm);
  useAutoOdds(races,setR);

  const save_=updated=>{setRaces(updated);setR(updated);}
  const flash=(text,type="ok")=>{setMsg({text,type});setTimeout(()=>setMsg({text:"",type:"ok"}),3500);}
  const fv=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  const fh=(i,k)=>e=>{const v=e.target.type==="checkbox"?e.target.checked:e.target.value;setForm(p=>{const h=[...p.horses];h[i]={...h[i],[k]:v};return{...p,horses:h};});}

  const startAdd=()=>{setForm(emptyForm);setEditId(null);setShowForm(true);}
  const startEdit=race=>{
    setForm({name:race.name,date:race.date,time:race.time,status:race.status,youtubeChannel:race.youtubeChannel||"@LahoreRaceClubofficial",customStreamUrl:race.customStreamUrl||"",
      horses:race.horses.map(h=>({name:h.name,jockey:h.jockey,weight:h.weight||"",age:String(h.age||""),odds:String(h.odds),autoOdds:!!h.autoOdds}))});
    setEditId(race.id);setShowForm(true);
  };

  const save=()=>{
    if(!form.name||!form.date||!form.time){flash("Name, date, time required.","err");return;}
    if(form.horses.some(h=>!h.name||!h.jockey||!h.odds)){flash("All horse fields required.","err");return;}
    const parsedHorses=form.horses.map((h,i)=>({id:i+1,name:h.name,jockey:h.jockey,weight:h.weight,age:parseInt(h.age)||0,odds:Math.max(1.1,parseFloat(h.odds)||1.1),autoOdds:!!h.autoOdds}));
    const updated=editId
      ?races.map(r=>r.id===editId?{...r,...form,horses:parsedHorses}:r)
      :[...races,{id:Date.now(),...form,horses:parsedHorses,winner:null}];
    save_(updated);setShowForm(false);setEditId(null);setForm(emptyForm);
    flash(editId?"Race updated!":"Race created!");
  };

  const deleteRace=id=>{if(!window.confirm("Delete this race?"))return;save_(races.filter(r=>r.id!==id));flash("Race deleted.");}

  const setWinner=(raceId,horseId)=>{
    const race=races.find(r=>r.id===raceId);
    const winnerName=race.horses.find(h=>h.id===horseId)?.name;
    const users=getUsers();
    users.forEach((u,ui)=>{
      (u.bets||[]).forEach((b,bi)=>{
        if(b.raceId===raceId&&b.status==="pending"){
          const won=b.horseName===winnerName;
          users[ui].bets[bi].status=won?"won":"lost";
          if(won){const p=Math.round(b.amount*b.odds);users[ui].bets[bi].payout=p;users[ui].balance+=p;}
        }
      });
    });
    setUsers(users);
    save_(races.map(r=>r.id===raceId?{...r,status:"finished",winner:horseId}:r));
    flash(`🏆 Winner: ${winnerName}. Bets settled!`);
  };

  const updateOdds=(raceId,horseId,val)=>{
    const v=Math.max(1.1,parseFloat(val)||1.1);
    save_(races.map(r=>r.id===raceId?{...r,horses:r.horses.map(h=>h.id===horseId?{...h,odds:Math.round(v*10)/10}:h)}:r));
  };
  const toggleAutoOdds=(raceId,horseId)=>{
    save_(races.map(r=>r.id===raceId?{...r,horses:r.horses.map(h=>h.id===horseId?{...h,autoOdds:!h.autoOdds}:h)}:r));
  };
  const changeStatus=(raceId,status)=>{
    save_(races.map(r=>r.id===raceId?{...r,status}:r));
  };

  return(
    <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 20px"}} className="fade-in">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <SH title="Manage Races" subtitle="Full edit · Inline odds · Auto-odds system · Live stream" noMargin/>
        <Btn onClick={startAdd} variant="gold">+ New Race</Btn>
      </div>
      <Alert text={msg.text} type={msg.type}/>

      {showForm&&(
        <Card style={{marginBottom:20,borderColor:"rgba(201,168,76,0.2)"}} className="fade-in">
          <h3 style={{fontFamily:"Playfair Display",fontSize:17,color:"var(--gold)",marginBottom:16}}>{editId?"Edit Race":"New Race"}</h3>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:10,marginBottom:12}}>
            <FI label="Race Name" value={form.name} onChange={fv("name")} placeholder="e.g. Lahore Gold Cup"/>
            <FI label="Date" type="date" value={form.date} onChange={fv("date")}/>
            <FI label="Time" type="time" value={form.time} onChange={fv("time")}/>
            <div><label style={{fontSize:10,color:"var(--muted)",letterSpacing:"0.15em",textTransform:"uppercase",display:"block",marginBottom:5}}>Status</label>
              <select value={form.status} onChange={fv("status")}><option value="upcoming">Upcoming</option><option value="live">🔴 Live</option><option value="finished">Finished</option></select>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <FI label="YouTube Channel Handle (for live stream)" value={form.youtubeChannel} onChange={fv("youtubeChannel")} placeholder="@LahoreRaceClubofficial"/>
            <FI label="Custom Stream Embed URL (optional override)" value={form.customStreamUrl} onChange={fv("customStreamUrl")} placeholder="https://www.youtube.com/embed/VIDEO_ID"/>
          </div>
          <Divider label="Horses"/>
          <div style={{display:"grid",gridTemplateColumns:"1.5fr 1.2fr 70px 55px 75px 100px 32px",gap:7,marginBottom:5}}>
            {["Horse Name","Jockey","Weight","Age","Odds ×","Auto Odds",""].map((l,i)=><label key={i} style={{fontSize:9,color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase"}}>{l}</label>)}
          </div>
          {form.horses.map((h,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"1.5fr 1.2fr 70px 55px 75px 100px 32px",gap:7,marginBottom:7,alignItems:"center"}}>
              <input value={h.name} onChange={fh(i,"name")} placeholder="Horse name"/>
              <input value={h.jockey} onChange={fh(i,"jockey")} placeholder="Jockey"/>
              <input value={h.weight} onChange={fh(i,"weight")} placeholder="56kg"/>
              <input type="number" value={h.age} onChange={fh(i,"age")} placeholder="4"/>
              <input type="number" value={h.odds} onChange={fh(i,"odds")} placeholder="2.5" step="0.1" min="1.1"/>
              <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:11,color:"var(--muted)"}}>
                <input type="checkbox" checked={h.autoOdds} onChange={fh(i,"autoOdds")} style={{width:"auto",accentColor:"var(--gold)"}}/>
                Auto 🔄
              </label>
              <button onClick={()=>setForm(p=>({...p,horses:p.horses.filter((_,idx)=>idx!==i)}))} style={{background:"#2a0d0d",border:"1px solid #c0392b",color:"#e74c3c",borderRadius:3,cursor:"pointer",height:34,fontSize:14}}>×</button>
            </div>
          ))}
          <Btn onClick={()=>setForm(p=>({...p,horses:[...p.horses,{name:"",jockey:"",weight:"",age:"",odds:"",autoOdds:true}]}))} variant="dark" size="sm" style={{marginTop:6}}>+ Add Horse</Btn>
          <div style={{display:"flex",gap:10,marginTop:16}}>
            <Btn onClick={save} variant="gold">Save Race</Btn>
            <Btn onClick={()=>{setShowForm(false);setEditId(null);}} variant="ghost">Cancel</Btn>
          </div>
        </Card>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {races.map(race=>(
          <Card key={race.id}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,marginBottom:14}}>
              <div>
                <h3 style={{fontFamily:"Playfair Display",fontSize:17,marginBottom:2}}>{race.name}</h3>
                <p style={{fontSize:11,color:"var(--muted)"}}>{race.date} · {race.time} {race.youtubeChannel&&`· 📺 ${race.youtubeChannel}`}</p>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                {/* Quick status change */}
                <select value={race.status} onChange={e=>changeStatus(race.id,e.target.value)} style={{padding:"4px 8px",fontSize:11,width:"auto",fontFamily:"Barlow Condensed",letterSpacing:"0.08em"}}>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">🔴 Live</option>
                  <option value="finished">Finished</option>
                </select>
                <Btn onClick={()=>startEdit(race)} variant="dark" size="sm">✏️ Edit</Btn>
                <Btn onClick={()=>deleteRace(race.id)} variant="red" size="sm">Delete</Btn>
              </div>
            </div>

            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{borderBottom:"1px solid var(--border)"}}>
                    {["Horse","Jockey","Wt","Age","Odds (edit)","Auto Odds","Action"].map(h=>(
                      <th key={h} style={{padding:"5px 10px",textAlign:"left",fontSize:9,color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {race.horses.map(h=>(
                    <tr key={h.id} style={{borderBottom:"1px solid var(--border)",background:race.winner===h.id?"rgba(201,168,76,0.05)":"transparent"}}>
                      <td style={{padding:"7px 10px",fontWeight:600,color:race.winner===h.id?"var(--gold)":"var(--text)",whiteSpace:"nowrap"}}>{race.winner===h.id&&"🏆 "}{h.name}</td>
                      <td style={{padding:"7px 10px",color:"var(--muted)",whiteSpace:"nowrap"}}>{h.jockey}</td>
                      <td style={{padding:"7px 10px",color:"var(--muted)"}}>{h.weight}</td>
                      <td style={{padding:"7px 10px",color:"var(--muted)"}}>{h.age}</td>
                      <td style={{padding:"5px 10px"}}>
                        <input
                          type="number" defaultValue={h.odds} step="0.1" min="1.1"
                          key={h.odds}
                          disabled={h.autoOdds}
                          style={{width:72,padding:"4px 7px",fontFamily:"Barlow Condensed",fontSize:15,fontWeight:700,color:"var(--gold2)",textAlign:"center",opacity:h.autoOdds?0.5:1,cursor:h.autoOdds?"not-allowed":"text"}}
                          onBlur={e=>updateOdds(race.id,h.id,e.target.value)}
                          onKeyDown={e=>{if(e.key==="Enter")updateOdds(race.id,h.id,e.target.value);}}
                        />
                      </td>
                      <td style={{padding:"5px 10px"}}>
                        <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
                          <input type="checkbox" checked={h.autoOdds} onChange={()=>toggleAutoOdds(race.id,h.id)} style={{accentColor:"var(--gold)",width:"auto"}}/>
                          <span style={{fontSize:10,color:"var(--muted)"}}>{h.autoOdds?"🔄 Auto":"Manual"}</span>
                        </label>
                      </td>
                      <td style={{padding:"5px 10px"}}>
                        {race.status!=="finished"&&(
                          <Btn onClick={()=>setWinner(race.id,h.id)} variant="green" size="sm">🏆 Declare</Btn>
                        )}
                        {race.status==="finished"&&race.winner===h.id&&<Badge color="gold">Winner</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Admin Users ──────────────────────────────────────────────────────────────
function AdminUsers(){
  const [users,setU]=useState(getUsers());
  const [showForm,setShowForm]=useState(false);
  const [editUser,setEditUser]=useState(null);
  const [form,setForm]=useState({username:"",password:"",role:"user",balance:"2000"});
  const [msg,setMsg]=useState({text:"",type:"ok"});
  const f=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  const flash=(text,type="ok")=>{setMsg({text,type});setTimeout(()=>setMsg({text:"",type:"ok"}),3000);}
  const save_u=updated=>{setUsers(updated);setU(updated);}

  const save=()=>{
    if(!form.username||!form.password){flash("All fields required.","err");return;}
    if(!editUser&&users.find(u=>u.username===form.username)){flash("Username taken.","err");return;}
    let updated;
    if(editUser){
      updated=users.map(u=>u.id===editUser.id?{...u,username:form.username,password:form.password,role:form.role,balance:parseInt(form.balance)||0}:u);
    }else{
      updated=[...users,{id:Date.now(),username:form.username,password:form.password,role:form.role,balance:parseInt(form.balance)||0,bets:[]}];
    }
    save_u(updated);setShowForm(false);setEditUser(null);setForm({username:"",password:"",role:"user",balance:"2000"});
    flash(editUser?"User updated!":"User created!");
  };

  const startEdit=u=>{setForm({username:u.username,password:u.password,role:u.role,balance:String(u.balance)});setEditUser(u);setShowForm(true);}
  const deleteUser=id=>{if(!window.confirm("Delete user?"))return;save_u(users.filter(u=>u.id!==id));flash("Deleted.");}
  const adjustBal=(id,amt)=>save_u(users.map(u=>u.id===id?{...u,balance:Math.max(0,u.balance+amt)}:u));

  return(
    <div style={{maxWidth:1000,margin:"0 auto",padding:"24px 20px"}} className="fade-in">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <SH title="Manage Users" subtitle={`${users.length} accounts total`} noMargin/>
        <Btn onClick={()=>{setShowForm(true);setEditUser(null);setForm({username:"",password:"",role:"user",balance:"2000"});}} variant="gold">+ Add User</Btn>
      </div>
      <Alert text={msg.text} type={msg.type}/>
      {showForm&&(
        <Card style={{marginBottom:18,borderColor:"rgba(201,168,76,0.2)"}} className="fade-in">
          <h3 style={{fontFamily:"Playfair Display",fontSize:17,color:"var(--gold)",marginBottom:16}}>{editUser?"Edit User":"New User"}</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:14}}>
            <FI label="Username" value={form.username} onChange={f("username")}/>
            <FI label="Password" value={form.password} onChange={f("password")}/>
            <div><label style={{fontSize:10,color:"var(--muted)",letterSpacing:"0.15em",textTransform:"uppercase",display:"block",marginBottom:5}}>Role</label><select value={form.role} onChange={f("role")}><option value="user">User</option><option value="admin">Admin</option></select></div>
            <FI label="Balance (₨)" value={form.balance} onChange={f("balance")} type="number"/>
          </div>
          <div style={{display:"flex",gap:8}}><Btn onClick={save} variant="gold">Save</Btn><Btn onClick={()=>{setShowForm(false);setEditUser(null);}} variant="ghost">Cancel</Btn></div>
        </Card>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {users.map(u=>(
          <Card key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,padding:"12px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:u.role==="admin"?"#2a0d0d":"#2a2310",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{u.role==="admin"?"👑":"👤"}</div>
              <div><div style={{fontSize:13,fontWeight:600}}>{u.username}</div><div style={{fontSize:10,color:"var(--muted)"}}>{(u.bets||[]).length} bets · ID {u.id}</div></div>
              <Badge color={u.role==="admin"?"red":"gold"}>{u.role}</Badge>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
              {u.role==="user"&&<>
                <span style={{fontFamily:"Barlow Condensed",fontSize:16,fontWeight:700,color:"var(--gold)",minWidth:88}}>₨{u.balance.toLocaleString()}</span>
                <Btn onClick={()=>adjustBal(u.id,1000)} variant="green" size="sm">+₨1K</Btn>
                <Btn onClick={()=>adjustBal(u.id,5000)} variant="green" size="sm">+₨5K</Btn>
                <Btn onClick={()=>adjustBal(u.id,-500)} variant="dark" size="sm">-₨500</Btn>
              </>}
              <Btn onClick={()=>startEdit(u)} variant="dark" size="sm">✏️ Edit</Btn>
              <Btn onClick={()=>deleteUser(u.id)} variant="red" size="sm">Delete</Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(null);
  const [page,setPage]=useState("");
  const login=u=>{setUser(u);setPage(u.role==="admin"?"dashboard":"races");}
  const logout=()=>{setUser(null);setPage("");}
  return(
    <div>
      <Header user={user} onLogout={logout} onNav={setPage} page={page}/>
      {!user?<AuthPage onLogin={login}/>:
       user.role==="admin"?(
         page==="admin_races"?<AdminRaces/>:page==="admin_users"?<AdminUsers/>:<AdminDashboard/>
       ):(
         page==="mybets"?<MyBetsPage user={user} onUserUpdate={setUser}/>:<RacesPage user={user} onUserUpdate={setUser}/>
       )}
    </div>
  );
}
