import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowRight,
  Bell,
  CarFront,
  CheckCircle2,
  Eye,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  ShieldCheck,
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

function Dashboard({ user, onLogout }) {
  const [mobileNav, setMobileNav] = useState(false);
  const stats = [
    { label: "Active cameras", value: "24", change: "+3 today", icon: <Eye /> },
    { label: "Violations detected", value: "1,284", change: "+18.4%", icon: <TrafficCone /> },
    { label: "Resolution rate", value: "94.8%", change: "+2.1%", icon: <CheckCircle2 /> },
    { label: "Live alerts", value: "08", change: "Needs attention", icon: <Bell /> }
  ];
  return <div className="dashboard">
    <header className="dashboard-header">
      <div className="dashboard-brand"><div className="signal small"><i /><i /><i /></div><div><strong>Intelligent Traffic</strong><small>Violation detection system</small></div></div>
      <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? <X /> : <Menu />}</button>
      <nav className={mobileNav ? "open" : ""}><a className="selected">Overview</a><a>Live map</a><a>Violations</a><a>Reports</a></nav>
      <div className="user-menu"><div className="avatar">{(user?.name || "A").charAt(0).toUpperCase()}</div><span>{user?.name || "Operator"}<small>{user?.role || "Admin"}</small></span><button onClick={onLogout}>Sign out</button></div>
    </header>
    <main className="dashboard-main">
      <div className="dashboard-intro"><div><p className="eyebrow">MONDAY, NOVEMBER 16, 2026</p><h1>Good morning, {user?.name?.split(" ")[0] || "Operator"}.</h1><p>Here’s what’s happening across your traffic network today.</p></div><button className="outline-button"><MapPin size={16} /> View live map</button></div>
      <div className="stats-grid">{stats.map((stat) => <div className="stat-card" key={stat.label}><div className="stat-top"><span className="stat-icon">{stat.icon}</span><span className={stat.label === "Live alerts" ? "warning-text" : "positive-text"}>{stat.change}</span></div><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>
      <div className="dashboard-grid"><section className="activity-card"><div className="section-heading"><div><p className="eyebrow">NETWORK PULSE</p><h2>Detection activity</h2></div><select><option>Last 7 days</option><option>Last 30 days</option></select></div><div className="chart"><div className="chart-grid"><span>400</span><span>300</span><span>200</span><span>100</span><span>0</span></div><div className="bars">{[38, 54, 46, 70, 61, 82, 91].map((height, index) => <div className="bar-col" key={index}><div className="bar" style={{ height: `${height}%` }} /><small>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</small></div>)}</div></div></section><section className="alerts-card"><div className="section-heading"><div><p className="eyebrow">ATTENTION REQUIRED</p><h2>Recent alerts</h2></div><button className="text-button">View all</button></div>{["Signal violation · Junction 04", "Speed limit · Ring Road", "No helmet · Central Avenue"].map((item, index) => <div className="alert-row" key={item}><span className={`alert-indicator level-${index + 1}`} /><div><strong>{item}</strong><small>{index + 2} minutes ago · Camera {String(index + 12).padStart(2, "0")}</small></div><ArrowRight size={16} /></div>)}</section></div>
    </main>
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
