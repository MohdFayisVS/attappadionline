import React, { useState } from "react";
import { Eye, Calendar, MapPin, Tag, ArrowUpRight, Search, Globe, ChevronRight, Bookmark, Sparkles, IdCard } from "lucide-react";
import { NewsPost } from "../types";

interface LatestNewsProps {
  news: NewsPost[];
  lang: "en" | "ml" | "ta";
  activeRegion: string;
  onRegionChange: (region: string) => void;
  onPostSelect: (post: NewsPost) => void;
  onDownloadCard?: (post: NewsPost) => void;
  bookmarks?: string[];
  onToggleBookmark?: (id: string, e: React.MouseEvent) => void;
}

export default function LatestNews({ 
  news, 
  lang, 
  activeRegion, 
  onRegionChange, 
  onPostSelect, 
  onDownloadCard,
  bookmarks = [],
  onToggleBookmark
}: LatestNewsProps) {
  const [newsSearch, setNewsSearch] = useState("");
  const newsTitle = (post: NewsPost) => lang === "ta" ? (post.titleTa || post.titleEn) : lang === "ml" ? post.titleMl : post.titleEn;
  const newsBody = (post: NewsPost) => lang === "ta" ? (post.contentTa || post.contentEn) : lang === "ml" ? post.contentMl : post.contentEn;
  const [activeCategoryTab, setActiveCategoryTab] = useState<"all" | "breaking" | "latest" | "updates">("all");

  const regionNames: { [key: string]: { en: string; ml: string; ta: string } } = {
    all: { en: "All Regions", ml: "എല്ലാ മേഖലകളും", ta: "அனைத்து பகுதிகளும்" },
    agali: { en: "Agali", ml: "അഗളി", ta: "அகளி" },
    mukkali: { en: "Mukkali", ml: "മുക്കാലി", ta: "முக்காலி" },
    thavalam: { en: "Thavalam", ml: "താവളം", ta: "தாவளம்" },
    kottathara: { en: "Kottathara", ml: "കോട്ടത്തറ", ta: "கோட்டத்தறை" },
    sholayur: { en: "Sholayur", ml: "ഷോളയൂർ", ta: "சோலையூர்" },
    pudur: { en: "Pudur", ml: "പുതൂർ", ta: "புதூர்" },
    anaikkatty: { en: "Anaikatty", ml: "ആനക്കട്ടി", ta: "ஆனைக்கட்டி" },
    jellippara: { en: "Jellippara", ml: "ജെല്ലിപ്പാറ", ta: "ஜெல்லிப்பாறை" },
    chittur: { en: "Chittur", ml: "ചിറ്റൂർ", ta: "சித்தூர்" }
  };

  // Filter posts based on region dropdown, searching input, and category tabs
  const filteredPosts = news.filter((post) => {
    // 1. Category Filter
    if (activeCategoryTab !== "all" && post.category !== activeCategoryTab) {
      return false;
    }

    // 2. Region Filter
    if (activeRegion !== "all" && !(post.regions || []).includes(activeRegion)) {
      return false;
    }

    // 3. Text Search
    if (newsSearch.trim() !== "") {
      const q = newsSearch.toLowerCase();
      const matchEn = post.titleEn.toLowerCase().includes(q) || post.contentEn.toLowerCase().includes(q);
      const matchMl = post.titleMl.toLowerCase().includes(q) || post.contentMl.toLowerCase().includes(q);
      const matchTa = (post.titleTa || "").toLowerCase().includes(q) || (post.contentTa || "").toLowerCase().includes(q);
      return matchEn || matchMl || matchTa;
    }

    return true;
  });

  return (
    <div className="space-y-6 text-gray-800 dark:text-slate-200">
      
      {/* Category control bar & search */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-lg shadow-sm space-y-4 animate-fade-in">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Category Tabs */}
          <div lang="en" className="ao-news-tabs ao-fixed-ui grid grid-cols-2 sm:grid-cols-4 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-lg p-1 text-xs font-bold uppercase w-full min-w-0 overflow-visible">
            <button
              onClick={() => setActiveCategoryTab("all")}
              className={`min-w-0 px-2 sm:px-3 py-2 rounded-md transition cursor-pointer ${activeCategoryTab === "all" ? "bg-[#052962] dark:bg-blue-600 text-white shadow-xs" : "text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-850"}`}
            >
              All Sections
            </button>
            <button
              onClick={() => setActiveCategoryTab("breaking")}
              className={`min-w-0 px-2 sm:px-3 py-2 rounded-md transition cursor-pointer ${activeCategoryTab === "breaking" ? "bg-[#c70000] text-white shadow-xs" : "text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-850"}`}
            >
              Breaking
            </button>
            <button
              onClick={() => setActiveCategoryTab("latest")}
              className={`min-w-0 px-2 sm:px-3 py-2 rounded-md transition cursor-pointer ${activeCategoryTab === "latest" ? "bg-[#052962]/90 dark:bg-blue-500/90 text-white shadow-xs" : "text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-850"}`}
            >
              Latest News
            </button>
            <button
              onClick={() => setActiveCategoryTab("updates")}
              className={`min-w-0 px-2 sm:px-3 py-2 rounded-md transition cursor-pointer ${activeCategoryTab === "updates" ? "bg-amber-600 text-white shadow-xs" : "text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-850"}`}
            >
              Daily Updates
            </button>
          </div>

          {/* Quick Search */}
          <div lang="en" className="ao-fixed-ui relative w-full md:w-80">
            <span className="absolute left-3 inset-y-0 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text"
              placeholder="Search news, places, keywords..."
              value={newsSearch}
              onChange={(e) => setNewsSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#052962] dark:focus:ring-blue-500 border-gray-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {/* Region selector pills inside filtering header */}
        <div className="border-t border-gray-100 dark:border-slate-800 pt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span lang="en" className="ao-fixed-ui text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2 block">
            Region Filter:
          </span>
          <div lang="en" className="ao-region-nav ao-fixed-ui flex w-full min-w-0 gap-2 overflow-x-auto whitespace-nowrap pb-2 sm:pb-1">
          {Object.keys(regionNames).map((key) => (
            <button
              key={key}
              onClick={() => onRegionChange(key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase transition cursor-pointer ${activeRegion === key ? "bg-[#ffe500] text-[#052962] border-2 border-[#052962] font-black" : "bg-gray-100 dark:bg-slate-850 text-gray-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border dark:border-slate-800"}`}
            >
              {regionNames[key].en}
            </button>
          ))}
          </div>
        </div>

      </div>

      {/* Main Grid display feed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        {filteredPosts.length === 0 ? (
          <div className="col-span-full text-center bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg py-12 px-4 shadow-sm text-gray-400">
            <Globe className="w-12 h-12 mx-auto text-gray-300 mb-3 animate-spin duration-3000" />
            <p lang={lang} className="ao-localized-content text-sm">
              {lang === "ml" ? "അന്വേഷിച്ച മേഖലയിലുള്ള വാർത്തകൾ ലഭ്യമല്ല." : lang === "ta" ? "இந்தத் தேடலுக்குப் பொருந்தும் செய்திகள் இல்லை." : "No articles matched for this search context right now."}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article 
              key={post.id}
              onClick={() => onPostSelect(post)}
              onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onPostSelect(post); } }}
              tabIndex={0}
              aria-label={`${lang === "ta" ? "செய்தியைப் படிக்க" : lang === "en" ? "Read article" : "വാർത്ത വായിക്കുക"}: ${newsTitle(post)}`}
              className="ao-news-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between group focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <div>
                
                {/* Photo Header */}
                <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-950">
                  <img 
                    src={post.image} 
                    alt={newsTitle(post)} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Category Stamp */}
                  <span className={`absolute top-2.5 left-2.5 text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-sm text-[#fcfcfb] shadow-sm ${post.category === "breaking" ? "bg-red-700 animate-pulse" : post.category === "latest" ? "bg-[#005689]" : "bg-amber-600"}`}>
                    {post.category}
                  </span>

                  {/* Bookmark Button Overlay */}
                  {onToggleBookmark && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(post.id, e);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-white/95 hover:bg-white text-slate-700 hover:text-amber-500 rounded-full shadow-md hover:scale-110 transition duration-200 z-10 flex items-center justify-center cursor-pointer border border-slate-100"
                      title={bookmarks.includes(post.id) ? ("Remove Bookmark") : ("Bookmark Article")}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${bookmarks.includes(post.id) ? "fill-amber-500 text-amber-500" : "text-slate-600"}`} />
                    </button>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-5 space-y-3">
                  
                  {/* Meta taggers */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(post.publishedAt).toLocaleDateString(lang === "ml" ? "ml-IN" : "en-US")}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{post.views || 1} views</span>
                    </span>
                  </div>

                  {/* Headline */}
                  <h4 className="font-serif-guardian font-extrabold text-[#052962] dark:text-slate-100 leading-snug group-hover:text-[#005689] dark:group-hover:text-blue-400 transition-colors text-lg sm:text-xl line-clamp-3">
                    {newsTitle(post)}
                  </h4>

                  {/* Description snippet */}
                  <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {newsBody(post)}
                  </p>

                </div>

              </div>

              {/* Card Footer tags */}
              <div className="p-4 sm:px-5 border-t border-gray-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-3 bg-gray-50/50 dark:bg-slate-900/50">
                <div className="flex flex-wrap gap-1">
                  {(post.regions || []).map(r => (
                    <span key={r} className="flex items-center gap-0.5 text-[10px] text-[#005689] dark:text-sky-300 font-bold bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-100 dark:border-sky-900/30 capitalize">
                      <MapPin className="w-2.5 h-2.5" />
                      {r}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {onDownloadCard && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadCard(post);
                      }}
                      className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-100 text-[#052962] hover:text-amber-800 border border-[#ffe500]/30 rounded text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1 cursor-pointer select-none"
                      title={lang === "en" ? "Card Preview & Download" : "കാർഡ് രൂപത്തിൽ ഡൗൺലോഡ് ചെയ്യുക"}
                    >
                      <IdCard className="w-3 h-3 text-amber-500 shrink-0" /> Card
                    </button>
                  )}
                  <span className="text-xs font-bold text-[#052962] group-hover:translate-x-1.5 transition duration-300 flex items-center gap-0.5">
                    Read article <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

            </article>
          ))
        )}
      </div>

    </div>
  );
}
