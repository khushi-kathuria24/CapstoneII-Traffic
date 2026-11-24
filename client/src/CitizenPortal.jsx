import { useState } from "react";
import {
  Activity,
  CalendarDays,
  Camera,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Construction,
  CreditCard,
  FileText,
  Footprints,
  LogOut,
  Map,
  MapPin,
  Menu,
  Newspaper,
  ParkingCircle,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wind,
  X
} from "lucide-react";
import DelhiTrafficMap from "./DelhiTrafficMap.jsx";

const citizenSections = [
  ["Smart City & Pedestrian Shield", ShieldCheck],
  ["Book Parking", ParkingCircle],
  ["Live Traffic Map", Map],
  ["My Bookings", CalendarDays],
  ["My Fines", CreditCard],
  ["Report Violation", CircleAlert],
  ["Report Road Issue", Construction],
  ["Road News", Newspaper]
];

const sampleBookings = [
  { id: "DL-PARK-1042", place: "Connaught Place Multi-level Parking", time: "Today, 6:00 PM", status: "Confirmed" },
  { id: "DL-PARK-0987", place: "India Gate Visitor Parking", time: "Yesterday, 11:30 AM", status: "Completed" }
];

const sampleFines = [
  { id: "DL-2026-94429", type: "Speeding", amount: 1000, place: "Ring Road, Dhaula Kuan", date: "15 Nov 2026" },
  { id: "DL-2026-42602", type: "No-parking zone", amount: 1000, place: "Connaught Place", date: "12 Nov 2026" },
  { id: "DL-2026-31570", type: "Signal violation", amount: 2000, place: "ITO Junction", date: "08 Nov 2026" }
];

function CitizenBanner({ eyebrow, title, detail, tone = "green", children }) {
  return (
    <section className={`citizen-banner ${tone}`}>
      <div>
        <span className="citizen-kicker"><Sparkles size={14} /> {eyebrow}</span>
        <h1>{title}</h1>
        <p>{detail}</p>
        {children}
      </div>
      <span className="citizen-banner-status"><i /> SMART CITY SHIELD ACTIVE</span>
    </section>
  );
}

function CitizenIssueForm({ title, issueType, onSubmitted, includeVehicle = false }) {
  const [submitted, setSubmitted] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmitted({
      id: `DL-CIT-${Date.now().toString().slice(-6)}`,
      title: data.get("details") || issueType,
      location: data.get("location"),
      status: "Submitted"
    });
    setSubmitted(true);
    event.currentTarget.reset();
  };

  return (
    <section className="citizen-card citizen-report-card">
      <div className="citizen-section-title">
        <span className="citizen-icon green"><FileText size={18} /></span>
        <div><h2>{title}</h2><p>Share a report with the Delhi Smart City operations team.</p></div>
      </div>
      {submitted && <div className="citizen-success" role="status"><CheckCircle2 size={17} /> Report received in this demo session.</div>}
      <form className="citizen-form" onSubmit={submit}>
        <label>Issue type
          <select name="type" defaultValue={issueType}>
            {[issueType, "Pothole", "Roadblock", "Water logging", "Streetlight outage", "Illegal parking", "Other"].filter((item, index, list) => list.indexOf(item) === index).map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        {includeVehicle && <label>Vehicle number<input name="vehicle" placeholder="DL 01 AB 1234" required /></label>}
        <label>Location or landmark<input name="location" placeholder="e.g. Near ITO Metro Station, Delhi" required /></label>
        <label className="citizen-form-wide">Details<textarea name="details" placeholder="Describe what happened and any helpful details..." rows="4" required /></label>
        <label className="citizen-form-wide">Attach a photo (optional)<input name="photo" type="file" accept="image/*" /></label>
        <button className="citizen-primary-button" type="submit"><Send size={15} /> Submit report</button>
      </form>
      <p className="citizen-demo-note">Demo UI only. Reports are not sent to a city service.</p>
    </section>
  );
}

function PedestrianShield({ activeTool, onToolChange, grievances, onIssueSubmitted }) {
  const [walkRequest, setWalkRequest] = useState(false);

  return (
    <div className="citizen-page-stack">
      <CitizenBanner
        eyebrow="SMART CITY CITIZEN ASSISTANT"
        title="Pedestrian safety, pollution shield & smart reporting"
        detail="Pedestrian crossing assistance, neighborhood air-quality updates, and simple civic reporting."
      >
        <div className="citizen-tool-tabs">
          {[
            ["crossing", "Pedestrian Crosswalk Shield", Footprints],
            ["pollution", "Noise & Air Pollution Heatmap", Wind],
            ["report", "Report a City Issue", Camera],
            ["grievances", `Track Grievances (${grievances.length})`, FileText]
          ].map(([key, title, Icon]) => (
            <button type="button" className={activeTool === key ? "active" : ""} key={key} onClick={() => onToolChange(key)}>
              <Icon size={14} /> {title}
            </button>
          ))}
        </div>
      </CitizenBanner>

      {activeTool === "crossing" && (
        <div className="citizen-two-column">
          <section className="citizen-card">
            <div className="citizen-section-title">
              <span className="citizen-icon green"><Footprints size={18} /></span>
              <div><h2>Live Pedestrian Crossing Assistant</h2><p>Roadside unit at ITO Crosswalk, New Delhi</p></div>
              <span className="citizen-live-tag"><i /> CONNECTED</span>
            </div>
            <div className={`crossing-status ${walkRequest ? "safe" : ""}`}>
              <span>{walkRequest ? "WALK PHASE REQUESTED" : "VEHICLE APPROACHING - PLEASE WAIT"}</span>
              <strong>{walkRequest ? "25" : "18"}</strong>
              <small>SECONDS TO {walkRequest ? "EXTENDED WALK PHASE" : "SAFE CROSSING"}</small>
              <p>Location: ITO Crosswalk · Approaching vehicle: DL-8C-021 · Sample sensor data</p>
            </div>
            <button className="citizen-primary-button" type="button" onClick={() => setWalkRequest(true)} disabled={walkRequest}>
              <Footprints size={15} /> {walkRequest ? "Walk phase request sent" : "Request extended walk phase (+25s)"}
            </button>
          </section>
          <section className="citizen-card">
            <div className="citizen-section-title"><span className="citizen-icon blue"><ShieldCheck size={18} /></span><div><h2>Pedestrian safety guidelines</h2><p>Smart safety shield at monitored intersections</p></div></div>
            {[
              ["Predictive braking warning", "Vehicles approaching above 45 km/h trigger an early crossing alert."],
              ["Night crosswalk illumination", "Low-light sensors can request brighter crossing lights."],
              ["Connected vehicle alert", "Approaching vehicles can receive a pedestrian warning."]
            ].map(([title, detail], index) => <article className={`citizen-guideline tone-${index}`} key={title}><strong>{index + 1}. {title}</strong><p>{detail}</p></article>)}
          </section>
        </div>
      )}

      {activeTool === "pollution" && (
        <section className="citizen-card">
          <div className="citizen-section-title"><span className="citizen-icon green"><Wind size={18} /></span><div><h2>Neighborhood air & noise snapshot</h2><p>Illustrative monitoring readings for central Delhi.</p></div><span className="citizen-demo-tag">SAMPLE READINGS</span></div>
          <div className="citizen-stat-grid">
            <div><small>AIR QUALITY INDEX</small><strong className="stat-amber">142</strong><span>Moderate · ITO</span></div>
            <div><small>PM 2.5</small><strong>58 <small>µg/m³</small></strong><span>Sample sensor reading</span></div>
            <div><small>NOISE LEVEL</small><strong>68 <small>dB</small></strong><span>Daytime average</span></div>
            <div><small>NEARBY MONITORS</small><strong>6</strong><span>Within 3 km</span></div>
          </div>
          <div className="citizen-heatmap"><span className="heat-zone green">India Gate <strong>Good</strong></span><span className="heat-zone amber">Connaught Place <strong>Moderate</strong></span><span className="heat-zone red">ITO <strong>Elevated</strong></span><span className="heat-zone green">Lodhi Garden <strong>Good</strong></span></div>
          <p className="citizen-demo-note">Readings are illustrative and are not connected to live pollution sensors.</p>
        </section>
      )}

      {activeTool === "report" && <CitizenIssueForm title="Report a city issue" issueType="Hawker / parking / honking" onSubmitted={onIssueSubmitted} />}

      {activeTool === "grievances" && <GrievanceList grievances={grievances} />}
    </div>
  );
}

function GrievanceList({ grievances }) {
  return (
    <section className="citizen-card">
      <div className="citizen-section-title"><span className="citizen-icon blue"><FileText size={18} /></span><div><h2>My civic reports</h2><p>Follow updates on reports created in this session.</p></div></div>
      <div className="citizen-list">
        {grievances.length === 0 && <p className="citizen-empty">No reports yet. Submit a road issue or violation to track it here.</p>}
        {grievances.map((item) => <article className="citizen-list-row" key={item.id}><span className="citizen-icon amber"><Construction size={17} /></span><div><strong>{item.title}</strong><small>{item.location || "Delhi"} · {item.id}</small></div><span className="citizen-status-pill">{item.status}</span></article>)}
      </div>
    </section>
  );
}

function ParkingPage({ onReserve }) {
  const [vehicle, setVehicle] = useState("4 Wheeler");
  const [area, setArea] = useState("Connaught Place");
  const [reserved, setReserved] = useState("");

  const spaces = [
    { id: "DL-CP-041", name: "Connaught Place - Block A", spaces: 18, price: 60, type: "4 Wheeler" },
    { id: "DL-CP-022", name: "Connaught Place - Block C", spaces: 11, price: 50, type: "4 Wheeler" },
    { id: "DL-IG-014", name: "India Gate Visitor Parking", spaces: 26, price: 40, type: "4 Wheeler" },
    { id: "DL-EV-007", name: "Rajiv Chowk EV Charging Bay", spaces: 6, price: 75, type: "EV" },
    { id: "DL-2W-016", name: "ITO Two-wheeler Parking", spaces: 32, price: 20, type: "2 Wheeler" }
  ].filter((space) => space.type === vehicle);

  const reserve = (space) => {
    setReserved(space.id);
    onReserve({ id: `DL-PARK-${Date.now().toString().slice(-4)}`, place: space.name, time: "Today, 6:00 PM", status: "Confirmed" });
  };

  return (
    <div className="citizen-page-stack">
      <CitizenBanner eyebrow="SMART CITY MOBILITY" title="Book parking" detail="Find a nearby Delhi parking space and reserve it for your visit." tone="blue" />
      {reserved && <div className="citizen-success" role="status"><CheckCircle2 size={17} /> Parking reservation added to My Bookings for this demo session.</div>}
      <div className="parking-type-tabs">
        {["4 Wheeler", "2 Wheeler", "EV"].map((item) => <button type="button" key={item} className={vehicle === item ? "active" : ""} onClick={() => { setVehicle(item); setReserved(""); }}><ParkingCircle size={16} /> {item}</button>)}
      </div>
      <div className="citizen-parking-layout">
        <section className="citizen-card parking-schedule">
          <div className="citizen-section-title"><span className="citizen-icon green"><CalendarDays size={18} /></span><div><h2>Booking schedule</h2><p>Choose your area and arrival time</p></div></div>
          <label>SELECT AREA<select value={area} onChange={(event) => setArea(event.target.value)}><option>Connaught Place</option><option>India Gate</option><option>ITO</option><option>Rajiv Chowk</option></select></label>
          <label>SELECT DATE<input type="date" defaultValue="2026-11-25" /></label>
          <label>ARRIVAL TIME<input type="time" defaultValue="18:00" /></label>
          <label>DURATION<select defaultValue="1"><option value="1">1 hour</option><option value="2">2 hours</option><option value="3">3 hours</option></select></label>
          <div className="citizen-pricing-note"><CheckCircle2 size={16} /><span><strong>Smart availability</strong><small>Sample rates and spaces; no payment is collected.</small></span></div>
        </section>
        <section className="citizen-card parking-results">
          <div className="citizen-section-title"><span className="citizen-icon blue"><MapPin size={18} /></span><div><h2>Available near {area}</h2><p>{spaces.length} sample locations in Delhi</p></div></div>
          {spaces.map((space) => (
            <article className="parking-space" key={space.id}>
              <div><strong>{space.name}</strong><small>{space.id} · {space.spaces} spaces available</small></div>
              <span className="parking-price">₹{space.price}<small>/hour</small></span>
              <button type="button" className="citizen-secondary-button" onClick={() => reserve(space)} disabled={reserved === space.id}>{reserved === space.id ? "Reserved" : "Reserve"}</button>
            </article>
          ))}
          {spaces.length === 0 && <p className="citizen-empty">No sample spaces for this vehicle type yet.</p>}
        </section>
      </div>
    </div>
  );
}

function BookingsPage({ bookings }) {
  return (
    <section className="citizen-card">
      <div className="citizen-section-title"><span className="citizen-icon green"><CalendarDays size={18} /></span><div><h2>My parking bookings</h2><p>Reservations made in this browser session.</p></div></div>
      <div className="citizen-list">
        {bookings.map((booking) => <article className="citizen-list-row" key={booking.id}><span className="citizen-icon blue"><ParkingCircle size={17} /></span><div><strong>{booking.place}</strong><small>{booking.id} · {booking.time}</small></div><span className="citizen-status-pill">{booking.status}</span></article>)}
      </div>
    </section>
  );
}

function FinesPage() {
  const [message, setMessage] = useState("");
  const total = sampleFines.reduce((sum, fine) => sum + fine.amount, 0);

  return (
    <div className="citizen-page-stack">
      <CitizenBanner eyebrow="MUNICIPAL ENFORCEMENT GRID" title="Fine settlement portal" detail="Review sample challans and evidence before using a secure government payment channel." tone="red" />
      <section className="fine-total-card"><div><small>TOTAL SAMPLE PAYABLE (INR)</small><strong>₹{total.toLocaleString("en-IN")}.00</strong></div><span>Demo only · Payment gateway not connected</span></section>
      {message && <div className="citizen-success" role="status">{message}</div>}
      <div className="fine-grid">
        {sampleFines.map((fine) => <article className="fine-card" key={fine.id}><div className="fine-card-top"><span className="citizen-icon red"><CircleAlert size={18} /></span><span className="fine-pending">PENDING</span></div><strong>{fine.type}</strong><small>{fine.id} · {fine.date}</small><p><MapPin size={14} /> {fine.place}</p><div className="fine-card-bottom"><b>₹{fine.amount.toLocaleString("en-IN")}</b><button type="button" className="citizen-secondary-button" onClick={() => setMessage("Demo only: payment is not available in this preview.")}>View challan</button></div></article>)}
      </div>
    </div>
  );
}

function NewsPage() {
  const stories = [
    ["TRAFFIC ADVISORY", "Temporary diversions around India Gate this evening", "Use C-Hexagon and follow on-road traffic staff directions.", "12 min ago"],
    ["ROAD WORK", "Night resurfacing work on Ring Road near Dhaula Kuan", "One lane may be restricted between 10 PM and 5 AM.", "1 hour ago"],
    ["PUBLIC TRANSPORT", "Metro interchange advisory for Rajiv Chowk", "Allow extra transfer time during the evening peak.", "Today"]
  ];

  return (
    <div className="citizen-page-stack">
      <CitizenBanner eyebrow="DELHI COMMUTE UPDATES" title="Road news & advisories" detail="Sample city updates to help residents plan their journeys." tone="blue" />
      <div className="citizen-news-grid">{stories.map(([tag, title, detail, time]) => <article className="citizen-card citizen-news-card" key={title}><span className="citizen-news-tag"><Newspaper size={13} /> {tag}</span><h2>{title}</h2><p>{detail}</p><small><Clock3 size={13} /> {time}</small></article>)}</div>
      <p className="citizen-demo-note">These advisories are sample content and are not an official Delhi traffic bulletin.</p>
    </div>
  );
}

export default function CitizenPortal({ user, onLogout }) {
  const [active, setActive] = useState("Live Traffic Map");
  const [activeSafetyTool, setActiveSafetyTool] = useState("crossing");
  const [mobileNav, setMobileNav] = useState(false);
  const [bookings, setBookings] = useState(sampleBookings);
  const [grievances, setGrievances] = useState([]);

  const onIssueSubmitted = (issue) => setGrievances((current) => [issue, ...current]);

  return (
    <div className="citizen-shell">
      <aside className={`citizen-sidebar ${mobileNav ? "open" : ""}`}>
        <div className="citizen-brand">
          <span className="citizen-brand-icon"><Sparkles size={19} /></span>
          <span><strong>TrafficNexus</strong><small>DELHI SMART CITY PORTAL</small></span>
          <b>CITIZEN</b>
        </div>
        <nav className="citizen-nav">
          {citizenSections.map(([label, Icon]) => <button key={label} type="button" className={active === label ? "active" : ""} onClick={() => { setActive(label); setMobileNav(false); }}><Icon size={15} /><span>{label}</span></button>)}
        </nav>
        <div className="citizen-sidebar-footer"><i /> Citizen safety shield active</div>
      </aside>

      <div className="citizen-main">
        <header className="citizen-header">
          <button type="button" className="citizen-menu-button" onClick={() => setMobileNav((open) => !open)} aria-label="Toggle citizen navigation">{mobileNav ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="citizen-shield-status"><i /> CITIZEN SAFETY SHIELD ACTIVE</div>
          <div className="citizen-header-actions">
            <button type="button" className="citizen-obu-button"><Activity size={14} /> Mobile OBU View</button>
            <div className="citizen-profile"><span>C</span><div><strong>{user?.name || "Citizen"}</strong><small>{user?.role === "admin" ? "Demo portal preview" : "Verified citizen"}</small></div></div>
            <button type="button" className="logout-button citizen-logout" onClick={onLogout}><LogOut size={14} /> Logout</button>
          </div>
        </header>

        <main className="citizen-content">
          {active === "Live Traffic Map" && <DelhiTrafficMap />}
          {active === "Smart City & Pedestrian Shield" && <PedestrianShield activeTool={activeSafetyTool} onToolChange={setActiveSafetyTool} grievances={grievances} onIssueSubmitted={onIssueSubmitted} />}
          {active === "Book Parking" && <ParkingPage onReserve={(booking) => setBookings((current) => [booking, ...current])} />}
          {active === "My Bookings" && <BookingsPage bookings={bookings} />}
          {active === "My Fines" && <FinesPage />}
          {active === "Report Violation" && <CitizenIssueForm title="Report a traffic violation" issueType="Unsafe driving" includeVehicle onSubmitted={onIssueSubmitted} />}
          {active === "Report Road Issue" && <CitizenIssueForm title="Report a road issue" issueType="Pothole" onSubmitted={onIssueSubmitted} />}
          {active === "Road News" && <NewsPage />}
        </main>
      </div>
    </div>
  );
}
