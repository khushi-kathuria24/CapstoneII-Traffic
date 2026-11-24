import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle2,
  CircleAlert,
  Eye,
  FileVideo2,
  Gauge,
  Layers3,
  Radio,
  Upload,
  Zap
} from "lucide-react";

const sampleVideos = [
  { label: "Load sample video 1", name: "Traffic flow sample", url: "/videos/video_2.mp4" },
  { label: "Load sample video 2", name: "Road monitoring sample", url: "/videos/video_4.mp4" }
];

export default function MLDetection() {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    if (!preview?.objectUrl) return undefined;
    return () => URL.revokeObjectURL(preview.url);
  }, [preview]);

  const selectFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const kind = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : null;
    if (!kind) {
      setFileError("Choose a video or image file to preview.");
      return;
    }
    setFileError("");
    setPreview({ kind, name: file.name, url: URL.createObjectURL(file), objectUrl: true });
  };

  const loadSample = (sample) => {
    setFileError("");
    setPreview({ kind: "video", name: sample.name, url: sample.url, objectUrl: false });
  };

  return (
    <section className="ml-detection-page">
      <header className="ml-hero panel-surface">
        <div className="ml-hero-icon"><FileVideo2 size={20} /></div>
        <div className="ml-hero-copy">
          <span className="ml-eyebrow">SYNCHRONIZED VISION &amp; MULTI-MODAL ML LAYER</span>
          <h1>Full Video ML Analyzer, Segmentation &amp; Telemetry Engine</h1>
          <p>Preview traffic video or frames here. Vehicle detection, instance segmentation, turning movement counts, lane analysis, and collision estimates become available after the model service is connected.</p>
        </div>
        <div className="ml-service-state"><span><i /> ML SERVICE NOT CONNECTED</span><small>No inference endpoint configured</small></div>
      </header>

      <div className="ml-demo-notice"><AlertTriangle size={15} /><span><strong>Preview only:</strong> selected media stays in this browser. No model inference runs and no video is uploaded to the server.</span></div>

      <div className="ml-workspace">
        <section className="ml-video-panel panel-surface">
          <div className="ml-panel-heading">
            <div><h2>Traffic video / feed canvas</h2><p>Local media preview; detection overlays require a connected model service.</p></div>
            <span className="mask-toggle"><Layers3 size={14} /> INSTANCE MASKS <small>OFFLINE</small></span>
          </div>
          <div className="ml-video-canvas">
            {preview?.kind === "video" && <video key={preview.url} src={preview.url} controls muted playsInline preload="metadata" />}
            {preview?.kind === "image" && <img src={preview.url} alt={`Local preview of ${preview.name}`} />}
            {!preview && <div className="ml-empty-canvas"><Camera size={38} /><strong>No video or frame selected</strong><span>Choose an MP4/video or an image frame to preview.</span></div>}
            {preview && <span className="ml-preview-name"><Eye size={13} /> {preview.name}</span>}
          </div>
          {fileError && <p className="ml-file-error" role="alert">{fileError}</p>}
          <input ref={fileInputRef} className="ml-file-input" type="file" accept="video/mp4,video/webm,image/jpeg,image/png" onChange={selectFile} aria-label="Select a video or frame for local preview" />
          <div className="ml-video-actions">
            <button type="button" className="ml-secondary-action" onClick={() => fileInputRef.current?.click()}><Upload size={14} /> Choose video / frame</button>
            {sampleVideos.map((sample) => <button type="button" className="ml-sample-action" key={sample.url} onClick={() => loadSample(sample)}><Zap size={13} /> {sample.label}</button>)}
            <button type="button" className="ml-analyze-action" disabled title="Connect an inference service to enable analysis."><Activity size={14} /> Analyze frame</button>
          </div>
          <p className="ml-model-path"><strong>Model folder:</strong> <code>server/ml/models/</code> <span>Weights go on the server, not in the client upload folder.</span></p>
        </section>

        <section className="ml-telemetry-panel panel-surface">
          <div className="ml-panel-heading"><div><h2><Activity size={16} /> Live telemetry &amp; collision index</h2><p>Waiting for inference results</p></div><span className="offline-pill">OFFLINE</span></div>
          <div className="ml-telemetry-card">
            <div className="ml-card-row"><strong>Congestion level</strong><span className="neutral-chip">NO DATA</span></div>
            <div className="ml-pair-metrics"><div><small>TOTAL VEHICLES</small><strong>--</strong></div><div><small>AVG FLOW SPEED</small><strong>-- <em>km/h</em></strong></div></div>
          </div>
          <div className="ml-tmc-card">
            <div className="ml-card-row"><strong><Radio size={14} /> Turning movement counts</strong><span>-- turns</span></div>
            <div className="ml-turn-grid"><div><span>STRAIGHT</span><strong>--</strong></div><div><span>LEFT TURN</span><strong>--</strong></div><div><span>RIGHT TURN</span><strong>--</strong></div></div>
          </div>
          <div className="ml-signal-grid">
            <div className="ml-stat-tile green"><Gauge size={14} /><small>LANE DISCIPLINE</small><strong>--</strong><span>Awaiting model</span></div>
            <div className="ml-stat-tile red"><CircleAlert size={14} /><small>COLLISION RISK (TTC)</small><strong>--</strong><span>Awaiting model</span></div>
          </div>
          <div className="ml-echallan-card"><div><CheckCircle2 size={15} /><span><small>AUTO E-CHALLANS</small><strong>Disabled</strong></span></div><span>No ticket will be issued from this preview.</span></div>
        </section>

        <section className="ml-results-panel">
          <div className="ml-results-heading"><div className="ml-card-row"><h2><Eye size={16} /> Detection results</h2><span className="result-count">0 found</span></div><p>Objects, events, OCR, and violations</p></div>
          <div className="ml-results-empty"><Camera size={24} /><span>Connect the ML service and run analysis to view detections.</span></div>
          <div className="ml-result-footer"><CircleAlert size={13} /> No model output is available yet.</div>
        </section>
      </div>

      <div className="ml-bottom-note"><Gauge size={15} /><span>Model outputs will appear here after the inference API, preprocessing, and model-specific adapters are configured.</span></div>
    </section>
  );
}
