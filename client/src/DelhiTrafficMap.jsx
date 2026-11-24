import { useEffect, useMemo, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import { ArrowUpRight, LocateFixed, MapPin, Navigation, Search, Signal } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./citizen-portal.css";

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
let googleMapsLibrary;

const trafficPoints = [
  { name: "Connaught Place", position: [28.6328, 77.2197], level: "Heavy", volume: "Slow moving", type: "Congestion" },
  { name: "India Gate", position: [28.6129, 77.2295], level: "Moderate", volume: "34 km/h", type: "Congestion" },
  { name: "ITO Junction", position: [28.6289, 77.241], level: "Heavy", volume: "Queue building", type: "Incident" },
  { name: "Kashmere Gate", position: [28.6663, 77.2336], level: "Light", volume: "42 km/h", type: "Congestion" },
  { name: "Dhaula Kuan", position: [28.591, 77.161], level: "Moderate", volume: "28 km/h", type: "Congestion" },
  { name: "AIIMS Flyover", position: [28.5672, 77.21], level: "Heavy", volume: "Slow moving", type: "Incident" },
  { name: "Saket District Centre", position: [28.5244, 77.2066], level: "Light", volume: "46 km/h", type: "Congestion" }
];

const route = [
  [28.667, 77.234],
  [28.647, 77.226],
  [28.633, 77.22],
  [28.629, 77.241],
  [28.613, 77.23],
  [28.591, 77.161]
];

function MapFocus({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 0.8 });
  }, [center, map]);
  return null;
}

function GoogleMapCanvas({ apiKey, center, points, trafficEnabled, onStatus, mapId }) {
  const elementRef = useRef(null);
  const mapRef = useRef(null);
  const trafficLayerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const markersRef = useRef([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    onStatus("loading");

    const initialize = async () => {
      try {
        if (!googleMapsLibrary) {
          setOptions({ key: apiKey, v: "weekly" });
          googleMapsLibrary = importLibrary("maps");
        }
        const { Map: GoogleMap } = await googleMapsLibrary;
        if (cancelled || !elementRef.current) return;

        const map = new GoogleMap(elementRef.current, {
          center: { lat: center[0], lng: center[1] },
          zoom: 12,
          gestureHandling: "greedy",
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          ...(mapId ? { mapId } : {})
        });
        const trafficLayer = new window.google.maps.TrafficLayer();
        mapRef.current = map;
        trafficLayerRef.current = trafficLayer;
        infoWindowRef.current = new window.google.maps.InfoWindow();
        setReady(true);
        onStatus("ready");
      } catch (error) {
        if (!cancelled) {
          console.error("Google Maps failed to initialize:", error);
          onStatus("error");
        }
      }
    };

    initialize();
    return () => {
      cancelled = true;
      trafficLayerRef.current?.setMap(null);
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [apiKey, mapId, onStatus]);

  useEffect(() => {
    if (mapRef.current) mapRef.current.panTo({ lat: center[0], lng: center[1] });
  }, [center, ready]);

  useEffect(() => {
    if (trafficLayerRef.current) {
      trafficLayerRef.current.setMap(ready && trafficEnabled ? mapRef.current : null);
    }
  }, [ready, trafficEnabled]);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.google?.maps) return;
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = points.map((point) => {
      const color = point.level === "Heavy" ? "#e45f62" : point.level === "Moderate" ? "#e8a23d" : "#49a981";
      const marker = new window.google.maps.Marker({
        map: mapRef.current,
        position: { lat: point.position[0], lng: point.position[1] },
        title: point.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: color,
          fillOpacity: 0.95,
          strokeColor: "#ffffff",
          strokeWeight: 3
        }
      });
      marker.addListener("click", () => {
        infoWindowRef.current.setContent(`<strong>${point.name}</strong><br>${point.level} sample traffic · ${point.volume}`);
        infoWindowRef.current.open({ map: mapRef.current, anchor: marker });
      });
      return marker;
    });
  }, [points, ready]);

  return <div className={`google-map-canvas ${ready ? "visible" : ""}`} ref={elementRef} />;
}

export default function DelhiTrafficMap() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [focus, setFocus] = useState([28.6139, 77.209]);
  const [notice, setNotice] = useState("");
  const [googleMapStatus, setGoogleMapStatus] = useState(googleMapsApiKey ? "loading" : "unconfigured");
  const [trafficEnabled, setTrafficEnabled] = useState(true);
  const visiblePoints = useMemo(() => trafficPoints.filter((point) => filter === "All" || point.type === filter), [filter]);
  const googleMapReady = googleMapStatus === "ready";

  const searchLocation = (event) => {
    event.preventDefault();
    const match = trafficPoints.find((point) => point.name.toLowerCase().includes(search.trim().toLowerCase()));
    if (!match) {
      setNotice("Try Connaught Place, ITO, India Gate, or Saket.");
      return;
    }
    setFocus(match.position);
    setNotice(`Centered on ${match.name}.`);
  };

  const centerMap = () => {
    setFocus([28.6139, 77.209]);
    setNotice("Map centered on New Delhi.");
  };

  return (
    <section className="traffic-map-page">
      <div className="traffic-map-heading">
        <div>
          <p className="traffic-map-eyebrow"><span /> DELHI CITY NAVIGATOR</p>
          <h1>Traffic <span>Map</span></h1>
          <p className="traffic-map-subtitle">Explore Delhi streets, key junctions, and sample congestion reports.</p>
        </div>
        <div className={`map-data-badge ${googleMapReady ? "google-ready" : ""}`}><Signal size={15} /> {googleMapReady ? (trafficEnabled ? "GOOGLE MAPS + TRAFFIC" : "GOOGLE MAPS") : "MAP PREVIEW"}</div>
      </div>

      <div className="traffic-map-layout">
        <aside className="map-sidebar">
          <form className="map-search" onSubmit={searchLocation}>
            <Search size={17} />
            <input aria-label="Search a Delhi location" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Delhi locations..." />
            <button type="submit" aria-label="Search map"><ArrowUpRight size={17} /></button>
          </form>
          {notice && <p className="map-notice" role="status">{notice}</p>}

          <div className="map-filter-row" aria-label="Traffic map filters">
            {["All", "Congestion", "Incident"].map((item) => (
              <button key={item} type="button" className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}</button>
            ))}
          </div>

          <div className="map-feed-heading">
            <div><small>MONITORED JUNCTIONS</small><strong>{visiblePoints.length} locations</strong></div>
            <button type="button" onClick={centerMap} aria-label="Recenter map"><LocateFixed size={17} /></button>
          </div>

          <div className="map-point-list">
            {visiblePoints.map((point) => (
              <button className="map-point-row" key={point.name} type="button" onClick={() => { setFocus(point.position); setNotice(`Centered on ${point.name}.`); }}>
                <span className={`traffic-level-dot ${point.level.toLowerCase()}`} />
                <span className="map-point-copy"><strong>{point.name}</strong><small>{point.type} · {point.volume}</small></span>
                <span className={`traffic-level-label ${point.level.toLowerCase()}`}>{point.level}</span>
              </button>
            ))}
          </div>

          <div className="map-legend">
            <strong>Traffic status</strong>
            <span><i className="heavy" /> Heavy</span>
            <span><i className="moderate" /> Moderate</span>
            <span><i className="light" /> Light</span>
          </div>
        </aside>

        <div className="traffic-map-card">
          <div className="map-card-toolbar">
          <div><MapPin size={16} /><strong>New Delhi, India</strong><span>{googleMapReady ? "Google Maps" : "OpenStreetMap preview"}</span></div>
          <div className="map-toolbar-actions">
            {googleMapsApiKey && <button className={`traffic-layer-toggle ${trafficEnabled ? "active" : ""}`} type="button" aria-pressed={trafficEnabled} onClick={() => setTrafficEnabled((enabled) => !enabled)}><Signal size={13} /> Traffic {trafficEnabled ? "on" : "off"}</button>}
            <a href="https://www.google.com/maps/search/?api=1&query=New+Delhi%2C+India" target="_blank" rel="noreferrer">Open in Google Maps <ArrowUpRight size={14} /></a>
          </div>
          </div>
        {!googleMapsApiKey && <div className="map-config-notice">Set <code>VITE_GOOGLE_MAPS_API_KEY</code> in <code>client/.env.local</code> to enable Google Maps and its traffic layer. Showing OpenStreetMap preview.</div>}
        {googleMapsApiKey && googleMapStatus === "loading" && <div className="map-config-notice">Loading Google Maps. OpenStreetMap is shown until it is ready.</div>}
        {googleMapsApiKey && googleMapStatus === "error" && <div className="map-config-notice error">Google Maps did not load. Check the API key, Maps JavaScript API, billing, and referrer restrictions. Showing OpenStreetMap preview.</div>}
          <div className="leaflet-map-wrap">
          {googleMapsApiKey && <GoogleMapCanvas apiKey={googleMapsApiKey} center={focus} points={visiblePoints} trafficEnabled={trafficEnabled} onStatus={setGoogleMapStatus} mapId={import.meta.env.VITE_GOOGLE_MAP_ID} />}
          {(!googleMapsApiKey || !googleMapReady) && (
            <MapContainer center={focus} zoom={12} scrollWheelZoom zoomControl={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapFocus center={focus} />
              <Polyline positions={route} pathOptions={{ color: "#4478e6", weight: 5, opacity: 0.72, dashArray: "10 8" }} />
              {visiblePoints.map((point) => {
                const color = point.level === "Heavy" ? "#e45f62" : point.level === "Moderate" ? "#e8a23d" : "#49a981";
                return (
                  <CircleMarker
                    key={point.name}
                    center={point.position}
                    radius={9}
                    pathOptions={{ color: "#fff", weight: 3, fillColor: color, fillOpacity: 0.95 }}
                  >
                    <Popup><strong>{point.name}</strong><br />{point.level} sample traffic · {point.volume}</Popup>
                  </CircleMarker>
                );
              })}
              <ZoomControl position="bottomright" />
            </MapContainer>
          )}
            <button className="map-locate-button" type="button" onClick={centerMap} aria-label="Center the map on Delhi"><Navigation size={17} /></button>
          </div>
        <div className="map-attribution-note">
          {googleMapReady
            ? trafficEnabled
              ? "Google traffic layer is enabled. Junction markers are illustrative sample data."
              : "Google Maps is loaded; the traffic layer is off. Junction markers are illustrative sample data."
            : "Delhi map preview uses OpenStreetMap tiles. Junction markers are illustrative sample data, not a live traffic feed."}
        </div>
        </div>
      </div>
    </section>
  );
}
