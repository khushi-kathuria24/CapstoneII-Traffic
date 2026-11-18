import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowRight,
  Bell,
  Bot,
  Building2,
  Camera,
  CarFront,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Crosshair,
  Gauge,
  Hospital,
  Eye,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  ParkingCircle,
  Radio,
  Search,
  ShieldCheck,
  Siren,
  Signal,
  TrendingUp,
  TrafficCone,
  UserRound,
  X
} from "lucide-react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "";

function GoogleMark() {
  return <span className="google-mark">G</span>;
}

function Feature({ icon, title, detail }) {
  return (
    <div className="feature">
      <span className="feature-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
    </div>
  );
}

function Login({ onLogin }) {
  const [mode, setMode] = useState("admin");
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to continue.");
      onLogin(data.user);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="brand-panel">
        <div className="brand">
          <div className="signal"><i /><i /><i /></div>
          <div><strong>Intelligent Traffic</strong><span>Violation detection system</span></div>
        </div>
        <div className="brand-copy">
          <p className="eyebrow light">AI-POWERED CITY OPERATIONS</p>
          <h1>Smarter roads.<br /><span>Safer cities.</span></h1>
          <p className="lead">Monitor traffic in real time, detect violations with confidence, and turn every intersection into actionable insight.</p>
        </div>
        <div className="feature-list">
          <Feature icon={<Activity size={17} />} title="Live monitoring and alerts" detail="Stay ahead of every incident" />
          <Feature icon={<Eye size={17} />} title="AI-assisted detection" detail="Accurate, explainable insights" />
          <Feature icon={<ShieldCheck size={17} />} title="Secure operations" detail="Built for modern city teams" />
        </div>
        <div className="panel-footer"><span className="status-dot" /> Systems operational <span>v1.0</span></div>
      </section>

      <section className="form-panel">
        <div className="portal-tabs">
          <button className={mode === "admin" ? "active" : ""} onClick={() => setMode("admin")}>Admin portal</button>
          <button className={mode === "user" ? "active" : ""} onClick={() => setMode("user")}>User portal</button>
        </div>
        <div className="form-content">
          <span className="welcome-badge">{isSignup ? "GET STARTED" : "WELCOME BACK"}</span>
          <h2>{isSignup ? "Create your account" : "Sign in to your portal"}</h2>
          <p className="form-intro">{isSignup ? "Join your city’s intelligent traffic operations team." : "Use your email or Google account to continue."}</p>
          {status.message && <div className={`notice ${status.type}`}>{status.message}</div>}
          <form onSubmit={submit}>
            {isSignup && <label>Full name<input name="name" value={form.name} onChange={update} placeholder="Alex Morgan" required /></label>}
            <label><span>Email address</span><div className="input-wrap"><Mail size={17} /><input name="email" type="email" value={form.email} onChange={update} placeholder="name@example.com" required /></div></label>
            <label><span>Password</span><div className="input-wrap"><LockKeyhole size={17} /><input name="password" type="password" value={form.password} onChange={update} placeholder="Enter your password" minLength="6" required /></div></label>
            {!isSignup && <div className="form-meta"><label className="check"><input type="checkbox" /> Remember me</label><a href="#reset">Forgot password?</a></div>}
            <button className="primary-button" disabled={loading}>{loading ? "Connecting..." : isSignup ? "Create account" : "Sign in"} <ArrowRight size={17} /></button>
          </form>
          <div className="divider"><span>OR</span></div>
          <a className="google-button" href={`${API_URL}/auth/google`}><GoogleMark /> Continue with Google</a>
          <p className="demo-hint">Demo access: <strong>demo@traffic.ai</strong> / <strong>Demo@123</strong></p>
          <p className="switch-auth">{isSignup ? "Already have an account?" : "New to the platform?"} <button onClick={() => { setIsSignup(!isSignup); setStatus({ type: "", message: "" }); }}>{isSignup ? "Sign in" : "Create account"}</button></p>
        </div>
        <div className="form-footer"><span><LockKeyhole size={13} /> Secure authentication</span><span>© 2025 Intelligent Traffic</span></div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, detail, tone = "blue" }) {
  return <div className={`metric-card tone-${tone}`}><span className="metric-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong>{detail && <p>{detail}</p>}</div></div>;
}

function AgentCenter() {
  const agents = [
    ["SITA Signal Optimizer", "Signal timing and congestion balancing", "Active", "#5a78ed"],
    ["Vision-Violation Agent", "Plate, helmet, seatbelt and lane detection", "Active", "#8b66d9"],
    ["Guardian Encroachment Agent", "Restricted zone and vendor detection", "Monitoring", "#e59a40"],
    ["Emergency Corridor Agent", "Priority green waves and route clearance", "Active", "#e95d65"],
    ["Road Intelligence Agent", "Pattern and incident forecasting", "Learning", "#3ba78a"]
  ];
  return <section><div className="page-banner purple"><div><p>COORDINATED AI OPERATIONS</p><h1>AI Agent Center</h1><span>Autonomous traffic agents operating across the Gujarat network</span></div><span className="active-badge"><i /> 5 AGENTS ACTIVE</span></div><div className="agent-grid">{agents.map(([name, detail, status, color]) => <article className="agent-card" key={name}><div className="agent-icon" style={{ background: `${color}18`, color }}><Bot /></div><span className="agent-status">{status}</span><h2>{name}</h2><p>{detail}</p><div className="agent-health"><span>Confidence</span><strong>{status === "Learning" ? "86%" : "98%"}</strong></div><div className="agent-progress"><i style={{ width: status === "Learning" ? "86%" : "98%", background: color }} /></div><button>Open agent <ArrowRight size={14} /></button></article>)}</div></section>;
}

function EncroachmentView() {
  const cases = [
    ["HAWKER in restricted area", "Indiranagar", "HIGH", "Hawker detected in restricted-area"],
    ["CART in road lane", "Brigade Road", "HIGH", "Cart detected in road lane"],
    ["VENDOR near bus stop", "Ashram Road", "MEDIUM", "Vendor congestion near bus stop"]
  ];
  return <section><div className="page-banner purple"><div><p>AI ROAD OBSTRUCTION MONITOR</p><h1>Encroachment &amp; Obstruction</h1><span>Unauthorized hawkers, vendors and road obstructions</span></div><span className="active-badge"><i /> GUARDIAN ACTIVE</span></div><div className="metric-row"><Metric icon={<Camera />} label="TOTAL DETECTIONS" value="6" tone="blue" /><Metric icon={<CircleAlert />} label="ACTIVE CASES" value="6" tone="orange" /><Metric icon={<Bell />} label="ALERTS SENT" value="6" tone="red" /><Metric icon={<CheckCircle2 />} label="RESOLVED" value="0" tone="green" /></div><div className="case-filter"><button className="active">All</button><button>Active</button><button>Detected</button><button>Alert sent</button><button>Resolved</button></div><div className="case-list">{cases.map(([title, place, severity, detail]) => <article className="case-card" key={title}><div className="case-camera"><Camera /><span>{title.startsWith("HAWKER") ? "CAM001" : title.startsWith("CART") ? "CAM002" : "CAM004"}</span></div><div className="case-info"><div><span className={`severity ${severity.toLower?.()}`}>{severity}</span><span className="alert-tag">AI VERIFIED</span></div><h2>{title}</h2><p><MapPin size={14} /> {place}<small>{detail}</small></p></div><div className="case-actions"><button className="resolve"><CheckCircle2 size={14} /> Resolve</button><button className="ignore">Ignore</button></div></article>)}</div></section>;
}

function EmergencyView() {
  return <section><div className="page-banner red"><div><p><Siren size={18} /> PRIORITY RESPONSE NETWORK</p><h1>AI Green Corridor</h1><span>Real-time emergency vehicle tracking with intelligent traffic clearance</span></div><span className="active-badge"><i /> ACTIVE</span></div><div className="metric-row"><Metric icon={<Siren />} label="ACTIVE EMERGENCIES" value="3" tone="red" /><Metric icon={<Activity />} label="AVG TIME SAVED" value="8m" tone="green" /><Metric icon={<Signal />} label="SIGNALS CLEARED" value="24" tone="blue" /><Metric icon={<CheckCircle2 />} label="SUCCESS RATE" value="98%" tone="purple" /></div><div className="emergency-grid">{[["DR617", "Ambulance", "Smart Horizon College Hub"], ["FIRE377", "Fire Truck", "Electronic City Tollgate"]].map(([id, type, place]) => <article className="emergency-card" key={id}><div className="route-map"><span className="live-route">LIVE TRACKING</span><div className="route-line"><i /><i /><i /><i /><i /></div><span className="speed">Speed<strong>65 km/h</strong></span></div><div className="vehicle-title"><span><CarFront /></span><div><strong>{id}</strong><small>{type}</small></div><em>ACTIVE</em></div><div className="vehicle-times"><div><small>Normal Time</small><strong>25m</strong></div><div><small>Corridor Time</small><strong>15m</strong></div><div><small>Time Saved</small><strong>10m</strong></div></div><p><MapPin size={15} /> <span><small>Destination</small><strong>{place}</strong></span></p></article>)}</div></section>;
}

function AnalyticsView() {
  const bars = [52, 3, 70, 48, 59, 64];
  return <section><div className="analytics-heading"><p>SYSTEM TELEMETRY &amp; ANALYTICS</p><h1>Traffic Analytics &amp; Insights</h1><span>Real-time corridor throughput, signal telemetry and fine enforcement revenue</span></div><div className="metric-row"><Metric icon={<Activity />} label="TOTAL ACTIVE SIGNALS" value="6" tone="blue" /><Metric icon={<TrendingUp />} label="FINES COLLECTED" value="₹0" tone="green" /><Metric icon={<CircleAlert />} label="PENDING FINES" value="4" tone="orange" /><Metric icon={<ClipboardList />} label="TOTAL FINES ISSUED" value="4" tone="purple" /></div><article className="analytics-chart"><div className="chart-heading"><div><h2>Vehicle Volume by Signal Intersection</h2><p>Live vehicle flow across monitored junctions</p></div><span className="sync-badge"><i /> Sync Active</span></div><div className="vertical-bars">{bars.map((height, index) => <div className="vertical-bar-wrap" key={index}><strong>{height}</strong><div style={{ height: `${height}%` }} /><small>SIG{String(index + 1).padStart(3, "0")}</small></div>)}</div></article></section>;
}

function GeneralView({ title }) {
  const descriptions = {
    "SENTINEL-X Command Center": "Unified city traffic command and incident response.",
    "Connected Vehicle Safety": "Connected vehicles, edge devices and roadside unit telemetry.",
    "Gujarat Traffic Map": "Live route congestion and intersection status across Gujarat.",
    "Parking Management": "Real-time occupancy and enforcement across city parking zones.",
    "Violations": "Detected traffic violations, evidence and fine processing.",
    "ML Detection": "Computer vision detections and model confidence monitoring.",
    "Illegal Parking AI": "Live illegal parking cases detected by roadside cameras.",
    "Daily Reports": "Generated operational reports and performance summaries.",
    "Road Intelligence": "Predictive congestion, incident and capacity intelligence."
  };
  return <section><div className="general-heading"><p>INTELLIGENT TRAFFIC OPERATIONS</p><h1>{title}</h1><span>{descriptions[title]}</span></div><div className="metric-row"><Metric icon={<Activity />} label="NETWORK STATUS" value="Online" tone="green" /><Metric icon={<Camera />} label="CONNECTED CAMERAS" value="24" tone="blue" /><Metric icon={<CircleAlert />} label="OPEN INCIDENTS" value="8" tone="orange" /><Metric icon={<CheckCircle2 />} label="SYSTEM HEALTH" value="98%" tone="purple" /></div><article className="general-card"><div><Crosshair /><h2>{title} overview</h2><p>Operational data is synchronized across the connected traffic network.</p></div><button>Refresh feed <Activity size={14} /></button></article></section>;
}

function Dashboard({ user, onLogout }) {
  const [mobileNav, setMobileNav] = useState(false);
  const [active, setActive] = useState("Traffic Monitoring");
  const navSections = [
    { label: "", items: [["SENTINEL-X Command Center", ShieldCheck], ["Connected Vehicle Safety", Radio], ["Gujarat Traffic Map", MapPin]] },
    { label: "OPERATIONS", items: [["AI Agent Center", Bot], ["Traffic Monitoring", Camera], ["Parking Management", ParkingCircle], ["Violations", ClipboardList], ["ML Detection", Crosshair], ["Illegal Parking AI", ParkingCircle], ["Encroachment Monitor", Building2], ["Emergency", Siren]] },
    { label: "INTELLIGENCE", items: [["Analytics", TrendingUp], ["Daily Reports", ClipboardList], ["Road Intelligence", Gauge]] }
  ];
  const corridors = [["S.G. Highway - Thaltej","969","MEDIUM"],["Infocity Circle","733","MEDIUM"],["Alkapuri, Vadodara","857","MEDIUM"],["Athwa Gate, Surat","1073","HIGH"],["Varchha Road, Surat","607","MEDIUM"],["Kalawad Road, Rajkot","967","MEDIUM"],["Ghogha Circle, Bhavnagar","563","LOW"],["Bedi Road, Jamnagar","1169","HIGH"]];

  return <div className="command-shell">
    <aside className={`command-sidebar ${mobileNav ? "open" : ""}`}>
      <div className="command-brand"><div className="command-logo"><Bot size={21} /></div><div><strong>UrbanSaathi</strong><small>VISION &amp; TRAFFIC CONTROL</small></div></div>
      <nav className="command-nav">{navSections.map((section, index) => <div className="nav-section" key={index}>{section.label && <span>{section.label}</span>}{section.items.map(([label, Icon]) => <button key={label} className={active === label ? "active" : ""} onClick={() => { setActive(label); setMobileNav(false); }}><Icon size={16} /><span>{label}</span></button>)}</div>)}</nav>
      <div className="sidebar-status"><span className="status-dot" /> AI systems operational</div>
    </aside>
    <div className="command-main">
      <header className="command-header">
        <button className="mobile-menu command-mobile" onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? <X /> : <Menu />}</button>
        <div className="live-room"><span className="status-dot" /> LIVE CONTROL ROOM <small>Gujarat Grid Active</small></div>
        <div className="header-actions"><button className="edge-pill"><Radio size={14} /> Mobile OBU / Edge</button><div className="header-user"><div className="header-avatar">{(user?.name || "A").charAt(0).toUpperCase()}</div><span><strong>{user?.name || "Admin"}</strong><small>{user?.role || "Master Controller"}</small></span></div><button className="logout-button" onClick={onLogout}><LogOut size={14} /> Logout</button></div>
      </header>
      <main className="command-content">
        {active === "Traffic Monitoring" && <>
          <div className="monitor-grid"><section className="live-feed"><div className="camera-top"><span><span className="live-dot" /> S.G. HIGHWAY - THALTEJ, AHMEDABAD</span><time>15/09/2026 17:37:33</time></div><div className="feed-visual"><div className="feed-overlay" /><div className="ai-badge"><Bot size={15} /><span><strong>AUTONOMOUS INSIGHT</strong><small>Optimal balance across 12 junctions</small></span></div><span className="camera-badge"><Camera size={13} /> CAM-GJ-001</span><span className="fps-badge">30 FPS · HD</span><div className="signal-countdown"><span>SIGNAL COUNTDOWN</span><strong>0:38</strong></div></div></section>
          <div className="monitor-side"><div className="telemetry-card"><div><p>LIVE FLOW RATE</p><strong>969 <small>vehicles</small></strong><span>Real-time corridor volume</span></div><div><p>SATURATION LEVEL</p><span className="medium-pill">MEDIUM</span></div></div><div className="signal-card"><div className="signal-card-title"><span><Signal size={17} /> <strong>Adaptive Signal Matrix</strong></span><div><button className="active">Auto AI</button><button>Manual</button></div></div><div className="timer-row"><div className="timer-light"><i /><i /><i /></div><div><p>CURRENT ACTIVE TIMER</p><strong>0:38</strong><span> sec remaining</span></div></div><div className="ai-active"><Bot size={14} /> SITA Neural Signal Optimizer Active</div></div></div></div>
          <div className="corridor-heading"><strong>GUJARAT GRID CORRIDORS (12)</strong><span>Click any corridor to switch live feed</span></div><div className="corridor-grid">{corridors.map(([name,density,level],index) => <button className={`corridor-card ${index === 0 ? "selected" : ""}`} key={name}><span className="corridor-title"><strong>{name}</strong><em className={`level-${level.toLowerCase()}`}>{level}</em></span><small>ID: CAM-GJ-{String(index + 1).padStart(3,"0")}</small><span className="density">DENSITY<strong>{density}</strong></span><span className="density-bars"><i/><i/><i/><i/></span><span className="map-link">Map <ArrowRight size={11}/></span></button>)}</div>
        </>}
        {active === "AI Agent Center" && <AgentCenter />}
        {active === "Encroachment Monitor" && <EncroachmentView />}
        {active === "Emergency" && <EmergencyView />}
        {active === "Analytics" && <AnalyticsView />}
        {!["Traffic Monitoring","AI Agent Center","Encroachment Monitor","Emergency","Analytics"].includes(active) && <GeneralView title={active} />}
      </main>
    </div>
  </div>;
}

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch(`${API_URL}/api/auth/me`, { credentials: "include" }).then((response) => response.ok ? response.json() : null).then((data) => data && setUser(data.user)).catch(() => {});
  }, []);
  const logout = async () => { await fetch(`${API_URL}/api/auth/logout`, { method: "POST", credentials: "include" }); setUser(null); };
  return user ? <Dashboard user={user} onLogout={logout} /> : <Login onLogin={setUser} />;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
