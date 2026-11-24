import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  Bot,
  Building2,
  CarFront,
  Check,
  Radio,
  Route,
  ShieldCheck,
  Siren,
  TrafficCone,
  Zap
} from "lucide-react";

const agents = [
  { id: "civic", name: "Civic & Road Health Agent", detail: "Validates civic and road-condition reports.", Icon: Building2 },
  { id: "traffic", name: "Traffic Agent", detail: "Analyzes congestion, vehicle flow, and diversion options.", Icon: CarFront },
  { id: "emergency", name: "Accident Emergency Agent", detail: "Assesses incidents and prioritizes emergency response.", Icon: Siren },
  { id: "corridor", name: "Green Corridor Agent", detail: "Plans priority routes for emergency vehicles.", Icon: Route },
  { id: "encroachment", name: "Encroachment Agent", detail: "Checks road obstructions and restricted areas.", Icon: TrafficCone },
  { id: "enforcement", name: "Enforcement Agent", detail: "Reviews potential violations for operator approval.", Icon: ShieldCheck },
  { id: "echallan", name: "E-Challan Agent", detail: "Prepares a draft ticket after evidence validation.", Icon: Check },
  { id: "authority", name: "Authority Coordination Agent", detail: "Packages recommendations for the responsible team.", Icon: Radio },
  { id: "verification", name: "Verification Agent", detail: "Checks that upstream results are consistent.", Icon: ShieldCheck }
];

const scenarios = [
  {
    id: "congestion",
    label: "SCENARIO A",
    title: "Road blockage & congestion",
    category: "Traffic congestion",
    color: "blue",
    description: "Coordinate traffic, road-health, and authority agents around a sample blocked corridor.",
    payload: { incident_id: "DEMO-TRAFFIC-001", zone: "DELHI-NCR-12", event_type: "road_blockage", vehicle_count: 145, severity: "HIGH" },
    agentIds: ["traffic", "civic", "encroachment", "authority", "verification"],
    summary: "Traffic recommendation prepared; operator review is still required."
  },
  {
    id: "infrastructure",
    label: "SCENARIO B",
    title: "Pothole / infrastructure",
    category: "Road condition",
    color: "orange",
    description: "Validate a sample road defect, estimate its traffic impact, and prepare a maintenance handoff.",
    payload: { incident_id: "DEMO-ROAD-002", zone: "DELHI-NCR-04", event_type: "pothole", severity: "MEDIUM" },
    agentIds: ["civic", "traffic", "authority", "verification"],
    summary: "Road-condition report packaged for human review."
  },
  {
    id: "acoustic",
    label: "SCENARIO C",
    title: "Acoustic traffic spike",
    category: "92 dB event",
    color: "purple",
    description: "Correlate a sample noise event with traffic context without storing raw audio.",
    payload: { incident_id: "DEMO-NOISE-003", zone: "DELHI-NCR-09", event_type: "acoustic_spike", noise_db: 92 },
    agentIds: ["civic", "traffic", "authority", "verification"],
    summary: "Noise event correlated with sample traffic context; no audio is uploaded."
  },
  {
    id: "ambulance",
    label: "SCENARIO D",
    title: "Emergency priority wave",
    category: "Ambulance V2X",
    color: "red",
    description: "Coordinate incident triage and a sample green-corridor recommendation.",
    payload: { incident_id: "DEMO-V2X-004", vehicle_id: "AMB-DEMO-07", event_type: "emergency_vehicle", route: ["J1", "J2", "J3"] },
    agentIds: ["emergency", "corridor", "traffic", "authority", "verification"],
    summary: "Priority route recommendation prepared; no signals were changed."
  }
];

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

export default function AIAgentCenter() {
  const [agentStatuses, setAgentStatuses] = useState(() => Object.fromEntries(agents.map((agent) => [agent.id, "Registered"])));
  const [events, setEvents] = useState([
    { id: 0, time: "READY", message: "Local orchestrator is ready for a demo scenario.", type: "ready" }
  ]);
  const [runningId, setRunningId] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const runToken = useRef(0);
  const eventId = useRef(0);

  const addEvent = useCallback((message, type = "info") => {
    const nextId = eventId.current + 1;
    eventId.current = nextId;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    setEvents((current) => [{ id: nextId, time, message, type }, ...current].slice(0, 12));
  }, []);

  useEffect(() => () => {
    runToken.current += 1;
  }, []);

  const runScenario = async (scenario) => {
    if (runningId) return;
    const token = runToken.current + 1;
    runToken.current = token;
    setRunningId(scenario.id);
    setLastRun(null);
    setAgentStatuses((current) => ({
      ...current,
      ...Object.fromEntries(scenario.agentIds.map((id) => [id, "Running"]))
    }));
    addEvent(`${scenario.title}: dispatching ${scenario.agentIds.length} agents concurrently.`, "start");

    await Promise.all(scenario.agentIds.map(async (id, index) => {
      await wait(300 + ((index * 173) % 500));
      if (runToken.current !== token) return;
      const agent = agents.find((item) => item.id === id);
      setAgentStatuses((current) => ({ ...current, [id]: "Complete" }));
      addEvent(`${agent.name} completed its local demo task.`);
    }));

    if (runToken.current !== token) return;
    setAgentStatuses((current) => ({ ...current, verification: "Verified" }));
    setLastRun({ scenarioId: scenario.id, summary: scenario.summary, completedAt: new Date().toLocaleTimeString() });
    addEvent("Verification Agent: scenario outputs passed the demo consistency check.", "success");
    setRunningId(null);
  };

  return (
    <section className="agent-center-page">
      <header className="multiagent-hero">
        <div className="multiagent-copy">
          <div className="multiagent-kickers">
            <span><Zap size={13} /> SYNCHRONIZED MULTI-AGENT ORCHESTRATION</span>
            <span className="agent-count"><Bot size={13} /> 9 REGISTERED AGENTS</span>
          </div>
          <h1>TrafficNexus <span>Multi-Agent AI</span></h1>
          <p>Coordinate traffic, road health, emergency, and verification agents in one operator-supervised workflow.</p>
          <div className="multiagent-flow">Event intake <i /> Agent analysis <i /> Verification <i /> Operator review</div>
        </div>
        <div className="multiagent-summary">
          <div><small>REGISTERED AGENTS</small><strong>9/9</strong><span>Local registry</span></div>
          <div><small>ORCHESTRATOR</small><strong className="ready-value">READY</strong><span>Demo mode</span></div>
        </div>
      </header>

      <div className="demo-safety-note"><Activity size={15} /><span><strong>Demo orchestration only.</strong> Scenarios use local sample rules; no live camera data, model inference, tickets, or traffic signals are changed.</span></div>

      <section className="agent-registry panel-surface">
        <div className="workspace-section-heading">
          <div><span className="section-icon violet"><Bot size={17} /></span><div><h2>Registered agent capability grid</h2><p>Configured responsibilities; registration is not a live health probe.</p></div></div>
          <span className="registry-ready"><i /> {agents.length} AGENTS READY</span>
        </div>
        <div className="registry-grid">
          {agents.map(({ id, name, detail, Icon }) => (
            <article className={`registry-agent ${agentStatuses[id] === "Running" ? "is-running" : ""}`} key={id}>
              <div className="registry-agent-top"><span className="registry-agent-icon"><Icon size={16} /></span><span className={`registry-status ${agentStatuses[id].toLowerCase()}`}>{agentStatuses[id]}</span></div>
              <h3>{name}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section">
        <div className="workspace-section-heading workflow-heading">
          <div><span className="section-icon blue"><Route size={17} /></span><div><h2>Coordinated workflows</h2><p>Run a sample incident through multiple agents at once.</p></div></div>
          {runningId && <span className="workflow-running"><i /> AGENTS WORKING</span>}
        </div>
        <div className="scenario-grid">
          {scenarios.map((scenario) => (
            <article className={`scenario-card ${scenario.color}`} key={scenario.id}>
              <div className="scenario-meta"><span>{scenario.label}</span><small>{scenario.category}</small></div>
              <h3>{scenario.title}</h3>
              <p>{scenario.description}</p>
              <pre><code>{JSON.stringify(scenario.payload, null, 2)}</code></pre>
              <div className="scenario-agent-count"><Bot size={13} /> {scenario.agentIds.length} agents · parallel demo</div>
              <button type="button" disabled={Boolean(runningId)} onClick={() => runScenario(scenario)}>
                <Zap size={14} /> {runningId === scenario.id ? "RUNNING AGENTS..." : "RUN SYNCHRONIZED PIPELINE"}
              </button>
            </article>
          ))}
        </div>
      </section>

      {lastRun && <div className="workflow-result"><Check size={16} /><span><strong>{scenarios.find((scenario) => scenario.id === lastRun.scenarioId)?.title} complete</strong>{lastRun.summary}</span><small>{lastRun.completedAt}</small></div>}

      <section className="event-stream panel-surface">
        <div className="workspace-section-heading">
          <div><span className="section-icon dark"><Radio size={17} /></span><div><h2>Local orchestration event stream</h2><p>Recent events from this browser session.</p></div></div>
          <span className="stream-status"><i /> LOCAL</span>
        </div>
        <div className="event-list" aria-live="polite">
          {events.map((event) => <div className={`event-row ${event.type}`} key={event.id}><time>{event.time}</time><span className="event-dot" /><p>{event.message}</p></div>)}
        </div>
      </section>
    </section>
  );
}
