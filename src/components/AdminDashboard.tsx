import React, { useState, useEffect, useRef } from "react";
import { 
  Lock, KeyRound, Globe, FileText, PlusCircle, Check, Trash2, Pencil, XCircle,
  Sparkles, Languages, Eye, ArrowLeft, ArrowUpRight, Calendar, Phone, BookOpen, AlertCircle,
  Upload, Bus, MapPin, Compass, UtensilsCrossed, Hotel, Image as ImageIcon, Clock, Activity, ListOrdered,
  Megaphone, Flame, Truck
} from "lucide-react";
import { motion, AnimatePresence } from "motion";
import { 
  NewsPost, EventItem, DirectoryItem, OpinionItem, EmergencyContact, 
  DestinationItem, CultureItem, StayItem, TravelogueItem, PhotoItem, BusRouteItem, BusStopTransit,
  NoticeItem, LpgDelivery
} from "../types";
import SocialCardGenerator from "./SocialCardGenerator";
import ExploreAttappadi from "./ExploreAttappadi";

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"news" | "opinions" | "events" | "explore" | "buses" | "directory" | "emergency" | "notices" | "lpg" | "ads" | "card-generator" | "tickers">("news");
  const [exploreSubTab, setExploreSubTab] = useState<"destinations" | "cultures" | "stays" | "travelogues" | "photos">("destinations");

  // Success message toaster helper
  const [successMessage, setSuccessMessage] = useState("");

  // DB collection states
  const [newsList, setNewsList] = useState<NewsPost[]>([]);
  const [opinionsList, setOpinionsList] = useState<OpinionItem[]>([]);
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [dirList, setDirList] = useState<DirectoryItem[]>([]);
  const [emergencyList, setEmergencyList] = useState<EmergencyContact[]>([]);
  const [destinationsList, setDestinationsList] = useState<DestinationItem[]>([]);
  const [culturesList, setCulturesList] = useState<CultureItem[]>([]);
  const [staysList, setStaysList] = useState<StayItem[]>([]);
  const [traveloguesList, setTraveloguesList] = useState<TravelogueItem[]>([]);
  const [photosList, setPhotosList] = useState<PhotoItem[]>([]);
  const [busRoutesList, setBusRoutesList] = useState<BusRouteItem[]>([]);
  const [routesList, setRoutesList] = useState<{ id: string; routeEn: string; routeMl: string; }[]>([]);
  const [noticesList, setNoticesList] = useState<NoticeItem[]>([]);
  const [lpgList, setLpgList] = useState<LpgDelivery[]>([]);

  // Database Diagnostic state
  const [dbDiagnostic, setDbDiagnostic] = useState<{
    status: "connected" | "disconnected" | "error" | "loading";
    isUsingFirestore: boolean;
    databaseId: string;
    errorMessage: string | null;
    collections: {
      news: { localCount: number; firestoreCount: number; status: string; error: string | null };
      events: { localCount: number; firestoreCount: number; status: string; error: string | null };
      notices: { localCount: number; firestoreCount: number; status: string; error: string | null };
    };
  }>({
    status: "loading",
    isUsingFirestore: false,
    databaseId: "",
    errorMessage: null,
    collections: {
      news: { localCount: 0, firestoreCount: 0, status: "idle", error: null },
      events: { localCount: 0, firestoreCount: 0, status: "idle", error: null },
      notices: { localCount: 0, firestoreCount: 0, status: "idle", error: null }
    }
  });

  // Editing/Form states
  // 1. News Form
  const [newsForm, setNewsForm] = useState({
    titleEn: "", titleMl: "", contentEn: "", contentMl: "",
    category: "latest" as "breaking" | "latest" | "updates", regions: [] as string[],
    image: "", isSlide: false, isCard: true
  });
  const [imgSourceMode, setImgSourceMode] = useState<"upload" | "url">("upload");
  const [isDragging, setIsDragging] = useState(false);

  // LPG Form State
  const [lpgForm, setLpgForm] = useState({
    agencyNameEn: "",
    agencyNameMl: "",
    areasEn: "",
    areasMl: "",
    date: new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" }),
    statusEn: "Delivering Today",
    statusMl: "ഇന്ന് വിതരണമുണ്ട്",
    contact: "",
    notesEn: "",
    notesMl: ""
  });

  // Explore Attappadi Image States
  const [destImgSourceMode, setDestImgSourceMode] = useState<"upload" | "url">("upload");
  const [destDragging, setDestDragging] = useState(false);

  const [cultureImgSourceMode, setCultureImgSourceMode] = useState<"upload" | "url">("upload");
  const [cultureDragging, setCultureDragging] = useState(false);

  const [stayImgSourceMode, setStayImgSourceMode] = useState<"upload" | "url">("upload");
  const [stayDragging, setStayDragging] = useState(false);

  const [photoImgSourceMode, setPhotoImgSourceMode] = useState<"upload" | "url">("upload");
  const [photoDragging, setPhotoDragging] = useState(false);
  
  const [noticeImgSourceMode, setNoticeImgSourceMode] = useState<"upload" | "url">("upload");
  const [noticeDragging, setNoticeDragging] = useState(false);
  
  // AI Assist News Help States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiIdea, setAiIdea] = useState("");
  const [aiPoints, setAiPoints] = useState("");

  // 2. Opinions Form
  const [opinionForm, setOpinionForm] = useState({
    authorName: "", titleEn: "", titleMl: "", contentEn: "", contentMl: "", approved: true
  });

  // 3. Events Form
  const [eventForm, setEventForm] = useState({
    titleEn: "", titleMl: "", date: "", time: "", locationEn: "", locationMl: "", descriptionEn: "", descriptionMl: ""
  });

  // 4. Explore sub-forms
  const [destForm, setDestForm] = useState({
    nameEn: "", nameMl: "", locationEn: "", locationMl: "", image: "",
    descriptionEn: "", descriptionMl: "", highlightsEn: "", highlightsMl: ""
  });
  const [cultureForm, setCultureForm] = useState({
    type: "culture", titleEn: "", titleMl: "", subtitleEn: "", subtitleMl: "", image: "",
    descEn: "", descMl: "", elementEn: "", elementMl: ""
  });
  const [stayForm, setStayForm] = useState({
    nameEn: "", nameMl: "", typeEn: "", typeMl: "", locationEn: "", locationMl: "", image: "",
    priceEn: "", priceMl: "", featuresEn: "", featuresMl: ""
  });
  const [travelogueForm, setTravelogueForm] = useState({
    titleEn: "", titleMl: "", authorEn: "", authorMl: "", date: "", snippetEn: "", snippetMl: "",
    readTimeEn: "", readTimeMl: ""
  });
  const [photoForm, setPhotoForm] = useState({
    url: "", titleEn: "", titleMl: "", descEn: "", descMl: ""
  });

  // Helper to get standard bus types for selected Authority
  const getStandardBusTypes = (authority: string) => {
    if (authority === "KSRTC") {
      return [
        { value: "Ordinary", labelEn: "Ordinary", labelMl: "ഓർഡിനറി" },
        { value: "Fast Passenger", labelEn: "Fast Passenger", labelMl: "ഫാസ്റ്റ് പാസഞ്ചർ" },
        { value: "Superfast", labelEn: "Superfast", labelMl: "സൂപ്പർ ഫാസ്റ്റ്" },
        { value: "Special", labelEn: "Special Service", labelMl: "പ്രത്യേക സർവീസ്" },
        { value: "Budget Tourism", labelEn: "Budget Tourism", labelMl: "ബജറ്റ് ടൂറിസം" },
        { value: "Gramavandi", labelEn: "Gramavandi", labelMl: "ഗ്രാമവണ്ടി" },
        { value: "Interstate", labelEn: "Interstate", labelMl: "അന്തർസംസ്ഥാന സർവീസ്" },
        { value: "Others", labelEn: "Others", labelMl: "മറ്റുള്ളവ" }
      ];
    } else if (authority === "PRIVATE") {
      return [
        { value: "Ordinary", labelEn: "Ordinary Private", labelMl: "ഓർഡിനറി പ്രൈവറ്റ്" },
        { value: "Limited Stop", labelEn: "Limited Stop", labelMl: "ലിമിറ്റഡ് സ്റ്റോപ്പ്" },
        { value: "City Bus", labelEn: "City Bus", labelMl: "സിറ്റി ബസ്" },
        { value: "Interstate", labelEn: "Interstate Private", labelMl: "അന്തർസംസ്ഥാന സർവീസ്" }
      ];
    } else if (authority === "TNSTC" || authority === "TNRTC") {
      return [
        { value: "Interstate", labelEn: "Interstate", labelMl: "അന്തർസംസ്ഥാന സർവീസ്" },
        { value: "Interstate Express", labelEn: "Interstate Express", labelMl: "അന്തർസംസ്ഥാന എക്സ്പ്രസ്സ്" }
      ];
    }
    return [];
  };

  // 5. Bus Timings Form
  const [busForm, setBusForm] = useState({
    routeEn: "", routeMl: "", type: "KSRTC", busTypeEn: "", busTypeMl: "",
    runsEn: "Daily Line", runsMl: "എല്ലാ ദിവസവും", frequencyEn: "", frequencyMl: "",
    timingsEn: "", timingsMl: "", privateBusName: ""
  });
  const [busTransitList, setBusTransitList] = useState<BusStopTransit[]>([]);
  const [routeForm, setRouteForm] = useState({ routeEn: "", routeMl: "" });
  const [transitInput, setTransitInput] = useState({
    time: "", typeEn: "", typeMl: "", viaCodeEn: "", viaCodeMl: ""
  });

  // 6. Directory Form
  const [dirForm, setDirForm] = useState({
    nameEn: "", nameMl: "", category: "hospital" as any, contact: "", locationEn: "Attappadi", locationMl: "അട്ടപ്പാടി"
  });

  // 7. Emergency Contact Form
  const [emergForm, setEmergForm] = useState({
    nameEn: "", nameMl: "", number: "", type: "hospital" as any
  });

  // 8. Notices Form
  const [noticeForm, setNoticeForm] = useState({
    titleEn: "", titleMl: "", contentEn: "", contentMl: "",
    type: "notice",
    severity: "medium",
    date: "",
    active: true,
    image: ""
  });

  // 8b. Quick Tickers Form
  const [quickBreakingForm, setQuickBreakingForm] = useState({
    titleEn: "",
    titleMl: ""
  });
  const [quickNoticeForm, setQuickNoticeForm] = useState({
    titleEn: "",
    titleMl: "",
    contentEn: "",
    contentMl: "",
    type: "notice",
    severity: "medium",
    date: new Date().toISOString().split("T")[0],
    active: true,
    image: ""
  });

  // 9. Side Banner Advertisements Form State
  const [adForm, setAdForm] = useState({
    leftAd: {
      titleEn: "", titleMl: "",
      subtitleEn: "", subtitleMl: "",
      contact: "", actionType: "share" as "phone" | "website" | "whatsapp" | "share",
      externalUrl: "", image: ""
    },
    rightAd: {
      titleEn: "", titleMl: "",
      subtitleEn: "", subtitleMl: "",
      contact: "", actionType: "phone" as "phone" | "website" | "whatsapp" | "share",
      externalUrl: "", image: ""
    }
  });

  const [leftAdImgSourceMode, setLeftAdImgSourceMode] = useState<"upload" | "url">("url");
  const [leftAdDragging, setLeftAdDragging] = useState(false);
  const [rightAdImgSourceMode, setRightAdImgSourceMode] = useState<"upload" | "url">("url");
  const [rightAdDragging, setRightAdDragging] = useState(false);

  // Editing active state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<string | null>(null);

  // Custom confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    type: string;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingType(null);
    setNewsForm({
      titleEn: "", titleMl: "", contentEn: "", contentMl: "",
      category: "latest", regions: [], image: "", isSlide: false, isCard: true
    });
    setOpinionForm({
      authorName: "", titleEn: "", titleMl: "", contentEn: "", contentMl: "", approved: true
    });
    setEventForm({
      titleEn: "", titleMl: "", date: "", time: "", locationEn: "", locationMl: "", descriptionEn: "", descriptionMl: ""
    });
    setDestForm({
      nameEn: "", nameMl: "", locationEn: "", locationMl: "", image: "",
      descriptionEn: "", descriptionMl: "", highlightsEn: "", highlightsMl: ""
    });
    setCultureForm({
      type: "culture", titleEn: "", titleMl: "", subtitleEn: "", subtitleMl: "", image: "",
      descEn: "", descMl: "", elementEn: "", elementMl: ""
    });
    setStayForm({
      nameEn: "", nameMl: "", typeEn: "", typeMl: "", locationEn: "", locationMl: "", image: "",
      priceEn: "", priceMl: "", featuresEn: "", featuresMl: ""
    });
    setTravelogueForm({
      titleEn: "", titleMl: "", authorEn: "", authorMl: "", date: "", snippetEn: "", snippetMl: "",
      readTimeEn: "", readTimeMl: ""
    });
    setPhotoForm({
      url: "", titleEn: "", titleMl: "", descEn: "", descMl: ""
    });
    setBusForm({
      routeEn: "", routeMl: "", type: "KSRTC", busTypeEn: "", busTypeMl: "",
      runsEn: "Daily Line", runsMl: "എല്ലാ ദിവസവും", frequencyEn: "", frequencyMl: "",
      timingsEn: "", timingsMl: "", privateBusName: ""
    });
    setBusTransitList([]);
    setDirForm({
      nameEn: "", nameMl: "", category: "hospital", contact: "", locationEn: "Attappadi", locationMl: "അട്ടപ്പാടി"
    });
    setEmergForm({
      nameEn: "", nameMl: "", number: "", type: "hospital"
    });
    setLpgForm({
      agencyNameEn: "",
      agencyNameMl: "",
      areasEn: "",
      areasMl: "",
      date: new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" }),
      statusEn: "Delivering Today",
      statusMl: "ഇന്ന് വിതരണമുണ്ട്",
      contact: "",
      notesEn: "",
      notesMl: ""
    });
    triggerToast("Edit session discarded.");
  };

  // Global Auto-Translation Toggle
  const [autoTranslateOnSubmit, setAutoTranslateOnSubmit] = useState(true);
  const [isTranslatingForm, setIsTranslatingForm] = useState(false);

  // Universal Live Debounced Auto Translation
  const liveTranslationTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const [activeLiveTranslationsCount, setActiveLiveTranslationsCount] = useState(0);

  const autoTranslateField = (
    text: string,
    sourceFieldPath: string, // e.g. "titleEn" or "leftAd.titleEn"
    targetFieldPath: string, // e.g. "titleMl" or "leftAd.titleMl"
    setFormState: React.Dispatch<React.SetStateAction<any>>,
    targetLang: "en" | "ml"
  ) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (liveTranslationTimers.current[sourceFieldPath]) {
      clearTimeout(liveTranslationTimers.current[sourceFieldPath]);
    }

    // Determine the delay. If they finish a sentence, translate faster ("When I typed a sentence, without clicking a button")
    const endsWithSentence = /[.!?\n\u0d3e-\u0d4d]\s*$/.test(text);
    const delay = endsWithSentence ? 650 : 1500;

    liveTranslationTimers.current[sourceFieldPath] = setTimeout(async () => {
      setActiveLiveTranslationsCount(prev => prev + 1);
      try {
        const response = await fetch("/api/admin/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed, targetLang })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.translatedText) {
            setFormState((prev: any) => {
              const isNested = sourceFieldPath.includes(".");
              if (isNested) {
                const [section, subkey] = sourceFieldPath.split(".");
                if (!prev[section] || !prev[section][subkey] || prev[section][subkey].trim() === "") {
                  return prev;
                }
                const targetParts = targetFieldPath.split(".");
                return {
                  ...prev,
                  [targetParts[0]]: {
                    ...prev[targetParts[0]],
                    [targetParts[1]]: data.translatedText
                  }
                };
              } else {
                if (!prev[sourceFieldPath] || prev[sourceFieldPath].trim() === "") {
                  return prev;
                }
                return {
                  ...prev,
                  [targetFieldPath]: data.translatedText
                };
              }
            });
          }
        }
      } catch (err) {
        console.error("Live translation error:", err);
      } finally {
        setActiveLiveTranslationsCount(prev => Math.max(0, prev - 1));
      }
    }, delay);
  };

  // Generic Auto Translation Core Engine
  const performAutoTranslationForForm = async <T extends Record<string, any>>(
    formState: T,
    setFormState: React.Dispatch<React.SetStateAction<T>>,
    fields: { en: keyof T; ml: keyof T; label?: string }[]
  ): Promise<T> => {
    if (!autoTranslateOnSubmit) {
      return formState;
    }

    let updatedForm = { ...formState };
    let hasKeysToTranslate = false;

    // Direct pre-check
    for (const pair of fields) {
      const enVal = String(formState[pair.en] || "").trim();
      const mlVal = String(formState[pair.ml] || "").trim();
      if ((enVal && !mlVal) || (mlVal && !enVal)) {
        hasKeysToTranslate = true;
      }
    }

    if (!hasKeysToTranslate) {
      return formState;
    }

    setIsTranslatingForm(true);
    triggerToast("✨ Gemini AI is generating translations for empty language fields...");

    try {
      const promises = fields.map(async (pair) => {
        const enVal = String(formState[pair.en] || "").trim();
        const mlVal = String(formState[pair.ml] || "").trim();

        if (enVal && !mlVal) {
          try {
            const response = await fetch("/api/admin/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: enVal, targetLang: "ml" })
            });
            const data = await response.json();
            if (response.ok && data.translatedText) {
              updatedForm[pair.ml] = data.translatedText as any;
            }
          } catch (e) {
            console.error("Auto translate error for " + String(pair.ml), e);
          }
        } else if (mlVal && !enVal) {
          try {
            const response = await fetch("/api/admin/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: mlVal, targetLang: "en" })
            });
            const data = await response.json();
            if (response.ok && data.translatedText) {
              updatedForm[pair.en] = data.translatedText as any;
            }
          } catch (e) {
            console.error("Auto translate error for " + String(pair.en), e);
          }
        }
      });

      await Promise.all(promises);
      setFormState(updatedForm);
      triggerToast("✨ Translations updated & completed by Gemini AI!");
    } catch (err) {
      console.error("Master translation routing failed", err);
    } finally {
      setIsTranslatingForm(false);
    }

    return updatedForm;
  };

  // Load and authenticate
  useEffect(() => {
    const token = localStorage.getItem("attappadi_admin_token");
    if (token === "attappadi-sec-2026-auth-token") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAllLists();
    }
  }, [isAuthenticated]);

  const refreshAllLists = () => {
    fetchNews();
    fetchOpinions();
    fetchEvents();
    fetchDirectory();
    fetchEmergency();
    fetchExploreDestinations();
    fetchExploreCultures();
    fetchExploreStays();
    fetchExploreTravelogues();
    fetchExplorePhotos();
    fetchBusRoutes();
    fetchRoutes();
    fetchNotices();
    fetchLpg();
    fetchAdConfig();
    fetchDbDiagnostic();
  };

  const fetchDbDiagnostic = async () => {
    try {
      const res = await fetch("/api/admin/db-diagnostic");
      if (res.ok) {
        const data = await res.json();
        setDbDiagnostic({
          status: data.status,
          isUsingFirestore: data.isUsingFirestore,
          databaseId: data.databaseId,
          collections: data.collections || {
            news: { localCount: 0, firestoreCount: 0, status: "idle", error: null },
            events: { localCount: 0, firestoreCount: 0, status: "idle", error: null },
            notices: { localCount: 0, firestoreCount: 0, status: "idle", error: null }
          },
          errorMessage: data.errorMessage
        });
      } else {
        setDbDiagnostic(prev => ({ ...prev, status: "error", errorMessage: "Failed to load diagnostic status" }));
      }
    } catch (err: any) {
      setDbDiagnostic(prev => ({ ...prev, status: "error", errorMessage: err.message || String(err) }));
    }
  };

  const triggerToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem("attappadi_admin_token", data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || "Incorrect Credentials. Please try again.");
      }
    } catch (_) {
      setLoginError("Could not connect to authentication services.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("attappadi_admin_token");
    setIsAuthenticated(false);
  };

  // Fetches
  const fetchNews = () => fetch("/api/news").then(r => r.json()).then(setNewsList).catch(console.error);
  const fetchOpinions = () => fetch("/api/opinions").then(r => r.json()).then(setOpinionsList).catch(console.error);
  const fetchEvents = () => fetch("/api/events").then(r => r.json()).then(setEventsList).catch(console.error);
  const fetchDirectory = () => fetch("/api/directory").then(r => r.json()).then(setDirList).catch(console.error);
  const fetchEmergency = () => fetch("/api/emergency").then(r => r.json()).then(setEmergencyList).catch(console.error);
  const fetchExploreDestinations = () => fetch("/api/destinations").then(r => r.json()).then(setDestinationsList).catch(console.error);
  const fetchExploreCultures = () => fetch("/api/cultures").then(r => r.json()).then(setCulturesList).catch(console.error);
  const fetchExploreStays = () => fetch("/api/stays").then(r => r.json()).then(setStaysList).catch(console.error);
  const fetchExploreTravelogues = () => fetch("/api/travelogues").then(r => r.json()).then(setTraveloguesList).catch(console.error);
  const fetchExplorePhotos = () => fetch("/api/photos").then(r => r.json()).then(setPhotosList).catch(console.error);
  const fetchBusRoutes = () => fetch("/api/busroutes").then(r => r.json()).then(setBusRoutesList).catch(console.error);
  const fetchRoutes = () => fetch("/api/routes").then(r => r.json()).then(setRoutesList).catch(console.error);
  const fetchNotices = () => fetch("/api/notices").then(r => r.json()).then(setNoticesList).catch(console.error);
  const fetchLpg = () => fetch("/api/lpg").then(r => r.json()).then(setLpgList).catch(console.error);
  const fetchAdConfig = () => {
    fetch("/api/adconfig")
      .then(r => r.json())
      .then(data => {
        if (data) {
          setAdForm({
            leftAd: {
              titleEn: data.leftAd?.titleEn || "",
              titleMl: data.leftAd?.titleMl || "",
              subtitleEn: data.leftAd?.subtitleEn || "",
              subtitleMl: data.leftAd?.subtitleMl || "",
              contact: data.leftAd?.contact || "",
              actionType: data.leftAd?.actionType || "share",
              externalUrl: data.leftAd?.externalUrl || "",
              image: data.leftAd?.image || ""
            },
            rightAd: {
              titleEn: data.rightAd?.titleEn || "",
              titleMl: data.rightAd?.titleMl || "",
              subtitleEn: data.rightAd?.subtitleEn || "",
              subtitleMl: data.rightAd?.subtitleMl || "",
              contact: data.rightAd?.contact || "",
              actionType: data.rightAd?.actionType || "phone",
              externalUrl: data.rightAd?.externalUrl || "",
              image: data.rightAd?.image || ""
            }
          });
        }
      })
      .catch(console.error);
  };

  const handleSaveAdConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalAdForm = { ...adForm };

    if (autoTranslateOnSubmit) {
      setIsTranslatingForm(true);
      triggerToast("✨ Gemini AI is generating translations for empty ad text labels...");
      try {
        // Translation for left ad
        if (adForm.leftAd.titleEn && !adForm.leftAd.titleMl) {
          const res = await fetch("/api/admin/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: adForm.leftAd.titleEn, targetLang: "ml" })
          });
          const d = await res.json();
          if (res.ok && d.translatedText) finalAdForm.leftAd.titleMl = d.translatedText;
        } else if (adForm.leftAd.titleMl && !adForm.leftAd.titleEn) {
          const res = await fetch("/api/admin/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: adForm.leftAd.titleMl, targetLang: "en" })
          });
          const d = await res.json();
          if (res.ok && d.translatedText) finalAdForm.leftAd.titleEn = d.translatedText;
        }

        if (adForm.leftAd.subtitleEn && !adForm.leftAd.subtitleMl) {
          const res = await fetch("/api/admin/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: adForm.leftAd.subtitleEn, targetLang: "ml" })
          });
          const d = await res.json();
          if (res.ok && d.translatedText) finalAdForm.leftAd.subtitleMl = d.translatedText;
        }

        // Translation for right ad
        if (adForm.rightAd.titleEn && !adForm.rightAd.titleMl) {
          const res = await fetch("/api/admin/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: adForm.rightAd.titleEn, targetLang: "ml" })
          });
          const d = await res.json();
          if (res.ok && d.translatedText) finalAdForm.rightAd.titleMl = d.translatedText;
        } else if (adForm.rightAd.titleMl && !adForm.rightAd.titleEn) {
          const res = await fetch("/api/admin/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: adForm.rightAd.titleMl, targetLang: "en" })
          });
          const d = await res.json();
          if (res.ok && d.translatedText) finalAdForm.rightAd.titleEn = d.translatedText;
        }

        if (adForm.rightAd.subtitleEn && !adForm.rightAd.subtitleMl) {
          const res = await fetch("/api/admin/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: adForm.rightAd.subtitleEn, targetLang: "ml" })
          });
          const d = await res.json();
          if (res.ok && d.translatedText) finalAdForm.rightAd.subtitleMl = d.translatedText;
        }

        setAdForm(finalAdForm);
      } catch (err) {
        console.error("Ad auto translate error", err);
      } finally {
        setIsTranslatingForm(false);
      }
    }

    try {
      const response = await fetch("/api/adconfig", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAdForm)
      });
      if (response.ok) {
        triggerToast("📢 Side Banner Ads config saved successfully to server!");
      } else {
        alert("Failed to save Ads config");
      }
    } catch (err: any) {
      alert("Error saving Ads config: " + err.message);
    }
  };

  const handleLeftAdFileProcess = (file: File) => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      alert("Image exceeds 12MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        setAdForm(prev => ({
          ...prev,
          leftAd: { ...prev.leftAd, image: e.target!.result as string }
        }));
        triggerToast("Left promo block image uploaded successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRightAdFileProcess = (file: File) => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      alert("Image exceeds 12MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        setAdForm(prev => ({
          ...prev,
          rightAd: { ...prev.rightAd, image: e.target!.result as string }
        }));
        triggerToast("Right promo block image uploaded successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  // NEWS ACTIONS
  const handleStartEditNews = (item: any) => {
    setNewsForm({
      titleEn: item.titleEn,
      titleMl: item.titleMl,
      contentEn: item.contentEn || "",
      contentMl: item.contentMl || "",
      category: item.category,
      regions: item.regions || [],
      image: item.image || "",
      isSlide: !!item.isSlide,
      isCard: item.isCard !== undefined ? !!item.isCard : true
    });
    setEditingId(item.id);
    setEditingType("news");
    setImgSourceMode("url");
    triggerToast("✏️ Loaded article into form for editing.");
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    const translatedNews = await performAutoTranslationForForm(newsForm, setNewsForm, [
      { en: "titleEn", ml: "titleMl" },
      { en: "contentEn", ml: "contentMl" }
    ]);
    if (!translatedNews.titleEn || !translatedNews.titleMl || !translatedNews.contentEn || !translatedNews.contentMl) {
      alert("Please fill in headline and content in English or Malayalam!");
      return;
    }

    const isEdit = typeof editingId === "string" && editingType === "news";
    const url = isEdit ? `/api/news/${editingId}` : "/api/news";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(translatedNews)
    });
    if (response.ok) {
      triggerToast(isEdit ? "News article updated successfully!" : "News article published successfully! (വാർത്ത പ്രസിദ്ധീകരിച്ചു)");
      setNewsForm({
        titleEn: "", titleMl: "", contentEn: "", contentMl: "",
        category: "latest", regions: [], image: "", isSlide: false, isCard: true
      });
      setEditingId(null);
      setEditingType(null);
      fetchNews();
    }
  };

  const handleDeleteNews = async (id: string) => {
    setDeleteConfirm({
      id,
      type: "news",
      title: "Delete News Article",
      message: "Are you sure you want to permanently delete this news article?",
      onConfirm: async () => {
        const response = await fetch(`/api/news/${id}`, { method: "DELETE" });
        if (response.ok) {
          triggerToast("News article removed successfully.");
          fetchNews();
        }
        setDeleteConfirm(null);
      }
    });
  };

  // FILE UPLOAD PROCESSOR
  const handleFileProcess = (file: File) => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      alert("Image exceeds 12MB limit. Please upload a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        setNewsForm(prev => ({ ...prev, image: e.target!.result as string }));
        triggerToast("Photo chemical processing completed!");
      }
    };
    reader.readAsDataURL(file);
  };

  // EXPLORE IMAGE FILE UPLOAD PROCESSORS
  const handleDestFileProcess = (file: File) => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      alert("Image exceeds 12MB limit. Please upload a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        setDestForm(prev => ({ ...prev, image: e.target!.result as string }));
        triggerToast("Destination photo loaded!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCultureFileProcess = (file: File) => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      alert("Image exceeds 12MB limit. Please upload a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        setCultureForm(prev => ({ ...prev, image: e.target!.result as string }));
        triggerToast("Culture photo loaded!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStayFileProcess = (file: File) => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      alert("Image exceeds 12MB limit. Please upload a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        setStayForm(prev => ({ ...prev, image: e.target!.result as string }));
        triggerToast("Stay option photo loaded!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoHubFileProcess = (file: File) => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      alert("Image exceeds 12MB limit. Please upload a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        setPhotoForm(prev => ({ ...prev, url: e.target!.result as string }));
        triggerToast("Gallery frame photo loaded!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNoticeFileProcess = (file: File) => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      alert("Image exceeds 12MB limit. Please upload a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        setNoticeForm(prev => ({ ...prev, image: e.target!.result as string }));
        triggerToast("Notice board attachment image processed!");
      }
    };
    reader.readAsDataURL(file);
  };

  // AI JOURNALIST reporting generator
  const handleAIGenerateNews = async () => {
    if (!aiIdea) {
      alert("Please enter a concept outline or headline first.");
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetch("/api/admin/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleSuggest: aiIdea, mainPoints: aiPoints })
      });
      const data = await response.json();
      if (response.ok) {
        setNewsForm(prev => ({
          ...prev,
          titleEn: data.titleEn || "",
          titleMl: data.titleMl || "",
          contentEn: data.contentEn || "",
          contentMl: data.contentMl || ""
        }));
        triggerToast("AI reporting created, loaded into translation blocks below!");
      } else {
        alert(data.error || "AI Generation error");
      }
    } catch (e: any) {
      alert("Failed to communicate with AI Assistant: " + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Translation helper
  const handleTranslateBlock = async (text: string, target: "ml" | "en") => {
    if (!text) {
      alert("Please enter content to translate first.");
      return;
    }
    triggerToast("Initiating translation process...");
    try {
      const response = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: target })
      });
      const data = await response.json();
      if (response.ok && data.translatedText) {
        if (target === "ml") {
          setNewsForm(prev => ({ ...prev, contentMl: data.translatedText }));
        } else {
          setNewsForm(prev => ({ ...prev, contentEn: data.translatedText }));
        }
        triggerToast("Translation loaded successfully!");
      } else {
        alert(data.error || "Translation API failed");
      }
    } catch (e: any) {
      alert("Translation failed: " + e.message);
    }
  };

  // OPINION BOARD ACTIONS
  const handleStartEditOpinion = (item: any) => {
    setOpinionForm({
      authorName: item.authorName,
      titleEn: item.titleEn,
      titleMl: item.titleMl,
      contentEn: item.contentEn,
      contentMl: item.contentMl || "",
      approved: item.approved !== undefined ? item.approved : true
    });
    setEditingId(item.id);
    setEditingType("opinions");
    triggerToast("✏️ Loaded opinion for editing.");
  };

  const handleCreateOpinion = async (e: React.FormEvent) => {
    e.preventDefault();
    const translatedOpinion = await performAutoTranslationForForm(opinionForm, setOpinionForm, [
      { en: "titleEn", ml: "titleMl" },
      { en: "contentEn", ml: "contentMl" }
    ]);
    if (!opinionForm.authorName || !translatedOpinion.titleEn || !translatedOpinion.contentEn) {
      alert("Missing required fields for Opinion post.");
      return;
    }

    const isEdit = typeof editingId === "string" && editingType === "opinions";
    const url = isEdit ? `/api/opinions/${editingId}` : "/api/opinions";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(translatedOpinion)
    });
    if (response.ok) {
      triggerToast(isEdit ? "Opinion column updated successfully." : "Opinion column published successfully.");
      setOpinionForm({ authorName: "", titleEn: "", titleMl: "", contentEn: "", contentMl: "", approved: true });
      setEditingId(null);
      setEditingType(null);
      fetchOpinions();
    }
  };

  const handleApproveOpinion = async (id: string) => {
    const response = await fetch(`/api/opinions/approve/${id}`, { method: "POST" });
    if (response.ok) {
      triggerToast("Opinion entry approved live!");
      fetchOpinions();
    }
  };

  const handleDeleteOpinion = async (id: string) => {
    setDeleteConfirm({
      id,
      type: "opinions",
      title: "Delete Opinion",
      message: "Are you sure you want to permanently delete this opinion column?",
      onConfirm: async () => {
        const response = await fetch(`/api/opinions/delete/${id}`, { method: "POST" });
        if (response.ok) {
          triggerToast("Opinion entry removed.");
          fetchOpinions();
        }
        setDeleteConfirm(null);
      }
    });
  };

  // EVENTS ACTIONS
  const handleStartEditEvent = (item: any) => {
    setEventForm({
      titleEn: item.titleEn,
      titleMl: item.titleMl,
      date: item.date,
      time: item.time || "",
      locationEn: item.locationEn,
      locationMl: item.locationMl,
      descriptionEn: item.descriptionEn || "",
      descriptionMl: item.descriptionMl || ""
    });
    setEditingId(item.id);
    setEditingType("events");
    triggerToast("✏️ Loaded event details for editing.");
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const translatedEvent = await performAutoTranslationForForm(eventForm, setEventForm, [
      { en: "titleEn", ml: "titleMl" },
      { en: "locationEn", ml: "locationMl" },
      { en: "descriptionEn", ml: "descriptionMl" }
    ]);
    if (!translatedEvent.titleEn || !translatedEvent.titleMl || !translatedEvent.date || !translatedEvent.locationEn) {
      alert("Please provide at least Name, Date and Location!");
      return;
    }

    const isEdit = typeof editingId === "string" && editingType === "events";
    const url = isEdit ? `/api/events/${editingId}` : "/api/events";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(translatedEvent)
    });
    if (response.ok) {
      triggerToast(isEdit ? "Community event updated successfully." : "Community event scheduled successfully.");
      setEventForm({ titleEn: "", titleMl: "", date: "", time: "", locationEn: "", locationMl: "", descriptionEn: "", descriptionMl: "" });
      setEditingId(null);
      setEditingType(null);
      fetchEvents();
    }
  };

  const handleDeleteEvent = async (id: string) => {
    setDeleteConfirm({
      id,
      type: "events",
      title: "Cancel Event",
      message: "Are you sure you want to permanently delete/cancel this community event?",
      onConfirm: async () => {
        const response = await fetch(`/api/events/${id}`, { method: "DELETE" });
        if (response.ok) {
          triggerToast("Event removed.");
          fetchEvents();
        }
        setDeleteConfirm(null);
      }
    });
  };

  // EXPLORE DESTINATIONS ACTIONS
  const handleStartEditDestination = (item: any) => {
    setDestForm({
      nameEn: item.nameEn,
      nameMl: item.nameMl,
      locationEn: item.locationEn,
      locationMl: item.locationMl,
      image: item.image || "",
      descriptionEn: item.descriptionEn || "",
      descriptionMl: item.descriptionMl || "",
      highlightsEn: Array.isArray(item.highlightsEn) ? item.highlightsEn.join(", ") : (item.highlightsEn || ""),
      highlightsMl: Array.isArray(item.highlightsMl) ? item.highlightsMl.join(", ") : (item.highlightsMl || "")
    });
    setEditingId(item.id);
    setEditingType("destinations");
    setDestImgSourceMode("url");
    triggerToast("✏️ Loaded destination for editing.");
  };

  const handleCreateDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    const translatedDestForm = await performAutoTranslationForForm(destForm, setDestForm, [
      { en: "nameEn", ml: "nameMl" },
      { en: "locationEn", ml: "locationMl" },
      { en: "descriptionEn", ml: "descriptionMl" },
      { en: "highlightsEn", ml: "highlightsMl" }
    ]);

    const highlightsEnArr = translatedDestForm.highlightsEn.split(",").map(x => x.trim()).filter(Boolean);
    const highlightsMlArr = translatedDestForm.highlightsMl.split(",").map(x => x.trim()).filter(Boolean);
    
    const isEdit = typeof editingId === "string" && editingType === "destinations";
    const url = isEdit ? `/api/destinations/${editingId}` : "/api/destinations";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...translatedDestForm,
        highlightsEn: highlightsEnArr,
        highlightsMl: highlightsMlArr
      })
    });
    if (response.ok) {
      triggerToast(isEdit ? "Tourist destination updated!" : "New Tourist destination added!");
      setDestForm({ nameEn: "", nameMl: "", locationEn: "", locationMl: "", image: "", descriptionEn: "", descriptionMl: "", highlightsEn: "", highlightsMl: "" });
      setEditingId(null);
      setEditingType(null);
      fetchExploreDestinations();
    }
  };

  const handleDeleteDestination = async (id: string) => {
    setDeleteConfirm({
      id,
      type: "destinations",
      title: "Delete Destination",
      message: "Are you sure you want to permanently delete this destination listing?",
      onConfirm: async () => {
        const response = await fetch(`/api/destinations/${id}`, { method: "DELETE" });
        if (response.ok) {
          triggerToast("Destination removed from Explore list.");
          fetchExploreDestinations();
        }
        setDeleteConfirm(null);
      }
    });
  };

  // EXPLORE CULTURE ACTIONS
  const handleStartEditCulture = (item: any) => {
    setCultureForm({
      type: item.type || "culture",
      titleEn: item.titleEn,
      titleMl: item.titleMl,
      subtitleEn: item.subtitleEn || "",
      subtitleMl: item.subtitleMl || "",
      image: item.image || "",
      descEn: item.descEn || "",
      descMl: item.descMl || "",
      elementEn: item.elementEn || "",
      elementMl: item.elementMl || ""
    });
    setEditingId(item.id);
    setEditingType("cultures");
    setCultureImgSourceMode("url");
    triggerToast("✏️ Loaded culture item for editing.");
  };

  const handleCreateCulture = async (e: React.FormEvent) => {
    e.preventDefault();
    const translatedCulture = await performAutoTranslationForForm(cultureForm, setCultureForm, [
      { en: "titleEn", ml: "titleMl" },
      { en: "subtitleEn", ml: "subtitleMl" },
      { en: "descEn", ml: "descMl" },
      { en: "elementEn", ml: "elementMl" }
    ]);

    const isEdit = typeof editingId === "string" && editingType === "cultures";
    const url = isEdit ? `/api/cultures/${editingId}` : "/api/cultures";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(translatedCulture)
    });
    if (response.ok) {
      triggerToast(isEdit ? "Culture item updated!" : "Culture item added!");
      setCultureForm({ type: "culture", titleEn: "", titleMl: "", subtitleEn: "", subtitleMl: "", image: "", descEn: "", descMl: "", elementEn: "", elementMl: "" });
      setEditingId(null);
      setEditingType(null);
      fetchExploreCultures();
    }
  };

  const handleDeleteCulture = async (id: string) => {
    setDeleteConfirm({
      id,
      type: "cultures",
      title: "Delete Culture Item",
      message: "Are you sure you want to permanently delete this heritage/culture card?",
      onConfirm: async () => {
        const response = await fetch(`/api/cultures/${id}`, { method: "DELETE" });
        if (response.ok) {
          triggerToast("Culture removed.");
          fetchExploreCultures();
        }
        setDeleteConfirm(null);
      }
    });
  };

  // EXPLORE STAYS ACTIONS
  const handleStartEditStay = (item: any) => {
    setStayForm({
      nameEn: item.nameEn,
      nameMl: item.nameMl,
      typeEn: item.typeEn || "",
      typeMl: item.typeMl || "",
      locationEn: item.locationEn,
      locationMl: item.locationMl,
      image: item.image || "",
      priceEn: item.priceEn || "",
      priceMl: item.priceMl || "",
      featuresEn: Array.isArray(item.featuresEn) ? item.featuresEn.join(", ") : (item.featuresEn || ""),
      featuresMl: Array.isArray(item.featuresMl) ? item.featuresMl.join(", ") : (item.featuresMl || "")
    });
    setEditingId(item.id);
    setEditingType("stays");
    setStayImgSourceMode("url");
    triggerToast("✏️ Loaded stay lodging listing for editing.");
  };

  const handleCreateStay = async (e: React.FormEvent) => {
    e.preventDefault();
    const translatedStay = await performAutoTranslationForForm(stayForm, setStayForm, [
      { en: "nameEn", ml: "nameMl" },
      { en: "typeEn", ml: "typeMl" },
      { en: "locationEn", ml: "locationMl" },
      { en: "priceEn", ml: "priceMl" },
      { en: "featuresEn", ml: "featuresMl" }
    ]);
    const featsEn = translatedStay.featuresEn.split(",").map(x => x.trim()).filter(Boolean);
    const featsMl = translatedStay.featuresMl.split(",").map(x => x.trim()).filter(Boolean);

    const isEdit = typeof editingId === "string" && editingType === "stays";
    const url = isEdit ? `/api/stays/${editingId}` : "/api/stays";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...translatedStay,
        featuresEn: featsEn,
        featuresMl: featsMl
      })
    });
    if (response.ok) {
      triggerToast(isEdit ? "Lodging option updated!" : "Nature lodging option saved!");
      setStayForm({ nameEn: "", nameMl: "", typeEn: "", typeMl: "", locationEn: "", locationMl: "", image: "", priceEn: "", priceMl: "", featuresEn: "", featuresMl: "" });
      setEditingId(null);
      setEditingType(null);
      fetchExploreStays();
    }
  };

  const handleDeleteStay = async (id: string) => {
    setDeleteConfirm({
      id,
      type: "stays",
      title: "Delete Lodging Option",
      message: "Are you sure you want to permanently delete this lodging/stay listing?",
      onConfirm: async () => {
        const response = await fetch(`/api/stays/${id}`, { method: "DELETE" });
        if (response.ok) {
          triggerToast("Stay option deleted.");
          fetchExploreStays();
        }
        setDeleteConfirm(null);
      }
    });
  };

  // EXPLORE TRAVELOGUES ACTIONS
  const handleStartEditTravelogue = (item: any) => {
    setTravelogueForm({
      titleEn: item.titleEn,
      titleMl: item.titleMl,
      authorEn: item.authorEn || "",
      authorMl: item.authorMl || "",
      date: item.date || "June 2026",
      snippetEn: item.snippetEn || "",
      snippetMl: item.snippetMl || "",
      readTimeEn: item.readTimeEn || "5 min read",
      readTimeMl: item.readTimeMl || "5 മിനുട്ട് വായന"
    });
    setEditingId(item.id);
    setEditingType("travelogues");
    triggerToast("✏️ Loaded travelogue details for editing.");
  };

  const handleCreateTravelogue = async (e: React.FormEvent) => {
    e.preventDefault();
    const translatedTravelogue = await performAutoTranslationForForm(travelogueForm, setTravelogueForm, [
      { en: "titleEn", ml: "titleMl" },
      { en: "authorEn", ml: "authorMl" },
      { en: "snippetEn", ml: "snippetMl" },
      { en: "readTimeEn", ml: "readTimeMl" }
    ]);

    const isEdit = typeof editingId === "string" && editingType === "travelogues";
    const url = isEdit ? `/api/travelogues/${editingId}` : "/api/travelogues";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(translatedTravelogue)
    });
    if (response.ok) {
      triggerToast(isEdit ? "Travelogue narrative updated!" : "Travelogue narrative shared!");
      setTravelogueForm({ titleEn: "", titleMl: "", authorEn: "", authorMl: "", date: "June 2026", snippetEn: "", snippetMl: "", readTimeEn: "5 min read", readTimeMl: "5 മിനുട്ട് വായന" });
      setEditingId(null);
      setEditingType(null);
      fetchExploreTravelogues();
    }
  };

  const handleDeleteTravelogue = async (id: string) => {
    setDeleteConfirm({
      id,
      type: "travelogues",
      title: "Remove Travelogue",
      message: "Are you sure you want to permanently delete this travelogue narrations snippet?",
      onConfirm: async () => {
        const response = await fetch(`/api/travelogues/${id}`, { method: "DELETE" });
        if (response.ok) {
          triggerToast("Travelogue deleted.");
          fetchExploreTravelogues();
        }
        setDeleteConfirm(null);
      }
    });
  };

  // EXPLORE PHOTOS ACTIONS
  const handleStartEditPhoto = (item: any) => {
    setPhotoForm({
      url: item.url,
      titleEn: item.titleEn,
      titleMl: item.titleMl,
      descEn: item.descEn || "",
      descMl: item.descMl || ""
    });
    setEditingId(item.id);
    setEditingType("photos");
    triggerToast("✏️ Loaded photo details for editing.");
  };

  const handleCreatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    const translatedPhoto = await performAutoTranslationForForm(photoForm, setPhotoForm, [
      { en: "titleEn", ml: "titleMl" },
      { en: "descEn", ml: "descMl" }
    ]);

    const isEdit = typeof editingId === "string" && editingType === "photos";
    const url = isEdit ? `/api/photos/${editingId}` : "/api/photos";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(translatedPhoto)
    });
    if (response.ok) {
      triggerToast(isEdit ? "Gallery frame updated!" : "Gallery frame registered!");
      setPhotoForm({ url: "", titleEn: "", titleMl: "", descEn: "", descMl: "" });
      setEditingId(null);
      setEditingType(null);
      fetchExplorePhotos();
    }
  };

  const handleDeletePhoto = async (id: string) => {
    setDeleteConfirm({
      id,
      type: "photos",
      title: "Delete Gallery Photo",
      message: "Are you sure you want to permanently delete this gallery photo frame?",
      onConfirm: async () => {
        const response = await fetch(`/api/photos/${id}`, { method: "DELETE" });
        if (response.ok) {
          triggerToast("Frame deleted.");
          fetchExplorePhotos();
        }
        setDeleteConfirm(null);
      }
    });
  };

  // BUS ROUTE TIMINGS ACTIONS
  const handleStartEditBusRoute = (item: any) => {
    setBusForm({
      routeEn: item.routeEn,
      routeMl: item.routeMl,
      type: item.type || "KSRTC",
      busTypeEn: item.busTypeEn || "",
      busTypeMl: item.busTypeMl || "",
      runsEn: item.runsEn || "Daily Line",
      runsMl: item.runsMl || "എല്ലാ ദിവസവും",
      frequencyEn: item.frequencyEn || "",
      frequencyMl: item.frequencyMl || "",
      timingsEn: item.timingsEn || "",
      timingsMl: item.timingsMl || "",
      privateBusName: item.privateBusName || ""
    });
    setBusTransitList(item.list || []);
    setEditingId(item.id);
    setEditingType("busroutes");
    triggerToast("✏️ Loaded bus route scheduling into designer board.");
  };

  const handleAddTransitStop = () => {
    if (!transitInput.time || !transitInput.typeEn || !transitInput.typeMl) {
      alert("Transit stop requires Time, Service type, and Via stops info.");
      return;
    }
    setBusTransitList(prev => [...prev, { ...transitInput }]);
    setTransitInput({ time: "", typeEn: "", typeMl: "", viaCodeEn: "", viaCodeMl: "" });
  };

  const handleCreateBusRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busTransitList.length === 0) {
      alert("Please add at least one schedule transit stop timing on the route list.");
      return;
    }
    const translatedBus = await performAutoTranslationForForm(busForm, setBusForm, [
      { en: "routeEn", ml: "routeMl" },
      { en: "busTypeEn", ml: "busTypeMl" },
      { en: "runsEn", ml: "runsMl" },
      { en: "frequencyEn", ml: "frequencyMl" },
      { en: "timingsEn", ml: "timingsMl" }
    ]);

    const isEdit = typeof editingId === "string" && editingType === "busroutes";
    const url = isEdit ? `/api/busroutes/${editingId}` : "/api/busroutes";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...translatedBus,
        list: busTransitList
      })
    });
    if (response.ok) {
      triggerToast(isEdit ? "Trans-valley bus timetable updated!" : "Trans-valley bus timetable registered!");
      setBusForm({ routeEn: "", routeMl: "", type: "KSRTC", busTypeEn: "", busTypeMl: "", runsEn: "Daily Line", runsMl: "എല്ലാ ദിവസവും", frequencyEn: "", frequencyMl: "", timingsEn: "", timingsMl: "", privateBusName: "" });
      setBusTransitList([]);
      setEditingId(null);
      setEditingType(null);
      fetchBusRoutes();
    }
  };

  const handleDeleteBusRoute = async (id: string) => {
    setDeleteConfirm({
      id,
      type: "busroutes",
      title: "Remove Bus Timetable",
      message: "Are you sure you want to suspend this route transit schedule from public timetables?",
      onConfirm: async () => {
        const response = await fetch(`/api/busroutes/${id}`, { method: "DELETE" });
        if (response.ok) {
          triggerToast("Route timetable removed.");
          fetchBusRoutes();
        }
        setDeleteConfirm(null);
      }
    });
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.routeEn && !routeForm.routeMl) {
      alert("Please provide at least one route description.");
      return;
    }
    const translated = await performAutoTranslationForForm(routeForm, setRouteForm, [
      { en: "routeEn", ml: "routeMl" }
    ]);

    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(translated)
      });
      if (response.ok) {
        triggerToast("🗺️ Route added to independent registry!");
        setRouteForm({ routeEn: "", routeMl: "" });
        fetchRoutes();
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error saving route to registry.");
    }
  };

  const handleDeleteRoute = async (id: string) => {
    setDeleteConfirm({
      id,
      type: "routes",
      title: "Remove Registered Route",
      message: "Are you sure you want to delete this route? Disconnecting it will not affect already registered schedules, but future entries won't find it.",
      onConfirm: async () => {
        const response = await fetch(`/api/routes/${id}`, { method: "DELETE" });
        if (response.ok) {
          triggerToast("Route deleted from registry.");
          fetchRoutes();
        }
        setDeleteConfirm(null);
      }
    });
  };

  // DIRECTORY ACTIONS
  const handleStartEditDirectory = (item: any) => {
    setDirForm({
      nameEn: item.nameEn,
      nameMl: item.nameMl,
      category: item.category || "hospital",
      contact: item.contact || "",
      locationEn: item.locationEn || "Attappadi",
      locationMl: item.locationMl || "അട്ടപ്പാടി"
    });
    setEditingId(item.id);
    setEditingType("directory");
    triggerToast("✏️ Loaded directory details for editing.");
  };

  const handleCreateDirectory = async (e: React.FormEvent) => {
    e.preventDefault();
    const translatedDir = await performAutoTranslationForForm(dirForm, setDirForm, [
      { en: "nameEn", ml: "nameMl" },
      { en: "locationEn", ml: "locationMl" }
    ]);

    const isEdit = typeof editingId === "string" && editingType === "directory";
    const url = isEdit ? `/api/directory/${editingId}` : "/api/directory";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(translatedDir)
    });
    if (response.ok) {
      triggerToast(isEdit ? "Local business phone listing updated!" : "Local business phone listing saved!");
      setDirForm({ nameEn: "", nameMl: "", category: "hospital", contact: "", locationEn: "Attappadi", locationMl: "അട്ടപ്പാടി" });
      setEditingId(null);
      setEditingType(null);
      fetchDirectory();
    }
  };

  const handleDeleteDirectory = async (id: string) => {
    setDeleteConfirm({
      id,
      type: "directory",
      title: "Remove Listing",
      message: "Are you sure you want to permanently delete this local directory element?",
      onConfirm: async () => {
        const response = await fetch(`/api/directory/${id}`, { method: "DELETE" });
        if (response.ok) {
          triggerToast("Directory entry removed.");
          fetchDirectory();
        }
        setDeleteConfirm(null);
      }
    });
  };

  // EMERGENCY ACTIONS
  const handleStartEditEmergency = (item: any) => {
    setEmergForm({
      nameEn: item.nameEn,
      nameMl: item.nameMl,
      number: item.number || "",
      type: item.type || "hospital"
    });
    setEditingId(item.id);
    setEditingType("emergency");
    triggerToast("✏️ Loaded hotline details for editing.");
  };

  const handleCreateEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    const translatedEmerg = await performAutoTranslationForForm(emergForm, setEmergForm, [
      { en: "nameEn", ml: "nameMl" }
    ]);

    const isEdit = typeof editingId === "string" && editingType === "emergency";
    const url = isEdit ? `/api/emergency/${editingId}` : "/api/emergency";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(translatedEmerg)
    });
    if (response.ok) {
      triggerToast(isEdit ? "Critical hazard contact updated." : "Critical hazard contact saved.");
      setEmergForm({ nameEn: "", nameMl: "", number: "", type: "hospital" });
      setEditingId(null);
      setEditingType(null);
      fetchEmergency();
    }
  };

  const handleDeleteEmergency = async (id: string) => {
    setDeleteConfirm({
      id,
      type: "emergency",
      title: "Remove Emergency Line",
      message: "Are you sure you want to permanently delete this critical safety/rescue hotline?",
      onConfirm: async () => {
        const response = await fetch(`/api/emergency/${id}`, { method: "DELETE" });
        if (response.ok) {
          triggerToast("Critical line removed.");
          fetchEmergency();
        }
        setDeleteConfirm(null);
      }
    });
  };

  // NOTICES ACTIONS
  const handleStartEditNotice = (item: any) => {
    setNoticeForm({
      titleEn: item.titleEn,
      titleMl: item.titleMl,
      contentEn: item.contentEn || "",
      contentMl: item.contentMl || "",
      type: item.type || "notice",
      severity: item.severity || "medium",
      date: item.date || new Date().toISOString().split("T")[0],
      active: item.active !== false,
      image: item.image || ""
    });
    setEditingId(item.id);
    setEditingType("notice");
    triggerToast("✏️ Loaded notice details for editing.");
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    const translatedNotice = await performAutoTranslationForForm(noticeForm, setNoticeForm, [
      { en: "titleEn", ml: "titleMl" },
      { en: "contentEn", ml: "contentMl" }
    ]);

    const isEdit = typeof editingId === "string" && editingType === "notice";
    const url = isEdit ? `/api/notices/${editingId}` : "/api/notices";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(translatedNotice)
    });
    if (response.ok) {
      triggerToast(isEdit ? "Notice details updated successfully." : "New announcement notice published.");
      setNoticeForm({ titleEn: "", titleMl: "", contentEn: "", contentMl: "", type: "notice", severity: "medium", date: "", active: true, image: "" });
      setEditingId(null);
      setEditingType(null);
      fetchNotices();
    }
  };

  const handleDeleteNotice = async (id: string) => {
    setDeleteConfirm({
      id,
      type: "notice",
      title: "Delete Notice Announcement",
      message: "Are you sure you want to permanently delete this notice? This action is irreversible.",
      onConfirm: async () => {
        const response = await fetch(`/api/notices/${id}`, { method: "DELETE" });
        if (response.ok) {
          triggerToast("Notice announcement deleted.");
          fetchNotices();
        }
        setDeleteConfirm(null);
      }
    });
  };

  // ==================== CUSTOM TICKER CONTROL HANDLERS ====================
  const handleQuickCreateBreaking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBreakingForm.titleEn && !quickBreakingForm.titleMl) {
      triggerToast("⚠️ Please provide at least one title field.");
      return;
    }
    
    let translatedForm = { ...quickBreakingForm };
    if (quickBreakingForm.titleEn && !quickBreakingForm.titleMl) {
      const mlRes = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: quickBreakingForm.titleEn, targetLang: "ml" })
      });
      if (mlRes.ok) {
        const tr = await mlRes.json();
        translatedForm.titleMl = tr.translatedText;
      }
    } else if (quickBreakingForm.titleMl && !quickBreakingForm.titleEn) {
      const enRes = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: quickBreakingForm.titleMl, targetLang: "en" })
      });
      if (enRes.ok) {
        const tr = await enRes.json();
        translatedForm.titleEn = tr.translatedText;
      }
    }

    const payload = {
      titleEn: translatedForm.titleEn || "Breaking Alert",
      titleMl: translatedForm.titleMl || "ബ്രേക്കിംഗ് വാർത്ത",
      contentEn: "Urgent Live Ticker Alert",
      contentMl: "അടിയന്തിര തത്സമയ അലേർട്ട്",
      category: "breaking",
      regions: [],
      image: "",
      isSlide: false,
      isCard: false
    };

    const res = await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      triggerToast("🔴 New Breaking Ticker item published live!");
      setQuickBreakingForm({ titleEn: "", titleMl: "" });
      fetchNews();
    }
  };

  const handleToggleNewsBreaking = async (item: NewsPost, makeBreaking: boolean) => {
    const payload = {
      titleEn: item.titleEn,
      titleMl: item.titleMl,
      contentEn: item.contentEn || "",
      contentMl: item.contentMl || "",
      category: makeBreaking ? "breaking" : "latest",
      regions: item.regions || [],
      image: item.image || "",
      isSlide: !!item.isSlide,
      isCard: item.isCard !== undefined ? !!item.isCard : true
    };

    const res = await fetch(`/api/news/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      triggerToast(makeBreaking ? "⚡ Item is now scrolling on Breaking Ticker" : "🛑 Item removed from Breaking Ticker");
      fetchNews();
    }
  };

  const handleQuickCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoticeForm.titleEn && !quickNoticeForm.titleMl) {
      triggerToast("⚠️ Please provide at least one title field.");
      return;
    }

    let translatedForm = { ...quickNoticeForm };
    if (quickNoticeForm.titleEn && !quickNoticeForm.titleMl) {
      const mlRes = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: quickNoticeForm.titleEn, targetLang: "ml" })
      });
      if (mlRes.ok) {
        const tr = await mlRes.json();
        translatedForm.titleMl = tr.translatedText;
      }
    } else if (quickNoticeForm.titleMl && !quickNoticeForm.titleEn) {
      const enRes = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: quickNoticeForm.titleMl, targetLang: "en" })
      });
      if (enRes.ok) {
        const tr = await enRes.json();
        translatedForm.titleEn = tr.translatedText;
      }
    }

    if (quickNoticeForm.contentEn && !quickNoticeForm.contentMl) {
      const mlRes = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: quickNoticeForm.contentEn, targetLang: "ml" })
      });
      if (mlRes.ok) {
        const tr = await mlRes.json();
        translatedForm.contentMl = tr.translatedText;
      }
    } else if (quickNoticeForm.contentMl && !quickNoticeForm.contentEn) {
      const enRes = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: quickNoticeForm.contentMl, targetLang: "en" })
      });
      if (enRes.ok) {
        const tr = await enRes.json();
        translatedForm.contentEn = tr.translatedText;
      }
    }

    const res = await fetch("/api/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...translatedForm,
        titleEn: translatedForm.titleEn || "Notice Alert",
        titleMl: translatedForm.titleMl || "അറിയിപ്പ്",
        contentEn: translatedForm.contentEn || "Official Notice Details",
        contentMl: translatedForm.contentMl || "ഔദ്യോഗിക അറിയിപ്പ് വിവരങ്ങൾ"
      })
    });

    if (res.ok) {
      triggerToast("📢 New Notice ticker announcement published live!");
      setQuickNoticeForm({
        titleEn: "",
        titleMl: "",
        contentEn: "",
        contentMl: "",
        type: "notice",
        severity: "medium",
        date: new Date().toISOString().split("T")[0],
        active: true,
        image: ""
      });
      fetchNotices();
    }
  };

  const handleToggleNoticeActiveState = async (item: NoticeItem, activeState: boolean) => {
    const payload = {
      titleEn: item.titleEn,
      titleMl: item.titleMl,
      contentEn: item.contentEn || "",
      contentMl: item.contentMl || "",
      type: item.type || "notice",
      severity: item.severity || "medium",
      date: item.date || "",
      active: activeState,
      image: item.image || ""
    };

    const res = await fetch(`/api/notices/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      triggerToast(activeState ? "📢 Notice is now active on Announcements Ticker" : "🛑 Notice is now hidden/inactive");
      fetchNotices();
    }
  };

  // LPG ACTIONS
  const handleStartEditLpg = (item: any) => {
    setLpgForm({
      agencyNameEn: item.agencyNameEn,
      agencyNameMl: item.agencyNameMl,
      areasEn: item.areasEn || "",
      areasMl: item.areasMl || "",
      date: item.date || "",
      statusEn: item.statusEn || "Delivering Today",
      statusMl: item.statusMl || "ഇന്ന് വിതരണമുണ്ട്",
      contact: item.contact || "",
      notesEn: item.notesEn || "",
      notesMl: item.notesMl || ""
    });
    setEditingId(item.id);
    setEditingType("lpg");
    triggerToast("✏️ Loaded LPG schedule details for editing.");
  };

  const handleCreateLpg = async (e: React.FormEvent) => {
    e.preventDefault();
    const translatedLpg = await performAutoTranslationForForm(lpgForm, setLpgForm, [
      { en: "agencyNameEn", ml: "agencyNameMl" },
      { en: "areasEn", ml: "areasMl" },
      { en: "notesEn", ml: "notesMl" }
    ]);

    const isEdit = typeof editingId === "string" && editingType === "lpg";
    const url = isEdit ? `/api/lpg/${editingId}` : "/api/lpg";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(translatedLpg)
    });
    if (response.ok) {
      triggerToast(isEdit ? "LPG schedule updated successfully." : "New LPG delivery schedule added.");
      setLpgForm({
        agencyNameEn: "",
        agencyNameMl: "",
        areasEn: "",
        areasMl: "",
        date: new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" }),
        statusEn: "Delivering Today",
        statusMl: "ഇന്ന് വിതരണമുണ്ട്",
        contact: "",
        notesEn: "",
        notesMl: ""
      });
      setEditingId(null);
      setEditingType(null);
      fetchLpg();
    }
  };

  const handleDeleteLpg = async (id: string) => {
    setDeleteConfirm({
      id,
      type: "lpg",
      title: "Delete LPG Delivery Schedule",
      message: "Are you sure you want to permanently delete this LPG routing schedule? This action is irreversible.",
      onConfirm: async () => {
        const response = await fetch(`/api/lpg/${id}`, { method: "DELETE" });
        if (response.ok) {
          triggerToast("LPG schedule deleted successfully.");
          fetchLpg();
        }
        setDeleteConfirm(null);
      }
    });
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4">
          <div className="flex justify-center">
            <span className="p-3 bg-[#ffe500] rounded-full text-slate-950 shadow-lg">
              <Lock className="w-8 h-8" />
            </span>
          </div>
          <h2 className="text-center font-serif text-3xl font-extrabold text-white">
            Attappadi Online Command Desk
          </h2>
          <p className="text-center text-xs text-slate-400">
            Secure Administrator verification portal.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-850 py-8 px-4 shadow-2xl rounded-lg sm:px-10 border border-slate-700/50">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-350">
                  Command Username
                </label>
                <div className="mt-1 relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 text-xs py-2.5 bg-slate-800 border border-slate-700 text-white rounded focus:ring-amber-400 focus:border-amber-400 focus:outline-hidden"
                    placeholder="e.g. admin"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-350">
                  Command Password
                </label>
                <div className="mt-1 relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 text-xs py-2.5 bg-slate-800 border border-slate-700 text-white rounded focus:ring-amber-400 focus:border-amber-400"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              {loginError && (
                <div className="rounded-md bg-red-900/30 p-3 border border-red-500/20 text-xs text-red-300">
                  {loginError}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs text-[#ffe500] hover:underline"
                >
                  ← Leave Command
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#ffe500] hover:bg-[#ffd500] text-slate-950 font-bold rounded text-xs transition duration-200 shadow-md hover:shadow-lg"
                >
                  Verify Administrator Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // MAIN AUTHENTICATED PANEL
  const standardTypes = getStandardBusTypes(busForm.type);
  const matchedOption = standardTypes.find(opt => 
    opt.labelEn.toLowerCase() === busForm.busTypeEn.toLowerCase() || 
    opt.value.toLowerCase() === busForm.busTypeEn.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row relative">
      
      {/* Toast Success Alert */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] bg-slate-900 text-emerald-400 border border-emerald-500 px-6 py-3.5 rounded-lg shadow-2xl flex items-center gap-3 text-xs font-bold"
          >
            <Check className="w-5 h-5 text-emerald-400" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Command Sidebar */}
      <aside className="w-full md:w-64 bg-[#0a3060] text-white shrink-0 flex flex-col justify-between shadow-xl">
        <div className="p-6">
          <div className="space-y-1">
            <span className="text-[10px] bg-red-650 tracking-wider text-white px-2 py-0.5 rounded font-extrabold uppercase">
              attappadi cms
            </span>
            <h1 className="text-xl font-serif font-extrabold tracking-tight">Command Desk</h1>
            <p className="text-[10px] text-blue-200">Session Verified En-US | Ml-IN</p>
          </div>

          {/* Navigation Items */}
          <nav className="mt-8 space-y-1">
            {[
              { id: "news", label: "📰 News (വാർത്തകൾ)" },
              { id: "tickers", label: "🔴 Scroll Tickers (ടിക്കർ കൺട്രോൾ)" },
              { id: "opinions", label: "✍️ Opinions & Columns" },
              { id: "events", label: "📅 Events Calendar" },
              { id: "explore", label: "🧭 Explore Attappadi" },
              { id: "buses", label: "🚌 Bus Timetable" },
              { id: "directory", label: "🗂️ Phone Directory" },
              { id: "emergency", label: "🚨 Emergency Numbers" },
              { id: "notices", label: "📢 Notices & Alerts (അറിയിപ്പുകൾ)" },
              { id: "lpg", label: "🚚 LPG Gas Delivery (ഗ്യാസ് വിതരണം)" },
              { id: "ads", label: "📢 Side Ads (പരസ്യങ്ങൾ)" },
              { id: "card-generator", label: "🎨 Social Card Maker (NEW)" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full text-left px-3 py-2.5 rounded text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  activeTab === item.id 
                    ? "bg-[#005689] text-[#ffe500] border-l-4 border-[#ffe500]" 
                    : "text-slate-250 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={onBack}
            className="w-full py-2 bg-[#005689] hover:bg-slate-900 text-[#ffe500] font-bold text-xs rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Command
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-800 hover:bg-red-700 text-white font-bold text-xs rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            🔐 Close Session (Logout)
          </button>
        </div>
      </aside>

      {/* Main CMS Work Canvas */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-gray-200 gap-4">
          <div>
            <h2 className="text-2xl font-serif font-black text-[#0a3060] capitalize">
              {activeTab} Management Module
            </h2>
            <p className="text-xs text-gray-500">Add, alter, approve, or purge system records live.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3.5 select-none shrink-0">
            {/* Auto-Translation Toggle Badge */}
            <div className="flex bg-amber-50 border border-amber-200/50 px-3 py-1.5 rounded-md gap-2 items-center text-slate-700 font-bold text-xs shadow-xs">
              <Sparkles className={`w-4 h-4 text-amber-500 shrink-0 ${activeLiveTranslationsCount > 0 ? "animate-spin" : ""}`} />
              <span>Gemini Translation:</span>
              <button
                type="button"
                onClick={() => setAutoTranslateOnSubmit(!autoTranslateOnSubmit)}
                className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded transition cursor-pointer ${
                  autoTranslateOnSubmit ? "bg-[#052962] text-white" : "bg-gray-300 text-gray-600"
                }`}
                title="When ON, typing in Malayalam or English automatically translates the missing language upon publishing!"
              >
                {autoTranslateOnSubmit ? "ON (സജീവം)" : "OFF (നിഷ്‌ക്രിയം)"}
              </button>
              {activeLiveTranslationsCount > 0 && (
                <span className="flex items-center gap-1 text-[9px] text-blue-800 animate-pulse font-mono font-black border-l pl-2 border-amber-250 shrink-0">
                  <span className="w-1.5 h-1.5 bg-blue-800 rounded-full animate-ping"></span>
                  TRANSLATING...
                </span>
              )}
            </div>
            <button 
              onClick={refreshAllLists}
              className="p-2 bg-white border rounded hover:bg-slate-50 text-slate-600 transition flex items-center gap-1 text-xs cursor-pointer shadow-xs"
            >
              🔄 Sync DB Status
            </button>
          </div>
        </header>

        {/* TAB CONTENTS */}
        
        {/* ==================== 1a. UNIFIED TICKERS CONTROL DESK ==================== */}
        {activeTab === "tickers" && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="border-b pb-4 bg-white p-5 rounded-xl shadow-xs border">
              <div>
                <span className="text-[10px] bg-red-650 text-white font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Real-time Display Center
                </span>
                <h2 className="font-serif font-extrabold text-[#052962] text-xl mt-1">
                  Scrolling Ticker Control Desk (സ്ക്രോളിങ് ടിക്കറുകൾ)
                </h2>
                <p className="text-[11.5px] text-slate-500 mt-1">
                  Manage the contents displaying on the two persistent scrolling banner strips at the very top of the homepage.
                </p>
              </div>

              {/* Status Visual Reference Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-[#c70000] text-white rounded-lg flex items-center justify-between shadow-2xs">
                  <div>
                    <h4 className="font-bold text-xs flex items-center gap-1">🔴 BREAKING NOW Ticker</h4>
                    <p className="text-[10px] text-red-100 mt-0.5">Displays urgent local alerts from the "Breaking News" post category.</p>
                  </div>
                  <span className="bg-white text-red-700 px-2 py-0.5 text-[9px] font-black rounded uppercase animate-ping">
                    Live
                  </span>
                </div>

                <div className="p-3 bg-[#f0fdf4] text-[#047857] border border-[#d1fae5] rounded-lg flex items-center justify-between shadow-2xs">
                  <div>
                    <h4 className="font-bold text-xs text-[#047857] flex items-center gap-1">📢 ANNOUNCEMENTS Ticker</h4>
                    <p className="text-[10px] text-emerald-800 dark:text-emerald-300 mt-0.5">Displays official notice alerts, administrative warnings, and bulletins.</p>
                  </div>
                  <span className="bg-emerald-600 text-white px-2 py-0.5 text-[9px] font-black rounded uppercase">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* ==================== PANEL A: BREAKING NEWS TICKER ==================== */}
              <div className="space-y-6">
                
                {/* A1. Quick Add Breaking Item */}
                <div className="bg-white p-5 rounded-xl border shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-red-700 text-sm border-b pb-2 flex items-center gap-2">
                    <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px]">🔴</span>
                    Quick Add Breaking Ticker Item
                  </h3>
                  
                  <form onSubmit={handleQuickCreateBreaking} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 font-semibold mb-0.5">Breaking Title (English)</label>
                        <input
                          type="text"
                          required={!quickBreakingForm.titleMl}
                          value={quickBreakingForm.titleEn}
                          onChange={(e) => setQuickBreakingForm({ ...quickBreakingForm, titleEn: e.target.value })}
                          className="w-full border rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-red-500"
                          placeholder="e.g. Traffic blocked on Mannarkkad road"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-semibold mb-0.5">ബ്രേക്കിംഗ് ഹെഡ്‌ലൈൻ (Malayalam)</label>
                        <input
                          type="text"
                          required={!quickBreakingForm.titleEn}
                          value={quickBreakingForm.titleMl}
                          onChange={(e) => setQuickBreakingForm({ ...quickBreakingForm, titleMl: e.target.value })}
                          className="w-full border rounded p-1.5 text-xs bg-white font-anek-malayalam focus:ring-1 focus:ring-red-500"
                          placeholder="ഉദാ: മണ്ണാർക്കാട് റോഡിൽ ഗതാഗതം തടസ്സപ്പെട്ടു"
                        />
                      </div>
                    </div>
                    <div className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded">
                      💡 Tip: Leave one title completely blank, and the system auto-translates it using Gemini AI instantly upon publishing!
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-xs rounded-lg shadow-xs hover:from-red-700 hover:to-red-800 cursor-pointer transition"
                    >
                      🚀 Publish Breaking Ticker Alert
                    </button>
                  </form>
                </div>

                {/* A2. Currently Scrolling Breaking Posts */}
                <div className="bg-white p-5 rounded-xl border shadow-xs space-y-3">
                  <h3 className="font-serif font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-1.5">
                    <span>🎬</span> Running Ticker Items ({newsList.filter(n => n.category === "breaking").length})
                  </h3>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {newsList.filter(n => n.category === "breaking").length === 0 ? (
                      <p className="text-slate-400 italic text-center py-4">No news articles with the "breaking" badge are currently scrolling.</p>
                    ) : (
                      newsList.filter(n => n.category === "breaking").map((item) => (
                        <div key={item.id} className="p-3 border-l-4 border-red-500 bg-slate-50 rounded-r-lg flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 truncate">{item.titleEn}</h4>
                            <p className="font-anek-malayalam text-gray-500 font-bold truncate mt-0.5">{item.titleMl}</p>
                            <span className="text-[9px] text-slate-400 block mt-1">{new Date(item.publishedAt).toLocaleDateString()}</span>
                          </div>
                          <button
                            onClick={() => handleToggleNewsBreaking(item, false)}
                            className="px-2 py-1 bg-white border border-red-200 text-red-650 hover:bg-red-50 rounded font-bold text-[10px] shrink-0 cursor-pointer transition shadow-2xs"
                          >
                            🛑 Stop Ticker
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* A3. Quick Upgrade standard post */}
                <div className="bg-white p-5 rounded-xl border shadow-xs space-y-3">
                  <h3 className="font-serif font-bold text-slate-700 text-sm border-b pb-2">
                    ⚡ Fast Upgrade Standard News Post to Ticker
                  </h3>
                  <p className="text-[10px] text-slate-450">Select a recently published standard news article to push onto the live top breaking banner instantly.</p>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {newsList.filter(n => n.category !== "breaking").slice(0, 7).map((item) => (
                      <div key={item.id} className="p-2.5 border rounded bg-slate-50/65 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-750 truncate">{item.titleEn}</h4>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 rounded uppercase mt-1 inline-block">{item.category}</span>
                        </div>
                        <button
                          onClick={() => handleToggleNewsBreaking(item, true)}
                          className="px-2.5 py-1 bg-white border text-emerald-700 hover:bg-emerald-50 rounded font-black text-[10px] shrink-0 cursor-pointer transition shadow-3xs"
                        >
                          ⚡ Add to Ticker
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* ==================== PANEL B: ANNOUNCEMENTS TICKER ==================== */}
              <div className="space-y-6">
                
                {/* B1. Quick Add Notice / Warning Item */}
                <div className="bg-white p-5 rounded-xl border shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-emerald-800 text-sm border-b pb-2 flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px]">📢</span>
                    Quick Add Official Notice Announcement
                  </h3>

                  <form onSubmit={handleQuickCreateNotice} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 font-semibold mb-0.5">Notice Title (English)</label>
                        <input
                          type="text"
                          required={!quickNoticeForm.titleMl}
                          value={quickNoticeForm.titleEn}
                          onChange={(e) => setQuickNoticeForm({ ...quickNoticeForm, titleEn: e.target.value })}
                          className="w-full border rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-emerald-500"
                          placeholder="e.g. Vaccination camp at Agali CHC"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-semibold mb-0.5">അറിയിപ്പ് വിഷയം (Malayalam)</label>
                        <input
                          type="text"
                          required={!quickNoticeForm.titleEn}
                          value={quickNoticeForm.titleMl}
                          onChange={(e) => setQuickNoticeForm({ ...quickNoticeForm, titleMl: e.target.value })}
                          className="w-full border rounded p-1.5 text-xs bg-white font-anek-malayalam focus:ring-1 focus:ring-emerald-500"
                          placeholder="ഉദാ: അഗളി സിഎച്ച്സിയിൽ വാക്സിനേഷൻ ക്യാമ്പ്"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 font-semibold mb-0.5">Alert Details / Details (English)</label>
                        <textarea
                          rows={2}
                          value={quickNoticeForm.contentEn}
                          onChange={(e) => setQuickNoticeForm({ ...quickNoticeForm, contentEn: e.target.value })}
                          className="w-full border rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-emerald-500"
                          placeholder="Times, locations, eligibility guidelines..."
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-semibold mb-0.5">അറിയിപ്പ് വിവരങ്ങൾ (Malayalam)</label>
                        <textarea
                          rows={2}
                          value={quickNoticeForm.contentMl}
                          onChange={(e) => setQuickNoticeForm({ ...quickNoticeForm, contentMl: e.target.value })}
                          className="w-full border rounded p-1.5 text-xs bg-white font-anek-malayalam focus:ring-1 focus:ring-emerald-500"
                          placeholder="സമയം, തീയതി, പങ്കെടുക്കേണ്ട നിയമങ്ങൾ..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 font-semibold mb-0.5">Notice Severity</label>
                        <select
                          value={quickNoticeForm.severity}
                          onChange={(e) => setQuickNoticeForm({ ...quickNoticeForm, severity: e.target.value })}
                          className="w-full border rounded p-1.5 text-xs bg-white cursor-pointer"
                        >
                          <option value="low">Standard Bulletin (കുറഞ്ഞ അറിയിപ്പ്)</option>
                          <option value="medium">Important Directive (പ്രധാനപ്പെട്ടത്)</option>
                          <option value="high">🚨 Urgent Warning / Caution (അടിയന്തിരം)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-0.5">Symbolic Prefix Type</label>
                        <select
                          value={quickNoticeForm.type}
                          onChange={(e) => setQuickNoticeForm({ ...quickNoticeForm, type: e.target.value })}
                          className="w-full border rounded p-1.5 text-xs bg-white cursor-pointer"
                        >
                          <option value="notice">📌 Standard Notice (സാധാരണ അറിയിപ്പ്)</option>
                          <option value="caution">⚠️ Warning / Caution (അപായക്കളി / ജാഗ്രത)</option>
                          <option value="attention">💥 Emergency Alert (അടിയന്തിര ജാഗ്രത)</option>
                        </select>
                      </div>
                    </div>

                    <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded">
                      💡 Tip: Leave either title or content translation blank and it will automatically translate into the missing language!
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-xs rounded-lg shadow-xs hover:from-emerald-700 hover:to-emerald-800 cursor-pointer transition"
                    >
                      🚀 Publish Announcement Ticker Alert
                    </button>
                  </form>
                </div>

                {/* B2. List of Official Notices / Alerts */}
                <div className="bg-white p-5 rounded-xl border shadow-xs space-y-3">
                  <h3 className="font-serif font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-1.5">
                    <span>📜</span> Active Announcements ({noticesList.length})
                  </h3>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {noticesList.length === 0 ? (
                      <p className="text-slate-400 italic text-center py-4">No admin notices published yet.</p>
                    ) : (
                      noticesList.map((item) => (
                        <div key={item.id} className={`p-3 border-l-4 rounded-r-lg flex items-center justify-between gap-4 bg-slate-50 ${item.active !== false ? "border-emerald-500 bg-emerald-50/10" : "border-slate-300"}`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {item.active !== false ? (
                                <span className="bg-emerald-600 text-white px-1.5 py-0.2 text-[8px] font-black rounded uppercase">Active</span>
                              ) : (
                                <span className="bg-slate-350 text-slate-600 px-1.5 py-0.2 text-[8px] font-bold rounded uppercase">Hidden</span>
                              )}
                              <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.1 rounded">{item.type}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 truncate mt-1">{item.titleEn}</h4>
                            <p className="font-anek-malayalam text-gray-500 font-bold truncate">{item.titleMl}</p>
                            <span className="text-[9px] text-slate-400 block mt-1">{item.date}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.active !== false ? (
                              <button
                                onClick={() => handleToggleNoticeActiveState(item, false)}
                                className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded font-bold text-[10px] cursor-pointer transition shadow-3xs"
                                title="Hide from scrolling banner"
                              >
                                Hide
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleNoticeActiveState(item, true)}
                                className="px-2 py-1 bg-[#047857]/10 text-[#047857] hover:bg-[#047857]/20 rounded font-bold text-[10px] cursor-pointer transition shadow-3xs"
                                title="Scroll on top banner"
                              >
                                Scroll
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotice(item.id)}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded cursor-pointer transition"
                              title="Delete announcement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ==================== 1. NEWS TAB ==================== */}
        {activeTab === "news" && (
          <div className="space-y-8 animate-fade-in text-xs">
            
            {/* Database Diagnostic & Sync Panel */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 border-gray-100 gap-2">
                <div>
                  <h3 className="font-serif font-black text-slate-800 text-sm flex items-center gap-2">
                    <Activity className={`w-4 h-4 ${dbDiagnostic.status === "connected" ? "text-emerald-500 animate-pulse" : "text-amber-500"}`} />
                    Database Integration & Sync Diagnostics
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Verify cloud connectivity and real-time syncing between server memory and Google Cloud Firestore.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={fetchDbDiagnostic}
                    className="px-2.5 py-1 bg-slate-50 border hover:bg-slate-100 text-slate-700 font-bold rounded text-[10px] transition cursor-pointer flex items-center gap-1"
                  >
                    🔄 Re-validate Connection
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left Column: Connection & Metadata */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Status Card */}
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-between h-28">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                        Connection Status
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        {dbDiagnostic.status === "loading" ? (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
                            <span className="font-bold text-slate-700 text-xs">Checking Connection...</span>
                          </>
                        ) : dbDiagnostic.status === "connected" ? (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="font-black text-emerald-700 text-xs uppercase tracking-wider">Cloud Connected</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            <span className="font-black text-amber-700 text-xs uppercase tracking-wider">Local Fallback Mode</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 text-[10px] text-gray-500 font-medium">
                      {dbDiagnostic.status === "connected" 
                        ? "Writing live to Google Cloud." 
                        : "Using local JSON backup. No external cloud sync."}
                    </div>
                  </div>

                  {/* Configuration Details */}
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-between h-28">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                        System Metadata
                      </span>
                      <div className="space-y-1 mt-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Database ID:</span>
                          <span className="font-mono text-slate-700 truncate max-w-[120px]" title={dbDiagnostic.databaseId}>
                            {dbDiagnostic.databaseId || "None"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Provider:</span>
                          <span className="text-slate-700 font-bold">
                            {dbDiagnostic.isUsingFirestore ? "Firestore" : "Local File"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500 truncate">
                      Platform: Google Cloud Run
                    </div>
                  </div>
                </div>

                {/* Right Column: Collection-level Diagnostics */}
                <div className="lg:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center border-b pb-2 border-gray-200">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                      Live Collection Diagnostics
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">Collections Tracked: 3</span>
                  </div>

                  <div className="space-y-3">
                    {(Object.entries(dbDiagnostic.collections || {}) as [string, { localCount: number; firestoreCount: number; status: string; error: string | null }][]).map(([key, col]) => {
                      // Visual indicators
                      let dotColor = "bg-gray-400";
                      let statusText = "Local/Unchecked";
                      let warningMessage = null;

                      if (dbDiagnostic.status === "connected") {
                        if (col.status === "healthy") {
                          dotColor = "bg-emerald-500 animate-pulse";
                          statusText = "Healthy & Synced";
                        } else if (col.status === "warning_empty") {
                          dotColor = "bg-amber-400 animate-pulse";
                          statusText = "Zero Records / Empty";
                          warningMessage = `No records found in the '${key}' collection. If records should be visible, verify Firestore security rules, connection roles, or read/write permissions for the '${key}' collection path.`;
                        } else if (col.status === "error") {
                          dotColor = "bg-red-500";
                          statusText = "Read Error / Locked";
                          warningMessage = `Failed to fetch '${key}' collection: ${col.error || "Permission Denied"}. This typically indicates a lack of query authorization, misconfigured collection roles, or locked Firestore security rules.`;
                        }
                      } else {
                        dotColor = "bg-slate-400";
                        statusText = "Local Cache Mode";
                      }

                      return (
                        <div key={key} className="bg-white border border-gray-200 rounded-lg p-3 space-y-2 hover:shadow-xs transition">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
                              <span className="font-serif font-black text-slate-800 text-xs capitalize">
                                '{key}' Collection
                              </span>
                            </div>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                              {statusText}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-[11px] pt-1">
                            <div className="border-r border-dashed border-gray-100">
                              <span className="text-gray-400 block text-[9px] uppercase tracking-wider font-extrabold">Local Cache count</span>
                              <span className="text-slate-700 font-bold text-xs">{col.localCount} records</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9px] uppercase tracking-wider font-extrabold">Cloud Firestore count</span>
                              <span className="text-slate-700 font-bold text-xs">
                                {dbDiagnostic.status === "connected" && col.status !== "error" 
                                  ? `${col.firestoreCount} records` 
                                  : "N/A"}
                              </span>
                            </div>
                          </div>

                          {warningMessage && (
                            <div className="mt-2 bg-amber-50/75 border border-amber-200/50 text-amber-800 text-[10px] p-2 rounded flex items-start gap-1.5 leading-relaxed">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-extrabold block">Contextual Database Alert:</span>
                                {warningMessage}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Error log expander if any */}
              {dbDiagnostic.errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200/50 rounded-lg text-[10.5px] text-red-700 font-mono mt-2">
                  <div className="font-bold flex items-center gap-1 mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    Last Connection Error Diagnostic Log:
                  </div>
                  <div className="bg-white p-2 rounded border border-red-100 break-words max-h-24 overflow-y-auto">
                    {dbDiagnostic.errorMessage}
                  </div>
                </div>
              )}
            </div>
            
            {/* AI assisted reporting desk block */}
            <section className="bg-amber-50 rounded-lg border border-amber-200 p-5 space-y-4">
              <h3 className="font-serif font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                AI Reporting Assistant (Gemini Smart journalist)
              </h3>
              <p className="text-[11px] text-slate-500">
                Type the topic headline or core clues. Gemini will draft cohesive paragraphs in both languages under standard news layout structure!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Article Headline Idea or Slag</label>
                  <input 
                    type="text" 
                    value={aiIdea}
                    onChange={(e) => setAiIdea(e.target.value)}
                    placeholder="e.g. Attappadi Block organizes millet food festival next monday" 
                    className="w-full bg-white border rounded p-2 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Core Facts Clues (Optional)</label>
                  <input 
                    type="text" 
                    value={aiPoints}
                    onChange={(e) => setAiPoints(e.target.value)}
                    placeholder="e.g. MLA will inaugurate, 15 tribal community self-help units participating, 10 millet varieties" 
                    className="w-full bg-white border rounded p-2 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={handleAIGenerateNews}
                  className="px-5 py-2 bg-slate-900 text-[#ffe500] font-black rounded hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {aiLoading ? "AI Reporter is typing draft..." : "✨ AI Compose Full News Story"}
                </button>
              </div>
            </section>

            {/* News composition Form */}
            <section className="bg-white rounded-lg shadow-xs p-6 space-y-4 border border-slate-200/50">
              <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-2 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#005689]" /> {editingId && editingType === "news" ? "Edit News Article" : "Publish Live News Article (വാർത്ത നൽകുക)"}
              </h3>

              {editingId && editingType === "news" && (
                <div className="bg-amber-50 border border-amber-200 text-amber-950 rounded p-3 text-xs flex items-center justify-between mb-2">
                  <span>✏️ You are currently editing article: <b>{newsForm.titleEn || "Untitled"}</b></span>
                  <button onClick={handleCancelEdit} type="button" className="text-amber-800 font-bold hover:underline py-0.5 px-2 bg-amber-100 hover:bg-amber-200 rounded flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Cancel Edit
                  </button>
                </div>
              )}

              <form onSubmit={handleCreateNews} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Category Group</label>
                    <select
                      value={newsForm.category}
                      onChange={(e) => setNewsForm({...newsForm, category: e.target.value as any})}
                      className="w-full border rounded p-2 focus:ring-1 focus:ring-[#005689] bg-white cursor-pointer"
                    >
                      <option value="breaking">Breaking News</option>
                      <option value="latest">Latest News</option>
                      <option value="updates">Updates List</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Layout Presentation Toggle</label>
                    <div className="flex items-center gap-4 pt-2.5">
                      <label className="inline-flex items-center gap-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newsForm.isSlide} 
                          onChange={(e) => setNewsForm({...newsForm, isSlide: e.target.checked})}
                          className="rounded text-[#052962]"
                        />
                        <span>Slide-carousel Showcase</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Geotagging Regions */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                  <span className="block text-xs font-bold text-[#0a3060] uppercase tracking-wider">Geotag News Regions (വാർത്താ മേഖലകൾ തരംതിരിക്കുക)</span>
                  <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                    {[
                      { key: "agali", name: "Agali (അഗളി)" },
                      { key: "mukkali", name: "Mukkali (മുക്കാലി)" },
                      { key: "thavalam", name: "Thavalam (താവളം)" },
                      { key: "kottathara", name: "Kottathara (കോട്ടത്തറ)" },
                      { key: "sholayur", name: "Sholayur (ഷോളയൂർ)" },
                      { key: "pudur", name: "Pudur (പുതൂർ)" },
                      { key: "anaikkatty", name: "Anaikatty (ആനക്കട്ടി)" },
                      { key: "jellippara", name: "Jellippara (ജെല്ലിപ്പാറ)" },
                      { key: "chittur", name: "Chittur (ചിറ്റൂർ)" }
                    ].map(reg => {
                      const isChecked = newsForm.regions?.includes(reg.key) || false;
                      return (
                        <label key={reg.key} className="inline-flex items-center gap-1.5 cursor-pointer text-xs select-none">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const currentRegs = newsForm.regions || [];
                              const updatedRegs = isChecked
                                ? currentRegs.filter(r => r !== reg.key)
                                : [...currentRegs, reg.key];
                              setNewsForm({ ...newsForm, regions: updatedRegs });
                            }}
                            className="rounded text-[#052962] cursor-pointer focus:ring-[#052962]"
                          />
                          <span className={isChecked ? "text-[#052962] font-black" : "text-slate-600 font-semibold"}>{reg.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Headline (English)</label>
                    <input 
                      type="text" 
                      value={newsForm.titleEn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewsForm({...newsForm, titleEn: val});
                        if (autoTranslateOnSubmit) {
                          autoTranslateField(val, "titleEn", "titleMl", setNewsForm, "ml");
                        }
                      }}
                      placeholder="Enter headline in English" 
                      className="w-full border rounded p-2 focus:ring-1 font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">മലയാളം വാർത്താ തലക്കെട്ട്</label>
                    <input 
                      type="text" 
                      value={newsForm.titleMl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewsForm({...newsForm, titleMl: val});
                        if (autoTranslateOnSubmit) {
                          autoTranslateField(val, "titleMl", "titleEn", setNewsForm, "en");
                        }
                      }}
                      placeholder="മലയാളത്തിൽ വാർത്ത നൽകുക" 
                      className="w-full border rounded p-2 focus:ring-1 font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* News Photo Upload Selection directly targeting local files */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/50 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#0a3060] uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#005689]" /> News Photo Selection (വാർത്ത ചിത്രം)
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setImgSourceMode("upload")}
                        className={`px-3 py-1 text-[10px] font-black rounded transition ${
                          imgSourceMode === "upload" 
                            ? "bg-[#0a3060] text-white" 
                            : "bg-white text-slate-650 border hover:bg-slate-100"
                        }`}
                      >
                        Upload Local File
                      </button>
                      <button
                        type="button"
                        onClick={() => setImgSourceMode("url")}
                        className={`px-3 py-1 text-[10px] font-black rounded transition ${
                          imgSourceMode === "url" 
                            ? "bg-[#0a3060] text-white" 
                            : "bg-white text-slate-650 border hover:bg-slate-100"
                        }`}
                      >
                        Provide Web Link URL
                      </button>
                    </div>
                  </div>

                  {imgSourceMode === "upload" ? (
                    <div 
                      className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center transition ${
                        isDragging ? "border-amber-400 bg-amber-50" : "border-slate-300 bg-white hover:bg-slate-50"
                      }`}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileProcess(f); }}
                    >
                      <Upload className="w-8 h-8 text-[#005689] shrink-0 mb-2 animate-bounce" />
                      <p className="text-[11px] font-bold text-slate-700">Drag & Drop photo here, or select click link</p>
                      <p className="text-[9px] text-slate-400 mt-1">JPEG/PNG/WebP format supported, up to 12MB size limit</p>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => { if (e.target.files?.[0]) handleFileProcess(e.target.files[0]); }}
                        className="mt-3 text-xs w-full max-w-xs block text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-[#0a3060]/10 file:text-[#0a3060] hover:file:bg-[#0a3060]/20 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div>
                      <input 
                        type="text" 
                        value={newsForm.image}
                        onChange={(e) => setNewsForm({...newsForm, image: e.target.value})}
                        placeholder="https://images.unsplash.com/photo-... or custom site link url" 
                        className="w-full border rounded p-2 focus:ring-1 focus:ring-[#005689]"
                      />
                    </div>
                  )}

                  {newsForm.image && (
                    <div className="flex items-center gap-3 bg-white p-2 rounded border border-slate-150">
                      <img 
                        src={newsForm.image} 
                        alt="News thumbnail preview" 
                        className="w-16 h-12 object-cover rounded border"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-0.5 truncate flex-1">
                        <p className="text-[10px] font-bold text-emerald-800 flex items-center gap-0.5">✓ Picture loaded ready</p>
                        <p className="text-[8px] text-slate-400 text-ellipsis overflow-hidden shrink-0 block">{newsForm.image.substring(0, 100)}...</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setNewsForm(prev => ({ ...prev, image: "" }))}
                        className="p-1 text-red-700 hover:bg-red-50 rounded"
                        title="Remove loaded image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* English Content Area */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-t border">
                    <span className="font-bold text-slate-700 font-mono">1. Article Content (English)</span>
                    <button
                      type="button"
                      onClick={() => handleTranslateBlock(newsForm.contentEn, "ml")}
                      className="px-2.5 py-1 bg-[#ffe500] text-slate-950 rounded font-black text-[9px] hover:bg-amber-400 transition"
                    >
                      🗣️ translate into Malayalam below
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={newsForm.contentEn}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewsForm({...newsForm, contentEn: val});
                      if (autoTranslateOnSubmit) {
                        autoTranslateField(val, "contentEn", "contentMl", setNewsForm, "ml");
                      }
                    }}
                    placeholder="Type news story in English..."
                    className="w-full border border-t-0 rounded-b p-2.5 focus:ring-1 focus:ring-[#005689] leading-relaxed"
                  />
                </div>

                {/* Malayalam Content Area */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-t border">
                    <span className="font-bold text-slate-700 font-mono">2. മാതൃക വിവരണം (മലയാളം ഭാഗം)</span>
                    <button
                      type="button"
                      onClick={() => handleTranslateBlock(newsForm.contentMl, "en")}
                      className="px-2.5 py-1 bg-slate-900 text-[#ffe500] rounded font-black text-[9px] hover:bg-slate-850 transition"
                    >
                      🗣️ translate into English above
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={newsForm.contentMl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewsForm({...newsForm, contentMl: val});
                      if (autoTranslateOnSubmit) {
                        autoTranslateField(val, "contentMl", "contentEn", setNewsForm, "en");
                      }
                    }}
                    placeholder="മലയാളം വാർത്ത ഉള്ളടക്കം നൽകുക..."
                    className="w-full border border-t-0 rounded-b p-2.5 focus:ring-1 focus:ring-[#005689] leading-relaxed font-anek-malayalam"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  {editingId && editingType === "news" && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-sm transition"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#0a3060] hover:bg-[#005689] text-white font-bold rounded text-sm transition shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-5 h-5 text-[#ffe500]" /> 
                    {editingId && editingType === "news" ? "Save Changes (സേവ് ചെയ്യുക)" : "Publish News Story (വാർത്ത പ്രസിദ്ധീകരിക്കുക)"}
                  </button>
                </div>
              </form>
            </section>

            {/* Published list */}
            <section className="bg-white rounded-lg shadow-xs p-6 space-y-4 border">
              <h3 className="font-serif font-bold text-[#0a3060] text-sm flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-[#005689]" /> Published News Articles ({newsList.length})
              </h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {newsList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No news articles published on database.</div>
                ) : (
                  newsList.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded border hover:border-slate-300 transition flex items-center gap-4">
                      <img 
                        src={item.image} 
                        alt="News listing item" 
                        className="w-16 h-12 object-cover rounded shrink-0 border bg-white"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 truncate space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-bold text-white bg-red-650 px-1.5 py-0.5 rounded uppercase">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-gray-400">{new Date(item.publishedAt).toLocaleDateString()} • {item.views || 0} views</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm truncate">{item.titleEn}</h4>
                        <p className="text-[10px] text-[#005689] truncate font-anek-malayalam font-bold">{item.titleMl}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEditNews(item)}
                          className="p-1.5 text-slate-800 bg-amber-100 hover:bg-amber-200 rounded transition"
                          title="Edit article"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(item.id)}
                          className="p-1.5 text-white bg-red-850 hover:bg-red-750 rounded transition"
                          title="Delete article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* ==================== 2. OPINIONS / COLUMNS TAB ==================== */}
        {activeTab === "opinions" && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Creator block */}
              <div className="bg-white rounded-lg p-6 border shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-2 flex items-center gap-1.5">
                  <PlusCircle className="w-5 h-5 text-[#005689]" /> {editingId && editingType === "opinions" ? "Edit Opinion Column" : "Publish Expert Column / Opinion"}
                </h3>

                {editingId && editingType === "opinions" && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-950 rounded p-3 text-xs flex items-center justify-between">
                    <span>✏️ You are currently editing column by: <b>{opinionForm.authorName || "Someone"}</b></span>
                    <button onClick={handleCancelEdit} type="button" className="text-amber-800 font-bold hover:underline py-0.5 px-2 bg-amber-100 hover:bg-amber-200 rounded flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Cancel Edit
                    </button>
                  </div>
                )}

                <form onSubmit={handleCreateOpinion} className="space-y-3.5">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Author Name / Expert credentials</label>
                    <input 
                      type="text" 
                      value={opinionForm.authorName}
                      onChange={(e) => setOpinionForm({...opinionForm, authorName: e.target.value})}
                      placeholder="e.g. Fayis Mohammed, Local Historian"
                      className="w-full border rounded p-1.5 focus:ring-1 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Column Title (En)</label>
                      <input 
                        type="text" 
                        value={opinionForm.titleEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOpinionForm({...opinionForm, titleEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleEn", "titleMl", setOpinionForm, "ml");
                          }
                        }}
                        placeholder="Attappadi's Organic Revolution"
                        className="w-full border rounded p-1.5 focus:ring-1"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">വിഷയം (Ml)</label>
                      <input 
                        type="text" 
                        value={opinionForm.titleMl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOpinionForm({...opinionForm, titleMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleMl", "titleEn", setOpinionForm, "en");
                          }
                        }}
                        placeholder="അട്ടപ്പാടിയുടെ കാർഷിക വിപ്ലവം"
                        className="w-full border rounded p-1.5 focus:ring-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Column narrative copy (En)</label>
                    <textarea 
                      rows={4}
                      value={opinionForm.contentEn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOpinionForm({...opinionForm, contentEn: val});
                        if (autoTranslateOnSubmit) {
                          autoTranslateField(val, "contentEn", "contentMl", setOpinionForm, "ml");
                        }
                      }}
                      placeholder="Type opinion argument here..."
                      className="w-full border rounded p-1.5 focus:ring-1"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">നാടൻ വിവരണം (Ml)</label>
                    <textarea 
                      rows={4}
                      value={opinionForm.contentMl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOpinionForm({...opinionForm, contentMl: val});
                        if (autoTranslateOnSubmit) {
                          autoTranslateField(val, "contentMl", "contentEn", setOpinionForm, "en");
                        }
                      }}
                      placeholder="വിശദമായ വിവരണം നൽകുക..."
                      className="w-full border rounded p-1.5 focus:ring-1 font-anek-malayalam"
                    />
                  </div>

                  <div className="flex gap-2">
                    {editingId && editingType === "opinions" && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="w-1/3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded transition shadow cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className={`py-2 text-white font-bold rounded transition shadow cursor-pointer text-center ${
                        editingId && editingType === "opinions" ? "w-2/3 bg-amber-600 hover:bg-amber-700" : "w-full bg-[#005689] hover:bg-[#0a3060]"
                      }`}
                    >
                      {editingId && editingType === "opinions" ? "Save Column Changes" : "Publish live Column (പ്രസിദ്ധീകരിക്കുക)"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Review and Moderation block */}
              <div className="bg-white rounded-lg p-6 border shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-2 flex items-center gap-1.5">
                  <BookOpen className="w-5 h-5 text-[#005689]" /> Opinion Moderations ({opinionsList.length})
                </h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {opinionsList.map((op) => (
                    <div key={op.id} className="p-3 border rounded bg-slate-50 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#0a3060]">{op.authorName}</span>
                        <div className="flex gap-1 items-center">
                          {!op.approved && (
                            <button
                              onClick={() => handleApproveOpinion(op.id)}
                              className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[9px] font-bold rounded cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleStartEditOpinion(op)}
                            className="p-1.5 bg-amber-100 text-slate-800 hover:bg-amber-200 rounded cursor-pointer transition"
                            title="Edit opinion column"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteOpinion(op.id)}
                            className="p-1.5 bg-red-800 text-white hover:bg-red-650 rounded cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="font-bold text-slate-800">{op.titleEn}</p>
                      <p className="text-slate-500 leading-normal line-clamp-3 italic">"{op.contentEn}"</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 3. EVENTS TAB ==================== */}
        {activeTab === "events" && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Creator block */}
              <div className="bg-white rounded-lg p-6 border shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-2 flex items-center gap-1.5">
                  <Calendar className="w-5 h-5 text-[#005689]" /> Register/Schedule Event
                </h3>
                <form onSubmit={handleCreateEvent} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Event Name (En)</label>
                      <input 
                        type="text" 
                        value={eventForm.titleEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEventForm({...eventForm, titleEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleEn", "titleMl", setEventForm, "ml");
                          }
                        }}
                        placeholder="Farming conclave assembly"
                        className="w-full border rounded p-1.5 focus:ring-1"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">പരിപാടി തലക്കെട്ട് (Ml)</label>
                      <input 
                        type="text" 
                        value={eventForm.titleMl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEventForm({...eventForm, titleMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleMl", "titleEn", setEventForm, "en");
                          }
                        }}
                        placeholder="കർഷക സംഗമം"
                        className="w-full border rounded p-1.5 focus:ring-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Event Date</label>
                      <input 
                        type="date" 
                        value={eventForm.date}
                        onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                        className="w-full border rounded p-1.5 focus:ring-1"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Scheduled Time duration</label>
                      <input 
                        type="text" 
                        value={eventForm.time}
                        onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                        placeholder="11:00 AM - 04:00 PM"
                        className="w-full border rounded p-1.5 focus:ring-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Location Venue (En)</label>
                      <input 
                        type="text" 
                        value={eventForm.locationEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEventForm({...eventForm, locationEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "locationEn", "locationMl", setEventForm, "ml");
                          }
                        }}
                        placeholder="Mukkali forest town hall"
                        className="w-full border rounded p-1.5 focus:ring-1"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">സ്ഥലപ്പേര് (Ml)</label>
                      <input 
                        type="text" 
                        value={eventForm.locationMl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEventForm({...eventForm, locationMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "locationMl", "locationEn", setEventForm, "en");
                          }
                        }}
                        placeholder="മുക്കാലി ടൗൺ ഹാൾ"
                        className="w-full border rounded p-1.5 focus:ring-1"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#005689] hover:bg-[#0a3060] text-white font-bold rounded transition shadow cursor-pointer"
                  >
                    Schedule Live Event
                  </button>
                </form>
              </div>

              {/* Event grid list */}
              <div className="bg-white rounded-lg p-6 border shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-2 flex items-center gap-1.5">
                  <Calendar className="w-5 h-5 text-[#005689]" /> Active scheduled calendar events ({eventsList.length})
                </h3>
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-2">
                  {eventsList.map((ev) => (
                    <div key={ev.id} className="p-3 border rounded bg-slate-50 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono font-bold bg-amber-100 text-slate-800 px-1.5 py-0.5 rounded">
                          {ev.date}
                        </span>
                        <h4 className="font-bold text-slate-800 pt-0.5">{ev.titleEn}</h4>
                        <p className="text-[10px] text-gray-500 font-semibold font-anek-malayalam">{ev.titleMl}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="p-1.5 bg-red-800 text-white rounded hover:bg-red-650 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 4. EXPLORE ATTAPPADI TAB ==================== */}
        {activeTab === "explore" && (
          <div className="space-y-6 animate-fade-in text-xs">
            
            {/* Explore sub tabs navigator */}
            <div className="flex border-b border-gray-200">
              {[
                { id: "destinations", label: "🗺️ Destinations" },
                { id: "cultures", label: "🍲 Culture & Food" },
                { id: "stays", label: "🏡 Nature Stays" },
                { id: "travelogues", label: "✍️ Stories" },
                { id: "photos", label: "📸 Photos Hub" }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setExploreSubTab(sub.id as any)}
                  className={`px-4 py-2 border-b-2 font-bold cursor-pointer text-xs ${
                    exploreSubTab === sub.id 
                      ? "border-[#0a3060] text-[#0a3060]" 
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Explore tab modules */}
            
            {/* Sub-tab 1: DESTINATIONS */}
            {exploreSubTab === "destinations" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={handleCreateDestination} className="bg-white p-6 border rounded-lg shadow-xs space-y-3.5">
                  <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-1.5 flex items-center gap-1.1">
                    <PlusCircle className="w-4 h-4 text-[#005689]" /> Add Destination Attraction
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Destination Name (En)</label>
                      <input 
                        type="text" 
                        required 
                        value={destForm.nameEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setDestForm({...destForm, nameEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "nameEn", "nameMl", setDestForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="e.g. Mukkali Watchtower" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">സ്ഥലം പേര് (Ml)</label>
                      <input 
                        type="text" 
                        required 
                        value={destForm.nameMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setDestForm({...destForm, nameMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "nameMl", "nameEn", setDestForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="മുക്കാലി വാച്ച് ടവർ" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Location Hub (En)</label>
                      <input 
                        type="text" 
                        value={destForm.locationEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setDestForm({...destForm, locationEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "locationEn", "locationMl", setDestForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="Mukkali Ranger Station" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">ദിശ വിവരണം (Ml)</label>
                      <input 
                        type="text" 
                        value={destForm.locationMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setDestForm({...destForm, locationMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "locationMl", "locationEn", setDestForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="മുക്കാലി ഫോറസ്റ്റ് സ്റ്റേഷൻ റേഞ്ച്" 
                      />
                    </div>
                  </div>
                  {/* Photo selection targeting local files or links */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#0a3060] uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#005689]" /> Cover Photo Selection
                      </label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDestImgSourceMode("upload")}
                          className={`px-2 py-0.5 text-[9px] font-black rounded transition ${
                            destImgSourceMode === "upload" 
                              ? "bg-[#0a3060] text-white" 
                              : "bg-white text-slate-600 border hover:bg-slate-100"
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setDestImgSourceMode("url")}
                          className={`px-2 py-0.5 text-[9px] font-black rounded transition ${
                            destImgSourceMode === "url" 
                              ? "bg-[#0a3060] text-white" 
                              : "bg-white text-slate-600 border hover:bg-slate-100"
                          }`}
                        >
                          Web URL
                        </button>
                      </div>
                    </div>

                    {destImgSourceMode === "upload" ? (
                      <div 
                        className={`border-2 border-dashed rounded-lg p-3.5 flex flex-col items-center justify-center transition ${
                          destDragging ? "border-amber-400 bg-amber-50" : "border-slate-300 bg-white hover:bg-slate-50"
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setDestDragging(true); }}
                        onDragLeave={() => setDestDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setDestDragging(false); const f = e.dataTransfer.files[0]; if (f) handleDestFileProcess(f); }}
                      >
                        <Upload className="w-6 h-6 text-[#005689] shrink-0 mb-1 animate-bounce" />
                        <p className="text-[10px] font-bold text-slate-700">Drag & Drop photo, or click to upload</p>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => { if (e.target.files?.[0]) handleDestFileProcess(e.target.files[0]); }}
                          className="mt-2 text-[10px] w-full max-w-xs block text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-[#0a3060]/10 file:text-[#0a3060] hover:file:bg-[#0a3060]/20 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div>
                        <input 
                          type="text" 
                          value={destForm.image}
                          onChange={(e) => setDestForm({...destForm, image: e.target.value})}
                          placeholder="https://images.unsplash.com/photo-... absolute link" 
                          className="w-full border rounded p-1.5 focus:ring-1 focus:ring-[#005689] bg-white text-xs"
                        />
                      </div>
                    )}

                    {destForm.image && (
                      <div className="flex items-center gap-2 bg-white p-1.5 rounded border">
                        <img 
                          src={destForm.image} 
                          alt="Destination thumbnail" 
                          className="w-12 h-9 object-cover rounded border"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-0.5 truncate flex-1 leading-tight">
                          <p className="text-[9px] font-bold text-emerald-800">✓ Destination photo loaded</p>
                          <p className="text-[8px] text-slate-400 truncate">{destForm.image.substring(0, 80)}...</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setDestForm(prev => ({ ...prev, image: "" }))}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-0.5">Analytical Description (En)</label>
                    <textarea 
                      rows={3} 
                      value={destForm.descriptionEn} 
                      onChange={e => {
                        const val = e.target.value;
                        setDestForm({...destForm, descriptionEn: val});
                        if (autoTranslateOnSubmit) {
                          autoTranslateField(val, "descriptionEn", "descriptionMl", setDestForm, "ml");
                        }
                      }} 
                      className="w-full border rounded p-1.5" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-0.5">നിർമ്മാണ വിവരണം അല്ലെങ്കിൽ യാത്രാ തനിമ (Ml)</label>
                    <textarea 
                      rows={3} 
                      value={destForm.descriptionMl} 
                      onChange={e => {
                        const val = e.target.value;
                        setDestForm({...destForm, descriptionMl: val});
                        if (autoTranslateOnSubmit) {
                          autoTranslateField(val, "descriptionMl", "descriptionEn", setDestForm, "en");
                        }
                      }} 
                      className="w-full border rounded p-1.5 font-anek-malayalam" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Highlights En (comma separated list)</label>
                      <input 
                        type="text" 
                        value={destForm.highlightsEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setDestForm({...destForm, highlightsEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "highlightsEn", "highlightsMl", setDestForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="Jeep Safari, Photography, Mist watching" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">സവിശേഷതകൾ Ml (കോമ ഉപയോഗിച്ച് തിരിക്കുക)</label>
                      <input 
                        type="text" 
                        value={destForm.highlightsMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setDestForm({...destForm, highlightsMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "highlightsMl", "highlightsEn", setDestForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="ജീപ്പ് സഫാരി, മൂടൽമഞ്ഞ്, കാഴ്ച്ചകൾ" 
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2 bg-slate-900 hover:bg-[#0a3060] text-[#ffe500] font-bold rounded cursor-pointer">Register Destination</button>
                </form>

                <div className="bg-white p-6 border rounded-lg shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-[#0a3060] text-sm flex items-center gap-1.5">
                    <Compass className="w-5 h-5 text-[#005689]" /> Registered places ({destinationsList.length})
                  </h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {destinationsList.map((dest) => (
                      <div key={dest.id} className="p-3 border rounded bg-slate-50 flex items-center gap-3">
                        <img src={dest.image} alt={dest.nameEn} className="w-12 h-10 object-cover rounded border bg-slate-200 shrink-0" referrerPolicy="no-referrer" />
                        <div className="flex-1 truncate">
                          <h4 className="font-bold text-slate-800">{dest.nameEn}</h4>
                          <p className="text-[10px] text-slate-400 font-anek-malayalam font-semibold">{dest.nameMl}</p>
                        </div>
                        <button onClick={() => handleDeleteDestination(dest.id)} className="p-1.5 bg-red-800 text-white rounded hover:bg-red-650 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: CULTURE & HERITAGE */}
            {exploreSubTab === "cultures" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={handleCreateCulture} className="bg-white p-6 border rounded-lg shadow-xs space-y-3.5">
                  <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-1.5 flex items-center gap-1.1">
                    <PlusCircle className="w-4 h-4 text-[#005689]" /> Add Culture / Food Entry
                  </h3>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-0.5">Category Type</label>
                    <select value={cultureForm.type} onChange={e => setCultureForm({...cultureForm, type: e.target.value})} className="w-full border rounded p-1.5 bg-white cursor-pointer">
                      <option value="culture">Tribal Culture, Dance & Heritage</option>
                      <option value="food">Tribal Gastronomy & Forest Food</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Title (En)</label>
                      <input 
                        type="text" 
                        required 
                        value={cultureForm.titleEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setCultureForm({...cultureForm, titleEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleEn", "titleMl", setCultureForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">മലയാളം തനിമ (Ml)</label>
                      <input 
                        type="text" 
                        required 
                        value={cultureForm.titleMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setCultureForm({...cultureForm, titleMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleMl", "titleEn", setCultureForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Subtitle (En)</label>
                      <input 
                        type="text" 
                        value={cultureForm.subtitleEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setCultureForm({...cultureForm, subtitleEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "subtitleEn", "subtitleMl", setCultureForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">ഉപതലക്കെട്ട് (Ml)</label>
                      <input 
                        type="text" 
                        value={cultureForm.subtitleMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setCultureForm({...cultureForm, subtitleMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "subtitleMl", "subtitleEn", setCultureForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                  </div>
                  {/* Photo selection targeting local files or links */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#0a3060] uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#005689]" /> Photo Selection
                      </label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCultureImgSourceMode("upload")}
                          className={`px-2 py-0.5 text-[9px] font-black rounded transition ${
                            cultureImgSourceMode === "upload" 
                              ? "bg-[#0a3060] text-white" 
                              : "bg-white text-slate-600 border hover:bg-slate-100"
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setCultureImgSourceMode("url")}
                          className={`px-2 py-0.5 text-[9px] font-black rounded transition ${
                            cultureImgSourceMode === "url" 
                              ? "bg-[#0a3060] text-white" 
                              : "bg-white text-slate-600 border hover:bg-slate-100"
                          }`}
                        >
                          Web URL
                        </button>
                      </div>
                    </div>

                    {cultureImgSourceMode === "upload" ? (
                      <div 
                        className={`border-2 border-dashed rounded-lg p-3.5 flex flex-col items-center justify-center transition ${
                          cultureDragging ? "border-amber-400 bg-amber-50" : "border-slate-300 bg-white hover:bg-slate-50"
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setCultureDragging(true); }}
                        onDragLeave={() => setCultureDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setCultureDragging(false); const f = e.dataTransfer.files[0]; if (f) handleCultureFileProcess(f); }}
                      >
                        <Upload className="w-6 h-6 text-[#005689] shrink-0 mb-1 animate-bounce" />
                        <p className="text-[10px] font-bold text-slate-700">Drag & Drop photo, or click to upload</p>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => { if (e.target.files?.[0]) handleCultureFileProcess(e.target.files[0]); }}
                          className="mt-2 text-[10px] w-full max-w-xs block text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-[#0a3060]/10 file:text-[#0a3060] hover:file:bg-[#0a3060]/20 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div>
                        <input 
                          type="text" 
                          value={cultureForm.image}
                          onChange={(e) => setCultureForm({...cultureForm, image: e.target.value})}
                          placeholder="https://images.unsplash.com/photo-... absolute link" 
                          className="w-full border rounded p-1.5 focus:ring-1 focus:ring-[#005689] bg-white text-xs"
                        />
                      </div>
                    )}

                    {cultureForm.image && (
                      <div className="flex items-center gap-2 bg-white p-1.5 rounded border">
                        <img 
                          src={cultureForm.image} 
                          alt="Culture thumbnail" 
                          className="w-12 h-9 object-cover rounded border"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-0.5 truncate flex-1 leading-tight">
                          <p className="text-[9px] font-bold text-emerald-800">✓ Culture photo loaded</p>
                          <p className="text-[8px] text-slate-400 truncate">{cultureForm.image.substring(0, 80)}...</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setCultureForm(prev => ({ ...prev, image: "" }))}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-0.5">Detailed Narrative (En)</label>
                    <textarea 
                      rows={3} 
                      value={cultureForm.descEn} 
                      onChange={e => {
                        const val = e.target.value;
                        setCultureForm({...cultureForm, descEn: val});
                        if (autoTranslateOnSubmit) {
                          autoTranslateField(val, "descEn", "descMl", setCultureForm, "ml");
                        }
                      }} 
                      className="w-full border rounded p-1.5" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-0.5">വിശദ വിവരണം (Ml)</label>
                    <textarea 
                      rows={3} 
                      value={cultureForm.descMl} 
                      onChange={e => {
                        const val = e.target.value;
                        setCultureForm({...cultureForm, descMl: val});
                        if (autoTranslateOnSubmit) {
                          autoTranslateField(val, "descMl", "descEn", setCultureForm, "en");
                        }
                      }} 
                      className="w-full border rounded p-1.5 font-anek-malayalam" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Key instruments descriptor (En)</label>
                      <input 
                        type="text" 
                        value={cultureForm.elementEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setCultureForm({...cultureForm, elementEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "elementEn", "elementMl", setCultureForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">പാരമ്പര്യ വിഭവങ്ങൾ / വാദ്യങ്ങൾ (Ml)</label>
                      <input 
                        type="text" 
                        value={cultureForm.elementMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setCultureForm({...cultureForm, elementMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "elementMl", "elementEn", setCultureForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2 bg-slate-900 text-[#ffe500] font-bold rounded cursor-pointer">Add Culture Segment</button>
                </form>

                <div className="bg-white p-6 border rounded-lg shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-[#0a3060] text-sm flex items-center gap-1.5">
                    <UtensilsCrossed className="w-5 h-5 text-[#005689]" /> Culture segments ({culturesList.length})
                  </h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {culturesList.map((cult) => (
                      <div key={cult.id} className="p-3 border rounded bg-slate-50 flex items-center justify-between">
                        <div>
                          <span className="text-[8px] bg-red-100 text-red-800 font-bold px-1 py-0.2 rounded inline-block mb-1 capitalize">{cult.type}</span>
                          <h4 className="font-bold text-slate-800">{cult.titleEn}</h4>
                        </div>
                        <button onClick={() => handleDeleteCulture(cult.id)} className="p-1.5 bg-red-800 text-white rounded hover:bg-red-650 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 3: NATURE STAYS */}
            {exploreSubTab === "stays" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={handleCreateStay} className="bg-white p-6 border rounded-lg shadow-xs space-y-3.5">
                  <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-1.5 flex items-center gap-1.1">
                    <PlusCircle className="w-4 h-4 text-[#005689]" /> Add Eco Lodging stay option
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Stay / Resort Name (En)</label>
                      <input 
                        type="text" 
                        required 
                        value={stayForm.nameEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setStayForm({...stayForm, nameEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "nameEn", "nameMl", setStayForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">റിസോർട്ട് മനോഹരമായ പേര് (Ml)</label>
                      <input 
                        type="text" 
                        required 
                        value={stayForm.nameMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setStayForm({...stayForm, nameMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "nameMl", "nameEn", setStayForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Accomodation Type (En)</label>
                      <input 
                        type="text" 
                        value={stayForm.typeEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setStayForm({...stayForm, typeEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "typeEn", "typeMl", setStayForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="Govt-owned Lodge" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">താമസ വിഭാഗം (Ml)</label>
                      <input 
                        type="text" 
                        value={stayForm.typeMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setStayForm({...stayForm, typeMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "typeMl", "typeEn", setStayForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="വന കുടിൽ" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Location VillageEn</label>
                      <input 
                        type="text" 
                        value={stayForm.locationEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setStayForm({...stayForm, locationEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "locationEn", "locationMl", setStayForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">മൊത്ത വിവരങ്ങൾ ജംഗ്ഷൻ (Ml)</label>
                      <input 
                        type="text" 
                        value={stayForm.locationMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setStayForm({...stayForm, locationMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "locationMl", "locationEn", setStayForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Price range En</label>
                      <input 
                        type="text" 
                        value={stayForm.priceEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setStayForm({...stayForm, priceEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "priceEn", "priceMl", setStayForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="₹2,000 - ₹3,500 / night" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">നിരക്ക് വിവരണം (Ml)</label>
                      <input 
                        type="text" 
                        value={stayForm.priceMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setStayForm({...stayForm, priceMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "priceMl", "priceEn", setStayForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="പ്രതിദിനം ₹2000" 
                      />
                    </div>
                  </div>
                  {/* Photo selection targeting local files or links */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#0a3060] uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#005689]" /> Cover image selection
                      </label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setStayImgSourceMode("upload")}
                          className={`px-2 py-0.5 text-[9px] font-black rounded transition ${
                            stayImgSourceMode === "upload" 
                              ? "bg-[#0a3060] text-white" 
                              : "bg-white text-slate-600 border hover:bg-slate-100"
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setStayImgSourceMode("url")}
                          className={`px-2 py-0.5 text-[9px] font-black rounded transition ${
                            stayImgSourceMode === "url" 
                              ? "bg-[#0a3060] text-white" 
                              : "bg-white text-slate-600 border hover:bg-slate-100"
                          }`}
                        >
                          Web URL
                        </button>
                      </div>
                    </div>

                    {stayImgSourceMode === "upload" ? (
                      <div 
                        className={`border-2 border-dashed rounded-lg p-3.5 flex flex-col items-center justify-center transition ${
                          stayDragging ? "border-amber-400 bg-amber-50" : "border-slate-300 bg-white hover:bg-slate-50"
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setStayDragging(true); }}
                        onDragLeave={() => setStayDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setStayDragging(false); const f = e.dataTransfer.files[0]; if (f) handleStayFileProcess(f); }}
                      >
                        <Upload className="w-6 h-6 text-[#005689] shrink-0 mb-1 animate-bounce" />
                        <p className="text-[10px] font-bold text-slate-700">Drag & Drop photo, or click to upload</p>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => { if (e.target.files?.[0]) handleStayFileProcess(e.target.files[0]); }}
                          className="mt-2 text-[10px] w-full max-w-xs block text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-[#0a3060]/10 file:text-[#0a3060] hover:file:bg-[#0a3060]/20 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div>
                        <input 
                          type="text" 
                          value={stayForm.image}
                          onChange={(e) => setStayForm({...stayForm, image: e.target.value})}
                          placeholder="https://images.unsplash.com/photo-... absolute link" 
                          className="w-full border rounded p-1.5 focus:ring-1 focus:ring-[#005689] bg-white text-xs"
                        />
                      </div>
                    )}

                    {stayForm.image && (
                      <div className="flex items-center gap-2 bg-white p-1.5 rounded border">
                        <img 
                          src={stayForm.image} 
                          alt="Stay thumbnail" 
                          className="w-12 h-9 object-cover rounded border"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-0.5 truncate flex-1 leading-tight">
                          <p className="text-[9px] font-bold text-emerald-800">✓ Stay photo loaded</p>
                          <p className="text-[8px] text-slate-400 truncate">{stayForm.image.substring(0, 80)}...</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setStayForm(prev => ({ ...prev, image: "" }))}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Features list En (comma split)</label>
                      <input 
                        type="text" 
                        value={stayForm.featuresEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setStayForm({...stayForm, featuresEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "featuresEn", "featuresMl", setStayForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="Hot Water, Jeep trekking, Organic foods" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">റിസോർട്ട് സൗകര്യങ്ങൾ Ml (കോമ സ്പ്ലിറ്റ്)</label>
                      <input 
                        type="text" 
                        value={stayForm.featuresMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setStayForm({...stayForm, featuresMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "featuresMl", "featuresEn", setStayForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="നാടൻ കഞ്ഞി വിഭവങ്ങൾ, ജീപ്പ് സവാരി" 
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2 bg-slate-900 text-[#ffe500] font-bold rounded cursor-pointer">Register Eco-lodging stay</button>
                </form>

                <div className="bg-white p-6 border rounded-lg shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-[#0a3060] text-sm flex items-center gap-1.5">
                    <Hotel className="w-5 h-5 text-[#005689]" /> Verified nature locations ({staysList.length})
                  </h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {staysList.map((stay) => (
                      <div key={stay.id} className="p-3 border rounded bg-slate-50 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800">{stay.nameEn}</h4>
                          <span className="text-[9px] text-[#c70000] font-black">{stay.priceEn}</span>
                        </div>
                        <button onClick={() => handleDeleteStay(stay.id)} className="p-1.5 bg-red-800 text-white rounded hover:bg-red-650 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 4: TRAVELOGUES */}
            {exploreSubTab === "travelogues" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={handleCreateTravelogue} className="bg-white p-6 border rounded-lg shadow-xs space-y-3.5">
                  <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-1.5 flex items-center gap-1.1">
                    <PlusCircle className="w-4 h-4 text-[#005689]" /> Publish travel blog story / Column
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Narrator nameEn</label>
                      <input 
                        type="text" 
                        required 
                        value={travelogueForm.authorEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setTravelogueForm({...travelogueForm, authorEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "authorEn", "authorMl", setTravelogueForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="e.g. Adv. Rajesh" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">എഴുത്തുകാരൻ പേര് (Ml)</label>
                      <input 
                        type="text" 
                        required 
                        value={travelogueForm.authorMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setTravelogueForm({...travelogueForm, authorMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "authorMl", "authorEn", setTravelogueForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="അഡ്വ. രാജേഷ് സുഹൃത്ത്" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Title En</label>
                      <input 
                        type="text" 
                        required 
                        value={travelogueForm.titleEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setTravelogueForm({...travelogueForm, titleEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleEn", "titleMl", setTravelogueForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">വിഷയം / പേര് (Ml)</label>
                      <input 
                        type="text" 
                        required 
                        value={travelogueForm.titleMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setTravelogueForm({...travelogueForm, titleMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleMl", "titleEn", setTravelogueForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-0.5">Date of travel</label>
                    <input type="text" value={travelogueForm.date} onChange={e => setTravelogueForm({...travelogueForm, date: e.target.value})} className="w-full border rounded p-1.5" placeholder="June 2026" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-0.5">Brief snippet (En)</label>
                    <textarea 
                      rows={3} 
                      value={travelogueForm.snippetEn} 
                      onChange={e => {
                        const val = e.target.value;
                        setTravelogueForm({...travelogueForm, snippetEn: val});
                        if (autoTranslateOnSubmit) {
                          autoTranslateField(val, "snippetEn", "snippetMl", setTravelogueForm, "ml");
                        }
                      }} 
                      className="w-full border rounded p-1.5" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-0.5">വിശദ വിവരണം കന്യാവനത്തിലൂടെയുള്ള അനുഭവം (Ml)</label>
                    <textarea 
                      rows={3} 
                      value={travelogueForm.snippetMl} 
                      onChange={e => {
                        const val = e.target.value;
                        setTravelogueForm({...travelogueForm, snippetMl: val});
                        if (autoTranslateOnSubmit) {
                          autoTranslateField(val, "snippetMl", "snippetEn", setTravelogueForm, "en");
                        }
                      }} 
                      className="w-full border rounded p-1.5 font-anek-malayalam" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Read time En</label>
                      <input 
                        type="text" 
                        value={travelogueForm.readTimeEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setTravelogueForm({...travelogueForm, readTimeEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "readTimeEn", "readTimeMl", setTravelogueForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="5 min read" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">വായന സമയം വിവരണം (Ml)</label>
                      <input 
                        type="text" 
                        value={travelogueForm.readTimeMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setTravelogueForm({...travelogueForm, readTimeMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "readTimeMl", "readTimeEn", setTravelogueForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="5 മിനുട്ട് വായന" 
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2 bg-slate-900 text-[#ffe500] font-bold rounded cursor-pointer">Register story</button>
                </form>

                <div className="bg-white p-6 border rounded-lg shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-[#0a3060] text-sm flex items-center gap-1.5">
                    <BookOpen className="w-5 h-5 text-[#005689]" /> Travelogues ({traveloguesList.length})
                  </h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {traveloguesList.map((tr) => (
                      <div key={tr.id} className="p-3 border rounded bg-slate-50 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800">{tr.titleEn}</h4>
                          <span className="text-[9px] text-gray-400">By {tr.authorEn}</span>
                        </div>
                        <button onClick={() => handleDeleteTravelogue(tr.id)} className="p-1.5 bg-red-800 text-white rounded hover:bg-red-650 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 5: PHOTO GALLERY */}
            {exploreSubTab === "photos" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={handleCreatePhoto} className="bg-white p-6 border rounded-lg shadow-xs space-y-3.5">
                  <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-1.5 flex items-center gap-1.1">
                    <PlusCircle className="w-4 h-4 text-[#005689]" /> Register/Add Photo to Hub Frame
                  </h3>
                  {/* Photo selection targeting local files or links */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#0a3060] uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#005689]" /> Photo Selection
                      </label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPhotoImgSourceMode("upload")}
                          className={`px-2 py-0.5 text-[9px] font-black rounded transition ${
                            photoImgSourceMode === "upload" 
                              ? "bg-[#0a3060] text-white" 
                              : "bg-white text-slate-600 border hover:bg-slate-100"
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoImgSourceMode("url")}
                          className={`px-2 py-0.5 text-[9px] font-black rounded transition ${
                            photoImgSourceMode === "url" 
                              ? "bg-[#0a3060] text-white" 
                              : "bg-white text-slate-600 border hover:bg-slate-100"
                          }`}
                        >
                          Web URL
                        </button>
                      </div>
                    </div>

                    {photoImgSourceMode === "upload" ? (
                      <div 
                        className={`border-2 border-dashed rounded-lg p-3.5 flex flex-col items-center justify-center transition ${
                          photoDragging ? "border-amber-400 bg-amber-50" : "border-slate-300 bg-white hover:bg-slate-50"
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setPhotoDragging(true); }}
                        onDragLeave={() => setPhotoDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setPhotoDragging(false); const f = e.dataTransfer.files[0]; if (f) handlePhotoHubFileProcess(f); }}
                      >
                        <Upload className="w-6 h-6 text-[#005689] shrink-0 mb-1 animate-bounce" />
                        <p className="text-[10px] font-bold text-slate-700">Drag & Drop photo, or click to upload</p>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => { if (e.target.files?.[0]) handlePhotoHubFileProcess(e.target.files[0]); }}
                          className="mt-2 text-[10px] w-full max-w-xs block text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-[#0a3060]/10 file:text-[#0a3060] hover:file:bg-[#0a3060]/20 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div>
                        <input 
                          type="text" 
                          required={!photoForm.url}
                          value={photoForm.url} 
                          onChange={e => setPhotoForm({...photoForm, url: e.target.value})} 
                          placeholder="https://images.unsplash.com/photo-... absolute link" 
                          className="w-full border rounded p-1.5 focus:ring-1 focus:ring-[#005689] bg-white text-xs"
                        />
                      </div>
                    )}

                    {photoForm.url && (
                      <div className="flex items-center gap-2 bg-white p-1.5 rounded border">
                        <img 
                          src={photoForm.url} 
                          alt="Hub preview" 
                          className="w-12 h-9 object-cover rounded border"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-0.5 truncate flex-1 leading-tight">
                          <p className="text-[9px] font-bold text-emerald-800">✓ Frame photo loaded</p>
                          <p className="text-[8px] text-slate-400 truncate">{photoForm.url.substring(0, 80)}...</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setPhotoForm(prev => ({ ...prev, url: "" }))}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Captioned Title (En)</label>
                      <input 
                        type="text" 
                        required 
                        value={photoForm.titleEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setPhotoForm({...photoForm, titleEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleEn", "titleMl", setPhotoForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">ചിത്ര തലക്കെട്ട് (Ml)</label>
                      <input 
                        type="text" 
                        required 
                        value={photoForm.titleMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setPhotoForm({...photoForm, titleMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleMl", "titleEn", setPhotoForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Desc (En)</label>
                      <input 
                        type="text" 
                        value={photoForm.descEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setPhotoForm({...photoForm, descEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "descEn", "descMl", setPhotoForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">വിവരം (Ml)</label>
                      <input 
                        type="text" 
                        value={photoForm.descMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setPhotoForm({...photoForm, descMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "descMl", "descEn", setPhotoForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2 bg-slate-900 text-[#ffe500] font-bold rounded cursor-pointer">Register Frame</button>
                </form>

                <div className="bg-white p-6 border rounded-lg shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-[#0a3060] text-sm flex items-center gap-1.5">
                    <ImageIcon className="w-5 h-5 text-[#005689]" /> Live frame captures ({photosList.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto pr-2">
                    {photosList.map((ph) => (
                      <div key={ph.id} className="relative aspect-square rounded border overflow-hidden group bg-slate-100">
                        <img src={ph.url} alt={ph.titleEn} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button onClick={() => handleDeletePhoto(ph.id)} className="absolute bottom-1 right-1 p-1 bg-red-800 text-white hover:bg-red-650 rounded shadow cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== 5. BUS TIME TABLE CMS ==================== */}
        {activeTab === "buses" && (
          <div className="space-y-8 animate-fade-in text-xs">
            
            {/* ====== SUB MODULE 1: INDEPENDENT ROUTE REGISTRY ====== */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-serif font-bold text-[#0a3060] text-sm flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#005689]" /> 
                  1. Independent Route Registry (ബസ് റൂട്ട് രജിസ്ട്രി)
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Define standard route lines first. These registered paths will then be selectable when adding individual bus schedules.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Create Route Form */}
                <form onSubmit={handleCreateRoute} className="lg:col-span-5 bg-white p-4 rounded-lg border shadow-xs space-y-3">
                  <span className="font-bold text-[#0a3060] text-[10.5px] uppercase block pb-1 border-b">🗺️ New Route Generator</span>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-0.5">Route Description (En)</label>
                    <input 
                      type="text" 
                      required 
                      value={routeForm.routeEn} 
                      onChange={e => {
                        const val = e.target.value;
                        setRouteForm({...routeForm, routeEn: val});
                        if (autoTranslateOnSubmit) {
                          autoTranslateField(val, "routeEn", "routeMl", setRouteForm, "ml");
                        }
                      }} 
                      className="w-full border rounded p-1.5" 
                      placeholder="e.g. Coimbatore - Anaikatty - Agali" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-0.5 font-anek-malayalam">ബസ് റൂട്ട് വിവരണം (Ml)</label>
                    <input 
                      type="text" 
                      required 
                      value={routeForm.routeMl} 
                      onChange={e => {
                        const val = e.target.value;
                        setRouteForm({...routeForm, routeMl: val});
                        if (autoTranslateOnSubmit) {
                          autoTranslateField(val, "routeMl", "routeEn", setRouteForm, "en");
                        }
                      }} 
                      className="w-full border rounded p-1.5 font-anek-malayalam" 
                      placeholder="ഉദാ: കോയമ്പത്തൂർ - ആനക്കട്ടി - അഗളി" 
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-[#005689] hover:bg-slate-900 text-white font-bold rounded transition cursor-pointer"
                  >
                    Register New Route (റൂട്ട് ചേർക്കുക)
                  </button>
                </form>

                {/* List of Registered Routes */}
                <div className="lg:col-span-7 bg-white p-4 rounded-lg border shadow-xs space-y-3">
                  <span className="font-bold text-slate-500 text-[10.5px] uppercase block pb-1 border-b">Currently Registered Route Paths ({routesList.length})</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[170px] overflow-y-auto pr-1">
                    {routesList.map((routeItem) => (
                      <div key={routeItem.id} className="p-2 border rounded bg-slate-50 hover:bg-slate-100/50 transition flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 font-anek-malayalam truncate">{routeItem.routeMl}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{routeItem.routeEn}</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteRoute(routeItem.id)} 
                          className="p-1 bg-red-100 text-red-700 hover:bg-red-200 rounded shrink-0 transition duration-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {routesList.length === 0 && (
                      <div className="col-span-2 text-center py-6 text-slate-400">No registered routes. Populate above.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ====== SUB MODULE 2: INDIVIDUAL BUS TIMETABLE REGISTRY ====== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Bus Form block */}
              <div className="bg-white rounded-lg p-6 border shadow-xs space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-serif font-bold text-[#0a3060] text-sm flex items-center gap-1.5">
                    <Bus className="w-5 h-5 text-[#005689]" /> 2. Register Bus Route Transit Schedule
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Select a pre-registered route path and supply authority, timing points & other frequencies.</p>
                </div>

                <form onSubmit={handleCreateBusRoute} className="space-y-3">
                  
                  {/* ROUTE SELECT FROM REGISTRY */}
                  <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 space-y-2">
                    <div>
                      <label className="block text-[#0a3060] font-bold mb-1">Select Registered Route (രജിസ്റ്റർ ചെയ്ത റൂട്ട് തെരഞ്ഞെടുക്കുക) *</label>
                      <select 
                        required
                        value={routesList.find(r => r.routeEn === busForm.routeEn)?.id || ""}
                        onChange={e => {
                          const selected = routesList.find(r => r.id === e.target.value);
                          if (selected) {
                            setBusForm({
                              ...busForm,
                              routeEn: selected.routeEn,
                              routeMl: selected.routeMl
                            });
                          } else {
                            setBusForm({
                              ...busForm,
                              routeEn: "",
                              routeMl: ""
                            });
                          }
                        }}
                        className="w-full border rounded p-2 bg-white font-semibold cursor-pointer text-[#0a3060] select-none"
                      >
                        <option value="">-- Choose Registered Route --</option>
                        {routesList.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.routeEn} | {r.routeMl}
                          </option>
                        ))}
                      </select>
                    </div>

                    {busForm.routeEn && (
                      <div className="p-2 bg-white rounded border border-blue-100 text-[10px] space-y-0.5">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase font-mono">Selected Path Line</span>
                        <div className="font-extrabold text-slate-800 font-anek-malayalam">{busForm.routeMl}</div>
                        <div className="text-slate-500 font-bold uppercase text-[9px] truncate">{busForm.routeEn}</div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pb-1">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Authority Type</label>
                      <select 
                        value={busForm.type} 
                        onChange={e => {
                          const selectedType = e.target.value;
                          const standardTypesForSelected = getStandardBusTypes(selectedType);
                          const firstOption = standardTypesForSelected[0];
                          setBusForm({
                            ...busForm, 
                            type: selectedType, 
                            busTypeEn: firstOption?.labelEn || "", 
                            busTypeMl: firstOption?.labelMl || "",
                            privateBusName: selectedType === "PRIVATE" ? (busForm.privateBusName || "") : ""
                          });
                        }} 
                        className="w-full border rounded p-1.5 bg-white cursor-pointer select-none text-xs font-bold text-[#0a3060]"
                      >
                        <option value="KSRTC">KSRTC (State Government)</option>
                        <option value="PRIVATE">PRIVATE Local Bus</option>
                        <option value="TNSTC">TNSTC / TNRTC (Tamil Nadu Interstate)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Standard Bus Category</label>
                      <select
                        value={matchedOption ? matchedOption.value : (busForm.type === "KSRTC" ? "Others" : standardTypes[0]?.value || "")}
                        onChange={e => {
                          const selectedVal = e.target.value;
                          if (selectedVal === "Others") {
                            setBusForm({
                              ...busForm,
                              busTypeEn: "",
                              busTypeMl: ""
                            });
                          } else {
                            const optionEntity = standardTypes.find(opt => opt.value === selectedVal);
                            setBusForm({
                              ...busForm,
                              busTypeEn: optionEntity?.labelEn || "",
                              busTypeMl: optionEntity?.labelMl || ""
                            });
                          }
                        }}
                        className="w-full border rounded p-1.5 bg-white cursor-pointer select-none font-semibold text-xs text-slate-800"
                      >
                        {standardTypes.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.value} ({opt.labelMl})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Private Bus Name input if authority is PRIVATE */}
                  {busForm.type === "PRIVATE" && (
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg space-y-1">
                      <label className="block text-emerald-950 font-bold text-xs font-anek-malayalam">സ്വകാര്യ ബസ്സിന്റെ പേര് (Private Bus Name)*</label>
                      <input 
                        type="text" 
                        required 
                        value={busForm.privateBusName || ""} 
                        onChange={e => setBusForm({...busForm, privateBusName: e.target.value})} 
                        className="w-full border rounded p-1.5 text-xs font-black bg-white focus:ring-1 focus:ring-emerald-500" 
                        placeholder="e.g. Anaswara, SMR, Attappadi Travels" 
                      />
                      <p className="text-[9px] text-emerald-700 leading-tight">This name will replace "PRIVATE" in client-facing timetables for easier identification.</p>
                    </div>
                  )}

                  {/* Manual input ONLY if Others is chosen for KSRTC */}
                  {busForm.type === "KSRTC" && (matchedOption ? matchedOption.value : "Others") === "Others" && (
                    <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-lg space-y-1">
                      <label className="block text-amber-950 font-bold text-[11px]">Type in the custom Bus Type (En / Ml)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input 
                          type="text" 
                          required
                          value={busForm.busTypeEn} 
                          onChange={e => {
                            const val = e.target.value;
                            setBusForm({...busForm, busTypeEn: val});
                            if (autoTranslateOnSubmit) {
                              autoTranslateField(val, "busTypeEn", "busTypeMl", setBusForm, "ml");
                            }
                          }} 
                          placeholder="e.g. KSRTC Swift" 
                          className="w-full border rounded p-1.5 bg-white text-xs" 
                        />
                        <input 
                          type="text" 
                          required
                          value={busForm.busTypeMl} 
                          onChange={e => {
                            const val = e.target.value;
                            setBusForm({...busForm, busTypeMl: val});
                            if (autoTranslateOnSubmit) {
                              autoTranslateField(val, "busTypeMl", "busTypeEn", setBusForm, "en");
                            }
                          }} 
                          placeholder="e.g. കെ.എസ്.ആർ.ടി.സി സ്വിഫ്റ്റ്" 
                          className="w-full border rounded p-1.5 font-anek-malayalam bg-white text-xs" 
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Service Frequency (En / Ml)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input 
                          type="text" 
                          value={busForm.frequencyEn} 
                          onChange={e => {
                            const val = e.target.value;
                            setBusForm({...busForm, frequencyEn: val});
                            if (autoTranslateOnSubmit) {
                              autoTranslateField(val, "frequencyEn", "frequencyMl", setBusForm, "ml");
                            }
                          }} 
                          placeholder="Every 40 minutes" 
                          className="w-full border rounded p-1" 
                        />
                        <input 
                          type="text" 
                          value={busForm.frequencyMl} 
                          onChange={e => {
                            const val = e.target.value;
                            setBusForm({...busForm, frequencyMl: val});
                            if (autoTranslateOnSubmit) {
                              autoTranslateField(val, "frequencyMl", "frequencyEn", setBusForm, "en");
                            }
                          }} 
                          placeholder="ഓരോ 40 മിനിറ്റിലും" 
                          className="w-full border rounded p-1 font-anek-malayalam" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Operation Hours En / Ml</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input 
                          type="text" 
                          value={busForm.timingsEn} 
                          onChange={e => {
                            const val = e.target.value;
                            setBusForm({...busForm, timingsEn: val});
                            if (autoTranslateOnSubmit) {
                              autoTranslateField(val, "timingsEn", "timingsMl", setBusForm, "ml");
                            }
                          }} 
                          placeholder="First: 06:15 AM" 
                          className="w-full border rounded p-1" 
                        />
                        <input 
                          type="text" 
                          value={busForm.timingsMl} 
                          onChange={e => {
                            const val = e.target.value;
                            setBusForm({...busForm, timingsMl: val});
                            if (autoTranslateOnSubmit) {
                              autoTranslateField(val, "timingsMl", "timingsEn", setBusForm, "en");
                            }
                          }} 
                          placeholder="ആദ്യ സർവീസ് 06:15 AM" 
                          className="w-full border rounded p-1 font-anek-malayalam" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add stops timeline sub-generator */}
                  <div className="bg-slate-50 p-3.5 rounded border border-slate-200 text-[10.5px] space-y-2">
                    <span className="font-bold text-[#0a3060] uppercase block">⏱️ Trip Stop Timing Points ({busTransitList.length} sequence stops defined)</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block mb-0.5">Time Stamp</span>
                        <input type="text" value={transitInput.time} onChange={e => setTransitInput({...transitInput, time: e.target.value})} placeholder="e.g. 15:20" className="w-full border rounded p-1 bg-white font-mono" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block mb-0.5">Stop Name En</span>
                        <input 
                          type="text" 
                          value={transitInput.typeEn} 
                          onChange={e => {
                            const val = e.target.value;
                            setTransitInput({...transitInput, typeEn: val});
                            if (autoTranslateOnSubmit) {
                              autoTranslateField(val, "typeEn", "typeMl", setTransitInput, "ml");
                            }
                          }} 
                          placeholder="e.g. MANNARKKAD" 
                          className="w-full border rounded p-1 bg-white" 
                        />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block mb-0.5">Stop Name Ml</span>
                        <input 
                          type="text" 
                          value={transitInput.typeMl} 
                          onChange={e => {
                            const val = e.target.value;
                            setTransitInput({...transitInput, typeMl: val});
                            if (autoTranslateOnSubmit) {
                              autoTranslateField(val, "typeMl", "typeEn", setTransitInput, "en");
                            }
                          }} 
                          placeholder="e.g. മണ്ണാർക്കാട്" 
                          className="w-full border rounded p-1 bg-white font-anek-malayalam" 
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1.5">
                      <div className="flex flex-wrap gap-1">
                        {busTransitList.map((tm, idx) => (
                          <span key={idx} className="bg-[#0a3060] text-white px-1.5 py-0.5 rounded text-[8.5px] font-mono">{tm.time} {tm.typeEn}</span>
                        ))}
                      </div>
                      <button type="button" onClick={handleAddTransitStop} className="px-3 py-1 bg-[#005689] text-white rounded font-bold hover:bg-slate-900 transition flex items-center gap-0.5 cursor-pointer">
                        <PlusCircle className="w-3.5 h-3.5" /> Add Stop point
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 text-[#ffe500] font-bold rounded cursor-pointer hover:bg-slate-850 transition"
                  >
                    Commit Entire Bus Timetable (ക്രമവിവരപ്പട്ടിക ചേർക്കുക)
                  </button>
                </form>
              </div>

              {/* Transit list display */}
              <div className="bg-white rounded-lg p-6 border shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-2 flex items-center gap-1.5">
                  <Clock className="w-5 h-5 text-[#005689]" /> Trans-valley timetables ({busRoutesList.length})
                </h3>
                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
                  {busRoutesList.map((route) => (
                    <div key={route.id} className="p-3 border rounded bg-slate-50 flex items-center justify-between">
                      <div className="space-y-0.5 truncate flex-1">
                        <span className="text-[8px] bg-[#0a3060] text-white px-1.5 py-0.2 rounded font-black">
                          {route.type === "PRIVATE" && route.privateBusName ? `PRIVATE - ${route.privateBusName.toUpperCase()}` : route.type}
                        </span>
                        <h4 className="font-extrabold text-slate-800 pt-0.5 font-anek-malayalam">{route.routeMl}</h4>
                        <p className="text-[10px] text-slate-400 font-bold truncate uppercase">{route.routeEn}</p>
                        <p className="text-[9px] text-[#c70000] font-bold">{route.list.length} Stops defined</p>
                      </div>
                      <button onClick={() => handleDeleteBusRoute(route.id as string)} className="p-1.5 bg-red-800 text-white rounded hover:bg-red-650 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  {busRoutesList.length === 0 && (
                    <div className="text-center py-12 text-slate-400 font-mono">No buses scheduled. Add one on the left.</div>
                  )}
                </div>
              </div>

              {/* Interactive Transport Map & Transit Layout Editor Module */}
              <div className="bg-white rounded-xl p-6 border shadow-xs space-y-4 col-span-1 lg:col-span-12">
                <div className="border-b pb-3">
                  <h3 className="font-serif font-bold text-[#0a3060] text-sm flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#005689]" /> 
                    3. Interactive Transit Chart & Branch Editor (ബസ് റൂട്ട് മാപ്പ് എഡിറ്റർ)
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Directly drag-and-drop regional transport hubs and draw/sever branching connections on the blueprint layout below. These coordinates affect the user-facing transit diagram instantly.
                  </p>
                </div>
                <div className="p-1 border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-slate-50">
                  <ExploreAttappadi lang="ml" initialTab="busTimings" isAdmin={true} />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 6. PHONE DIRECTORY CMS ==================== */}
        {activeTab === "directory" && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Creator block */}
              <div className="bg-white rounded-lg p-6 border shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-2 flex items-center gap-1.5">
                  <Phone className="w-5 h-5 text-[#005689]" /> Register business / local service directory card
                </h3>
                <form onSubmit={handleCreateDirectory} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Vendor Name (En)</label>
                      <input 
                        type="text" 
                        required 
                        value={dirForm.nameEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setDirForm({...dirForm, nameEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "nameEn", "nameMl", setDirForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="e.g. Agali Auto Stand Desk" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">മലയാളത്തിൽ പേര് (Ml)</label>
                      <input 
                        type="text" 
                        required 
                        value={dirForm.nameMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setDirForm({...dirForm, nameMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "nameMl", "nameEn", setDirForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="അഗളി ഓട്ടോ സ്റ്റാൻഡ്" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Category list</label>
                      <select value={dirForm.category} onChange={e => setDirForm({...dirForm, category: e.target.value as any})} className="w-full border rounded p-1.5 bg-white cursor-pointer">
                        <option value="hospital">Hospitals, Emergency health care</option>
                        <option value="taxi">Jeep, Taxi, auto operators</option>
                        <option value="plumber">Plumber assistance</option>
                        <option value="electrician">Electrician assistance</option>
                        <option value="government">Government offices & KSEB</option>
                        <option value="schools">Schools & colleges</option>
                        <option value="police">Police stations</option>
                        <option value="fire">Fire force services</option>
                        <option value="others_services">Others local utilities</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Phone Call Dial / contact Number</label>
                      <input type="text" required value={dirForm.contact} onChange={e => setDirForm({...dirForm, contact: e.target.value})} className="w-full border rounded p-1.5" placeholder="04924-254XXX or 94979X..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Service Area (En)</label>
                      <input 
                        type="text" 
                        value={dirForm.locationEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setDirForm({...dirForm, locationEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "locationEn", "locationMl", setDirForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="Agali Area" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">സ്ഥലം വിവരണം (Ml)</label>
                      <input 
                        type="text" 
                        value={dirForm.locationMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setDirForm({...dirForm, locationMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "locationMl", "locationEn", setDirForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                        placeholder="അഗളി മേഖല" 
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2 bg-slate-900 text-[#ffe500] font-bold rounded cursor-pointer">Add directory registration</button>
                </form>
              </div>

              {/* View directory array */}
              <div className="bg-white rounded-lg p-6 border shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-2 flex items-center gap-1.5">
                  <ListOrdered className="w-5 h-5 text-[#005689]" /> Verified listings ({dirList.length})
                </h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {dirList.map((dir) => (
                    <div key={dir.id} className="p-2.5 border rounded bg-slate-50 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] bg-slate-200 text-slate-800 font-bold px-1 rounded uppercase tracking-wider block mb-0.5">{dir.category}</span>
                        <h4 className="font-bold text-slate-800">{dir.nameEn}</h4>
                        <p className="text-[10px] text-emerald-800 font-bold font-mono">📞{dir.contact}</p>
                      </div>
                      <button onClick={() => handleDeleteDirectory(dir.id)} className="p-1.5 bg-red-800 text-white rounded hover:bg-red-650 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 7. EMERGENCY CONTACTS CMS ==================== */}
        {activeTab === "emergency" && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Creator block */}
              <div className="bg-white rounded-lg p-6 border shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-5 h-5 text-red-650 shrink-0" /> Publish critical emergency helpline number
                </h3>
                <form onSubmit={handleCreateEmergency} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Service agency (En)</label>
                      <input 
                        type="text" 
                        required 
                        value={emergForm.nameEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setEmergForm({...emergForm, nameEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "nameEn", "nameMl", setEmergForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">മലയാളം അലാറം വിവരങ്ങൾ (Ml)</label>
                      <input 
                        type="text" 
                        required 
                        value={emergForm.nameMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setEmergForm({...emergForm, nameMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "nameMl", "nameEn", setEmergForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Helpline dial number</label>
                      <input type="text" required value={emergForm.number} onChange={e => setEmergForm({...emergForm, number: e.target.value})} className="w-full border rounded p-1.5" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Category emergency type</label>
                      <select value={emergForm.type} onChange={e => setEmergForm({...emergForm, type: e.target.value as any})} className="w-full border rounded p-1.5 bg-white cursor-pointer select-none">
                        <option value="ambulance">Ambulance desk</option>
                        <option value="police">Police patrol operations</option>
                        <option value="fire">Fire force rescuers</option>
                        <option value="hospital">Taluk medical center hospitals</option>
                        <option value="forest">Forest rescue guards</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2 bg-red-800 text-white font-bold rounded cursor-pointer">Register Critical line</button>
                </form>
              </div>

              {/* View Emergency Contacts list */}
              <div className="bg-white rounded-lg p-6 border shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-2 flex items-center gap-1.5">
                  <Activity className="w-5 h-5 text-red-650" /> Live critical lines ({emergencyList.length})
                </h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 font-mono">
                  {emergencyList.map((em) => (
                    <div key={em.id} className="p-2.5 border rounded bg-red-50/50 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded uppercase block mb-0.5 max-w-fit">{em.type}</span>
                        <h4 className="font-bold text-slate-800">{em.nameEn}</h4>
                        <p className="text-[10px] text-red-650 font-black">{em.number}</p>
                      </div>
                      <button onClick={() => handleDeleteEmergency(em.id)} className="p-1.5 bg-red-800 text-white rounded hover:bg-red-650 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== Notices & Alerts Management ==================== */}
        {activeTab === "notices" && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="border-b pb-4 flex justify-between items-center bg-white p-4 rounded-lg shadow-2xs border">
              <div>
                <span className="text-[10px] bg-[#052962] text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  Official Communication Unit
                </span>
                <h2 className="font-serif font-extrabold text-[#052962] text-xl mt-1">
                  Notices, Warnings & Cautions (അറിയിപ്പുകൾ & അലാറങ്ങൾ)
                </h2>
                <p className="text-[10px] text-slate-500 mt-1">
                  Announce emergency water alerts, wild animal border crossings, medical camps, or public directives. Translate instantly from English to Malayalam.
                </p>
              </div>

              {editingId && editingType === "notice" && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditingType(null);
                    setNoticeForm({ titleEn: "", titleMl: "", contentEn: "", contentMl: "", type: "notice", severity: "medium", date: "", active: true });
                  }}
                  className="px-3 py-1.5 bg-slate-105 hover:bg-slate-205 text-slate-805 font-bold rounded-lg transition text-[10px] cursor-pointer"
                >
                  Clear Edit Mode
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Creator block */}
              <div className="bg-white rounded-lg p-6 border shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-2 flex items-center gap-1.5">
                  <PlusCircle className="w-5 h-5 text-[#005689] shrink-0" /> 
                  {editingId && editingType === "notice" ? "Modify existing notice announcement" : "Publish new notice announcement"}
                </h3>
                <form onSubmit={handleCreateNotice} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Notice Title (English)</label>
                      <input 
                        type="text" 
                        required 
                        value={noticeForm.titleEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setNoticeForm({...noticeForm, titleEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleEn", "titleMl", setNoticeForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500" 
                        placeholder="e.g. Landslide alert in Pudur"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">അറിയിപ്പ് വിഷയം (Malayalam)</label>
                      <input 
                        type="text" 
                        required 
                        value={noticeForm.titleMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setNoticeForm({...noticeForm, titleMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleMl", "titleEn", setNoticeForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5 text-xs" 
                        placeholder="e.g. പുതൂരിൽ ഉരുൾപൊട്ടൽ ജാഗ്രത"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Notice Content (English)</label>
                      <textarea 
                        required 
                        rows={3}
                        value={noticeForm.contentEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setNoticeForm({...noticeForm, contentEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "contentEn", "contentMl", setNoticeForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5 text-xs font-semibold" 
                        placeholder="Write detailed statement..."
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">വിശദമായ വിവരങ്ങൾ (Malayalam)</label>
                      <textarea 
                        required 
                        rows={3}
                        value={noticeForm.contentMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setNoticeForm({...noticeForm, contentMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "contentMl", "contentEn", setNoticeForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5 text-xs" 
                        placeholder="വിവരണങ്ങൾ എഴുതുക..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Display Notice Type</label>
                      <select 
                        value={noticeForm.type} 
                        onChange={e => setNoticeForm({...noticeForm, type: e.target.value})} 
                        className="w-full border rounded p-1.5 bg-white cursor-pointer"
                      >
                        <option value="notice">📢 Notice (അറിയിപ്പ്)</option>
                        <option value="caution">⚠️ Caution (ജാഗ്രത)</option>
                        <option value="attention">🔔 Attention (ശ്രദ്ധിക്കുക)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Severity Level</label>
                      <select 
                        value={noticeForm.severity} 
                        onChange={e => setNoticeForm({...noticeForm, severity: e.target.value})} 
                        className="w-full border rounded p-1.5 bg-white cursor-pointer"
                      >
                        <option value="low">🟢 Low (സാധാരണ)</option>
                        <option value="medium">🟡 Medium (മീഡിയം)</option>
                        <option value="high">🔴 High Severity (ഉയർന്ന ജാഗ്രത)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Posting Date</label>
                      <input 
                        type="date" 
                        value={noticeForm.date} 
                        onChange={e => setNoticeForm({...noticeForm, date: e.target.value})} 
                        className="w-full border rounded p-1.5 text-xs" 
                      />
                    </div>
                  </div>

                  {/* Notice Image Selection */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#0a3060] uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-[#005689]" /> Notice Image Attachment (ചിത്ര ലിങ്ക് / ഫയൽ)
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNoticeImgSourceMode("upload")}
                          className={`px-3 py-1 text-[10px] font-black rounded transition ${
                            noticeImgSourceMode === "upload" 
                              ? "bg-[#0a3060] text-white" 
                              : "bg-white text-slate-650 border hover:bg-slate-100"
                          }`}
                        >
                          Upload Local File
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoticeImgSourceMode("url")}
                          className={`px-3 py-1 text-[10px] font-black rounded transition ${
                            noticeImgSourceMode === "url" 
                              ? "bg-[#0a3060] text-white" 
                              : "bg-white text-slate-650 border hover:bg-slate-100"
                          }`}
                        >
                          Provide Web Link URL
                        </button>
                      </div>
                    </div>

                    {noticeImgSourceMode === "upload" ? (
                      <div 
                        className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center transition ${
                          noticeDragging ? "border-amber-400 bg-amber-50" : "border-slate-300 bg-white hover:bg-slate-50"
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setNoticeDragging(true); }}
                        onDragLeave={() => setNoticeDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setNoticeDragging(false); const f = e.dataTransfer.files[0]; if (f) handleNoticeFileProcess(f); }}
                      >
                        <Upload className="w-8 h-8 text-[#005689] shrink-0 mb-2 animate-bounce" />
                        <p className="text-[11px] font-bold text-slate-700">Drag & Drop photo here, or select click link</p>
                        <p className="text-[9px] text-slate-400 mt-1">JPEG/PNG/WebP format supported, up to 12MB size limit</p>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => { if (e.target.files?.[0]) handleNoticeFileProcess(e.target.files[0]); }}
                          className="mt-3 text-xs w-full max-w-xs block text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-[#0a3060]/10 file:text-[#0a3060] hover:file:bg-[#0a3060]/20 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div>
                        <input 
                          type="text" 
                          value={noticeForm.image || ""}
                          onChange={(e) => setNoticeForm({...noticeForm, image: e.target.value})}
                          className="w-full border rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500" 
                          placeholder="Paste image URL (e.g. https://example.com/alert.jpg)"
                        />
                      </div>
                    )}

                    {noticeForm.image && (
                      <div className="relative mt-2 border rounded-lg overflow-hidden max-h-40 bg-slate-100 flex items-center justify-center">
                        <img 
                          src={noticeForm.image} 
                          alt="Notice preview" 
                          className="max-h-40 object-contain w-full"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setNoticeForm({ ...noticeForm, image: "" })}
                          className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow cursor-pointer"
                          title="Remove Image"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 p-2 border rounded-lg">
                    <input 
                      type="checkbox" 
                      id="noticeActive"
                      checked={noticeForm.active} 
                      onChange={e => setNoticeForm({...noticeForm, active: e.target.checked})} 
                      className="cursor-pointer"
                    />
                    <label htmlFor="noticeActive" className="font-semibold text-slate-650 cursor-pointer select-none">
                      Publish as Active Announcement (നിശ്ചിത സമയത്തേക്ക് ലൈവ് ആക്കുക)
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 bg-slate-900 text-[#ffe500] font-bold rounded cursor-pointer hover:bg-slate-850 transition"
                  >
                    {editingId && editingType === "notice" ? "Save notice modifications" : "Publish notice live"}
                  </button>
                </form>
              </div>

              {/* View Notices Announcements list */}
              <div className="bg-white rounded-lg p-6 border shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-2 flex items-center gap-1.5">
                  <Megaphone className="w-5 h-5 text-[#005689]" /> Current Notices & Directives ({noticesList.length})
                </h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {noticesList.length === 0 ? (
                    <p className="text-slate-400 italic text-center py-8">No notices created yet in the system database.</p>
                  ) : (
                    noticesList.map((not) => (
                      <div 
                        key={not.id} 
                        className={`p-3 border rounded-xl flex items-start justify-between gap-3 ${
                          !not.active 
                            ? "bg-slate-100 border-slate-200 opacity-60" 
                            : not.severity === "high" 
                              ? "bg-rose-50 border-rose-150" 
                              : not.type === "caution" 
                                ? "bg-amber-50 border-amber-150" 
                                : "bg-slate-50 border-slate-150"
                        }`}
                      >
                        <div className="flex-1 flex gap-3 items-start">
                          {not.image && (
                            <img 
                              src={not.image} 
                              alt="Notice Attachment" 
                              className="w-12 h-12 object-cover rounded-lg border bg-slate-100 shrink-0 select-none shadow-xs" 
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="space-y-1 relative pr-4 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase block ${
                                not.severity === "high" 
                                  ? "bg-rose-600 text-white" 
                                  : not.type === "caution" 
                                    ? "bg-amber-500 text-slate-950" 
                                    : "bg-[#052962] text-white"
                              }`}>
                                {not.type || "notice"}
                              </span>
                              <span className="text-[7px] text-slate-400 font-bold">{not.date}</span>
                              {!not.active && <span className="text-[8px] bg-gray-500 text-white font-extrabold px-1 rounded uppercase">Inactive</span>}
                            </div>

                            <h4 className="font-bold text-slate-800 leading-snug">{not.titleEn}</h4>
                            <span className="text-[10px] text-slate-400 leading-tight block font-anek-malayalam font-bold">{not.titleMl}</span>
                            
                            <p className="text-[10px] text-slate-500 pt-1 line-clamp-2 leading-relaxed border-t border-slate-100/40 mt-1 select-none font-semibold">
                              {not.contentEn}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button 
                            onClick={() => handleStartEditNotice(not)} 
                            className="p-1.5 bg-slate-50 text-slate-700 rounded-lg hover:bg-[#ffe500] hover:text-[#052962] border transition cursor-pointer"
                            title="Edit Notice"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteNotice(not.id)} 
                            className="p-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-750 hover:text-white border border-red-200 transition cursor-pointer"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== LPG Delivery Management ==================== */}
        {activeTab === "lpg" && (
          <div className="space-y-6 animate-fade-in text-xs text-gray-800">
            <div className="border-b pb-4 flex justify-between items-center bg-white p-4 rounded-lg shadow-2xs border">
              <div>
                <span className="text-[10px] bg-amber-500 text-amber-950 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  Local Services & Deliveries
                </span>
                <h2 className="font-serif font-extrabold text-[#052962] text-xl mt-1">
                  LPG Gas Delivery Today (ഇന്നത്തെ ഗ്യാസ് വിതരണം)
                </h2>
                <p className="text-[10px] text-slate-500 mt-1">
                  Create, update, and manage the daily gas cylinder shipping routes and agency hotline contacts for deep tribal villages across Attappadi.
                </p>
              </div>

              {editingId && editingType === "lpg" && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setEditingType(null);
                    setLpgForm({
                      agencyNameEn: "", agencyNameMl: "", areasEn: "", areasMl: "",
                      date: new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" }),
                      statusEn: "Delivering Today", statusMl: "ഇന്ന് വിതരണമുണ്ട്",
                      contact: "", notesEn: "", notesMl: ""
                    });
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition text-[10px] cursor-pointer"
                >
                  Clear Edit Mode
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Creator block */}
              <div className="bg-white rounded-lg p-6 border shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-2 flex items-center gap-1.5">
                  <PlusCircle className="w-5 h-5 text-amber-600 shrink-0" /> 
                  {editingId && editingType === "lpg" ? "Modify LPG scheduling details" : "Schedule new gas delivery route"}
                </h3>
                <form onSubmit={handleCreateLpg} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Agency Name (English)</label>
                      <input 
                        type="text" 
                        required 
                        value={lpgForm.agencyNameEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setLpgForm({...lpgForm, agencyNameEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "agencyNameEn", "agencyNameMl", setLpgForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5 text-xs focus:ring-1 focus:ring-amber-500 font-bold" 
                        placeholder="e.g. Agali Indane Gas Agency"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">ഏജൻസി പേര് (Malayalam)</label>
                      <input 
                        type="text" 
                        required 
                        value={lpgForm.agencyNameMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setLpgForm({...lpgForm, agencyNameMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "agencyNameMl", "agencyNameEn", setLpgForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5 text-xs font-bold" 
                        placeholder="e.g. അഗളി ഇൻഡെയ്ൻ ഗ്യാസ് ഏജൻസി"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Delivering Areas (English)</label>
                      <textarea 
                        required 
                        rows={2}
                        value={lpgForm.areasEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setLpgForm({...lpgForm, areasEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "areasEn", "areasMl", setLpgForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5 text-xs font-semibold" 
                        placeholder="e.g. Agali, Sholayur, Kottathara Road, Chavadiyur"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">വിതരണം ചെയ്യുന്ന സ്ഥലങ്ങൾ (Malayalam)</label>
                      <textarea 
                        required 
                        rows={2}
                        value={lpgForm.areasMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setLpgForm({...lpgForm, areasMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "areasMl", "areasEn", setLpgForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5 text-xs" 
                        placeholder="e.g. അഗളി, ഷോളയൂർ, കോട്ടത്തറ റോഡ്, ചാവടിയൂർ"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Delivery Status (EN)</label>
                      <select 
                        value={lpgForm.statusEn} 
                        onChange={e => {
                          const val = e.target.value;
                          let associatedMl = "ഇന്ന് വിതരണമുണ്ട്";
                          if (val === "Delivering Tomorrow") associatedMl = "നാളെ വിതരണമുണ്ട്";
                          if (val === "Delayed") associatedMl = "വൈകുന്നു";
                          setLpgForm({...lpgForm, statusEn: val, statusMl: associatedMl});
                        }} 
                        className="w-full border rounded p-1.5 bg-white cursor-pointer"
                      >
                        <option value="Delivering Today">🟢 Delivering Today</option>
                        <option value="Delivering Tomorrow">🔵 Delivering Tomorrow</option>
                        <option value="Delayed">🔴 Delayed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">സ്റ്റാറ്റസ് (ML)</label>
                      <input 
                        type="text"
                        required
                        value={lpgForm.statusMl} 
                        onChange={e => setLpgForm({...lpgForm, statusMl: e.target.value})} 
                        className="w-full border rounded p-1.5 text-xs focus:ring-1 focus:ring-amber-500 bg-white" 
                        placeholder="ഇന്ന് വിതരണമുണ്ട്"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Delivery Date/Day Text</label>
                      <input 
                        type="text" 
                        required
                        value={lpgForm.date} 
                        onChange={e => setLpgForm({...lpgForm, date: e.target.value})} 
                        className="w-full border rounded p-1.5 text-xs" 
                        placeholder="e.g. Today or Monday, 22 June"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Contact Hotline (Driver/Agency)</label>
                      <input 
                        type="text" 
                        required 
                        value={lpgForm.contact} 
                        onChange={e => setLpgForm({...lpgForm, contact: e.target.value})} 
                        className="w-full border rounded p-1.5 text-xs font-mono font-bold" 
                        placeholder="e.g. 9445123450"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Additional Note (EN)</label>
                      <input 
                        type="text" 
                        value={lpgForm.notesEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setLpgForm({...lpgForm, notesEn: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "notesEn", "notesMl", setLpgForm, "ml");
                          }
                        }} 
                        className="w-full border rounded p-1.5 text-xs" 
                        placeholder="e.g. Vehicle starts at 9:00 AM from Agali"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">അധിക വിവരങ്ങൾ (ML)</label>
                      <input 
                        type="text" 
                        value={lpgForm.notesMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setLpgForm({...lpgForm, notesMl: val});
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "notesMl", "notesEn", setLpgForm, "en");
                          }
                        }} 
                        className="w-full border rounded p-1.5 text-xs" 
                        placeholder="e.g. അഗളിയിൽ നിന്ന് രാവിലെ 9 മണിക്ക് വാഹനം പുറപ്പെടും"
                      />
                    </div>
                  </div>

                  {/* Translation utility badge */}
                  {autoTranslateOnSubmit && (
                    <div className="bg-emerald-50 text-emerald-800 text-[10px] p-2.5 rounded-lg border border-emerald-200/50 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <strong>Smart Auto-Translation (Gemini-Engine):</strong> Any fields left empty in Kerala local language (Malayalam) will be automatically translated using state-of-the-art Deep Learning models on submit!
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isTranslatingForm}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg transition font-mono uppercase tracking-widest text-[11px] shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isTranslatingForm ? "Translating form fields..." : editingId && editingType === "lpg" ? "💾 Update LPG Schedule" : "🚀 Publish LPG Schedule"}
                  </button>
                </form>
              </div>

              {/* List block */}
              <div className="bg-white rounded-lg p-6 border shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-[#0a3060] text-sm border-b pb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-5 h-5 text-amber-500" /> Current Seeding / Routes Scheduled ({lpgList.length})
                  </span>
                  <button 
                    type="button"
                    onClick={fetchLpg} 
                    className="text-[10px] text-blue-600 hover:underline font-bold"
                  >
                    Refresh List
                  </button>
                </h3>

                <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                  {lpgList.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      No gas deliveries scheduling is loaded in filesystem.
                    </div>
                  ) : (
                    lpgList.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-3 bg-slate-50 hover:bg-amber-50/20 border rounded-lg transition flex justify-between gap-2.5 items-start"
                      >
                        <div className="space-y-1">
                          <span className="inline-block text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {item.statusEn} (📅 {item.date})
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-xs">
                            {item.agencyNameEn} <span className="text-slate-400 font-normal">| {item.agencyNameMl}</span>
                          </h4>
                          <p className="text-[11px] text-slate-600 leading-tight">
                            <strong className="text-amber-800">📍 Areas:</strong> {item.areasEn} 
                            <span className="block text-slate-400 text-[10px] font-medium font-sans">({item.areasMl})</span>
                          </p>
                          <p className="text-[10px] text-slate-405 font-mono">
                            ☎️ Support Number: {item.contact} 
                            {item.notesEn && <span className="block italic mt-0.5 text-slate-500">ℹ️ {item.notesEn}</span>}
                          </p>
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button 
                            type="button"
                            onClick={() => handleStartEditLpg(item)} 
                            className="p-1.5 bg-slate-50 text-slate-700 rounded hover:bg-[#ffe500] hover:text-[#052962] border transition cursor-pointer"
                            title="Edit LPG Schedule"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteLpg(item.id)} 
                            className="p-1.5 bg-red-50 text-red-700 rounded hover:bg-red-750 hover:text-white border border-red-200 transition cursor-pointer"
                            title="Delete LPG Schedule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 10. AD CONTEXT MANAGEMENT ==================== */}
        {activeTab === "ads" && (
          <div className="space-y-6">
            <div className="bg-[#0a3060] text-slate-100 p-5 rounded-lg border shadow-sm">
              <h2 className="text-base font-serif font-bold text-yellow-400 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-yellow-400" /> Dynamic Ads & Sponsors Management
              </h2>
              <p className="text-[11px] text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Customize the promotional banner blocks displayed on the sides of the breaking news ticker on the main landing desk. Both ads can operate as a click-to-dial mobile link, click-to-chat WhatsApp message, custom web redirect, or a quick-share pop-up.
              </p>
            </div>

            <form onSubmit={handleSaveAdConfig} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. LEFT SIDE AD BLOCK */}
                <div className="bg-white rounded-lg border p-6 shadow-xs space-y-5">
                  <div className="flex border-b pb-3 justify-between items-center bg-slate-50/50 -mx-6 -mt-6 p-4 rounded-t-lg">
                    <h3 className="font-serif font-black text-[#0a3060] text-sm flex items-center gap-1.5">
                      <span className="p-1 rounded bg-[#ffe500] text-[#0a3060] font-sans font-black text-[10px]">LEFT</span>
                      Left Side Ad Banner
                    </h3>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">Homepage Ticker Left</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1">Headline Text (EN)</label>
                      <input 
                        type="text" 
                        value={adForm.leftAd.titleEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setAdForm(prev => ({
                            ...prev,
                            leftAd: { ...prev.leftAd, titleEn: val }
                          }));
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleEn", "titleMl", (updater: any) => {
                              setAdForm(prev => ({
                                ...prev,
                                leftAd: typeof updater === "function" ? updater(prev.leftAd) : updater
                              }));
                            }, "ml");
                          }
                        }}
                        className="w-full border rounded p-2 text-xs" 
                        placeholder="e.g. Call for Ads"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1">ശീർഷകം (ML) (Headline)</label>
                      <input 
                        type="text" 
                        value={adForm.leftAd.titleMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setAdForm(prev => ({
                            ...prev,
                            leftAd: { ...prev.leftAd, titleMl: val }
                          }));
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleMl", "titleEn", (updater: any) => {
                              setAdForm(prev => ({
                                ...prev,
                                leftAd: typeof updater === "function" ? updater(prev.leftAd) : updater
                              }));
                            }, "en");
                          }
                        }}
                        className="w-full border rounded p-2 text-xs font-serif" 
                        placeholder="e.g. പരസ്യങ്ങൾക്ക് വിളിക്കുക"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1">Subtitle / Body (EN)</label>
                      <input 
                        type="text" 
                        value={adForm.leftAd.subtitleEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setAdForm(prev => ({
                            ...prev,
                            leftAd: { ...prev.leftAd, subtitleEn: val }
                          }));
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "subtitleEn", "subtitleMl", (updater: any) => {
                              setAdForm(prev => ({
                                ...prev,
                                leftAd: typeof updater === "function" ? updater(prev.leftAd) : updater
                              }));
                            }, "ml");
                          }
                        }}
                        className="w-full border rounded p-2 text-xs" 
                        placeholder="e.g. Highlight your brand now"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1">ഉപശീർഷകം (ML) (Subtitle)</label>
                      <input 
                        type="text" 
                        value={adForm.leftAd.subtitleMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setAdForm(prev => ({
                            ...prev,
                            leftAd: { ...prev.leftAd, subtitleMl: val }
                          }));
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "subtitleMl", "subtitleEn", (updater: any) => {
                              setAdForm(prev => ({
                                ...prev,
                                leftAd: typeof updater === "function" ? updater(prev.leftAd) : updater
                              }));
                            }, "en");
                          }
                        }}
                        className="w-full border rounded p-2 text-xs font-serif" 
                        placeholder="e.g. കുറഞ്ഞ നിരക്കിൽ പരസ്യങ്ങൾ"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1">Lead Contact Number</label>
                      <input 
                        type="text" 
                        value={adForm.leftAd.contact} 
                        onChange={e => setAdForm({
                          ...adForm,
                          leftAd: { ...adForm.leftAd, contact: e.target.value }
                        })}
                        className="w-full border rounded p-2 text-xs font-mono" 
                        placeholder="e.g. +91 9447471224"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1">Click Action Style</label>
                      <select 
                        value={adForm.leftAd.actionType}
                        onChange={e => setAdForm({
                          ...adForm,
                          leftAd: { ...adForm.leftAd, actionType: e.target.value as any }
                        })}
                        className="w-full border rounded p-2 text-xs font-bold text-slate-700 bg-white"
                      >
                        <option value="share">Popup Contact Dial Card</option>
                        <option value="phone">Dial Directly (Phone Link)</option>
                        <option value="whatsapp">Direct WhatsApp Chat</option>
                        <option value="website">Custom Web URL Redirect</option>
                      </select>
                    </div>
                  </div>

                  {adForm.leftAd.actionType === "website" && (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1">Destination Web URI (Redirect URL)</label>
                      <input 
                        type="url" 
                        value={adForm.leftAd.externalUrl} 
                        onChange={e => setAdForm({
                          ...adForm,
                          leftAd: { ...adForm.leftAd, externalUrl: e.target.value }
                        })}
                        className="w-full border rounded p-2 text-xs font-mono" 
                        placeholder="https://example.com"
                      />
                    </div>
                  )}

                  {/* LEFT IMAGE HANDLER */}
                  <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-slate-550 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> Left Ad Banner Image
                      </span>
                      <div className="flex bg-white border rounded p-0.5 text-[9px] font-bold">
                        <button
                          type="button"
                          onClick={() => setLeftAdImgSourceMode("url")}
                          className={`px-2 py-0.5 rounded cursor-pointer ${leftAdImgSourceMode === "url" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                        >
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setLeftAdImgSourceMode("upload")}
                          className={`px-2 py-0.5 rounded cursor-pointer ${leftAdImgSourceMode === "upload" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                        >
                          Upload File
                        </button>
                      </div>
                    </div>

                    {leftAdImgSourceMode === "url" ? (
                      <input 
                        type="text" 
                        value={adForm.leftAd.image}
                        onChange={e => setAdForm({
                          ...adForm,
                          leftAd: { ...adForm.leftAd, image: e.target.value }
                        })}
                        className="w-full border rounded p-1.5 text-xs bg-white" 
                        placeholder="Image URL link (leave empty for custom typography banner)"
                      />
                    ) : (
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setLeftAdDragging(true); }}
                        onDragLeave={() => setLeftAdDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setLeftAdDragging(false);
                          if (e.dataTransfer.files?.[0]) handleLeftAdFileProcess(e.dataTransfer.files[0]);
                        }}
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 bg-white ${leftAdDragging ? "border-sky-500 bg-sky-50" : "border-slate-300 hover:border-slate-400"}`}
                      >
                        <Upload className="w-6 h-6 text-slate-400" />
                        <span className="text-[10px] text-slate-500">Drag & Drop brand banner image or</span>
                        <label className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">
                          Browse Local Storage
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleLeftAdFileProcess(e.target.files[0]);
                            }} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                    )}

                    {adForm.leftAd.image && (
                      <div className="relative w-full h-16 bg-slate-900 rounded overflow-hidden mt-2">
                        <img 
                          src={adForm.leftAd.image} 
                          alt="Left Ad preview" 
                          className="w-full h-full object-cover opacity-90"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setAdForm({ ...adForm, leftAd: { ...adForm.leftAd, image: "" } })}
                          className="absolute top-1 right-1 p-1 bg-red-800 text-white rounded-full hover:bg-red-700 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* LEFT MOCK MOCKUP PREVIEW */}
                  <div className="border border-yellow-250/50 bg-amber-50/15 p-4 rounded-lg space-y-2">
                    <h4 className="text-[9px] uppercase font-bold text-[#0a3060] flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Live Miniature Preview (Left)
                    </h4>
                    <div className="h-10 bg-slate-950 rounded flex items-center px-4 justify-between select-none overflow-hidden relative">
                      {adForm.leftAd.image ? (
                        <div className="absolute inset-0">
                          <img 
                            src={adForm.leftAd.image} 
                            alt="Left ad cover" 
                            className="w-full h-full object-cover opacity-40" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-slate-950/80"></div>
                        </div>
                      ) : null}
                      <div className="relative flex items-center gap-2 text-white overflow-hidden">
                        <Megaphone className="w-4 h-4 text-[#ffe500] shrink-0" />
                        <div className="text-[10px] truncate leading-tight">
                          <strong className="text-yellow-400 font-black block">{adForm.leftAd.titleEn || "Contact for Ads"}</strong>
                          <span className="text-[8px] text-slate-300 block">{adForm.leftAd.subtitleEn || "Enquire Now"}</span>
                        </div>
                      </div>
                      <div className="relative text-[9px] bg-[#005689] px-2 py-0.5 rounded text-yellow-300 font-extrabold shadow-sm shrink-0 uppercase tracking-widest font-mono">
                        {adForm.leftAd.actionType === "phone" ? "Dial" : adForm.leftAd.actionType === "whatsapp" ? "Chat" : adForm.leftAd.actionType === "website" ? "Visit" : "Info"}
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. RIGHT SIDE AD BLOCK */}
                <div className="bg-white rounded-lg border p-6 shadow-xs space-y-5">
                  <div className="flex border-b pb-3 justify-between items-center bg-slate-50/50 -mx-6 -mt-6 p-4 rounded-t-lg">
                    <h3 className="font-serif font-black text-[#0a3060] text-sm flex items-center gap-1.5">
                      <span className="p-1 rounded bg-[#ffe500] text-[#0a3060] font-sans font-black text-[10px]">RIGHT</span>
                      Right Side Ad Banner
                    </h3>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">Homepage Ticker Right</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1">Headline Text (EN)</label>
                      <input 
                        type="text" 
                        value={adForm.rightAd.titleEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setAdForm(prev => ({
                            ...prev,
                            rightAd: { ...prev.rightAd, titleEn: val }
                          }));
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleEn", "titleMl", (updater: any) => {
                              setAdForm(prev => ({
                                ...prev,
                                rightAd: typeof updater === "function" ? updater(prev.rightAd) : updater
                              }));
                            }, "ml");
                          }
                        }}
                        className="w-full border rounded p-2 text-xs" 
                        placeholder="e.g. Spot Ads Available"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1">ശീർഷകം (ML) (Headline)</label>
                      <input 
                        type="text" 
                        value={adForm.rightAd.titleMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setAdForm(prev => ({
                            ...prev,
                            rightAd: { ...prev.rightAd, titleMl: val }
                          }));
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "titleMl", "titleEn", (updater: any) => {
                              setAdForm(prev => ({
                                ...prev,
                                rightAd: typeof updater === "function" ? updater(prev.rightAd) : updater
                              }));
                            }, "en");
                          }
                        }}
                        className="w-full border rounded p-2 text-xs font-serif" 
                        placeholder="e.g. പരസ്യങ്ങൾക്ക് ബന്ധപ്പെടുക"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1">Subtitle / Body (EN)</label>
                      <input 
                        type="text" 
                        value={adForm.rightAd.subtitleEn} 
                        onChange={e => {
                          const val = e.target.value;
                          setAdForm(prev => ({
                            ...prev,
                            rightAd: { ...prev.rightAd, subtitleEn: val }
                          }));
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "subtitleEn", "subtitleMl", (updater: any) => {
                              setAdForm(prev => ({
                                ...prev,
                                rightAd: typeof updater === "function" ? updater(prev.rightAd) : updater
                              }));
                            }, "ml");
                          }
                        }}
                        className="w-full border rounded p-2 text-xs" 
                        placeholder="e.g. Expand your retail business"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1">ഉപശീർഷകം (ML) (Subtitle)</label>
                      <input 
                        type="text" 
                        value={adForm.rightAd.subtitleMl} 
                        onChange={e => {
                          const val = e.target.value;
                          setAdForm(prev => ({
                            ...prev,
                            rightAd: { ...prev.rightAd, subtitleMl: val }
                          }));
                          if (autoTranslateOnSubmit) {
                            autoTranslateField(val, "subtitleMl", "subtitleEn", (updater: any) => {
                              setAdForm(prev => ({
                                ...prev,
                                rightAd: typeof updater === "function" ? updater(prev.rightAd) : updater
                              }));
                            }, "en");
                          }
                        }}
                        className="w-full border rounded p-2 text-xs font-serif" 
                        placeholder="e.g. കച്ചവടങ്ങൾ വളർത്താം"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1">Lead Contact Number</label>
                      <input 
                        type="text" 
                        value={adForm.rightAd.contact} 
                        onChange={e => setAdForm({
                          ...adForm,
                          rightAd: { ...adForm.rightAd, contact: e.target.value }
                        })}
                        className="w-full border rounded p-2 text-xs font-mono" 
                        placeholder="e.g. +91 9447471224"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1">Click Action Style</label>
                      <select 
                        value={adForm.rightAd.actionType}
                        onChange={e => setAdForm({
                          ...adForm,
                          rightAd: { ...adForm.rightAd, actionType: e.target.value as any }
                        })}
                        className="w-full border rounded p-2 text-xs font-bold text-slate-700 bg-white"
                      >
                        <option value="phone">Dial Directly (Phone Link)</option>
                        <option value="whatsapp">Direct WhatsApp Chat</option>
                        <option value="website">Custom Web URL Redirect</option>
                        <option value="share">Popup Contact Dial Card</option>
                      </select>
                    </div>
                  </div>

                  {adForm.rightAd.actionType === "website" && (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1">Destination Web URI (Redirect URL)</label>
                      <input 
                        type="url" 
                        value={adForm.rightAd.externalUrl} 
                        onChange={e => setAdForm({
                          ...adForm,
                          rightAd: { ...adForm.rightAd, externalUrl: e.target.value }
                        })}
                        className="w-full border rounded p-2 text-xs font-mono" 
                        placeholder="https://example.com"
                      />
                    </div>
                  )}

                  {/* RIGHT IMAGE HANDLER */}
                  <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-slate-550 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> Right Ad Banner Image
                      </span>
                      <div className="flex bg-white border rounded p-0.5 text-[9px] font-bold">
                        <button
                          type="button"
                          onClick={() => setRightAdImgSourceMode("url")}
                          className={`px-2 py-0.5 rounded cursor-pointer ${rightAdImgSourceMode === "url" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                        >
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setRightAdImgSourceMode("upload")}
                          className={`px-2 py-0.5 rounded cursor-pointer ${rightAdImgSourceMode === "upload" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                        >
                          Upload File
                        </button>
                      </div>
                    </div>

                    {rightAdImgSourceMode === "url" ? (
                      <input 
                        type="text" 
                        value={adForm.rightAd.image}
                        onChange={e => setAdForm({
                          ...adForm,
                          rightAd: { ...adForm.rightAd, image: e.target.value }
                        })}
                        className="w-full border rounded p-1.5 text-xs bg-white" 
                        placeholder="Image URL link (leave empty for custom typography banner)"
                      />
                    ) : (
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setRightAdDragging(true); }}
                        onDragLeave={() => setRightAdDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setRightAdDragging(false);
                          if (e.dataTransfer.files?.[0]) handleRightAdFileProcess(e.dataTransfer.files[0]);
                        }}
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 bg-white ${rightAdDragging ? "border-sky-500 bg-sky-50" : "border-slate-300 hover:border-slate-400"}`}
                      >
                        <Upload className="w-6 h-6 text-slate-400" />
                        <span className="text-[10px] text-slate-500">Drag & Drop brand banner image or</span>
                        <label className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">
                          Browse Local Storage
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleRightAdFileProcess(e.target.files[0]);
                            }} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                    )}

                    {adForm.rightAd.image && (
                      <div className="relative w-full h-16 bg-slate-900 rounded overflow-hidden mt-2">
                        <img 
                          src={adForm.rightAd.image} 
                          alt="Right Ad preview" 
                          className="w-full h-full object-cover opacity-90"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setAdForm({ ...adForm, rightAd: { ...adForm.rightAd, image: "" } })}
                          className="absolute top-1 right-1 p-1 bg-red-800 text-white rounded-full hover:bg-red-700 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* RIGHT MOCK MOCKUP PREVIEW */}
                  <div className="border border-yellow-250/50 bg-amber-50/15 p-4 rounded-lg space-y-2">
                    <h4 className="text-[9px] uppercase font-bold text-[#0a3060] flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Live Miniature Preview (Right)
                    </h4>
                    <div className="h-10 bg-slate-950 rounded flex items-center px-4 justify-between select-none overflow-hidden relative">
                      {adForm.rightAd.image ? (
                        <div className="absolute inset-0">
                          <img 
                            src={adForm.rightAd.image} 
                            alt="Right ad cover" 
                            className="w-full h-full object-cover opacity-40" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-slate-950/80"></div>
                        </div>
                      ) : null}
                      <div className="relative flex items-center gap-2 text-white overflow-hidden">
                        <Megaphone className="w-4 h-4 text-[#ffe500] shrink-0" />
                        <div className="text-[10px] truncate leading-tight">
                          <strong className="text-yellow-400 font-black block">{adForm.rightAd.titleEn || "Attappadi Online Ads"}</strong>
                          <span className="text-[8px] text-slate-300 block">{adForm.rightAd.subtitleEn || "Contact: +91 9447471224"}</span>
                        </div>
                      </div>
                      <div className="relative text-[9px] bg-[#005689] px-2 py-0.5 rounded text-yellow-300 font-extrabold shadow-sm shrink-0 uppercase tracking-widest font-mono">
                        {adForm.rightAd.actionType === "phone" ? "Dial" : adForm.rightAd.actionType === "whatsapp" ? "Chat" : adForm.rightAd.actionType === "website" ? "Visit" : "Info"}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Translation note */}
              {autoTranslateOnSubmit && (
                <div className="bg-emerald-50 text-emerald-800 text-[10px] p-3 rounded-lg border border-emerald-200/50 flex items-center gap-2 max-w-xl mx-auto">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong>Gemini AI Automatic Translations:</strong> Type your title or subtitle in English, and Gemini AI will automatically translate to Malayalam when you click "Save Ad Layout"!
                  </div>
                </div>
              )}

              {/* Action bar and save button */}
              <div className="flex justify-center border-t pt-6 bg-slate-50 p-4 rounded-b-lg -mx-6 -mb-6 mt-8">
                <button
                  type="submit"
                  disabled={isTranslatingForm}
                  className="px-8 py-3 bg-[#ffe500] hover:bg-slate-900 hover:text-white text-[#0a3060] font-black rounded-lg transition duration-200 uppercase tracking-widest text-xs shadow-md border cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isTranslatingForm ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" /> Translating & Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Ad Configurations Live
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}
        {activeTab === "card-generator" && (
          <SocialCardGenerator
            newsList={newsList}
            opinionsList={opinionsList}
            eventsList={eventsList}
            photosList={photosList}
            triggerToast={triggerToast}
          />
        )}

      </main>

      {/* Delete confirmation state modal backdrop */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-[999]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full border text-xs text-slate-800"
            >
              <div className="flex items-center gap-2.5 text-slate-900 border-b pb-1.5 font-bold text-sm mb-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <span>{deleteConfirm.title}</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-semibold mb-5">{deleteConfirm.message}</p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteConfirm.onConfirm}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded cursor-pointer transition flex items-center gap-1.5 shadow-md"
                >
                  Delete Live Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
