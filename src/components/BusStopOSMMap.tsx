import React, { useEffect, useRef, useState } from "react";

type Stop = { id: string; en: string; ml: string };
type Props = {
  stops: Stop[];
  selectedStop: string;
  onSelectStop: (id: string) => void;
  lang: "en" | "ml" | "ta";
};
type Coordinate = { lat: number; lon: number };
type LeafletMap = {
  setView: (coords: [number, number], zoom: number) => LeafletMap;
  remove: () => void;
  invalidateSize: () => void;
};
type MarkerLayer = { clearLayers: () => void };
type LeafletApi = {
  map: (element: HTMLElement) => LeafletMap;
  layerGroup: () => MarkerLayer & { addTo: (map: LeafletMap) => MarkerLayer };
  tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: LeafletMap) => void };
  circleMarker: (coords: [number, number], options: Record<string, unknown>) => {
    addTo: (layer: MarkerLayer) => { on: (event: string, handler: () => void) => void };
  };
};
declare global { interface Window { L?: LeafletApi } }

const coordinatesKey = "attappadi_osm_stop_coordinates_v1";
const loadLeaflet = async (): Promise<LeafletApi> => {
  if (window.L) return window.L;
  if (!document.querySelector('link[data-attappadi-leaflet]')) {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    css.dataset.attappadiLeaflet = "true";
    document.head.appendChild(css);
  }
  if (!document.querySelector('script[data-attappadi-leaflet]')) {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.dataset.attappadiLeaflet = "true";
    document.head.appendChild(script);
  }
  const script = document.querySelector('script[data-attappadi-leaflet]') as HTMLScriptElement;
  if (!window.L) await new Promise<void>((resolve, reject) => {
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Map library unavailable")), { once: true });
  });
  if (!window.L) throw new Error("Map library unavailable");
  return window.L;
};

export default function BusStopOSMMap({ stops, selectedStop, onSelectStop, lang }: Props) {
  const element = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<MarkerLayer | null>(null);
  const [coordinates, setCoordinates] = useState<Record<string, Coordinate>>(() => {
    try { return JSON.parse(localStorage.getItem(coordinatesKey) || "{}"); } catch { return {}; }
  });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadLeaflet().then(L => {
      if (!active || !element.current) return;
      const map = L.map(element.current).setView([11.06, 76.55], 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);
      mapRef.current = map;
      markersRef.current = L.layerGroup().addTo(map);
      setReady(true);
      setTimeout(() => map.invalidateSize(), 100);
    }).catch(() => { if (active) setStatus("Unable to load OpenStreetMap."); });
    return () => { active = false; mapRef.current?.remove(); mapRef.current = null; markersRef.current = null; };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.L) return;
    const map = mapRef.current;
    const markerLayer = markersRef.current;
    if (!markerLayer) return;
    markerLayer.clearLayers();
    stops.forEach(stop => {
      const pos = coordinates[stop.id];
      if (!pos || !Number.isFinite(pos.lat) || !Number.isFinite(pos.lon)) return;
      window.L!.circleMarker([pos.lat, pos.lon], {
        radius: stop.id === selectedStop ? 10 : 6,
        color: stop.id === selectedStop ? "#052962" : "#d97706",
        fillColor: stop.id === selectedStop ? "#ffe500" : "#fff",
        fillOpacity: 1,
        weight: 3
      }).addTo(markerLayer).on("click", () => onSelectStop(stop.id));
    });
    const selected = coordinates[selectedStop];
    if (selected) map.setView([selected.lat, selected.lon], 12);
  }, [ready, coordinates, stops, selectedStop, onSelectStop]);

  const locateStop = async () => {
    const stop = stops.find(s => s.id === selectedStop);
    if (!stop || busy) return;
    setBusy(true);
    setStatus("");
    try {
      // User-triggered request only: never bulk geocode against the public Nominatim service.
      const query = encodeURIComponent(stop.en + ", Kerala, India");
      const response = await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + query);
      if (!response.ok) throw new Error("Location search failed");
      const results: Array<{ lat: string; lon: string }> = await response.json();
      if (!results.length) throw new Error("Stop not found. Coordinates need manual verification.");
      const point = { lat: Number(results[0].lat), lon: Number(results[0].lon) };
      if (!Number.isFinite(point.lat) || !Number.isFinite(point.lon)) throw new Error("Invalid coordinates");
      const updated = { ...coordinates, [stop.id]: point };
      setCoordinates(updated);
      localStorage.setItem(coordinatesKey, JSON.stringify(updated));
      setStatus("Approximate location found. Verify the marker before using it.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to locate stop.");
    } finally { setBusy(false); }
  };

  return (
    <section className="space-y-2" aria-label="OpenStreetMap bus stops">
      <div ref={element} className="h-[320px] sm:h-[420px] w-full rounded-lg border border-slate-200" />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span>{lang === "ml" ? "സ്റ്റോപ്പ് തിരഞ്ഞെടുത്ത് സമയക്രമം കാണുക" : lang === "ta" ? "நிறுத்தத்தைத் தேர்ந்தெடுத்து நேர அட்டவணையைப் பார்க்கவும்" : "Select a stop marker to view its timetable"}</span>
        {!coordinates[selectedStop] && <button type="button" disabled={busy} onClick={locateStop} className="rounded bg-[#052962] px-3 py-2 text-white disabled:opacity-50">
          {busy ? "Locating..." : "Find selected stop on map"}
        </button>}
      </div>
      {status && <p role="status" className="text-xs text-slate-600">{status}</p>}
      <p className="text-[10px] text-slate-500">© OpenStreetMap contributors. Stop locations are approximate until verified; timetable times are scheduled, not live GPS.</p>
    </section>
  );
}
