import React, { useEffect, useMemo, useRef, useState } from "react";

type Stop = { id: string; en: string; ml: string };
type Props = { stops: Stop[]; selectedStop: string; onSelectStop: (id: string) => void; lang: "en" | "ml" | "ta"; isAdmin?: boolean };
type Position = { lat: number; lon: number; kind: "station" | "stop" | "place"; name: string };
type Layer = { clearLayers: () => void; addTo: (map: MapInstance) => Layer };
type Marker = { dragging?: { enable: () => void }; getLatLng?: () => { lat: number; lng: number }; addTo: (layer: Layer) => Marker; on: (event: string, callback: () => void) => Marker; bindTooltip: (text: string, options?: Record<string, unknown>) => Marker };
type MapInstance = { on: (event: string, callback: (e: { latlng: { lat: number; lng: number } }) => void) => void; scrollWheelZoom: { enable: () => void }; dragging: { enable: () => void }; setView: (point: [number, number], zoom: number) => MapInstance; remove: () => void; invalidateSize: () => void; fitBounds: (bounds: [number, number][], options?: Record<string, unknown>) => void };
type Leaflet = {
  map: (element: HTMLElement) => MapInstance;
  layerGroup: () => Layer;
  tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: MapInstance) => void };
  circleMarker: (point: [number, number], options: Record<string, unknown>) => Marker;\n  marker: (point: [number, number], options?: Record<string, unknown>) => Marker;
};
declare global { interface Window { L?: Leaflet } }
type OsmElement = { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };
// Grounded OSM locality coordinates. These are *town/village centers*, not verified boarding platforms.
const KNOWN_PLACES: Record<string, Position> = {
  AGALI: { lat: 11.10571, lon: 76.65476, kind: "place", name: "Agali village" },
  SHOLAYUR: { lat: 11.06136, lon: 76.70020, kind: "place", name: "Sholayur village" },
  MANNARKKAD: { lat: 10.99290, lon: 76.45690, kind: "place", name: "Mannarkkad locality" }
};
const CACHE_KEY = "attappadi_osm_verified_stops_v2";
const CACHE_AGE = 7 * 24 * 60 * 60 * 1000;
const bounds = [9.3, 75.5, 11.8, 77.6];
const label = (lang: Props["lang"], en: string, ml: string, ta: string) => lang === "ml" ? ml : lang === "ta" ? ta : en;

function cleanName(value: string): string {
  return value.toUpperCase().replace(/[^A-Z]/g, "").replace(/ANAIKATTY|ANAIKKATI|ANAIKATI/g, "ANAIKKATTY").replace(/MANNARKAD/g, "MANNARKKAD");
}
function stopAliases(stop: Stop): string[] {
  const variants: Record<string, string[]> = {
    ANAIKKATTY: ["Anaikatti", "Anaikatty", "Anaikkatty", "Anaikatti Border"],
    MULLI: ["Mulli", "Mulli Checkpost"],
    GOOLIKKADAVU: ["Goolikadavu", "Goolikkadavu", "Gulikadavu"],
    SHORNUR: ["Shoranur", "Shornur"],
    CHERPULASSERY: ["Cherpulassery", "Cherppulassery"],
    THAVALAM: ["Thavalam", "Thavalam Junction"],
    JELLIPPARA: ["Jellippara", "Jellipara"]
  };
  return [stop.en, ...(variants[stop.id] || [])];
}
function loadLibrary(): Promise<Leaflet> {
  if (window.L) return Promise.resolve(window.L);
  if (!document.querySelector('link[data-attappadi-leaflet]')) {
    const css = document.createElement("link");
    css.rel = "stylesheet"; css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    css.dataset.attappadiLeaflet = "true"; document.head.appendChild(css);
  }
  return new Promise((resolve, reject) => {
    let script = document.querySelector('script[data-attappadi-leaflet]') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.dataset.attappadiLeaflet = "true";
      document.head.appendChild(script);
    }
    const timer = window.setTimeout(() => reject(new Error("Map library timed out")), 15000);
    const done = () => { window.clearTimeout(timer); if (window.L) resolve(window.L); else reject(new Error("Map library unavailable")); };
    script.addEventListener("load", done, { once: true });
    script.addEventListener("error", () => { window.clearTimeout(timer); reject(new Error("Map library unavailable")); }, { once: true });
    if (window.L) done();
  });
}
function loadCache(): Record<string, Position> {
  try {
    const stored = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (stored && Date.now() - stored.savedAt < CACHE_AGE && stored.positions) return stored.positions;
  } catch { /* ignore corrupt cache */ }
  return {};
}
async function lookupStops(stops: Stop[], signal: AbortSignal): Promise<Record<string, Position>> {
  // One grouped Overpass query for real OSM bus stops, stations and populated places.
  // We do not invent coordinates or substitute arbitrary points on a drawn diagram.
  const names = [...new Set(stops.flatMap(stopAliases))];
  const pattern = names.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const query = `[out:json][timeout:35];(nwr["name"~"^(${pattern})$",i]["highway"="bus_stop"](${bounds.join(",")});nwr["name"~"^(${pattern})$",i]["amenity"="bus_station"](${bounds.join(",")});nwr["name"~"^(${pattern})$",i]["place"](${bounds.join(",")}););out center;`;
  const response = await fetch("https://overpass.kumi.systems/api/interpreter", {
    method: "POST", body: new URLSearchParams({ data: query }), signal
  });
  if (!response.ok) throw new Error("OpenStreetMap location lookup unavailable");
  const data: { elements?: OsmElement[] } = await response.json();
  const found: Record<string, Position> = {};
  for (const stop of stops) {
    const aliases = new Set(stopAliases(stop).map(cleanName));
    const candidates = (data.elements || []).filter(item => item.tags?.name && aliases.has(cleanName(item.tags.name)));
    // Prefer actual station objects over town centers. No guessed location for unresolved stops.
    const ranked = candidates.map(item => {
      const lat = item.lat ?? item.center?.lat;
      const lon = item.lon ?? item.center?.lon;
      const station = item.tags?.amenity === "bus_station";
      const busStop = item.tags?.highway === "bus_stop";
      const score = station ? 3 : busStop ? 2 : 1;
      return { lat, lon, score, name: item.tags?.name || stop.en };
    }).filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lon)).sort((a, b) => b.score - a.score);
    if (ranked.length) {
      const match = ranked[0];
      found[stop.id] = { lat: match.lat!, lon: match.lon!, kind: match.score === 3 ? "station" : match.score === 2 ? "stop" : "place", name: match.name };
    }
  }
  return found;
}

export default function BusStopOSMMap({ stops, selectedStop, onSelectStop, lang, isAdmin = false }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const layerRef = useRef<Layer | null>(null);
  const onSelectRef = useRef(onSelectStop);
  onSelectRef.current = onSelectStop;
  const [ready, setReady] = useState(false);
  const [positions, setPositions] = useState<Record<string, Position>>(() => ({ ...KNOWN_PLACES, ...loadCache() }));
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingStop, setEditingStop] = useState("AGALI");
  const [manual, setManual] = useState<Record<string, { lat: number; lon: number; name: string }>>(() => {
    try { return JSON.parse(localStorage.getItem("attappadi_bus_manual_stops_v1") || "{}"); } catch { return {}; }
  });
  const [customName, setCustomName] = useState("");
  const [importText, setImportText] = useState("");
  const manualRef = useRef(manual);
  manualRef.current = manual;
  const editRef = useRef(editMode);
  editRef.current = editMode;
  const editingRef = useRef(editingStop);
  editingRef.current = editingStop;
  const saveManual = (next: typeof manual) => {
    setManual(next);
    try { localStorage.setItem("attappadi_bus_manual_stops_v1", JSON.stringify(next)); } catch { /* storage unavailable */ }
  };
  const [error, setError] = useState("");
  const available = useMemo(() => stops.filter(s => manual[s.id] || positions[s.id]), [stops, positions, manual]);

  useEffect(() => {
    let mounted = true;
    loadLibrary().then(L => {
      if (!mounted || !container.current) return;
      const map = L.map(container.current).setView([11.05, 76.58], 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        maxZoom: 19
      }).addTo(map);
      map.scrollWheelZoom.enable();
      map.dragging.enable();
      map.on("click", e => {
        if (!editRef.current || !editingRef.current) return;
        const id = editingRef.current;
        const old = manualRef.current[id];
        const next = { ...manualRef.current, [id]: { lat: e.latlng.lat, lon: e.latlng.lng, name: old?.name || stopListRef.current.find(s => s.id === id)?.en || id } };
        saveManual(next);
      });
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      setReady(true);
      window.setTimeout(() => map.invalidateSize(), 150);
    }).catch(() => { if (mounted) setError("Unable to load map tiles."); });
    return () => { mounted = false; mapRef.current?.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  const ids = stops.map(s => s.id).join(",");
  const stopListRef = useRef(stops);
  stopListRef.current = stops;
  const positionsRef = useRef(positions);
  positionsRef.current = positions;
  useEffect(() => {
    if (!stops.length) return;
    const controller = new AbortController();
    let mounted = true;
    setLoading(true);
    lookupStops(stops, controller.signal).then(found => {
      if (!mounted) return;
      const merged = { ...KNOWN_PLACES, ...loadCache(), ...found };
      positionsRef.current = { ...positionsRef.current, ...merged };
      setPositions(positionsRef.current);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), positions: positionsRef.current })); } catch { /* unavailable */ }
      if (!Object.keys(found).length) setError("Some places are not mapped in OSM; checking place names individually.");
    }).catch(e => {
      if (mounted && e.name !== "AbortError") setError("Map locations could not be refreshed. Try again later.");
    }).finally(() => { if (mounted) setLoading(false); });
    // Nominatim fallback: a single queued request per second, with a strict regional bounding box.
    // Only resolves stops that are still missing; every accepted location is labeled a locality.
    const delay = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms));
    const fallback = async () => {
      await delay(1500);
      // Restrict public geocoder use; full coverage needs a curated, shared stop-coordinate dataset.
      let attempts = 0;
      for (const stop of stopListRef.current) {
        if (controller.signal.aborted) break;
        if (positionsRef.current[stop.id]) continue;
        if (++attempts > 4) break;
        try {
          const query = encodeURIComponent(stop.en + ", Kerala, India");
          const url = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&viewbox=75.5,11.8,77.6,9.3&bounded=1&q=" + query;
          const response = await fetch(url, { signal: controller.signal });
          if (response.ok) {
            const items: Array<{ lat: string; lon: string; display_name: string }> = await response.json();
            const item = items[0];
            if (item) {
              const lat = Number(item.lat), lon = Number(item.lon);
              if (lat >= bounds[0] && lat <= bounds[2] && lon >= bounds[1] && lon <= bounds[3]) {
                const entry: Position = { lat, lon, kind: "place", name: item.display_name };
                positionsRef.current = { ...positionsRef.current, [stop.id]: entry };
                if (mounted) setPositions(positionsRef.current);
                try { localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), positions: positionsRef.current })); } catch { /* storage unavailable */ }
              }
            }
          }
        } catch (e) { if (controller.signal.aborted) break; }
        await delay(1100);
      }
      if (mounted) setLoading(false);
    };
    void fallback();
    return () => { mounted = false; controller.abort(); };
  }, [ids]);

  useEffect(() => {
    if (!ready || !window.L || !layerRef.current || !mapRef.current) return;
    const layer = layerRef.current;
    layer.clearLayers();
    available.forEach(stop => {
      const point = manual[stop.id] || positions[stop.id];
      const selected = stop.id === selectedStop;
      const marker = window.L!.circleMarker([point.lat, point.lon], {
        radius: selected ? 10 : 7, weight: 3,
        color: selected ? "#052962" : "#d97706",
        fillColor: selected ? "#ffe500" : "#ffffff",
        fillOpacity: 1
      }).addTo(layer).bindTooltip(stop.en + (point.kind === "place" ? " (town center)" : ""), { direction: "top" })
        .on("click", () => onSelectRef.current(stop.id));
    });
    const selected = positions[selectedStop];
    if (selected) mapRef.current.setView([selected.lat, selected.lon], 12);
    else if (available.length) mapRef.current.fitBounds(available.map(s => [positions[s.id].lat, positions[s.id].lon]), { padding: [24, 24], maxZoom: 11 });
  }, [ready, positions, selectedStop, available, manual]);

  return <section className="space-y-2" aria-label="OpenStreetMap bus stops">
    <div ref={container} className="h-[360px] sm:h-[460px] w-full rounded-lg border border-slate-200" />
    <p className="text-xs font-semibold">{label(lang, "Tap a station dot to see its bus timetable", "ബസ് സമയക്രമം കാണാൻ മാപ്പിലെ സ്റ്റേഷൻ അടയാളം തിരഞ്ഞെടുക്കുക", "பேருந்து நேர அட்டவணையைக் காண வரைபடத்தில் நிறுத்தத்தைத் தேர்ந்தெடுக்கவும்")}</p>
    {isAdmin && <div className="rounded-lg border border-slate-300 p-3 space-y-3 bg-white">
      <button type="button" onClick={() => setEditMode(v => !v)} className="rounded bg-slate-900 px-3 py-2 text-white text-sm">{editMode ? "Close station editor" : "Edit bus station positions"}</button>
      {editMode && <>
        <p className="text-sm">Choose a station, then click its actual location on the map to place or move its dot. Click another dot to select it for editing. Changes are saved in this browser only until exported and published centrally.</p>
        <select aria-label="Station to position" value={editingStop} onChange={e => { setEditingStop(e.target.value); setCustomName(manual[e.target.value]?.name || stops.find(s => s.id === e.target.value)?.en || ""); }} className="w-full border rounded p-2">
          {stops.map(stop => <option key={stop.id} value={stop.id}>{stop.en}{manual[stop.id] ? " ✓" : " — needs manual placement"}</option>)}
        </select>
        <input aria-label="Station display name" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Station display name" className="w-full border rounded p-2" />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded bg-blue-800 text-white px-3 py-2" onClick={() => { const old = manual[editingStop] || positions[editingStop]; if (old) saveManual({ ...manual, [editingStop]: { lat: old.lat, lon: old.lon, name: customName.trim() || editingStop } }); }}>Save station name</button>
          <button type="button" className="rounded border px-3 py-2" onClick={() => { const next = { ...manual }; delete next[editingStop]; saveManual(next); }}>Reset manual position</button>
          <button type="button" className="rounded border px-3 py-2" onClick={() => { const blob = new Blob([JSON.stringify(manual, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "attappadi-bus-stop-positions.json"; a.click(); URL.revokeObjectURL(url); }}>Export positions JSON</button>
        </div>
        <textarea aria-label="Import saved positions JSON" value={importText} onChange={e => setImportText(e.target.value)} placeholder="Paste exported station coordinates JSON" className="w-full border rounded p-2" rows={3} />
        <button type="button" className="rounded border px-3 py-2" onClick={() => { try { const parsed = JSON.parse(importText); if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw Error(); const next = { ...manual }; for (const [id, p] of Object.entries(parsed as Record<string, { lat: number; lon: number; name: string }>)) { if (stops.some(s => s.id === id) && Number.isFinite(p?.lat) && Number.isFinite(p?.lon) && Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180 && typeof p.name === "string") next[id] = p; } saveManual(next); setImportText(""); } catch { window.alert("Invalid station coordinate JSON"); } }}>Import positions</button>
      </>}
    </div>}
    <p className="text-xs text-slate-600" role="status">{loading ? "Checking additional OpenStreetMap locations..." : `${available.length} of ${stops.length} places mapped`}</p>
    {error && <p className="text-xs text-amber-700" role="alert">{error}</p>}
    <p className="text-[10px] text-slate-500">© OpenStreetMap contributors. Dots use OSM bus stops or stations where available; town-center markers are labeled and may not be the exact boarding point. Timetables are scheduled, not live GPS.</p>
  </section>;
}
