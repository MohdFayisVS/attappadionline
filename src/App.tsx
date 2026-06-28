import React, { useState, useEffect } from "react";
import { 
  Globe, Languages, Eye, Calendar as CalendarIcon, MapPin, 
  Settings, ChevronLeft, ChevronRight, X, AlertTriangle, CloudSun, Phone, BookOpen, Clock, Search, Share2,
  Bookmark, Sun, Moon, Megaphone, Newspaper, Zap, Sparkles, IdCard, Bus, Car, ShoppingBag, Utensils
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NewsPost, EventItem, DirectoryItem, EmergencyContact, NoticeItem } from "./types";
import LatestNews from "./components/LatestNews";
import WeatherWidget from "./components/WeatherWidget";
import CalendarWidget from "./components/CalendarWidget";
import DirectoryWidget from "./components/DirectoryWidget";
import OpinionsWidget from "./components/OpinionsWidget";
import NoticesWidget from "./components/NoticesWidget";
import AdminDashboard from "./components/AdminDashboard";
import ShareButtons from "./components/ShareButtons";
import ExploreAttappadi from "./components/ExploreAttappadi";
import ShareCardModal from "./components/ShareCardModal";

const slideVariants = {
  enter: (dir: "next" | "prev") => ({
    x: dir === "next" ? 180 : -180,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (dir: "next" | "prev") => ({
    x: dir === "next" ? -180 : 180,
    opacity: 0
  })
};

export default function App() {
  // Navigation & URL Routing state: news vs admin-dashboard
  const [viewMode, setViewMode] = useState<"news" | "admin">("news");

  // Live digital clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Section Navigation: Supporting all main header sections including bookmarks
  const [activeSection, setActiveSection] = useState<
    "news" | "latest-updates" | "events" | "photos" | "videos" | "explore" | "column" | "readers-column" | "local-services" | "bookmarks"
  >("news");

  // Bookmarking storage state
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("attappadi_bookmarks");
      return stored ? JSON.parse(stored) : [];
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("attappadi_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setBookmarks((prev) => {
      if (prev.includes(id)) {
        return prev.filter((bId) => bId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const stored = localStorage.getItem("attappadi_theme");
      if (stored === "dark" || stored === "light") return stored;
      return "light"; // Default to light theme
    } catch (_) {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("attappadi_theme", theme);
    } catch (_) {}
    
    const root = window.document.documentElement;
    if (theme === "dark") {
       root.classList.add("dark");
    } else {
       root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };
  
  // Language control
  const [lang, setLang] = useState<"en" | "ml">("ml");
  
  // Quick Access Deep Link States
  const [exploreTab, setExploreTab] = useState<"destinations" | "food" | "stays" | "travelogues" | "photos" | "culture" | "busTimings">("destinations");
  const [localServicesTab, setLocalServicesTab] = useState<"emergency" | "lpg" | "commercial" | "autorikshaw" | "shopping">("lpg");
  
  // Storage & API states
  const [news, setNews] = useState<NewsPost[]>([]);
  const [breakingPosts, setBreakingPosts] = useState<NewsPost[]>([]);
  const [sliderPosts, setSliderPosts] = useState<NewsPost[]>([]);
  const [announcements, setAnnouncements] = useState<NoticeItem[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<NoticeItem | null>(null);
  const [selectedAppService, setSelectedAppService] = useState<"busTimings" | "autorikshaw" | "travelFood" | "shopping" | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Advertisement State Hooks
  const [adConfig, setAdConfig] = useState<any>(null);
  const [activeAdDetail, setActiveAdDetail] = useState<{
    title: string;
    subtitle: string;
    contact: string;
    image?: string;
  } | null>(null);

  const fetchAdConfig = async () => {
    try {
      const res = await fetch("/api/adconfig");
      if (res.ok) {
        const data = await res.json();
        setAdConfig(data);
      }
    } catch (err) {
      console.error("Ad retrieval issue", err);
    }
  };

  // Search indexing and state tracking
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<"all" | "news" | "events" | "directory">("all");
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [allDirectory, setAllDirectory] = useState<DirectoryItem[]>([]);
  const [allEmergency, setAllEmergency] = useState<EmergencyContact[]>([]);

  // Selected region filter state
  const [activeRegion, setActiveRegion] = useState("all");

  // Handler for geographical desk clicks that switches view to home page news and smoothly scrolls to it
  const handleRegionClick = (regionKey: string) => {
    setActiveRegion(regionKey);
    setActiveSection("news");
    setTimeout(() => {
      const el = document.getElementById("latest-news-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 80);
  };

  // Read News Article modal and sliding transition states
  const [selectedArticle, setSelectedArticle] = useState<NewsPost | null>(null);
  const [shareCardTarget, setShareCardTarget] = useState<any | null>(null);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");

  // Home slider active item pointer
  const [currSliderIdx, setCurrSliderIdx] = useState(0);

  // Listen to hash change routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#admin-portal-attappadi") {
        setViewMode("admin");
      } else {
        setViewMode("news");
      }
    };

    // check hash on load
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Fetch all news
  const fetchNewsFeed = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/news");
      const data: NewsPost[] = await res.json();
      setNews(data);

      // breaking news entries
      const breaking = data.filter(n => n.category === "breaking");
      setBreakingPosts(breaking);

      // slider entries
      const slides = data.filter(n => n.isSlide);
      setSliderPosts(slides);

      // Fetch other collections for global index mapping
      fetchAuxiliarySearchIndices();
      fetchAnnouncementsList();
    } catch (err) {
      console.error("Failed to render news feed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncementsList = async () => {
    try {
      const res = await fetch("/api/notices");
      if (res.ok) {
        const data: NoticeItem[] = await res.json();
        const active = data.filter((n: NoticeItem) => n.active !== false);
        setAnnouncements(active);
      }
    } catch (err) {
      console.error("Failed to fetch notices for ticker", err);
    }
  };

  const fetchAuxiliarySearchIndices = async () => {
    try {
      const [eventsRes, dirRes, emergRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/directory"),
        fetch("/api/emergency")
      ]);
      if (eventsRes.ok) setAllEvents(await eventsRes.json());
      if (dirRes.ok) setAllDirectory(await dirRes.json());
      if (emergRes.ok) setAllEmergency(await emergRes.ok ? await emergRes.json() : []);
    } catch (err) {
      console.error("Failed to load search indexes", err);
    }
  };

  useEffect(() => {
    fetchNewsFeed();
    fetchAdConfig();
  }, []);

  // Auto scroll slider every 7.5 seconds
  useEffect(() => {
    if (sliderPosts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrSliderIdx(prev => (prev + 1) % sliderPosts.length);
    }, 7500);
    return () => clearInterval(interval);
  }, [sliderPosts]);

  const handleArticleClick = async (article: NewsPost) => {
    setSelectedArticle(article);
    // increment article views
    try {
      await fetch(`/api/news/${article.id}/view`, { method: "POST" });
      // update local list views count
      setNews(prev => prev.map(n => n.id === article.id ? { ...n, views: (n.views || 0) + 1 } : n));
    } catch (_) {}
  };

  // Article reading sliding and listing logic
  const getPrevNextArticles = () => {
    if (!selectedArticle || !news || news.length === 0) return { prev: null, next: null };
    const currentIndex = news.findIndex(n => n.id === selectedArticle.id);
    const prev = currentIndex > 0 ? news[currentIndex - 1] : null;
    const next = currentIndex < news.length - 1 ? news[currentIndex + 1] : null;
    return { prev, next };
  };

  const handleNextArticle = () => {
    const { next } = getPrevNextArticles();
    if (next) {
      setSlideDirection("next");
      handleArticleClick(next);
    }
  };

  const handlePrevArticle = () => {
    const { prev } = getPrevNextArticles();
    if (prev) {
      setSlideDirection("prev");
      handleArticleClick(prev);
    }
  };

  const { prev: prevArticle, next: nextArticle } = getPrevNextArticles();

  // Touch Swipe Gesture State & Handlers
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 50) {
        handleNextArticle();
      } else if (diffX < -50) {
        handlePrevArticle();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Keyboard navigation event wrapper (key arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedArticle) return;
      if (e.key === "ArrowRight") {
        handleNextArticle();
      } else if (e.key === "ArrowLeft") {
        handlePrevArticle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedArticle, news]);

  // Scroll to head of the view whenever article reader gets a change
  useEffect(() => {
    if (selectedArticle) {
      const modalEl = document.getElementById("news-read-modal");
      if (modalEl) {
        modalEl.scrollTo({ top: 0, behavior: "instant" as any });
      }
    }
  }, [selectedArticle?.id]);

  // Real-time search query matching logic
  const getFilteredSearchResults = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { news: [], events: [], directory: [] };

    const matchedNews = news.filter(n => 
      n.titleEn.toLowerCase().includes(q) ||
      n.titleMl.toLowerCase().includes(q) ||
      n.contentEn.toLowerCase().includes(q) ||
      n.contentMl.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q) ||
      (n.regions && n.regions.some(r => r.toLowerCase().includes(q)))
    );

    const matchedEvents = allEvents.filter(e => 
      e.titleEn.toLowerCase().includes(q) ||
      e.titleMl.toLowerCase().includes(q) ||
      e.locationEn.toLowerCase().includes(q) ||
      e.locationMl.toLowerCase().includes(q) ||
      e.descriptionEn.toLowerCase().includes(q) ||
      e.descriptionMl.toLowerCase().includes(q)
    );

    const matchedDirectory = allDirectory.filter(d => 
      d.nameEn.toLowerCase().includes(q) ||
      d.nameMl.toLowerCase().includes(q) ||
      d.contact.toLowerCase().includes(q) ||
      d.locationEn.toLowerCase().includes(q) ||
      d.locationMl.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q)
    );

    const matchedEmergency = allEmergency.filter(em => 
      em.nameEn.toLowerCase().includes(q) ||
      em.nameMl.toLowerCase().includes(q) ||
      em.number.toLowerCase().includes(q) ||
      em.type.toLowerCase().includes(q)
    );

    // Combine standard directory and emergency entries under a unified search directory list
    const directoryCombined = [
      ...matchedDirectory,
      ...matchedEmergency.map(em => ({
        id: em.id,
        nameEn: em.nameEn,
        nameMl: em.nameMl,
        category: em.type as any,
        contact: em.number,
        locationEn: "Emergency Response Hub",
        locationMl: "അടിയന്തര വിഭാഗം"
      }))
    ];

    return {
      news: matchedNews,
      events: matchedEvents,
      directory: directoryCombined
    };
  };

  const getWhatsAppLink = (number: string) => {
    const cleanNum = number.replace(/[^\d+]/g, "");
    return `https://wa.me/${cleanNum}`;
  };

  const renderAdBox = (ad: any) => {
    if (!ad) return null;
    
    const title = lang === "ml" ? ad.titleMl || ad.titleEn : ad.titleEn || ad.titleMl;
    const subtitle = lang === "ml" ? ad.subtitleMl || ad.subtitleEn : ad.subtitleEn || ad.subtitleMl;
    
    let icon = <Share2 className="w-4 h-4 flex-shrink-0" />;
    if (ad.actionType === "phone") icon = <Phone className="w-4 h-4 flex-shrink-0 animate-pulse" />;
    if (ad.actionType === "whatsapp") icon = (
      <svg className="w-4 h-4 flex-shrink-0 fill-[#ffe500]" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.713-1.448L0 24zm6.59-4.846c1.6.95 3.1 1.448 4.7 1.45 5.4 0 9.8-4.398 9.8-9.78 0-2.602-1.01-5.05-2.846-6.89C16.406 2.08 13.96 1.06 11.3 1.06 5.96 1.06 1.6 5.458 1.6 10.84c0 1.63.43 3.22 1.25 4.63l-1.02 3.73 3.82-.999zM18.15 14.85c-.326-.163-1.925-.95-2.221-1.058-.297-.11-.513-.163-.73.163-.216.325-.838 1.058-1.027 1.275-.19.217-.378.244-.704.08-.326-.163-1.378-.508-2.625-1.623-.97-.866-1.625-1.936-1.815-2.262-.19-.325-.02-.5-.183-.663-.147-.146-.327-.379-.49-.57-.162-.19-.217-.324-.325-.542-.11-.217-.054-.407-.027-.57.027-.163.216-.515.325-.73.11-.218.147-.353.217-.488.07-.136.035-.27-.014-.38-.05-.11-.513-1.247-.704-1.707-.186-.447-.364-.386-.5-.393-.13-.005-.28-.005-.43-.005-.15 0-.39.056-.59.27-.2.22-.76.74-.76 1.81 0 1.07.78 2.1 1.2 2.65 0 0 1.5 2.3 3.65 3.21.5.21 1 .34 1.35.45.54.17 1 .15 1.4.09.43-.06 1.34-.55 1.53-1.08.19-.53.19-.99.13-1.08-.05-.1-.2-.16-.53-.32z"/>
      </svg>
    );
    if (ad.actionType === "website") icon = <Globe className="w-4 h-4 flex-shrink-0" />;

    const isInternalAction = ad.actionType === "share";

    const boxContent = (
      <div 
        onClick={isInternalAction ? () => setActiveAdDetail({
          title,
          subtitle,
          contact: ad.contact,
          image: ad.image
        }) : undefined}
        className="relative flex flex-row items-center justify-between w-full h-20 bg-slate-900/40 border border-white/10 rounded-lg p-3 hover:bg-slate-900/65 hover:border-[#ffe500]/40 transition duration-300 cursor-pointer select-none overflow-hidden group gap-3"
      >
        {ad.image ? (
          <div className="absolute inset-0 z-0">
            <img 
              src={ad.image} 
              alt={title} 
              className="w-full h-full object-cover opacity-65 group-hover:scale-105 transition duration-500" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-950/70 group-hover:bg-slate-950/60 transition duration-300"></div>
          </div>
        ) : null}

        <div className="relative z-10 flex flex-row items-center justify-between h-full w-full gap-3">
          <div className="flex items-center gap-3 min-w-0 text-left">
            <div className="w-10 h-10 rounded-md bg-[#ffe500]/10 flex items-center justify-center text-[#ffe500] shrink-0 group-hover:scale-110 transition duration-300">
              {icon}
            </div>
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] text-[#ffe500] font-mono tracking-wider uppercase font-bold px-1.5 py-0.5 bg-black/50 rounded shadow whitespace-nowrap">
                  Ad / പരസ്യം
                </span>
                {ad.contact && (
                  <span className="text-[9px] text-slate-300 font-mono tracking-wider uppercase font-semibold px-1.5 py-0.5 bg-white/10 rounded truncate max-w-[120px]">
                    {ad.contact}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-200 leading-snug truncate">
                {title}
              </span>
              <span className="text-[10px] text-slate-400 font-sans font-medium leading-tight truncate">
                {subtitle}
              </span>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center bg-[#ffe500]/10 border border-[#ffe500]/20 group-hover:bg-[#ffe500] group-hover:text-[#052962] px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-serif font-black uppercase tracking-wider text-[#ffe500] transition duration-300">
            {ad.actionType === "phone" ? (lang === "en" ? "CALL NOW" : "വിളിക്കുക") : 
             ad.actionType === "whatsapp" ? (lang === "en" ? "CHAT" : "വാട്സാപ്പ്") : 
             ad.actionType === "website" ? (lang === "en" ? "VISIT" : "വെബ്സൈറ്റ്") : 
             (lang === "en" ? "VIEW DETAILS" : "വിശദാംശങ്ങൾ")}
          </div>
        </div>
      </div>
    );

    if (isInternalAction) {
      return boxContent;
    }

    let href = "#";
    if (ad.actionType === "phone") href = `tel:${ad.contact}`;
    if (ad.actionType === "whatsapp") href = getWhatsAppLink(ad.contact);
    if (ad.actionType === "website") href = ad.externalUrl || "https://example.com";

    return (
      <a 
        href={href} 
        target={ad.actionType === "website" ? "_blank" : undefined} 
        rel={ad.actionType === "website" ? "noopener noreferrer" : undefined}
        className="contents"
      >
        {boxContent}
      </a>
    );
  };

  const results = getFilteredSearchResults();
  const totalResultsCount = results.news.length + results.events.length + results.directory.length;

  if (viewMode === "admin") {
    return (
      <AdminDashboard 
        onBack={() => {
          window.location.hash = "";
          setViewMode("news");
          fetchNewsFeed(); // trigger refresh
          fetchAdConfig(); // reload ad configuration
        }} 
      />
    );
  }

  return (
    <div className={`min-h-screen bg-[#fcfcfb] dark:bg-[#090d16] text-gray-900 dark:text-slate-150 transition-colors duration-300 ${lang === 'ml' ? 'font-anek-malayalam' : 'font-anek-english'}`}>
      
      {/* 1. TOP NEWS TICKER (BREAKING) */}
      {breakingPosts.length > 0 && (
        <div id="breaking-ticker-bar" className="bg-[#c70000] text-white py-2 px-4 shadow text-xs font-bold flex items-center gap-3 overflow-hidden select-none">
          <span className="bg-white text-red-700 px-2 py-0.5 rounded-sm uppercase tracking-wider text-[10px] font-extrabold shrink-0 flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            BREAKING NOW
          </span>
          <div className="relative flex-1 w-full overflow-hidden whitespace-nowrap">
            <div className="inline-block animate-marquee pl-[100%] hover:pause">
              {breakingPosts.map((bp) => (
                <button
                  key={bp.id}
                  onClick={() => handleArticleClick(bp)}
                  className="mr-12 hover:underline hover:text-yellow-200 transition text-left inline-block"
                >
                  <span className="text-white mr-1.5 font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-yellow-300" /> {lang === "en" ? (bp.titleEn || bp.titleMl) : (bp.titleMl || bp.titleEn)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1b. TOP ANNOUNCEMENTS TICKER (OFFICIAL NOTICES & ALERTS) */}
      {announcements.length > 0 && (
        <div id="announcement-ticker-bar" className="bg-[#f0fdf4] dark:bg-[#06221c] text-[#047857] dark:text-[#34d399] py-1.5 px-4 shadow-xs text-xs font-bold flex items-center gap-3 overflow-hidden select-none border-t border-[#d1fae5] dark:border-[#0c4035] border-b">
          <span className="bg-[#047857] dark:bg-[#34d399] text-white dark:text-[#06221c] px-2 py-0.5 rounded-sm uppercase tracking-wider text-[10px] font-extrabold shrink-0 flex items-center gap-1 animate-pulse">
            <Megaphone className="w-3.5 h-3.5" />
            {lang === "en" ? "ANNOUNCEMENTS" : "അറിയിപ്പുകൾ"}
          </span>
          <div className="relative flex-1 w-full overflow-hidden whitespace-nowrap">
            <div className="inline-block animate-marquee pl-[100%] hover:pause">
              {announcements.map((not) => (
                <button
                  key={not.id}
                  onClick={() => setSelectedAnnouncement(not)}
                  className="mr-12 hover:underline hover:text-emerald-800 dark:hover:text-emerald-200 transition text-left inline-block cursor-pointer"
                >
                  <span className="text-slate-900 dark:text-emerald-50 mr-1.5 font-bold inline-flex items-center gap-1">
                    {not.type === "caution" ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    )}{" "}
                    {lang === "en" ? not.titleEn : not.titleMl}
                  </span>
                  <span className="text-emerald-600 dark:text-[#a7f3d0]/70 text-[10px] font-mono font-normal">[{not.date}]</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. CHIEF BRAND BANNER */}
      <header className="bg-[#052962] text-white relative">
        
        {/* Top bar with real-time stats & language switchers */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-2 border-b border-blue-900/50 gap-2">
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-200">
            <span>{new Date().toLocaleDateString(lang === "ml" ? "ml-IN" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            <span className="text-[#ffe500] font-bold">Agali, 28°C 🌤️</span>
            <span className="flex items-center gap-1.5 bg-black/25 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-tight text-white border border-white/5 shadow-inner">
              <Clock className="w-3.5 h-3.5 text-[#ffe500] animate-pulse" />
              <span>{currentTime.toLocaleTimeString(lang === "ml" ? "ml-IN" : "en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}</span>
            </span>
          </div>
          <div className="flex gap-4 text-xs font-semibold items-center select-none text-slate-300">
            <button 
              onClick={() => setLang("ml")} 
              className={`hover:text-[#ffe500] transition cursor-pointer ${lang === 'ml' ? 'text-[#ffe500] font-bold' : ''}`}
            >
              മലയാളം
            </button>
            <span className="opacity-40">|</span>
            <button 
              onClick={() => setLang("en")} 
              className={`hover:text-[#ffe500] transition cursor-pointer ${lang === 'en' ? 'text-[#ffe500] font-bold' : ''}`}
            >
              English
            </button>
            <span className="opacity-40">|</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 hover:text-[#ffe500] transition cursor-pointer text-slate-300 bg-white/5 active:bg-white/10 py-1 px-2 rounded-md hover:scale-102"
              title={theme === "light" ? (lang === 'en' ? "Switch to Dark Mode" : "ഡാർക്ക് മോഡിലേക്ക് മാറ്റുക") : (lang === 'en' ? "Switch to Light Mode" : "ലൈറ്റ് മോഡിലേക്ക് മാറ്റുക")}
            >
              {theme === "light" ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-yellow-100" />
                  <span>{lang === "en" ? "Dark Theme" : "ഡാർക്ക്"}</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#ffe500]" />
                  <span>{lang === "en" ? "Light Theme" : "ലൈറ്റ്"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Brand Core Title, Search & Horizontal Navigation Wrapper with Custom Ads */}
        <div className="max-w-7xl mx-auto px-6 py-6 border-b border-white/10 flex flex-col gap-6">
          
          {/* Row 1: Brand Identity Headline Row (Centered and prominent) */}
          <div className="flex flex-col items-center justify-center text-center">
            
            {/* Inline Compact App Launcher Strip */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 select-none">
              
              {/* BUS SHORTCUT */}
              <button
                onClick={() => setSelectedAppService("busTimings")}
                className="group flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-amber-400 hover:text-[#052962] text-slate-100 transition duration-150 text-[11px] font-bold font-sans border border-white/5 active:scale-95 cursor-pointer"
                title={lang === "en" ? "Bus Timings Tracker" : "ബസ് സമയവിവരങ്ങൾ"}
              >
                <Bus className="w-3.5 h-3.5 text-amber-400 group-hover:text-[#052962] transition duration-150" />
                <span>{lang === "en" ? "Bus Timings" : "ബസ് സമയം"}</span>
              </button>

              {/* AUTO SHORTCUT */}
              <button
                onClick={() => setSelectedAppService("autorikshaw")}
                className="group flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-emerald-500 hover:text-white text-slate-100 transition duration-150 text-[11px] font-bold font-sans border border-white/5 active:scale-95 cursor-pointer"
                title={lang === "en" ? "Hire Regional Auto & Taxis" : "ഓട്ടോ ടാക്സി വിളിപ്പടം"}
              >
                <Car className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white transition duration-150" />
                <span>{lang === "en" ? "Auto Taxi" : "ഓട്ടോ ടാക്സി"}</span>
              </button>

              {/* TRAVEL & FOOD SHORTCUT */}
              <button
                onClick={() => setSelectedAppService("travelFood")}
                className="group flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-cyan-500 hover:text-white text-slate-100 transition duration-150 text-[11px] font-bold font-sans border border-white/5 active:scale-95 cursor-pointer"
                title={lang === "en" ? "Explore Spot & Local Food" : "വിനോദസഞ്ചാര കേന്ദ്രങ്ങളും ഭക്ഷണശാലകളും"}
              >
                <Utensils className="w-3.5 h-3.5 text-cyan-400 group-hover:text-white transition duration-150" />
                <span>{lang === "en" ? "Travel & Food" : "യാത്ര & ഭക്ഷണം"}</span>
              </button>

              {/* LOCAL SHOPPING SHORTCUT */}
              <button
                onClick={() => setSelectedAppService("shopping")}
                className="group flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-fuchsia-500 hover:text-white text-slate-100 transition duration-150 text-[11px] font-bold font-sans border border-white/5 active:scale-95 cursor-pointer"
                title={lang === "en" ? "Shop & Order Online across Attappadi" : "പ്രാദേശിക വ്യാപാരശാലകളിൽ വാട്സാപ്പ് ഓർഡർ"}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-fuchsia-400 group-hover:text-white transition duration-150" />
                <span>{lang === "en" ? "Local Shopping" : "വ്യാപാരശാലകൾ"}</span>
              </button>

            </div>

            <div className="text-center flex-1 min-w-0 py-2">
              <h1 
                onClick={() => { setActiveSection("news"); setActiveRegion("all"); setSearchQuery(""); }}
                className="text-4xl sm:text-5xl md:text-6xl font-serif-guardian font-black tracking-tighter italic cursor-pointer transition select-none hover:opacity-95"
              >
                Attappadi<span className="text-[#ffe500]">Online</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-semibold uppercase tracking-widest font-sans">ALL AROUND THE ATTAPPADI HILLS</p>
            </div>
          </div>

          {/* New Responsive Side-by-Side Long Banner Ad Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* LEFT AD BOX */}
            {renderAdBox(adConfig?.leftAd || {
              titleEn: "Enquire for Ads",
              titleMl: "പരസ്യങ്ങൾക്ക് ബന്ധപ്പെടുക",
              subtitleEn: "Enquire Now",
              subtitleMl: "പരസ്യങ്ങൾ നൽകാൻ",
              contact: "+91 9447471224",
              actionType: "share",
              image: ""
            })}

            {/* RIGHT AD BOX */}
            {renderAdBox(adConfig?.rightAd || {
              titleEn: "Contact Support",
              titleMl: "പരസ്യങ്ങൾക്ക് വിളിക്കുക",
              subtitleEn: "Attappadi Ads",
              subtitleMl: "പരസ്യങ്ങൾ നൽകാൻ",
              contact: "+91 9447471224",
              actionType: "phone",
              image: ""
            })}
          </div>

          {/* Row 2: Search Bar & Persistent Navigation Menu */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 pt-2">
            
            {/* Persistent Search Bar Input - The Guardian Editorial Style */}
            <div className="relative w-full max-w-sm md:max-w-md shrink-0">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-300" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Auto switch back to news list when typing search queries
                  if (activeSection !== "news") {
                    setActiveSection("news");
                  }
                }}
                placeholder={lang === "en" ? "Search news, events, local directory..." : "വാർത്തകൾ, പരിപാടികൾ, ഡയറക്ടറി ഇവിടെ തിരയാം..."}
                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-[#052962] placeholder-slate-300 focus:placeholder-slate-500 pl-10 pr-10 py-2 sm:py-2.5 rounded border border-white/20 focus:border-white focus:outline-none focus:ring-2 focus:ring-[#ffe500] text-xs sm:text-sm font-semibold transition shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-300 hover:text-red-500 cursor-pointer animate-fade-in"
                  title="Clear Search"
                >
                  <X className="w-4 h-4 font-black" />
                </button>
              )}
            </div>

            {/* Section Navigation desk menu */}
            <nav className="flex flex-wrap justify-center lg:justify-end gap-x-4 sm:gap-x-5 gap-y-2 text-xs md:text-sm font-bold uppercase tracking-wide">
            <button 
              onClick={() => { setActiveSection("news"); setActiveRegion("all"); setSearchQuery(""); }} 
              className={`pb-1 hover:text-[#ffe500] transition duration-200 ${activeSection === "news" ? "text-[#ffe500] border-b-4 border-[#ffe500] font-extrabold" : "text-white"}`}
            >
              Home
            </button>
            <button 
              onClick={() => { setActiveSection("latest-updates"); setSearchQuery(""); }} 
              className={`pb-1 hover:text-[#ffe500] transition duration-200 ${activeSection === "latest-updates" ? "text-[#ffe500] border-b-4 border-[#ffe500] font-extrabold" : "text-white"}`}
            >
              Latest Updates
            </button>
            <button 
              onClick={() => { setActiveSection("events"); setSearchQuery(""); }} 
              className={`pb-1 hover:text-[#ffe500] transition duration-200 ${activeSection === "events" ? "text-[#ffe500] border-[#ffe500] border-b-4 font-extrabold" : "text-white"}`}
            >
              Events
            </button>
            <button 
              onClick={() => { setActiveSection("photos"); setSearchQuery(""); }} 
              className={`pb-1 hover:text-[#ffe500] transition duration-200 ${activeSection === "photos" ? "text-[#ffe500] border-b-4 border-[#ffe500] font-extrabold" : "text-white"}`}
            >
              Photos
            </button>
            <button 
              onClick={() => { setActiveSection("videos"); setSearchQuery(""); }} 
              className={`pb-1 hover:text-[#ffe500] transition duration-200 ${activeSection === "videos" ? "text-[#ffe500] border-b-4 border-[#ffe500] font-extrabold" : "text-white"}`}
            >
              Videos
            </button>
            <button 
              onClick={() => { setActiveSection("explore"); setExploreTab("destinations"); setSearchQuery(""); }} 
              className={`pb-1 hover:text-[#ffe500] text-yellow-200 transition duration-200 ${activeSection === "explore" ? "text-[#ffe500] border-b-4 border-[#ffe500] font-extrabold" : ""}`}
            >
              Explore Attappadi
            </button>
            <button 
              onClick={() => { setActiveSection("column"); setSearchQuery(""); }} 
              className={`pb-1 hover:text-[#ffe500] transition duration-200 ${activeSection === "column" ? "text-[#ffe500] border-b-4 border-[#ffe500] font-extrabold" : "text-white"}`}
            >
              Column
            </button>
            <button 
              onClick={() => { setActiveSection("readers-column"); setSearchQuery(""); }} 
              className={`pb-1 hover:text-[#ffe500] text-emerald-200 transition duration-200 ${activeSection === "readers-column" ? "text-[#ffe500] border-b-4 border-[#ffe500] font-extrabold" : ""}`}
            >
              Readers' Column
            </button>
            <button 
              onClick={() => { setActiveSection("local-services"); setLocalServicesTab("lpg"); setSearchQuery(""); }} 
              className={`pb-1 hover:text-[#ffe500] text-red-200 transition duration-200 ${activeSection === "local-services" ? "text-[#ffe500] border-b-4 border-[#ffe500] font-extrabold" : ""}`}
            >
              Local Services
            </button>
            <button 
              onClick={() => { setActiveSection("bookmarks"); setSearchQuery(""); }} 
              className={`pb-1 hover:text-[#ffe500] text-orange-200 transition duration-200 ${activeSection === "bookmarks" ? "text-[#ffe500] border-b-4 border-[#ffe500] font-extrabold" : ""}`}
            >
              <span className="flex items-center gap-1 select-none">
                Saved
                {bookmarks.length > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-sans font-black">
                    {bookmarks.length}
                  </span>
                )}
              </span>
            </button>
          </nav>
        </div>
      </div>

        {/* Third Level sub-regions row strip */}
        <div className="bg-[#dcdcdc] text-[#121212] px-6 py-2.5 text-[11px] font-bold uppercase border-b border-gray-300">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-x-5 gap-y-1 items-center">
            <span className="text-[#c70000] shrink-0 font-black">Regions:</span>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {[
                { key: "all", en: "All Regions", ml: "എല്ലാ മേഖലയും" },
                { key: "agali", en: "Agali", ml: "അഗളി" },
                { key: "mukkali", en: "Mukkali", ml: "മുക്കാലി" },
                { key: "thavalam", en: "Thavalam", ml: "താവളം" },
                { key: "kottathara", en: "Kottathara", ml: "കോട്ടത്തറ" },
                { key: "sholayur", en: "Sholayur", ml: "ഷോളയൂർ" },
                { key: "pudur", en: "Pudur", ml: "പുതൂർ" },
                { key: "anaikkatty", en: "Anaikatty", ml: "ആനക്കട്ടി" },
                { key: "jellippara", en: "Jellippara", ml: "ജെല്ലിപ്പാറ" },
                { key: "chittur", en: "Chittur", ml: "ചിറ്റൂർ" }
              ].map(reg => (
                <button 
                  key={reg.key}
                  onClick={() => handleRegionClick(reg.key)}
                  className={`hover:underline cursor-pointer transition uppercase text-[10px] ${activeSection === "news" && activeRegion === reg.key ? "text-[#052962] font-black underline" : "text-gray-700 font-semibold"}`}
                >
                  {lang === "en" ? reg.en : reg.ml}
                </button>
              ))}
            </div>
          </div>
        </div>

      </header>

      {/* 3. HERO SLIDES SHOWCASE */}
      {sliderPosts.length > 0 && searchQuery.trim().length === 0 && activeSection === "news" && (
        <section id="slider-hero" className="max-w-7xl mx-auto p-4 md:px-8 mt-4">
          <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[16/8] md:aspect-[16/6] shadow-md border border-gray-100 flex flex-col justify-end">
            
            {/* Slide Image */}
            <div className="absolute inset-0">
              <img 
                src={sliderPosts[currSliderIdx].image} 
                alt="Slider background" 
                className="w-full h-full object-cover opacity-70 transition-all duration-1000 transform scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
            </div>

            {/* Slider Navigation arrows */}
            <div className="absolute top-4 right-4 flex gap-1.5 z-10">
              <button
                onClick={() => setCurrSliderIdx(prev => (prev - 1 + sliderPosts.length) % sliderPosts.length)}
                className="p-1.5 bg-slate-950/80 hover:bg-[#ffe500] text-white hover:text-slate-950 rounded-full transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrSliderIdx(prev => (prev + 1) % sliderPosts.length)}
                className="p-1.5 bg-slate-950/80 hover:bg-[#ffe500] text-white hover:text-slate-950 rounded-full transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Slider Details text bubble */}
            <div className="relative p-6 md:p-10 text-white max-w-4xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#ffe500] text-[#052962] font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm">
                  {lang === "en" ? "FEATURED REPORT" : "പ്രത്യേക റിപ്പോർട്ട്"}
                </span>
                
                {(sliderPosts[currSliderIdx].regions || []).map(r => (
                  <span key={r} className="text-[10px] uppercase font-bold text-sky-200 bg-sky-950/80 border border-sky-800 px-2 py-0.5 rounded inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-yellow-300" />
                    {r}
                  </span>
                ))}
              </div>

              <h2 className="text-lg md:text-3xl font-serif-guardian font-extrabold text-[#ffe500] leading-tight select-none">
                {lang === "en" ? sliderPosts[currSliderIdx].titleEn : sliderPosts[currSliderIdx].titleMl}
              </h2>

              <p className="text-xs md:text-sm text-gray-200 line-clamp-2 md:leading-relaxed max-w-2xl font-light">
                {lang === "en" ? sliderPosts[currSliderIdx].contentEn : sliderPosts[currSliderIdx].contentMl}
              </p>

              <button
                onClick={() => handleArticleClick(sliderPosts[currSliderIdx])}
                className="mt-2 text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition"
              >
                {lang === "en" ? "Read full article" : "വാർത്ത പൂർണ്ണമായി വായിക്കാം"} ➜
              </button>
            </div>

            {/* Dots Pointer indicator */}
            <div className="absolute bottom-4 left-6 flex gap-1.5">
              {sliderPosts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrSliderIdx(i)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition ${i === currSliderIdx ? "bg-[#ffe500]" : "bg-white/40"}`}
                ></button>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 4. MAIN THREE-COLUMN LAYOUT CONTEXT */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Main News Feed or Search Results (Col spans 8 or 12) */}
        <section className={`${activeSection === "news" ? "lg:col-span-8" : "lg:col-span-12"} space-y-4`}>
          {searchQuery.trim().length > 0 ? (
            <div className="bg-white border-t-4 border-[#052962] rounded-lg shadow-sm p-5 md:p-6 space-y-5" id="search-results-board">
              
              {/* Search Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">
                    {lang === "en" ? "GLOBAL ARCHIVE INDEX" : "തിരച്ചിൽ ഫലങ്ങൾ"}
                  </span>
                  <h3 className="font-serif-guardian font-extrabold text-[#052962] text-lg sm:text-xl">
                    {lang === "en" ? `Search results for "${searchQuery}"` : `"${searchQuery}" ഫലങ്ങൾ`}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {lang === "en" ? `Found ${totalResultsCount} matching listings` : `ആകെ ${totalResultsCount} വിവരങ്ങൾ ലഭിച്ചു` }
                  </p>
                </div>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="px-2.5 py-1 text-xs font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 rounded flex items-center gap-1 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> {lang === "en" ? "Clear" : "ഒഴിവാക്കുക"}
                </button>
              </div>

              {/* Selector Categories Tab */}
              <div className="flex flex-wrap gap-1.5 border-b border-gray-100 pb-3">
                {[
                  { key: "all", label: `All (${totalResultsCount})` },
                  { key: "news", label: `News (${results.news.length})` },
                  { key: "events", label: `Events (${results.events.length})` },
                  { key: "directory", label: `Directory (${results.directory.length})` }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setSearchFilter(tab.key as any)}
                    className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wide rounded cursor-pointer transition ${searchFilter === tab.key ? "bg-[#052962] text-[#ffe500]" : "bg-slate-50 text-gray-600 hover:bg-slate-100 border border-gray-200"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Results stack list */}
              <div className="space-y-6">
                
                {/* NEWS LIST */}
                {(searchFilter === "all" || searchFilter === "news") && results.news.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#052962] border-b border-gray-100 pb-1 flex items-center gap-1.5">
                      <Newspaper className="w-3.5 h-3.5 text-[#052962]" />
                      {lang === "en" ? "News" : "വാർത്തകൾ"}
                    </h4>
                    <div className="space-y-3">
                      {results.news.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => handleArticleClick(item)}
                          className="p-3 bg-[#fcfcfb] border border-gray-100 rounded-lg hover:border-sky-300 hover:shadow-xs transition cursor-pointer flex gap-4 group"
                        >
                          <img 
                            src={item.image} 
                            alt="post" 
                            className="w-16 h-16 object-cover rounded-md shrink-0 bg-gray-100 border border-gray-100" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 border border-red-100/50 px-1.5 py-0.5 rounded-sm">
                                {item.category}
                              </span>
                              <span className="text-[9px] text-gray-400 font-bold">{new Date(item.publishedAt).toLocaleDateString()}</span>
                            </div>
                            <h5 className="font-serif-guardian font-extrabold text-sm text-[#052962] group-hover:text-[#c70000] leading-snug transition-colors line-clamp-1">
                              {lang === "en" ? item.titleEn : item.titleMl}
                            </h5>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {lang === "en" ? item.contentEn : item.contentMl}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* EVENTS LIST */}
                {(searchFilter === "all" || searchFilter === "events") && results.events.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#052962] border-b border-gray-100 pb-1 flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#052962]" />
                      {lang === "en" ? "Upcoming Gatherings" : "വരാനിരിക്കുന്ന പരിപാടികൾ"}
                    </h4>
                    <div className="space-y-3">
                      {results.events.map((ev) => (
                        <div 
                          key={ev.id}
                          className="p-3 bg-[#fcfcfb] border border-gray-100 rounded-lg hover:border-yellow-400 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <span className="text-[9px] font-extrabold text-[#ffe500] bg-black px-1.5 py-0.5 rounded uppercase">
                              Event ({ev.date})
                            </span>
                            <h5 className="font-bold text-sm text-gray-800 leading-snug">
                              {lang === "en" ? ev.titleEn : ev.titleMl}
                            </h5>
                            <p className="text-xs text-gray-500 line-clamp-1 italic">
                              {lang === "en" ? ev.descriptionEn : ev.descriptionMl}
                            </p>
                            <div className="flex gap-x-4 gap-y-1 text-[10px] text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {ev.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-red-500" />
                                {lang === "en" ? ev.locationEn : ev.locationMl}
                              </span>
                            </div>
                          </div>
                          {/* Event Share trigger */}
                          <div className="shrink-0 self-end sm:self-center">
                            <ShareButtons 
                              title={lang === "en" ? ev.titleEn : ev.titleMl}
                              url={`${window.location.origin}/#event-${ev.id}`}
                              layout="bubble"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DIRECTORY SERVICES LIST */}
                {(searchFilter === "all" || searchFilter === "directory") && results.directory.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#052962] border-b border-gray-100 pb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#052962]" />
                      {lang === "en" ? "Citizen Directory Contacts" : "ഫോൺ ഡയറക്ടറി"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.directory.map((item) => (
                        <div 
                          key={item.id}
                          className="p-3 bg-[#fcfcfb] border border-gray-100 rounded-lg flex justify-between items-center hover:shadow-xs transition"
                        >
                          <div className="space-y-1 min-w-0 flex-1 pr-2 p-0.5">
                            <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-100 px-1 py-0.5 rounded">
                              {item.category}
                            </span>
                            <h5 className="font-bold text-xs text-gray-800 truncate mt-1">
                              {lang === "en" ? item.nameEn : item.nameMl}
                            </h5>
                            <p className="text-[10px] text-gray-400 truncate mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                              {lang === "en" ? item.locationEn : item.locationMl}
                            </p>
                          </div>
                          <a 
                            href={`tel:${item.contact}`}
                            className="p-1.5 border border-[#052962] hover:bg-[#052962] hover:text-white text-[#052962] font-black text-[11px] rounded transition flex items-center gap-1 shrink-0"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{item.contact}</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state inside results block */}
                {totalResultsCount === 0 && (
                  <div className="text-center py-12 px-4 space-y-4">
                    <svg className="w-12 h-12 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-600">
                        {lang === "en" ? "No search results match your criteria" : "തിരച്ചിൽ ഫലങ്ങളൊന്നും കണ്ടെത്താനായില്ല"}
                      </p>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto">
                        {lang === "en" ? "We couldn't find matches for word tags. Double check spelling terms or region values." : "തന്നിരിക്കുന്ന വാക്കുകൾക്ക് അനുയോജ്യമായ റിപ്പോർട്ടുകളോ സേവനങ്ങളോ ഡയറക്ടറിയിൽ ലഭ്യമല്ല."}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="px-4 py-2 bg-[#052962] hover:bg-slate-900 text-white font-black text-xs rounded transition uppercase tracking-wider cursor-pointer"
                    >
                      {lang === "en" ? "Show all news" : "എല്ലാ വാർത്തകളും വീണ്ടും കാണിക്കുക"}
                    </button>
                  </div>
                )}
                
              </div>

            </div>
          ) : activeSection === "explore" ? (
            <ExploreAttappadi lang={lang} initialTab={exploreTab} />
          ) : activeSection === "photos" ? (
            <ExploreAttappadi lang={lang} initialTab="photos" />
          ) : activeSection === "latest-updates" ? (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[#052962] pb-2 flex justify-between items-center bg-slate-50 p-2.5 rounded border border-gray-100">
                <h3 className="font-serif-guardian font-black text-[#052962] text-lg uppercase tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  {lang === "en" ? "Real-time Valley Broadcasts" : "തത്സമയ വാർത്തകൾ"}
                </h3>
              </div>
              
              <div className="bg-[#052962] text-white px-4 py-2 text-xs font-bold rounded flex items-center gap-2 overflow-hidden select-none">
                <span className="bg-red-600 text-white px-1.5 py-0.5 text-[8px] text-[8px] rounded uppercase font-black shrink-0 animate-bounce">LIVE</span>
                <div className="relative flex-1 w-full overflow-hidden whitespace-nowrap">
                  <div className="inline-block animate-marquee pl-[100%] hover:pause">
                    {news.filter(n => n.category === "updates").length > 0 ? (
                      news.filter(n => n.category === "updates").map((up) => (
                        <button
                          key={up.id}
                          onClick={() => handleArticleClick(up)}
                          className="mr-10 hover:underline hover:text-yellow-200 transition text-left inline-block"
                        >
                          <span className="text-[#ffe500] mr-1.5 font-bold inline-flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 fill-[#ffe500] text-[#ffe500]" /> {lang === "ml" ? up.titleMl : up.titleEn}
                          </span>
                          {lang === "ml" && up.titleEn && (
                            <span className="text-slate-300 text-[10px] font-sans">({up.titleEn})</span>
                          )}
                          {lang === "en" && up.titleMl && (
                            <span className="text-slate-300 text-[10px] font-anek-malayalam">({up.titleMl})</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 fill-[#ffe500] text-[#ffe500]" />
                        {lang === "en" 
                          ? "SPECIALTY TRIBAL HEALTH CAMP AT PUDUR CLINIC REGISTRATION OPEN • MONSOON ECO-GUIDELINES ISSUED • "
                          : "പുതൂർ ക്ലിനിക്കിൽ സ്പെഷ്യാലിറ്റി മെഡിക്കൽ ക്യാമ്പ് രജിസ്ട്രേഷൻ തുടരുന്നു • മഴക്കാല സുരക്ഷാ മുന്നറിയിപ്പുകൾ • "}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <LatestNews 
                news={news}
                lang={lang}
                activeRegion={activeRegion}
                onRegionChange={(reg) => {
                  setActiveRegion(reg);
                }}
                onPostSelect={handleArticleClick}
                onDownloadCard={setShareCardTarget}
                bookmarks={bookmarks}
                onToggleBookmark={toggleBookmark}
              />
            </div>
          ) : activeSection === "events" ? (
            <div className="bg-white border border-gray-100 rounded-lg shadow-xs p-5 md:p-6 space-y-6 animate-fade-in">
              <div className="border-b pb-4">
                <span className="text-[10px] bg-[#052962] text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  {lang === "en" ? "Interactive Timeline" : "സമയക്രമം"}
                </span>
                <h2 className="font-serif-guardian font-extrabold text-[#052962] text-2xl mt-1">
                  {lang === "en" ? "Community Events & Calendars" : "പ്രാദേശിക പരിപാടികൾ"}
                </h2>
                <p className="text-xs text-gray-400 mt-1 hover:text-gray-500 transition">
                  {lang === "en" 
                    ? "Dates of local health camps, tribal festivals, agricultural melas, and regional updates."
                    : "അട്ടപ്പാടി മേഖലയിലെ കൃഷി മേളകൾ, പൊതു സമ്പർക്ക പരിപാടികൾ, സൗജന്യ ചികിൽസാ ക്യാമ്പുകൾ എന്നിവയുടെ വിവരങ്ങൾ."}
                </p>
              </div>

              <CalendarWidget lang={lang} onDownloadCard={setShareCardTarget} />

              <div className="bg-[#052962]/5 border-l-4 border-[#052962] p-4 rounded-r mt-4">
                <h4 className="text-xs font-bold text-[#052962] uppercase mb-1">
                  {lang === "en" ? "Host a community event?" : "നാട്ടിൽ ഒരു പരിപാടി നടക്കുന്നുണ്ടോ?"}
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
                  {lang === "en" 
                    ? "Submit notices of assemblies, agricultural exhibitions, health camps, or festivals to publish on our bulletin board for free."
                    : "നിങ്ങളുടെ തദ്ദേശ പൊതുപരിപാടികളും സാമൂഹ്യ നോട്ടിസുകളും ഇവിടെ സൗജന്യമായി പരസ്യപ്പെടുത്താൻ അഡ്മിൻ ഡെസ്ക്കുമായി ബന്ധപ്പെടുക."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href="tel:+914912245353" className="bg-[#052962] hover:bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded transition inline-flex items-center gap-1 uppercase">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Desk Manager</span>
                  </a>
                </div>
              </div>
            </div>
          ) : activeSection === "videos" ? (
            <div className="bg-white border border-gray-100 rounded-lg shadow-xs p-5 md:p-6 space-y-6 animate-fade-in">
              <div className="border-b pb-4">
                <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  {lang === "en" ? "Visual Stories" : "വീഡിയോ വാർത്തകൾ"}
                </span>
                <h2 className="font-serif-guardian font-extrabold text-[#052962] text-2xl mt-1">
                  {lang === "en" ? "Attappadi Documentary & Video Hub" : "കാഴ്ചകളിലൂടെ അട്ടപ്പാടി..."}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {lang === "en" 
                    ? "HD video essays, field journals, and local visual reporting tracking the valleys."
                    : "അട്ടപ്പാടിയുടെ മനോഹർ ദൃശ്യങ്ങളും, വന്യജീവി വൈവിധ്യവും, തനത് ഗാനങ്ങളും ഉൾപ്പെടുത്തിയ വീഡിയോകൾ."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    titleEn: "Silent Valley National Park: Journey Through Time",
                    titleMl: "സൈലന്റ് വാലി: നിഗൂഢ വനങ്ങളിലൂടെയുള്ള യാത്രാവിവരണം",
                    duration: "12:40",
                    image: "https://images.unsplash.com/photo-1549221194-4fa7a41413f4?w=800&auto=format&fit=crop",
                    descEn: "Explore the ancient rain forests, evergreen giant trees, and the native birds singing deep along the Kunthi River.",
                    descMl: "കുന്തിപ്പുഴയുടെ ഇരമ്പലിനൊപ്പം പാടുന്ന മലമുഴക്കി വേഴാമ്പലുകളും ചോലവനങ്ങളും നിറയുന്ന അതിമനോഹര ചിത്രം."
                  },
                  {
                    titleEn: "The Rhythm of the Soil: Traditional Tribal Dances",
                    titleMl: "തുടിതാളം: പരമ്പരാഗത അട്ടപ്പാടി പണിയ, കുറുമ്പ നൃത്തങ്ങൾ",
                    duration: "08:15",
                    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop",
                    descEn: "An intimate field presentation of the Elelakkaradi dance, capturing native songs with local instrumental rhythms.",
                    descMl: "ഏലേലക്കരടി താളത്തിൽ ഇവിടുത്തെ മലനിരകളെയും പ്രകൃതിയെയും വണങ്ങുന്ന ഗോത്ര നൃത്ത ദൃശ്യങ്ങൾ."
                  },
                  {
                    titleEn: "Vanya Ragi: Revival of Indigenous Farming in Pudur",
                    titleMl: "വനസംസ്കാരം: പുതൂരിലെ പരമ്പരാഗത റാഗി കൃഷിയുടെ തിരിച്ചുപിടിക്കൽ",
                    duration: "10:30",
                    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop",
                    descEn: "Witness how local community farmers collaborate to preserve organic grains and millets without chemicals.",
                    descMl: "മേഖലയിലെ കർഷകർ ഒത്തുകൂടി തനത് റാഗി, വൻപയർ കൃഷികൾ വീണ്ടെടുക്കുന്നതിൻ്റെ കഥകൾ."
                  },
                  {
                    titleEn: "Gorge Waters: The Sweets of Siruvani Rivers",
                    titleMl: "ശിരുവാണി തേനൊഴുക്ക്: വിശ്വപ്രസിദ്ധമായ കുടിവെള്ള താഴ്വാരം",
                    duration: "06:50",
                    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop",
                    descEn: "A visual essay tracking sweet streams of Siruvani hills and how they are protected inside Nilgiri biozones.",
                    descMl: "പ്രകൃത്യാൽ ശുദ്ധീകരിക്കപ്പെട്ട് ഒഴുകിയെത്തുന്ന ലോകത്തിലെ അമൃതുപോലുള്ള ശിരുവാണി ജലപാത."
                  }
                ].map((vid, vIdx) => (
                  <div key={vIdx} className="bg-[#fcfcfb] border border-gray-100 rounded-lg overflow-hidden group hover:shadow-md transition duration-300">
                    <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
                      <img src={vid.image} alt={vid.titleEn} className="w-full h-full object-cover opacity-85 group-hover:scale-102 transition duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <button className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition duration-200 group-hover:scale-110 cursor-pointer flex items-center justify-center">
                          <svg className="w-4 h-4 ml-0.5 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" stroke="none" />
                          </svg>
                        </button>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-slate-950/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow-sm">
                        {vid.duration}
                      </span>
                    </div>
                    <div className="p-4 space-y-1 text-slate-800">
                      <h4 className="font-serif-guardian font-extrabold text-sm text-[#052962] leading-tight group-hover:text-red-700 transition duration-200">
                        {lang === "en" ? vid.titleEn : vid.titleMl}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                        {lang === "en" ? vid.descEn : vid.descMl}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeSection === "column" ? (
            <div className="bg-white border border-gray-100 rounded-lg shadow-xs p-5 md:p-6 space-y-6 animate-fade-in">
              <div className="border-b pb-4">
                <span className="text-[10px] bg-[#052962] text-[#ffe500] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  {lang === "en" ? "Editorial Desk" : "പത്രാധിപരുടെ കോളം"}
                </span>
                <h2 className="font-serif-guardian font-extrabold text-[#052962] text-2xl mt-1 leading-tight">
                  {lang === "en" ? "Valley Columns & Commentary" : "പംക്തികൾ"}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {lang === "en" 
                    ? "In-depth investigative reports and developmental journalism written by native scholars."
                    : "പ്രാദേശിക വികസനം, ഗോത്ര ഭാഷാ പദ്ധതികൾ, പ്രകൃതി കൃഷി എന്നിവ സംബന്ധിച്ച ലേഖന പരമ്പരകൾ."}
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    titleEn: "Millet Sovereignty: Pudur's Path to Native Nutritional Revival",
                    titleMl: "ചാമയും റാഗിയും: ഭക്ഷ്യസ്വയംപര്യാപ്തതയിലെ പുതൂരിലെ മുന്നേറ്റങ്ങൾ",
                    authorEn: "Prof. Sivaraman Nair, Agro-historian",
                    authorMl: "പ്രൊഫ. ശിവരാമൻ നായർ, അഗ്രോ ഹിസ്റ്റോറിയൻ",
                    roleEn: "Former Advisor, National Biodiversity Authority",
                    roleMl: "മുൻ ഉപദേഷ്ടാവ്, ദേശീയ ജൈവ വൈവിധ്യ സമിതി",
                    date: "June 15, 2026",
                    excerptEn: "The transition back to organic millets inside Pudur is not just about nostalgia—it represents our direct path to secure native nutrient channels for generations to come, fighting malnutrition at the soil roots...",
                    excerptMl: "സംസ്‌കരിച്ച ധാന്യങ്ങളിൽ നിന്ന് ഈ നാട്ടിലെ പരമ്പരാഗത റാഗിയിലേക്കും ചാമയിലേക്കുമുള്ള മടക്കം കേവലമൊരു ഭക്ഷണ ശീലമല്ല—അതൊരു ഭക്ഷ്യസ്വാതന്ത്ര്യത്തിന്റെ പ്രഖ്യാപനമാണ്..."
                  },
                  {
                    titleEn: "The Silence of Silent Valley: Protecting the Rain Forests Canopy",
                    titleMl: "നിശബ്ദതയുടെ താലോലം: സൈലന്റ് വാലി മഴക്കാടുകളുടെ ജൈവ സുരക്ഷ",
                    authorEn: "Dr. Arundhati Roy, Ecologist",
                    authorMl: "ഡോ. അരുന്ധതി റോയ്, ഫോറസ്റ്റ് ഇക്കോളജിസ്റ്റ്",
                    roleEn: "Forum for Biosphere Protection Chair",
                    roleMl: "ബയോസ്ഫിയർ സംരക്ഷണ ഫോറം ചെയർപേഴ്സൺ",
                    date: "May 29, 2026",
                    excerptEn: "Silent Valley remains the final undisturbed evergreen canopy in India. We must enforce strict eco-tourism boundaries to protect watershed tables feeding the Kunthi River from microclimatic variations...",
                    excerptMl: "സൈലന്റ് വാലി ഈ ഉപഭൂഖണ്ഡത്തിലെ അവസാന കന്യകാവനമാണെന്ന് നാം ഓർക്കണം. കുന്തിപ്പുഴ കാത്തുസൂക്ഷിക്കാൻ ടൂറിസം നിയന്ത്രണങ്ങൾ കൂടുതൽ കർശനമാക്കേണ്ടതുണ്ട്..."
                  }
                ].map((col, cIdx) => (
                  <article key={cIdx} className="space-y-3 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                        🗓️ {col.date}
                      </span>
                    </div>
                    <h3 className="font-serif-guardian font-extrabold text-[#052962] text-base leading-snug">
                      {lang === "en" ? col.titleEn : col.titleMl}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#052962] text-yellow-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {col.authorEn.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-800 leading-none">
                          {lang === "en" ? col.authorEn : col.authorMl}
                        </p>
                        <p className="text-[8px] text-gray-400">
                          {lang === "en" ? col.roleEn : col.roleMl}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 border-l-2 border-[#052962] p-2.5 rounded-r select-none italic leading-relaxed">
                      "{lang === "en" ? col.excerptEn : col.excerptMl}"
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : activeSection === "readers-column" ? (
            <div className="bg-white border border-gray-100 rounded-lg shadow-xs p-5 md:p-6 space-y-6 animate-fade-in">
              <div className="border-b pb-4">
                <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  {lang === "en" ? "Public Domain" : "വായനക്കാരുടെ അഭിപ്രായങ്ങൾ"}
                </span>
                <h2 className="font-serif-guardian font-extrabold text-[#052962] text-2xl mt-1 leading-tight">
                  {lang === "en" ? "Beyond The Desk: Readers' Columns" : "വായനക്കാരുടെ എഴുത്തുകൾ"}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {lang === "en" 
                    ? "Community views, essay letters, and local concerns submitted directly by local farmers, youth and activists."
                    : "അട്ടപ്പാടിയിലെ ജനങ്ങളും കർഷകരും പരിസ്ഥിതി പ്രവർത്തകരും തങ്ങളുടെ കാഴ്ചപ്പാടുകൾ നേരിട്ട് സമർപ്പിക്കുന്ന തുറന്ന വേദി."}
                </p>
              </div>

              <OpinionsWidget lang={lang} />
            </div>
          ) : activeSection === "local-services" ? (
            <div className="bg-white border border-gray-100 rounded-lg shadow-xs p-5 md:p-6 space-y-6 animate-fade-in">
              <div className="border-b pb-4">
                <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  {lang === "en" ? "HELPLINES & SERVICES" : "സഹായങ്ങൾ & സേവനങ്ങൾ"}
                </span>
                <h2 className="font-serif-guardian font-extrabold text-[#052962] text-2xl mt-1 leading-tight">
                  {lang === "en" ? "Local Services & Emergency Directory" : "പ്രാദേശിക സേവനങ്ങളും ഡയറക്ടറിയും"}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {lang === "en" 
                    ? "Quick emergency hotlines, essential tribal healthcare desks, forest department patrols, and verified regional services."
                    : "അടിയന്തര സഹായ നമ്പറുകൾ, ആരോഗ്യ കേന്ദ്രങ്ങൾ, കാട്ടാന/വനപാലക വിഭാഗം, പ്രാദേശിക ടെക്നീഷ്യൻമാരുടെയും ജിപ്പുകളുടെയും ഡയറക്ടറി വിവരങ്ങൾ."}
                </p>
              </div>

              <DirectoryWidget lang={lang} onDownloadCard={setShareCardTarget} initialTab={localServicesTab} />
            </div>
          ) : activeSection === "bookmarks" ? (
            <div className="bg-white border border-gray-100 rounded-lg shadow-xs p-5 md:p-6 space-y-6 animate-fade-in">
              <div className="border-b pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span className="text-[10px] bg-amber-500 text-slate-900 font-extrabold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                    {lang === "en" ? "Your Library" : "ലൈബ്രറി"}
                  </span>
                  <h2 className="font-serif-guardian font-extrabold text-[#052962] text-2xl mt-1 leading-tight flex items-center gap-2">
                    <Bookmark className="w-5 h-5 fill-amber-500 text-amber-500" />
                    {lang === "en" ? "Bookmarked Stories" : "സൂക്ഷിച്ചുവെച്ച വാർത്തകൾ"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "en" 
                      ? "Saved articles kept on this device for offline or delayed reading."
                      : "നിങ്ങൾ പിന്നീട് വായിക്കാനായി ഈ ഉപകരണത്തിൽ മാത്രം സൂക്ഷിച്ചുവെച്ച പ്രധാന വാർത്തകൾ."}
                  </p>
                </div>
                {bookmarks.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm(lang === "en" ? "Clear all saved bookmarks?" : "സൂക്ഷിച്ച വാർത്തകളെല്ലാം ഒഴിവാക്കണോ?")) {
                        setBookmarks([]);
                      }
                    }}
                    className="self-start sm:self-auto px-4 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs font-bold rounded-lg transition uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    🗑️ {lang === "en" ? "Clear All" : "എല്ലാം ഒഴിവാക്കുക"}
                  </button>
                )}
              </div>

              {bookmarks.length === 0 ? (
                <div className="text-center py-16 px-4 bg-slate-50/50 rounded-xl border border-dashed border-gray-200/80 max-w-xl mx-auto space-y-4">
                  <div className="w-16 h-16 bg-[#052962]/5 text-[#052962]/80 font-bold rounded-full flex items-center justify-center mx-auto text-xl shadow-xs">
                    📂
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif-guardian font-bold text-base text-gray-800">
                      {lang === "en" ? "Your saved list is empty" : "ലിസ്റ്റ് ശൂന്യമാണ്"}
                    </h3>
                    <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                      {lang === "en" 
                        ? "Browse regional bulletins or breaking stories and click the Bookmark button inside any article to save it here."
                        : "അട്ടപ്പാടി ഓൺലൈൻ വാർത്തകൾ വായിക്കുമ്പോൾ കാണുന്ന ബുക്ക്‌മാർക്ക് ബട്ടൺ ക്ലിക്ക് ചെയ്ത് വാർത്തകൾ ഇവിടെ സേവ് ചെയ്യാം."}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSection("news")}
                    className="px-5 py-2 bg-[#052962] hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition uppercase tracking-widest cursor-pointer"
                  >
                    👉 {lang === "en" ? "Explore News Feed" : "വാർത്തകൾ കാണുക"}
                  </button>
                </div>
              ) : (
                <LatestNews 
                  news={news.filter(n => bookmarks.includes(n.id))}
                  lang={lang}
                  activeRegion={"all"}
                  onRegionChange={() => {}}
                  onPostSelect={handleArticleClick}
                  onDownloadCard={setShareCardTarget}
                  bookmarks={bookmarks}
                  onToggleBookmark={toggleBookmark}
                />
              )}
            </div>
          ) : (
            <>
              <div id="latest-news-section" className="border-b border-[#052962] pb-2 mb-4 flex justify-between items-center bg-slate-50 p-2.5 rounded border border-gray-100">
                <h3 className="font-serif-guardian font-black text-[#052962] text-lg uppercase tracking-tight">
                  {lang === "en" ? "Valley News Dispatch" : "പ്രധാന വാർത്തകൾ"}
                </h3>
                
                {activeRegion !== "all" && (
                  <span className="text-xs font-bold text-[#052962] bg-sky-50 px-2.5 py-1 rounded border border-sky-100 uppercase">
                    🏷️ {lang === "en" ? `Filtered by ${activeRegion}` : `${activeRegion} മേഖല`}
                  </span>
                )}
              </div>

              <LatestNews 
                news={news}
                lang={lang}
                activeRegion={activeRegion}
                onRegionChange={(reg) => {
                  setActiveRegion(reg);
                  // auto scroll to layout top
                  document.getElementById("latest-news-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                onPostSelect={handleArticleClick}
                onDownloadCard={setShareCardTarget}
                bookmarks={bookmarks}
                onToggleBookmark={toggleBookmark}
              />
            </>
          )}
        </section>

        {/* RIGHT COLUMN: Interactive utility Sidebar widget board (Col spans 4) */}
        {activeSection === "news" && (
          <aside className="lg:col-span-4 space-y-6">
            {/* Bookmarked Stories Sidebar Widget */}
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 space-y-4">
              <div className="border-b pb-2 flex justify-between items-center">
                <h4 className="font-serif-guardian font-extrabold text-[#052962] text-sm uppercase tracking-tight flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500" />
                  {lang === "en" ? "Saved Stories" : "സൂക്ഷിച്ച വാർത്തകൾ"}
                </h4>
                {bookmarks.length > 0 && (
                  <span className="text-[10px] bg-amber-100 text-[#0c2447] font-extrabold px-2 py-0.5 rounded-full font-mono">
                    {bookmarks.length}
                  </span>
                )}
              </div>
              
              {bookmarks.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic font-medium leading-relaxed">
                  {lang === "en" 
                    ? "No bookmarked articles. Click the Bookmark icon on any article to save it for quick access." 
                    : "വാർത്തകളൊന്നും സൂക്ഷിച്ചിട്ടില്ല. വേഗത്തിൽ വായിക്കാൻ വാർത്തകളിലെ ബുക്ക്‌മാർക്ക് ഐക്കൺ ക്ലിക്ക് ചെയ്യുക."}
                </p>
              ) : (
                <div className="space-y-3">
                  {news
                    .filter(n => bookmarks.includes(n.id))
                    .slice(0, 5) // Show top 5
                    .map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => handleArticleClick(item)}
                        className="flex gap-2.5 items-center group cursor-pointer hover:bg-slate-50 p-1.5 rounded transition duration-200"
                        title={lang === "en" ? "Read Article" : "വായിക്കുക"}
                      >
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-10 h-10 object-cover rounded shadow-inner shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-black text-xs text-slate-800 leading-tight line-clamp-2 group-hover:text-[#005689] transition">
                            {lang === "en" ? item.titleEn : item.titleMl}
                          </h5>
                          <span className="text-[9px] text-gray-400 font-medium">
                            {new Date(item.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(item.id);
                          }}
                          className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition cursor-pointer text-slate-300"
                          title={lang === "en" ? "Remove" : "ഒഴിവാക്കുക"}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  {bookmarks.length > 5 && (
                    <button
                      onClick={() => setActiveSection("bookmarks")}
                      className="w-full text-center text-xs text-[#052962] font-extrabold hover:underline pt-1 block cursor-pointer"
                    >
                      {lang === "en" ? `View all ${bookmarks.length} bookmarks →` : `എല്ലാ ${bookmarks.length} വാർത്തകളും കാണുക →`}
                    </button>
                  )}
                </div>
              )}
            </div>

            <WeatherWidget lang={lang} theme={theme} />
            <NoticesWidget lang={lang} onDownloadCard={setShareCardTarget} />
          </aside>
        )}

      </main>

      {/* 5. USER OPINIONS BROAD BOARD */}
      {(activeSection === "news" || activeSection === "readers-column") && (
        <section className="bg-gray-100/50 border-t border-b border-gray-200 mt-12 py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="border-b border-gray-200 pb-3 mb-8">
              <h3 className="text-xl font-serif-guardian font-extrabold text-[#052962] uppercase tracking-wider">
                {lang === "en" ? "BEYOND THE DESK: OPINIONS" : "വായനക്കാരുടെ അഭിപ്രായങ്ങൾ"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Community discussions, reform outlooks, and civil insights submitted directly by local scholars, farmers, and social activists.
              </p>
            </div>
            <OpinionsWidget lang={lang} />
          </div>
        </section>
      )}

      {/* ARTICLE READER MODAL (Dynamic Overlay Drawer) */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            
            {/* Desktop Left Float Arrow (Previous Story) */}
            {prevArticle && (
              <button
                type="button"
                onClick={handlePrevArticle}
                className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-[#ffe500] text-[#052962] hover:scale-110 rounded-full shadow-2xl transition duration-200 cursor-pointer border border-gray-200/80 hover:border-amber-300 z-50 group items-center justify-center"
                title={lang === "en" ? "Previous article" : "മുൻപത്തെ വാർത്ത"}
              >
                <ChevronLeft className="w-6 h-6 stroke-[3]" />
              </button>
            )}

            {/* Desktop Right Float Arrow (Next Story) */}
            {nextArticle && (
              <button
                type="button"
                onClick={handleNextArticle}
                className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-[#ffe500] text-[#052962] hover:scale-110 rounded-full shadow-2xl transition duration-200 cursor-pointer border border-gray-200/80 hover:border-amber-300 z-50 group items-center justify-center"
                title={lang === "en" ? "Next article" : "അടുത്ത വാർത്ത"}
              >
                <ChevronRight className="w-6 h-6 stroke-[3]" />
              </button>
            )}

            <motion.div 
              id="news-read-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative bg-[#fcfcfb] border-t-8 border-[#052962] rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col justify-between"
            >
              
              {/* Stable stationary close button on the absolute top-right of the modal box */}
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950/80 text-white rounded-full hover:bg-red-700 transition cursor-pointer z-50 shadow-md flex items-center justify-center"
                title="Close"
              >
                <X className="w-5 h-5 font-bold" />
              </button>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={selectedArticle.id}
                  custom={slideDirection}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
                  className="flex flex-col flex-1"
                >
                  
                  {/* Modal header with image detail representation */}
                  <div className="relative aspect-video w-full bg-slate-100 shrink-0">
                    <img 
                      src={selectedArticle.image} 
                      alt={selectedArticle.titleEn} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>

                    {/* Overlaid titles info */}
                    <div className="absolute bottom-4 left-6 right-6 text-white text-xs">
                      <span className="bg-[#ffe500] text-slate-950 font-extrabold px-2.5 py-1 uppercase rounded-sm inline-block tracking-wider mb-2">
                        {selectedArticle.category}
                      </span>
                      <div className="flex gap-4 text-gray-200 mt-1">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>{new Date(selectedArticle.publishedAt).toLocaleDateString()}</span>
                        </span>
                        <span>•</span>
                        <span>{selectedArticle.views || 1} views total</span>
                      </div>
                    </div>

                  </div>

                  {/* Editorial contents */}
                  <div className="p-6 md:p-8 space-y-6">
                    
                    {/* Headlines and visual toggles */}
                    <div className="space-y-4 border-b pb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className={`font-serif-guardian leading-tight text-xl md:text-2xl ${lang === "ml" ? "font-anek-malayalam text-[#c70000] font-black" : "text-[#052962] font-black"}`}>
                          {lang === "en" ? selectedArticle.titleEn : selectedArticle.titleMl}
                        </h3>
                        {lang === "ml" && selectedArticle.titleEn && (
                          <p className="text-[11px] text-gray-400 font-medium font-sans">English: {selectedArticle.titleEn}</p>
                        )}
                        {lang === "en" && selectedArticle.titleMl && (
                          <p className="text-[11px] text-gray-400 font-medium font-anek-malayalam">മലയാളം: {selectedArticle.titleMl}</p>
                        )}
                        {/* Swipe indicator badge hint */}
                        <div className="md:hidden pt-1 flex items-center gap-1 text-[9px] text-[#005689] font-bold select-none font-sans shrink-0 uppercase tracking-widest">
                          <span className="p-0.5 px-1.5 bg-sky-50 border border-sky-100 rounded inline-flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                            Swipe ← or → to browse stories
                          </span>
                        </div>
                      </div>
                      
                      {/* Inline Language Selector for Reader Choice */}
                      <div className="flex bg-slate-100 border border-slate-200/50 p-1 rounded-md text-xs font-bold items-center shrink-0 self-start sm:self-auto select-none">
                        <button
                          type="button"
                          onClick={() => setLang("ml")}
                          className={`px-3 py-1 rounded transition cursor-pointer ${lang === "ml" ? "bg-[#052962] text-white shadow-xs" : "text-gray-600 hover:text-[#052962]"}`}
                        >
                          മലയാളം
                        </button>
                        <button
                          type="button"
                          onClick={() => setLang("en")}
                          className={`px-3 py-1 rounded transition cursor-pointer ${lang === "en" ? "bg-[#052962] text-white shadow-xs" : "text-gray-600 hover:text-[#052962]"}`}
                        >
                          English
                        </button>
                      </div>
                    </div>

                    {/* Social Media sharing horizontal block */}
                    <div className="bg-slate-50 border border-gray-100 rounded-lg p-3 px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-[#052962] uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                          <Megaphone className="w-3.5 h-3.5 text-[#052962]" />
                          {lang === "en" ? "Share Article:" : "വാർത്ത ഷെയർ ചെയ്യാം:"}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => setShareCardTarget(selectedArticle)}
                          className="px-3 py-1 bg-[#ffe500] hover:bg-[#ffe500]/90 text-[#052962] font-black text-[10px] uppercase tracking-wider rounded border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title={lang === "en" ? "Download as beautiful card graphic" : "മനോഹരമായ വാർത്താ കാർഡ് രൂപത്തിൽ ഡൗൺലോഡ് ചെയ്യാം"}
                        >
                          <IdCard className="w-3.5 h-3.5 text-[#052962]" /> {lang === "en" ? "Download Card" : "വാർത്താ കാർഡ്"}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(selectedArticle.id, e)}
                          className={`px-3 py-1 font-black text-[10px] uppercase tracking-wider rounded border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            bookmarks.includes(selectedArticle.id) 
                              ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600" 
                              : "bg-white text-slate-700 border-gray-300 hover:bg-gray-100"
                          }`}
                          title={bookmarks.includes(selectedArticle.id) ? (lang === "en" ? "Remove Bookmark" : "ബുക്ക്‌മാർക്ക് ഒഴിവാക്കുക") : (lang === "en" ? "Bookmark Article" : "ബുക്ക്‌മാർക്ക് ചെയ്യുക")}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${bookmarks.includes(selectedArticle.id) ? "fill-white text-white animate-pulse" : "text-slate-600"}`} />
                          <span>{bookmarks.includes(selectedArticle.id) ? (lang === "en" ? "Bookmarked" : "സേവ് ചെയ്തവ") : (lang === "en" ? "Bookmark" : "സേവ് ചെയ്യാം")}</span>
                        </button>
                      </div>
                      <ShareButtons 
                        title={lang === "en" ? selectedArticle.titleEn : selectedArticle.titleMl}
                        url={`${window.location.origin}/#article-${selectedArticle.id}`}
                        layout="row"
                      />
                    </div>

                    {/* Single narrative text depending on language selection */}
                    <div className="text-sm text-gray-800 leading-relaxed text-justify min-h-[160px]">
                      {lang === "en" ? (
                        <div className="space-y-4 animate-fade-in">
                          <span className="inline-block text-[10px] font-black text-[#052962] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider border border-blue-100/50 font-sans">
                            English Dispatch
                          </span>
                          <p className="whitespace-pre-line text-sm text-gray-800 font-sans tracking-wide leading-relaxed">{selectedArticle.contentEn}</p>
                        </div>
                      ) : (
                        <div className="space-y-4 font-anek-malayalam animate-fade-in">
                          <span className="inline-block text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-100/50">
                            മലയാളം ലേഖനം
                          </span>
                          <p className="whitespace-pre-line text-sm text-gray-800 leading-relaxed">{selectedArticle.contentMl}</p>
                        </div>
                      )}
                    </div>

                    {/* Nodal regions tags footer */}
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Region Tags:</span>
                      {(selectedArticle.regions || []).map(r => (
                        <span key={r} className="text-xs bg-gray-100 border text-slate-800 font-bold px-3 py-1 rounded capitalize flex items-center gap-0.5">
                          <MapPin className="w-3.5 h-3.5 text-red-600" /> {r}
                        </span>
                      ))}
                    </div>

                    {/* STORY SWIPING TRANSITION FLOW SECTION - Sliding next/prev cards */}
                    <div className="border-t border-b py-6 my-4 space-y-4">
                      <h4 className="text-xs font-bold text-[#052962] uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#005689]" /> RELATED & NEXT DISPATCHES
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Option Left: Previous */}
                        {prevArticle ? (
                          <button
                            type="button"
                            onClick={handlePrevArticle}
                            className="group text-left p-3.5 bg-slate-50 hover:bg-slate-100/85 border border-slate-200/60 rounded-lg transition duration-200 flex items-center gap-3 w-full cursor-pointer"
                          >
                            <div className="p-1.5 bg-white border rounded group-hover:bg-[#ffe500]/10 group-hover:border-[#ffe500] transition shrink-0">
                              <ChevronLeft className="w-4 h-4 text-[#052962]" />
                            </div>
                            <div className="min-w-0 flex-1 leading-snug">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">« PREVIOUS DISPATCH</span>
                              <span className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-[#c70000] transition">
                                {lang === "en" ? prevArticle.titleEn : prevArticle.titleMl}
                              </span>
                            </div>
                          </button>
                        ) : (
                          <div className="p-3.5 bg-slate-50/50 border border-slate-200/30 rounded-lg text-slate-400 text-xs italic flex items-center justify-center opacity-60">
                            No earlier articles
                          </div>
                        )}

                        {/* Option Right: Next */}
                        {nextArticle ? (
                          <button
                            type="button"
                            onClick={handleNextArticle}
                            className="group text-left p-3.5 bg-[#052962]/5 hover:bg-[#052962]/10 border border-[#052962]/20 rounded-lg transition duration-200 flex items-center gap-3 w-full cursor-pointer"
                          >
                            <div className="min-w-0 flex-1 leading-snug text-right">
                              <span className="text-[9px] font-black text-[#052962] uppercase tracking-widest block mb-0.5">NEXT DISPATCH »</span>
                              <span className="text-xs font-bold text-[#052962] line-clamp-1 group-hover:text-amber-600 transition">
                                {lang === "en" ? nextArticle.titleEn : nextArticle.titleMl}
                              </span>
                            </div>
                            <div className="p-1.5 bg-white border rounded group-hover:bg-[#ffe500] group-hover:border-[#ffe500] transition shrink-0">
                              <ChevronRight className="w-4 h-4 text-[#052962]" />
                            </div>
                          </button>
                        ) : (
                          <div className="p-3.5 bg-slate-50/50 border border-slate-200/30 rounded-lg text-slate-400 text-xs italic flex items-center justify-center opacity-60">
                            You are at the latest item
                          </div>
                        )}

                      </div>

                      {/* Related recommendations based on category and tags */}
                      {(() => {
                        const relatedArticles = news
                          .filter(n => n.id !== selectedArticle.id && (n.category === selectedArticle.category || (n.regions || []).some(r => (selectedArticle.regions || []).includes(r))))
                          .slice(0, 2);
                        if (relatedArticles.length === 0) return null;
                        return (
                          <div className="pt-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">You may also find analytical interest in:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {relatedArticles.map(rel => (
                                <div 
                                  key={rel.id} 
                                  onClick={() => { setSlideDirection("next"); handleArticleClick(rel); }}
                                  className="p-2.5 bg-white hover:bg-amber-50/50 border hover:border-amber-200 rounded-lg flex items-center gap-2.5 cursor-pointer transition select-none"
                                >
                                  <img 
                                    src={rel.image} 
                                    alt={rel.titleEn} 
                                    className="w-10 h-10 object-cover rounded border shrink-0 bg-slate-50"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0 flex-1 leading-tight">
                                    <span className="text-[8px] font-extrabold text-[#c70000] bg-red-50 px-1.5 py-0.5 rounded uppercase tracking-wider mb-0.5 inline-block font-sans">
                                      {rel.category}
                                    </span>
                                    <p className="text-xs font-bold text-[#052962] truncate select-none">
                                      {lang === "en" ? rel.titleEn : rel.titleMl}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                    </div>

                  </div>

                  {/* Sticky Mobile Next/Prev Navigation bar at the bottom */}
                  <div className="md:hidden sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-150 p-3 flex items-center justify-between gap-3 shadow-xl shrink-0 z-40">
                    {prevArticle ? (
                      <button
                        type="button"
                        onClick={handlePrevArticle}
                        className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-black text-[10px] flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 border border-slate-200"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 text-slate-700 stroke-[3]" />
                        <span>{lang === "en" ? "Prev" : "മുൻപ്"}</span>
                      </button>
                    ) : (
                      <div className="flex-1 shrink-0" />
                    )}

                    <div className="text-[10px] font-black text-gray-400 font-sans tracking-wide uppercase select-none shrink-0">
                      {lang === "en" ? "Swipe Story" : "സ്വൈപ്പ്"}
                    </div>

                    {nextArticle ? (
                      <button
                        type="button"
                        onClick={handleNextArticle}
                        className="flex-1 py-2 px-3 bg-[#052962] text-white hover:bg-[#005689] rounded font-black text-[10px] flex items-center justify-center gap-1 cursor-pointer transition active:scale-95"
                      >
                        <span>{lang === "en" ? "Next" : "അടുത്തത്"}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </button>
                    ) : (
                      <div className="flex-1 shrink-0" />
                    )}
                  </div>

                  {/* Close footer button */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedArticle(null)}
                      className="px-6 py-2 bg-[#052962] hover:bg-slate-900 text-white font-bold text-xs rounded transition uppercase tracking-wide cursor-pointer"
                    >
                      Close article (വായിച്ചു കഴിഞ്ഞു)
                    </button>
                  </div>

                </motion.div>
              </AnimatePresence>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. SHARE GRAPHIC CARD GENERATOR MODAL */}
      <ShareCardModal
        isOpen={shareCardTarget !== null}
        onClose={() => setShareCardTarget(null)}
        data={shareCardTarget}
        lang={lang}
      />

      {/* 5. DYNAMIC SPONSORSHIP / AD DETAIL OVERLAY */}
      <AnimatePresence>
        {activeAdDetail && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-[100]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-150 flex flex-col text-xs text-slate-850"
            >
              {activeAdDetail.image ? (
                <div className="w-full h-44 relative bg-slate-900 shrink-0">
                  <img 
                    src={activeAdDetail.image} 
                    alt={activeAdDetail.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 text-yellow-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow">
                    Verified Sponsor
                  </div>
                </div>
              ) : (
                <div className="w-full h-24 bg-gradient-to-br from-[#052962] to-[#0a3060] flex items-center justify-center p-4 text-center shrink-0">
                  <div className="text-yellow-400 uppercase font-black tracking-widest text-[10px]">
                    Sponsorship Partner
                  </div>
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight">
                    {activeAdDetail.title}
                  </h3>
                  <p className="text-slate-550 leading-relaxed font-semibold text-[11px]">
                    {activeAdDetail.subtitle}
                  </p>
                </div>

                {activeAdDetail.contact && (
                  <div className="p-3 bg-slate-50 border rounded-lg flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Contact Line</span>
                      <strong className="text-slate-800 text-xs font-mono">{activeAdDetail.contact}</strong>
                    </div>
                    <a 
                      href={`tel:${activeAdDetail.contact}`}
                      className="px-3 py-1.5 bg-[#052962] hover:bg-slate-900 text-[#ffe500] font-black text-[10px] rounded uppercase tracking-wider transition shadow-xs shrink-0"
                    >
                      Call Now
                    </a>
                  </div>
                )}

                <div className="flex gap-2 justify-end border-t pt-4">
                  <button
                    onClick={() => setActiveAdDetail(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded cursor-pointer transition text-[10px] uppercase font-sans tracking-wide"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5b. DETAILED ANNOUNCEMENT/NOTICE OVERLAY */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl max-w-md w-full shadow-lg overflow-hidden flex flex-col font-anek-malayalam text-slate-900 dark:text-slate-100"
            >
              <div className={`p-4 text-white flex items-center justify-between ${
                selectedAnnouncement.severity === "high" 
                  ? "bg-rose-700" 
                  : selectedAnnouncement.type === "caution" 
                    ? "bg-amber-600" 
                    : "bg-[#054E40]"
              }`}>
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-white" />
                  <h4 className="text-sm font-black uppercase tracking-wider font-sans">
                    {lang === "en" ? "OFFICIAL ANNOUNCEMENT" : "ഔദ്യോഗിക അറിയിപ്പ്"}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold border-b dark:border-slate-800 pb-2 bg-white dark:bg-slate-900">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{selectedAnnouncement.date}</span>
                  </span>
                  <span className="uppercase text-[9px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded font-black text-slate-700 dark:text-slate-350 border dark:border-slate-800">
                    {selectedAnnouncement.type}
                  </span>
                </div>

                {selectedAnnouncement.image && (
                  <div className="w-full rounded-xl overflow-hidden border dark:border-slate-800 bg-slate-105 dark:bg-slate-950 max-h-56 flex items-center justify-center shadow-xs">
                    <img 
                      src={selectedAnnouncement.image} 
                      alt="Announcement Attachment" 
                      className="w-full max-h-56 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="space-y-1.5 text-left bg-white dark:bg-slate-900">
                  <h3 className="text-sm font-black text-slate-950 dark:text-white leading-snug">
                    {lang === "en" ? selectedAnnouncement.titleEn : selectedAnnouncement.titleMl}
                  </h3>
                  <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-semibold whitespace-pre-wrap pt-2 border-t border-slate-50 dark:border-slate-800">
                    {lang === "en" ? selectedAnnouncement.contentEn : selectedAnnouncement.contentMl}
                  </p>
                </div>

                {selectedAnnouncement.severity === "high" && (
                  <div className="bg-rose-50 dark:bg-rose-950/25 border border-rose-150 dark:border-rose-900/40 p-2.5 rounded-xl flex items-start gap-2 text-[10px] text-rose-850 dark:text-rose-300 text-left">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="font-extrabold leading-normal">
                      {lang === "en" 
                        ? "CRITICAL ATTENTION REQUIRED: Please spread the word to local neighborhood groups." 
                        : "അടിയന്തര ശ്രദ്ധ ആവശ്യമാണ്: വിവരങ്ങൾ പ്രാദേശിക ഗ്രൂപ്പുകളിലേക്ക് പങ്കുവെക്കുക."}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center w-full bg-white dark:bg-slate-900">
                  <button
                    onClick={() => {
                      setSelectedAnnouncement(null);
                      setShareCardTarget(selectedAnnouncement);
                    }}
                    className="px-3.5 py-2 bg-[#ffe500] hover:bg-[#e6ce00] text-slate-950 rounded-xl text-xs font-black cursor-pointer transition flex items-center gap-1.5 shadow-xs"
                  >
                    <IdCard className="w-4 h-4 text-slate-950 shrink-0" /> {lang === "en" ? "Share Card" : "ഷെയർ കാർഡ്"}
                  </button>
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-850 dark:text-slate-200 rounded-xl text-xs font-black cursor-pointer transition"
                  >
                    {lang === "en" ? "Close" : "വായിച്ചു ബോധ്യപ്പെട്ടു"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* App Service Pop-up Modal */}
      <AnimatePresence>
        {selectedAppService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAppService(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 border border-slate-200 dark:border-slate-800 text-slate-700"
            >
              
              {/* Modal sticky top banner header */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-sky-50 dark:bg-sky-950/40 text-sky-600 rounded-lg text-lg">
                    {selectedAppService === "busTimings" && "🚌"}
                    {selectedAppService === "autorikshaw" && "🚖"}
                    {selectedAppService === "travelFood" && "🍽️"}
                    {selectedAppService === "shopping" && "🛍️"}
                  </span>
                  <div>
                    <h3 className="font-serif-guardian font-extrabold text-slate-900 dark:text-white text-base">
                      {selectedAppService === "busTimings" && (lang === "en" ? "KSRTC & Private Bus Timings" : "കെ.എസ്.ആർ.ടി.സി & പ്രൈവറ്റ് ബസ് സമയവിവരങ്ങൾ")}
                      {selectedAppService === "autorikshaw" && (lang === "en" ? "AUTO TAXI" : "പ്രാദേശിക ഓട്ടോ & ടാക്സി വിളിപ്പടം")}
                      {selectedAppService === "travelFood" && (lang === "en" ? "Explore Valley Food & Culture" : "പ്രാദേശിക ഭക്ഷണശാലകളും സംസ്കാരവും")}
                      {selectedAppService === "shopping" && (lang === "en" ? "SHOPPING" : "വ്യാപാരശാലകളും വാട്സാപ്പ് ഓർഡർ പോർട്ടലും")}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest font-sans mt-0.5">
                      {lang === "en" ? "ATTAPPADI ONLINE DIGITAL SERVICES" : "അട്ടപ്പാടി ഓൺലൈൻ ഡിജിറ്റൽ സേവനങ്ങൾ"}
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedAppService(null)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full transition cursor-pointer"
                  title={lang === "en" ? "Close" : "അടയ്ക്കുക"}
                >
                  <X className="w-5 h-5 font-bold" />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/10 dark:bg-slate-950/10">
                {selectedAppService === "busTimings" && (
                  <ExploreAttappadi lang={lang} initialTab="busTimings" hideTabsSelection={true} />
                )}
                {selectedAppService === "travelFood" && (
                  <ExploreAttappadi lang={lang} initialTab="culture" hideTabsSelection={true} />
                )}
                {selectedAppService === "autorikshaw" && (
                  <DirectoryWidget lang={lang} onDownloadCard={setShareCardTarget} initialTab="autorikshaw" hideHeaderTabs={true} />
                )}
                {selectedAppService === "shopping" && (
                  <DirectoryWidget lang={lang} onDownloadCard={setShareCardTarget} initialTab="shopping" hideHeaderTabs={true} />
                )}
              </div>

              {/* Modal footer back confirmation bar */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-400">
                <span>
                  {lang === "en" ? "💡 Powered by Attappadi Community Directory" : "💡 അട്ടപ്പാടി കമ്മ്യൂണിറ്റി ഡയറക്ടറിയുടെ സഹകരണത്തോടെ"}
                </span>
                <button
                  onClick={() => setSelectedAppService(null)}
                  className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-xs font-black transition cursor-pointer"
                >
                  {lang === "en" ? "Done" : "പൂർത്തിയായി"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="bg-[#052962] text-gray-300 py-12 px-6 md:px-12 border-t-4 border-[#ffe500]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <h4 className="text-xl font-serif-guardian font-extrabold text-[#ffe500]">ATTAPPADI ONLINE</h4>
            <p className="text-xs leading-relaxed text-gray-400">
              Reliable Malayalam & English journalism representing Mukkali, Thavalam, Agali, Kottathara, Sholayur, Pudur, Anaikatty, Jellippara, and Chittur. Elevating the tribal block’s native voice.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="text-sm font-bold text-[#fcfcfb] uppercase tracking-wider">Quick Geographical Desks</h5>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-slate-300 font-semibold uppercase">
              <button onClick={() => handleRegionClick("agali")} className="hover:text-[#ffe500] text-left transition cursor-pointer font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> Agali</button>
              <button onClick={() => handleRegionClick("mukkali")} className="hover:text-[#ffe500] text-[#ffe500]/90 text-left transition cursor-pointer font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#ffe500] shrink-0" /> Mukkali</button>
              <button onClick={() => handleRegionClick("thavalam")} className="hover:text-[#ffe500] text-left transition cursor-pointer font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> Thavalam</button>
              <button onClick={() => handleRegionClick("kottathara")} className="hover:text-[#ffe500] text-left transition cursor-pointer font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> Kottathara</button>
              <button onClick={() => handleRegionClick("sholayur")} className="hover:text-[#ffe500] text-left transition cursor-pointer font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> Sholayur</button>
              <button onClick={() => handleRegionClick("pudur")} className="hover:text-[#ffe500] text-left transition cursor-pointer font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> Pudur</button>
              <button onClick={() => handleRegionClick("anaikkatty")} className="hover:text-[#ffe500] text-left transition cursor-pointer font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> Anaikatty</button>
              <button onClick={() => handleRegionClick("jellippara")} className="hover:text-[#ffe500] text-left transition cursor-pointer font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> Jellippara</button>
              <button onClick={() => handleRegionClick("chittur")} className="hover:text-[#ffe500] text-left transition cursor-pointer font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> Chittur</button>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="text-sm font-bold text-[#fcfcfb] uppercase tracking-wider">Editorial Standards</h5>
            <p className="text-xs text-gray-400 leading-relaxed">
              Serving the Nilgiri-Silent Valley biosphere block with clean, independent, secular columns. All citizen opinion submissions undergo rigorous fact-checking.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>
            © <span 
              onDoubleClick={() => { window.location.hash = "#admin-portal-attappadi"; }} 
              className="cursor-default select-none hover:text-[#ffe500] transition-colors font-medium"
              title="Editorial Desk"
            >2026</span> Attappadi Online. All rights reserved by the respective communities.
          </p>
        </div>
      </footer>

    </div>
  );
}
