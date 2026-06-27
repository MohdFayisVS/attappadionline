import { useState, useEffect, useRef } from "react";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Filter, 
  Sparkles,
  Info,
  IdCard 
} from "lucide-react";
import { EventItem } from "../types";
import ShareButtons from "./ShareButtons";
import { motion, AnimatePresence } from "motion/react";

const weekDaysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const weekDaysMl = ["ഞായർ", "തിങ്കൾ", "ചൊവ്വാ", "ബുധൻ", "വ്യാഴം", "വെള്ളി", "ശനി"];

const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthNamesMl = ["ജനു", "ഫെബ്രു", "മാർ", "ഏപ്രി", "മേയ്", "ജൂൺ", "ജൂലൈ", "ഓഗ", "സെപ്റ്റ", "ഒക്ടോ", "നവം", "ഡിസം"];

export default function CalendarWidget({ lang, onDownloadCard }: { lang: "en" | "ml"; onDownloadCard?: (ev: EventItem) => void }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // The base reference date for the inline strip view (defaults to today)
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  // The actively selected date filter (YYYY-MM-DD), defaults to null (showing all)
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Standard utility to normalize dates to YYYY-MM-DD
  const getNormalizedDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    } catch {
      return "";
    }
  };

  const getNormalizedDateFromObj = (dateObj: Date): string => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Generate 11 days (5 trailing, the base day, and 5 leading days) for the inline strip
  const getDaysStrip = () => {
    const arr = [];
    for (let i = -5; i <= 5; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      arr.push(d);
    }
    return arr;
  };

  const daysStrip = getDaysStrip();

  const shiftDays = (amount: number) => {
    const newBase = new Date(baseDate);
    newBase.setDate(baseDate.getDate() + amount);
    setBaseDate(newBase);
  };

  const resetToToday = () => {
    const freshToday = new Date();
    setBaseDate(freshToday);
    setSelectedDateFilter(getNormalizedDateFromObj(freshToday));
  };

  const getEventsForDay = (dateObj: Date): EventItem[] => {
    const checkStr = getNormalizedDateFromObj(dateObj);
    return events.filter(ev => {
      const normEvDate = getNormalizedDate(ev.date);
      return normEvDate === checkStr || ev.date === checkStr;
    });
  };

  const formatEventDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const day = d.getDate();
      const month = lang === "en" ? monthNamesEn[d.getMonth()] : monthNamesMl[d.getMonth()];
      return { day, month };
    } catch (_) {
      return { day: "?", month: "Date" };
    }
  };

  // Filter events: if a date is selected on the strip, show that day's events.
  // Otherwise, filter to show only future/today events or all events.
  const filteredEvents = events.filter(ev => {
    if (!selectedDateFilter) return true;
    const normEvDate = getNormalizedDate(ev.date);
    return normEvDate === selectedDateFilter || ev.date === selectedDateFilter;
  });

  const todayStr = getNormalizedDateFromObj(new Date());

  if (loading) {
    return (
      <div id="calendar-widget-wrapper" className="bg-white border p-6 text-center rounded-xl shadow-xs">
        <span className="animate-spin text-[#052962] rounded-full h-5 w-5 border-2 border-current border-t-transparent inline-block mr-2"></span>
        <span className="text-xs text-gray-400 font-anek-malayalam font-bold">
          {lang === "en" ? "Syncing Community Calendar..." : "കലണ്ടർ വിവരങ്ങൾ ലഭ്യമാക്കുന്നു..."}
        </span>
      </div>
    );
  }

  return (
    <div id="calendar-widget" className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col font-anek-malayalam">
      
      {/* 1. Header with dynamic month focus indicator & navigation */}
      <div className="bg-linear-to-r from-[#052962] to-[#003980] text-white p-4.5 relative overflow-hidden select-none">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 bg-[radial-gradient(circle_at_bottom_right,yellow_1%_20%,transparent_60%)] pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded bg-[#ffe500]/15 border border-[#ffe500]/25 text-[#ffe500]">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#ffe500]">
              {lang === "en" ? "CALENDAR" : "കലണ്ടർ"}
            </span>
          </div>
          
          <button 
            type="button"
            onClick={resetToToday}
            className="text-[10px] bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-0.5 rounded font-black transition duration-200 cursor-pointer"
          >
            {lang === "en" ? "Today" : "ഇന്ന്"}
          </button>
        </div>

        {/* Focused Date/Month Representation */}
        <div className="flex items-center justify-between mt-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-black tracking-tight leading-none text-white">
              {lang === "en" ? monthNamesEn[baseDate.getMonth()] : monthNamesMl[baseDate.getMonth()]} {baseDate.getFullYear()}
            </h3>
            <p className="text-[10px] text-white/75 font-bold">
              {lang === "en" ? "Swipe left / right to browse calendar timeline" : "വലത്തോട്ടും ഇടത്തോട്ടും മാറ്റി ദിവസങ്ങൾ തിരഞ്ഞെടുക്കുക"}
            </p>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => shiftDays(-4)}
              aria-label="Shift calendar back"
              className="p-1.5 rounded-md bg-white/5 hover:bg-[#ffe500]/20 hover:text-[#ffe500] border border-white/10 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => shiftDays(4)}
              aria-label="Shift calendar forward"
              className="p-1.5 rounded-md bg-white/5 hover:bg-[#ffe500]/20 hover:text-[#ffe500] border border-white/10 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Inline Date Strip Component with leading & trailing days */}
      <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-1 select-none">
        
        {/* Shifting Edge Arrow Left */}
        <button 
          onClick={() => shiftDays(-1)} 
          className="p-1 text-slate-400 hover:text-slate-800 transition cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Days Strip Viewport */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 flex justify-between gap-1 overflow-x-auto no-scrollbar scroll-smooth px-1"
        >
          {daysStrip.map((dayObj, i) => {
            const dateStr = getNormalizedDateFromObj(dayObj);
            const isSelected = selectedDateFilter === dateStr;
            const isToday = dateStr === todayStr;
            const dayEvents = getEventsForDay(dayObj);
            const hasEvents = dayEvents.length > 0;

            const dayOfWeekLabel = lang === "en" 
              ? weekDaysEn[dayObj.getDay()] 
              : weekDaysMl[dayObj.getDay()];

            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setSelectedDateFilter(null); // Deselect on second click
                  } else {
                    setSelectedDateFilter(dateStr);
                  }
                }}
                className={`flex flex-col items-center justify-between py-2.5 px-2.5 rounded-xl transition-all duration-200 cursor-pointer text-center relative min-w-[45px] shrink-0 border ${
                  isSelected
                    ? "bg-[#052962] text-white border-[#052962] shadow-sm scale-110 z-10"
                    : isToday
                      ? "bg-[#ffe500]/15 border-[#ffe500] text-[#052962]"
                      : "bg-white hover:bg-slate-100 border-slate-200 text-slate-800"
                }`}
              >
                {/* Week day abbreviation */}
                <span className={`text-[8px] font-black uppercase tracking-wider block ${
                  isSelected ? "text-[#ffe500]" : "text-slate-400"
                }`}>
                  {dayOfWeekLabel}
                </span>

                {/* Day number */}
                <span className={`text-sm font-black block mt-0.5 leading-none ${
                  isSelected ? "text-white" : isToday ? "text-[#052962]" : "text-slate-900"
                }`}>
                  {dayObj.getDate()}
                </span>

                {/* Indicator dot or count of events */}
                {hasEvents && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 block ${
                    isSelected ? "bg-[#ffe500]" : "bg-[#052962]/90"
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Shifting Edge Arrow Right */}
        <button 
          onClick={() => shiftDays(1)} 
          className="p-1 text-slate-400 hover:text-slate-800 transition cursor-pointer shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

      {/* 3. Filter Status Area */}
      <div className="px-4.5 py-3 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500 font-anek-malayalam select-none">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#052962]" />
          <span>
            {selectedDateFilter ? (
              <>
                {lang === "en" ? "Filtered Date:" : "ഫിൽട്ടർ ചെയ്ത ദിവസം:"} {" "}
                <span className="text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded font-black font-anek-malayalam">
                  {selectedDateFilter}
                </span>
              </>
            ) : (
              lang === "en" ? "Showing all scheduled events" : "എല്ലാ തീയതികളിലെയും വിവരങ്ങൾ"
            )}
          </span>
        </div>
        
        {selectedDateFilter && (
          <button
            onClick={() => setSelectedDateFilter(null)}
            className="flex items-center gap-1 text-[10px] text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded transition font-black cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>{lang === "en" ? "Show All" : "എല്ലാം കാണിക്കാം"}</span>
          </button>
        )}
      </div>

      {/* 4. Sleek Dynamic Event Timeline Feed */}
      <div className="p-4 space-y-4">
        
        <div className="space-y-3 max-h-[355px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 px-4 text-center border-2 border-dashed border-slate-150 rounded-2xl space-y-2"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 text-xs text-slate-400">
                  <p className="font-extrabold font-anek-malayalam text-slate-700">
                    {lang === "en" ? "No Events Scheduled" : "പരിപാടികൾ ഒന്നും നിശ്ചയിച്ചിട്ടില്ല"}
                  </p>
                  <p className="text-[10px] leading-tight font-semibold">
                    {lang === "en"
                      ? "Choose another highlighted day on the horizontal timeline above."
                      : "തീയതി ഫിൽട്ടറുകൾ മാറ്റുകയോ മുകളിൽ മറ്റൊരു തീയതി തിരഞ്ഞെടുക്കുകയോ ചെയ്യാം."}
                  </p>
                </div>
              </motion.div>
            ) : (
              filteredEvents.map((ev) => {
                const dateObj = formatEventDate(ev.date);
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={ev.id} 
                    className="flex gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 hover:border-[#052962]/50 hover:shadow-xs transition duration-200"
                  >
                    {/* Compact Date Box */}
                    <div className="flex flex-col justify-center items-center bg-slate-50 rounded-lg border border-slate-200 text-slate-800 h-12 w-12 shrink-0 text-center select-none shadow-inner">
                      <span className="text-base font-black leading-none text-slate-900">{dateObj.day}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider leading-none mt-1 text-[#052962]">{dateObj.month}</span>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h4 className="text-xs font-black text-slate-900 leading-snug line-clamp-2 uppercase">
                        {lang === "en" ? ev.titleEn : ev.titleMl}
                      </h4>
                      
                      {/* Secondary parameters */}
                      <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[10px] text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{ev.time}</span>
                        </span>
                        <span className="flex items-center gap-0.5 max-w-[145px] truncate text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-[#052962] shrink-0" />
                          <span>{lang === "en" ? ev.locationEn : ev.locationMl}</span>
                        </span>
                      </div>

                      {/* Snippet expand block */}
                      <p className="text-[10.5px] text-slate-500 leading-normal line-clamp-2 italic font-medium pt-1 border-t border-slate-100">
                        {lang === "en" ? ev.descriptionEn : ev.descriptionMl}
                      </p>

                      {/* Sharing triggers */}
                      <div className="mt-2.5 pt-1.5 flex justify-between items-center gap-2">
                        {onDownloadCard && (
                          <button
                            onClick={() => onDownloadCard(ev)}
                            className="px-2.5 py-1 hover:bg-amber-100 text-[#052962] hover:text-amber-800 rounded-md bg-[#ffe500]/15 border border-[#ffe500]/40 text-[9px] font-black uppercase tracking-wider transition duration-200 flex items-center gap-1 cursor-pointer select-none"
                            title="Generate Shareable Graphic Card"
                          >
                            <IdCard className="w-3.5 h-3.5 text-amber-600 shrink-0" /> {lang === "en" ? "Card Preview" : "കാർഡ്"}
                          </button>
                        )}
                        <ShareButtons 
                          title={lang === "en" ? ev.titleEn : ev.titleMl}
                          summary={lang === "en" ? `${ev.locationEn} at ${ev.time}` : `${ev.locationMl}, ${ev.time}`}
                          url={`${window.location.origin}/#event-${ev.id}`}
                          layout="bubble"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Info Tip block */}
        <div className="bg-[#052962]/5 border border-[#052962]/10 p-2.5 rounded-xl flex items-start gap-2 text-[10.5px] text-slate-600 select-none">
          <Info className="w-3.5 h-3.5 text-[#052962] shrink-0 mt-0.5" />
          <p className="font-semibold leading-relaxed">
            {lang === "en" 
              ? "Citizen Events Desk is updated live based on panchayat bulletins." 
              : "പഞ്ചായത്ത് വിവരങ്ങൾ പ്രകാരം പരിപാടികളുടെ കലണ്ടർ അപ്ഡേറ്റ് ചെയ്യുന്നതാണ്."}
          </p>
        </div>
      </div>

    </div>
  );
}
