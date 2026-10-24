import { useCallback, useEffect, useState } from "react";
import { CloudSun, CloudRain, CloudLightning, Sun, Cloud, CloudFog, RefreshCw } from "lucide-react";

type Language = "en" | "ml" | "ta";
type Forecast = {
  location: string; source: string; updatedAt: string;
  current: { temperature: number; humidity: number; windSpeed: number; weatherCode: number };
  tomorrow: { date: string; minTemperature: number; maxTemperature: number; rainProbability: number; weatherCode: number };
};

function condition(code: number, lang: Language) {
  const labels: Record<string, [string, string, string]> = {
    clear: ["Clear sky", "തെളിഞ്ഞ ആകാശം", "தெளிவான வானம்"],
    cloudy: ["Partly cloudy", "ഭാഗികമായി മേഘാവൃതം", "பகுதியளவு மேகமூட்டம்"],
    overcast: ["Cloudy", "മേഘാവൃതം", "மேகமூட்டம்"],
    fog: ["Foggy", "മൂടൽമഞ്ഞ്", "மூடுபனி"],
    drizzle: ["Light drizzle", "ചാറ്റൽമഴ", "லேசான தூறல்"],
    rain: ["Rain expected", "മഴയ്ക്ക് സാധ്യത", "மழை பெய்ய வாய்ப்பு"],
    snow: ["Snow", "മഞ്ഞുവീഴ്ച", "பனிப்பொழிவு"],
    thunder: ["Thunderstorms", "ഇടിമിന്നലോടുകൂടിയ മഴ", "இடியுடன் கூடிய மழை"]
  };
  const key = code === 0 ? "clear" : code <= 2 ? "cloudy" : code === 3 ? "overcast" : code <= 48 ? "fog" : code <= 57 ? "drizzle" : code <= 67 || (code >= 80 && code <= 82) ? "rain" : code >= 95 ? "thunder" : code >= 71 && code <= 86 ? "snow" : "cloudy";
  return labels[key][lang === "en" ? 0 : lang === "ml" ? 1 : 2];
}
function WeatherIcon({ code }: { code: number }) {
  const className = "w-9 h-9 text-amber-400";
  if (code >= 95) return <CloudLightning className={className} />;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain className={className} />;
  if (code >= 45 && code <= 48) return <CloudFog className={className} />;
  if (code === 0) return <Sun className={className} />;
  if (code === 3) return <Cloud className={className} />;
  return <CloudSun className={className} />;
}
export default function WeatherWidget({ lang, theme = "light" }: { lang: Language; theme?: "light" | "dark" }) {
  const [weather, setWeather] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fetchWeather = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/weather");
      if (!response.ok) throw new Error("Weather request failed");
      const result: Forecast = await response.json();
      if (!result.current || !result.tomorrow) throw new Error("Missing forecast");
      setWeather(result);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void fetchWeather();
    const timer = window.setInterval(() => { void fetchWeather(); }, 600000);
    return () => window.clearInterval(timer);
  }, [fetchWeather]);
  const font = lang === "ml" ? "font-anek-malayalam" : lang === "ta" ? "font-anek-tamil" : "font-anek-english";
  const tr = (en: string, ml: string, ta: string) => lang === "ml" ? ml : lang === "ta" ? ta : en;
  const card = theme === "dark" ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-[#052962]";
  return (
    <section className={`rounded-2xl border p-4 space-y-3 ${card}`} aria-label="Attappadi weather">
      <div className="flex justify-between items-center gap-2">
        <span lang={lang} className={`text-xs ${font}`}>{tr("Attappadi overall weather · Agali reference", "അട്ടപ്പാടിയിലെ പൊതുവായ കാലാവസ്ഥ · അഗളി അടിസ്ഥാനമാക്കി", "அட்டப்பாடியின் பொதுவான வானிலை · அகளி அடிப்படையில்")}</span>
        <button type="button" onClick={() => void fetchWeather()} disabled={loading} aria-label="Refresh weather" className="p-2 rounded-lg border border-slate-400/20"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
      </div>
      {error && <p lang={lang} className={`text-xs text-amber-600 ${font}`}>{tr("Live weather temporarily unavailable.", "തത്സമയ കാലാവസ്ഥാ വിവരങ്ങൾ താൽക്കാലികമായി ലഭ്യമല്ല.", "நேரடி வானிலைத் தகவல் தற்காலிகமாகக் கிடைக்கவில்லை.")}</p>}
      {weather ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-400/20 p-4 space-y-2">
            <h3 lang="en" className="font-anek-english text-sm font-black uppercase tracking-wide">WEATHER NOW</h3>
            <div className="flex items-center gap-3"><WeatherIcon code={weather.current.weatherCode} /><strong className="text-3xl tabular-nums">{Math.round(weather.current.temperature)}°C</strong></div>
            <p lang={lang} className={`text-sm ${font}`}>{condition(weather.current.weatherCode, lang)}</p>
            <p lang={lang} className={`text-xs opacity-75 ${font}`}>{tr("Humidity", "ആർദ്രത", "ஈரப்பதம்")}: {weather.current.humidity}% · {tr("Wind", "കാറ്റ്", "காற்று")}: {weather.current.windSpeed} km/h</p>
          </div>
          <div className="rounded-xl border border-slate-400/20 p-4 space-y-2">
            <h3 lang="en" className="font-anek-english text-sm font-black uppercase tracking-wide">WEATHER TOMORROW</h3>
            <div className="flex items-center gap-3"><WeatherIcon code={weather.tomorrow.weatherCode} /><strong className="text-2xl tabular-nums">{Math.round(weather.tomorrow.minTemperature)}°–{Math.round(weather.tomorrow.maxTemperature)}°C</strong></div>
            <p lang={lang} className={`text-sm ${font}`}>{condition(weather.tomorrow.weatherCode, lang)}</p>
            <p lang={lang} className={`text-xs opacity-75 ${font}`}>{tr("Chance of rain", "മഴയ്ക്കുള്ള സാധ്യത", "மழைக்கான வாய்ப்பு")}: {weather.tomorrow.rainProbability ?? "—"}%</p>
          </div>
        </div>
      ) : !loading ? <p lang={lang} className={font}>{tr("Weather data unavailable.", "കാലാവസ്ഥാ വിവരങ്ങൾ ലഭ്യമല്ല.", "வானிலைத் தகவல் கிடைக்கவில்லை.")}</p> : <p lang={lang} className={font}>{tr("Loading weather…", "കാലാവസ്ഥാ വിവരങ്ങൾ ലഭ്യമാക്കുന്നു…", "வானிலைத் தகவல் ஏற்றப்படுகிறது…")}</p>}
      <p className="text-[10px] opacity-65 font-anek-english">Source: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline">Open-Meteo</a> · Forecast for the Agali reference point; local hill conditions may vary. {weather?.updatedAt ? `Updated: ${weather.updatedAt} IST` : ""}</p>
    </section>
  );
}
