import React, { useEffect, useRef, useState } from "react";

type Stop = { id: string; nameEn: string; nameMl: string };
type Lang = "en" | "ml" | "ta";
type Props = { stops: Stop[]; selected: string; lang: Lang; tamilName: (name: string) => string; onSelect: (id: string) => void };
type GeoStop = { id: string; lat: number; lon: number };
declare global { interface Window { L?: any } }

const OSM_NAMES: Record<string, string[]> = {
  ANAIKKATTY: ["Anaikatti", "Anaikatty", "Anakkatty", "Anaikatti"],
  AGALI: ["Agali", "Agaly"],
  MANNARKKAD: ["Mannarkkad", "Mannarkad"],
  MUKKALI: ["Mukkali"],
  SHOLAYUR: ["Sholayur", "Sholayoor"],
  PUDUR: ["Pudur"],
  THAVALAM: ["Thavalam"],
  GOOLIKKADAVU: ["Goolikadavu", "Goolikkadavu"],
  JELLIPPARA: ["Jellippara"],
  PALOOR: ["Paloor"],
  MULLI: ["Mulli"],
  PALAKKAD: ["Palakkad"],
  COIMBATORE: ["Coimbatore"],
  METTUPALAYAM: ["Mettupalayam"],
  KOZHIKODE: ["Kozhikode"],
  MANJERI: ["Manjeri"],
  THRISSUR: ["Thrissur"],
  KOTTAYAM: ["Kottayam"],
  GURUVAYUR: ["Guruvayur"],
  SHORNUR: ["Shoranur", "Shornur"],
  PERINTHALMANNA: ["Perinthalmanna"],
  CHERPULASSERY: ["Cherpulassery"],
  CHITTUR: ["Chittur"],
  KATTAPPANA: ["Kattappana"]
};
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");
const mapCenter: [number, number] = [11.10571, 76.65476];
const leafletCss = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const leafletJs = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

export default function BusStopsOsmMap({ stops, selected, lang, tamilName, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markerLayer = useRef<any>(null);
  const callback = useRef(onSelect);
  const [locations, setLocations] = useState<GeoStop[]>([]);
  const [message, setMessage] = useState("");
  callback.current = onSelect;

  useEffect(() => {
    let cancelled = false;
    const css = document.getElementById("ao-leaflet-css") as HTMLLinkElement | null;
    if (!css) {
      const link = document.createElement("link");
      link.id = "ao-leaflet-css"; link.rel = "stylesheet"; link.href = leafletCss;
      document.head.appendChild(link);
    }
    const initialize = () => {
      if (cancelled || !container.current || map.current || !window.L) return;
      const L = window.L;
      map.current = L.map(container.current, { scrollWheelZoom: false }).setView(mapCenter, 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map.current);
      markerLayer.current = L.layerGroup().addTo(map.current);
      setTimeout(() => map.current?.invalidateSize(), 100);
    };
    if (window.L) initialize();
    else {
      let script = document.getElementById("ao-leaflet-js") as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script"); script.id = "ao-leaflet-js"; script.src = leafletJs;
        document.head.appendChild(script);
      }
      script.addEventListener("load", initialize);
    }
    return () => { cancelled = true; map.current?.remove(); map.current = null; markerLayer.current = null; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // One OSM query for mapped settlements, rather than 24 requests to Nominatim.
    const names = Object.values(OSM_NAMES).flat().map(s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const query = `[out:json][timeout:20];(node["place"~"village|town|city|hamlet|suburb"]["name"~"^(${names})$",i](9.2,75.1,11.8,77.7);way["place"~"village|town|city|hamlet|suburb"]["name"~"^(${names})$",i](9.2,75.1,11.8,77.7););out center;`;
    fetch("https://overpass.kumi.systems/api/interpreter", {
      method: "POST", body: new URLSearchParams({ data: query }), signal: controller.signal
    }).then(r => { if (!r.ok) throw new Error("OSM lookup unavailable"); return r.json(); })
      .then(data => {
        const matches: GeoStop[] = [];
        for (const stop of stops) {
          const aliases = OSM_NAMES[stop.id] || [stop.nameEn];
          const found = (data.elements || []).filter((e: any) => aliases.some(n => normalize(n) === normalize(e.tags?.name || "")));
          // Avoid ambiguous settlement names. Only unique matches are placed automatically.
          if (found.length !== 1) continue;
          const e = found[0];
          const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon;
          if (Number.isFinite(lat) && Number.isFinite(lon)) matches.push({ id: stop.id, lat, lon });
        }
        setLocations(matches);
        if (matches.length < stops.length) setMessage(lang === "ml" ? "സ്ഥിരീകരിക്കാത്ത സ്റ്റോപ്പുകൾ ഭൂപടത്തിൽ കാണിക്കില്ല." : lang === "ta" ? "உறுதிப்படுத்தப்படாத நிறுத்தங்கள் வரைபடத்தில் காட்டப்படாது." : "Unverified stop locations are not shown.");
      }).catch(() => setMessage(lang === "ml" ? "ഭൂപടത്തിലെ സ്റ്റോപ്പുകൾ ലോഡ് ചെയ്യാനായില്ല." : lang === "ta" ? "வரைபட நிறுத்தங்களை ஏற்ற முடியவில்லை." : "Stop locations could not be loaded."));
    return () => controller.abort();
  }, [stops]);

  useEffect(() => {
    if (!window.L || !markerLayer.current) return;
    const L = window.L;
    markerLayer.current.clearLayers();
    for (const stop of stops) {
      const location = locations.find(p => p.id === stop.id);
      if (!location) continue;
      const active = selected === stop.id;
      const label = lang === "ml" ? stop.nameMl : lang === "ta" ? tamilName(stop.nameEn) : stop.nameEn;
      const marker = L.circleMarker([location.lat, location.lon], {
        radius: active ? 9 : 6, color: active ? "#052962" : "#ffffff",
        weight: active ? 3 : 2, fillColor: active ? "#ffe500" : "#e11d48", fillOpacity: 1
      }).addTo(markerLayer.current);
      marker.bindTooltip(label, { direction: "top" });
      marker.on("click", () => callback.current(stop.id));
    }
  }, [locations, stops, selected, lang, tamilName]);

  return <div className="space-y-2 mt-3">
    <div ref={container} className="h-[330px] w-full rounded-lg border border-slate-200" role="region" aria-label="OpenStreetMap bus stop schedule map" />
    <p className="text-[11px] text-slate-600">{lang === "ml" ? "സ്റ്റോപ്പ് മാർക്കറിൽ ക്ലിക്ക് ചെയ്ത് സമയവിവരം കാണുക. തത്സമയ ബസ് ട്രാക്കിങ് അല്ല." : lang === "ta" ? "நிறுத்தப் புள்ளியைத் தேர்ந்தெடுத்து அட்டவணையைப் பார்க்கவும். நேரடி பேருந்து கண்காணிப்பு அல்ல." : "Select a stop dot to see its timetable. Not live bus tracking."}</p>
    {message && <p className="text-[10px] text-amber-700">{message}</p>}
  </div>;
}
