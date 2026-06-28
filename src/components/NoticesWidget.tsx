import { useState, useEffect } from "react";
import { 
  Megaphone, 
  AlertTriangle, 
  Info, 
  Bell, 
  X, 
  ChevronRight, 
  Clock, 
  Sparkles,
  RefreshCw,
  IdCard
} from "lucide-react";
import { NoticeItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

export default function NoticesWidget({ lang, onDownloadCard }: { lang: "en" | "ml"; onDownloadCard?: (not: NoticeItem) => void }) {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notices");
      const data = await res.json();
      // Only show active notices
      const activeNotices = data.filter((n: NoticeItem) => n.active !== false);
      setNotices(activeNotices);
    } catch (err) {
      console.error("Failed to fetch notices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const getIcon = (type: string, severity: string) => {
    if (type === "caution" || severity === "high") {
      return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
    }
    if (type === "attention") {
      return <Bell className="w-4 h-4 text-amber-500 shrink-0 animate-swing" />;
    }
    return <Megaphone className="w-4 h-4 text-blue-500 dark:text-sky-400 shrink-0" />;
  };

  const getNoticeBg = (not: NoticeItem) => {
    if (not.severity === "high") {
      return "bg-rose-50/70 hover:bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 dark:border-rose-900/40";
    }
    if (not.type === "caution") {
      return "bg-amber-50/70 hover:bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:hover:bg-amber-950/30 dark:border-amber-900/40";
    }
    return "bg-slate-50/80 hover:bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:hover:bg-slate-900/80 dark:border-slate-800";
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 text-center rounded-2xl shadow-xs">
        <span className="animate-spin text-[#052962] dark:text-yellow-400 rounded-full h-4.5 w-4.5 border-2 border-current border-t-transparent inline-block mr-2"></span>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-bold font-anek-malayalam">
          {lang === "en" ? "Loading Notices..." : "അറിയിപ്പുകൾ വരുന്നു..."}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-4.5 space-y-3 font-anek-malayalam select-none">
      {/* Widget Header */}
      <div className="flex justify-between items-center pb-1">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-red-650/10 border border-red-650/20 text-red-650 dark:text-rose-400 animate-pulse">
            <Megaphone className="w-3.5 h-3.5" />
          </span>
          <h3 className="text-xs font-black tracking-wider text-[#052962] dark:text-[#38bdf8] uppercase">
            {lang === "en" ? "NOTICES & ALERTS" : "അറിയിപ്പുകൾ"}
          </h3>
        </div>

        <button 
          onClick={fetchNotices} 
          disabled={loading}
          className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg text-slate-400 dark:text-slate-500 hover:text-[#052962] dark:hover:text-[#38bdf8] transition cursor-pointer"
          title="Refresh Notices"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Notices Timeline / Listing */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {notices.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400 dark:text-slate-550 font-medium">
              {lang === "en" ? "No active notices or alerts." : "അറിയിപ്പുകൾ ഒന്നും നിലവിലില്ല."}
            </p>
          </div>
        ) : (
          notices.map((not) => (
            <div
              key={not.id}
              onClick={() => setSelectedNotice(not)}
              className={`p-3 rounded-xl border text-left transition duration-200 cursor-pointer flex gap-3 items-start ${getNoticeBg(not)}`}
            >
              {/* Severity / Type Icon Circle */}
              <div className="p-1.5 rounded-full bg-white dark:bg-slate-850 border dark:border-slate-750 shrink-0 mt-0.5 shadow-2xs">
                {getIcon(not.type, not.severity)}
              </div>

              {/* Notice snippet text content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                    not.severity === "high" 
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-extrabold" 
                      : not.type === "caution" 
                        ? "bg-amber-100 text-amber-805 dark:bg-amber-950/40 dark:text-amber-300" 
                        : "bg-blue-105 text-[#052962] dark:bg-blue-950/45 dark:text-[#38bdf8]"
                  }`}>
                    {lang === "en" ? not.type : not.type === "caution" ? "ജാഗ്രത" : not.type === "attention" ? "ശ്രദ്ധിക്കുക" : "നോട്ടീസ്"}
                  </span>

                  <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold font-mono">
                    {not.date}
                  </span>
                </div>

                <div className="flex gap-2 items-start mt-1">
                  {not.image && (
                    <img 
                      src={not.image} 
                      alt="" 
                      className="w-10 h-10 object-cover rounded-lg border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 shadow-3xs"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 leading-snug line-clamp-1">
                      {lang === "en" ? not.titleEn : not.titleMl}
                    </h4>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                      {lang === "en" ? not.contentEn : not.contentMl}
                    </p>
                  </div>
                </div>
              </div>

              <div className="shrink-0 mt-2.5 flex flex-col items-end gap-2.5 text-slate-400 dark:text-slate-500">
                {onDownloadCard && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadCard(not);
                    }}
                    className="p-1 cursor-pointer bg-slate-100 hover:bg-[#ffe500] hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-yellow-450 dark:hover:text-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg transition flex items-center justify-center"
                    title={lang === "en" ? "Generate Graphic Card" : "ഷെയർ കാർഡ്"}
                  >
                    <IdCard className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  </button>
                )}
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info strip */}
      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2 font-bold justify-between">
        <span>{lang === "en" ? "CLICK CARDS FOR FULL DETAILS" : "വിശദമായി വായിക്കാൻ കാർഡിൽ തൊടുക"}</span>
        <span>•</span>
        <span className="text-[#052962] dark:text-[#38bdf8] font-black">{notices.length} {lang === "en" ? "Live Notes" : "അറിയിപ്പുകൾ"}</span>
      </div>

      {/* Detailed Modal Overlay */}
      <AnimatePresence>
        {selectedNotice && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-lg overflow-hidden flex flex-col font-anek-malayalam"
            >
              <div className={`p-4 text-white flex items-center justify-between ${
                selectedNotice.severity === "high" 
                  ? "bg-rose-700 dark:bg-rose-900" 
                  : selectedNotice.type === "caution" 
                    ? "bg-amber-600 dark:bg-amber-800" 
                    : "bg-[#052962] dark:bg-slate-950"
              }`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-100 shrink-0" />
                  <h4 className="text-sm font-black uppercase tracking-wider">
                    {lang === "en" ? "OFFICIAL NOTIFICATION" : "പഞ്ചായത്ത് ഔദ്യോഗിക അറിയിപ്പ്"}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="p-1 rounded-lg hover:bg-white/10 dark:hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold border-b dark:border-slate-800 pb-2 bg-white dark:bg-slate-900">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{selectedNotice.date}</span>
                  </span>
                  <span className="uppercase text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-black text-slate-800 dark:text-slate-300 border dark:border-slate-750">
                    {selectedNotice.type}
                  </span>
                </div>

                {selectedNotice.image && (
                  <div className="w-full rounded-xl overflow-hidden border dark:border-slate-800 bg-slate-100 dark:bg-slate-950 max-h-56 flex items-center justify-center shadow-xs">
                    <img 
                      src={selectedNotice.image} 
                      alt="Notice Attachment" 
                      className="w-full max-h-56 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="space-y-1.5 text-left bg-white dark:bg-slate-900">
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-snug">
                    {lang === "en" ? selectedNotice.titleEn : selectedNotice.titleMl}
                  </h3>
                  <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-semibold whitespace-pre-wrap pt-2 border-t border-slate-50 dark:border-slate-800">
                    {lang === "en" ? selectedNotice.contentEn : selectedNotice.contentMl}
                  </p>
                </div>

                {selectedNotice.severity === "high" && (
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-900/40 p-2.5 rounded-xl flex items-start gap-2 text-[10px] text-rose-800 dark:text-rose-350 text-left">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <p className="font-extrabold leading-normal">
                      {lang === "en" 
                        ? "CRITICAL ATTENTION REQUIRED: Please spread the word to local neighborhood groups." 
                        : "അടിയന്തര ശ്രദ്ധ ആവശ്യമാണ്: വിവരങ്ങൾ പ്രാദേശിക ഗ്രൂപ്പുകളിലേക്ക് പങ്കുവെക്കുക."}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center w-full bg-white dark:bg-slate-900">
                  {onDownloadCard && (
                    <button
                      onClick={() => {
                        setSelectedNotice(null);
                        onDownloadCard(selectedNotice);
                      }}
                      className="px-3.5 py-2 bg-[#ffe500] hover:bg-[#e6ce00] text-slate-950 rounded-xl text-xs font-black cursor-pointer transition flex items-center gap-1.5 shadow-xs"
                    >
                      <IdCard className="w-4 h-4 text-slate-950 shrink-0" /> {lang === "en" ? "Share Card" : "ഷെയർ കാർഡ്"}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedNotice(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-black cursor-pointer transition"
                  >
                    {lang === "en" ? "Close" : "വായിച്ചു ബോധ്യപ്പെട്ടു"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
