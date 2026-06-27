import { useState, useEffect } from "react";
import { CloudSun, CloudRain, CloudLightning, Wind, Sun, RefreshCw } from "lucide-react";
import { WeatherData } from "../types";

export default function WeatherWidget({ 
  lang, 
  theme = "light" 
}: { 
  lang: "en" | "ml"; 
  theme?: "light" | "dark"; 
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/weather");
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error("Failed to load local weather", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const getWeatherIcon = (enCondition: string, iconClass = "w-6 h-6") => {
    const term = enCondition.toLowerCase();
    const isDark = theme === "dark";
    
    // Choose dynamic colors: white in light mode, yellow in dark mode
    const colorClass = isDark ? "text-yellow-400 fill-yellow-400/10" : "text-white fill-white/10";
    
    if (term.includes("shower") || term.includes("rain") || term.includes("drizzle")) {
      return <CloudRain className={`${iconClass} ${colorClass} animate-bounce`} />;
    }
    if (term.includes("thunder") || term.includes("lightning")) {
      return <CloudLightning className={`${iconClass} ${colorClass} animate-pulse`} />;
    }
    if (term.includes("wind") || term.includes("breeze")) {
      return <Wind className={`${iconClass} ${colorClass}`} />;
    }
    if (term.includes("sunny") || term.includes("clear")) {
      return <Sun className={`${iconClass} ${colorClass} animate-pulse`} />;
    }
    return <CloudSun className={`${iconClass} ${colorClass}`} />;
  };

  if (loading || !weather) {
    return (
      <div className={`p-4 text-center rounded-xl shadow-xs border transition-colors duration-300 ${
        theme === "dark" 
          ? "bg-[#090d16] border-slate-800 text-slate-100" 
          : "bg-white border-slate-200 text-slate-800"
      }`}>
        <span className="animate-spin text-[#052962] dark:text-yellow-400 rounded-full h-4.5 w-4.5 border-2 border-current border-t-transparent inline-block mr-2"></span>
        <span className="text-xs text-slate-400 font-bold font-anek-malayalam">
          {lang === "en" ? "Loading Weather Now..." : "കാലാവസ്ഥ വിവരങ്ങൾ വരുന്നു..."}
        </span>
      </div>
    );
  }

  // Calculate average temperature of sub-regions dynamically
  const temps = weather.subRegions.map(r => r.temp).filter(t => typeof t === 'number' || !isNaN(Number(t)));
  const avgTemp = temps.length > 0 ? Math.round(temps.reduce((sum, item) => sum + Number(item), 0) / temps.length) : 28;

  return (
    <div className={`rounded-2xl shadow-xs p-4.5 space-y-3 font-anek-malayalam border transition-colors duration-300 ${
      theme === "dark" 
        ? "bg-[#090d16] border-slate-800 text-slate-100" 
        : "bg-white border-slate-200 text-slate-800"
    }`}>
      
      {/* 1. Header showing "WEATHER NOW" */}
      <div className="flex justify-between items-center select-none pb-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <h3 className={`text-xs font-black tracking-wider uppercase ${
            theme === "dark" ? "text-slate-200" : "text-[#052962]"
          }`}>
            {lang === "en" ? "WEATHER NOW" : "കാലാവസ്ഥ ഇപ്പോൾ"}
          </h3>
        </div>
        
        <button 
          onClick={fetchWeather} 
          disabled={loading}
          className={`p-1 border rounded-lg transition cursor-pointer ${
            theme === "dark" 
              ? "hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white" 
              : "hover:bg-slate-50 border-slate-100 text-slate-400 hover:text-[#052962]"
          }`}
          title="Refresh Weather Info"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 2. Interactive Horizontal Weather Strip with hides scrollbar styled inline */}
      <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1 pt-1 scroll-smooth select-none [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        
        {/* Module A: Overall Valley Average */}
        <div className={`p-3 rounded-xl min-w-[125px] flex flex-col justify-between shrink-0 shadow-sm relative overflow-hidden group border ${
          theme === "dark" 
            ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-slate-100" 
            : "bg-gradient-to-br from-[#052962] to-[#003980] border-[#042456] text-white"
        }`}>
          <div className="absolute -right-4 -bottom-4 w-11 h-11 bg-white/5 rounded-full group-hover:scale-135 transition-all duration-300 pointer-events-none" />
          
          <div>
            <span className={`text-[8px] font-black uppercase tracking-wider block leading-none ${
              theme === "dark" ? "text-yellow-400" : "text-[#ffe500]"
            }`}>
              {lang === "en" ? "VALLEY AVG" : "അട്ടപ്പാടി"}
            </span>
            {/* Display pure visual icon instead of text description */}
            <div className="flex items-center justify-center py-2">
              {getWeatherIcon(weather.conditionEn, "w-10 h-10")}
            </div>
          </div>

          <div className="mt-1 flex items-baseline justify-between z-10">
            <span className="text-base font-black tracking-tight leading-none">{avgTemp}°C</span>
            <span className={`text-[8.5px] font-bold ${theme === "dark" ? "text-slate-400" : "text-white/80"}`}>{weather.humidity} %</span>
          </div>
        </div>

        {/* Modules B-F: Subregions Inline Strip */}
        {weather.subRegions.map((reg) => (
          <div 
            key={reg.name} 
            className={`p-3 rounded-xl min-w-[105px] flex flex-col justify-between shrink-0 transition duration-155 relative border ${
              theme === "dark" 
                ? "bg-slate-900 border-slate-800 text-slate-100" 
                : "bg-slate-800 border-slate-900 text-white"
            }`}
          >
            <div>
              <span className={`text-[8px] font-black uppercase tracking-wider block leading-none truncate max-w-[95px] ${
                theme === "dark" ? "text-slate-400" : "text-slate-300"
              }`}>
                {reg.name}
              </span>
              {/* Display pure visual icon instead of text description */}
              <div className="flex items-center justify-center py-2">
                {getWeatherIcon(reg.conditionEn, "w-8 h-8")}
              </div>
            </div>

            <div className="mt-1 flex items-baseline justify-center">
              <span className={`text-sm font-black tracking-tight leading-none ${
                theme === "dark" ? "text-yellow-400" : "text-white"
              }`}>{reg.temp}°C</span>
            </div>
          </div>
        ))}

      </div>

      {/* Decorative footer details indicator strip */}
      <div className={`flex items-center justify-between text-[8px] font-bold border-t pt-2 select-none ${
        theme === "dark" ? "text-slate-500 border-slate-800" : "text-slate-400 border-slate-100"
      }`}>
        <span>{lang === "en" ? "SWIPE TO BROWSE MICROCLIMATES" : "കൂടുതൽ കാണാൻ വലത്തോട്ട് മാറ്റുക"}</span>
        <span>•</span>
        <span className="flex items-center gap-0.5">
          <span>{lang === "en" ? "Wind: " : "കാറ്റ്: "}</span>
          <span className={theme === "dark" ? "text-slate-300" : "text-slate-600"}>
            {lang === "en" ? weather.breezeEn : weather.breezeMl}
          </span>
        </span>
      </div>

    </div>
  );
}
