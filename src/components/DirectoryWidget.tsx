import { useState, useEffect, FormEvent } from "react";
import { 
  Phone, Search, AlertOctagon, HeartHandshake, ShieldAlert, 
  Truck, TreePine, Flame, MapPin, PlusCircle, CheckCircle, 
  X, Radio, Sparkles, MessageSquare, Trash2, Power, IdCard 
} from "lucide-react";
import { DirectoryItem, EmergencyContact, LpgDelivery, AutoTaxi, LocalShop } from "../types";
import { ShoppingBag, Store, Send } from "lucide-react";

const PRE_SEEDED_SHOPS: LocalShop[] = [
  {
    id: "shop-1",
    nameEn: "Hill Range Organic Groceries",
    nameMl: "ഹിൽ റേഞ്ച് ഓർഗാനിക് ഗ്രോസറി",
    category: "grocery",
    contact: "9447471224",
    locationEn: "Agali",
    locationMl: "അഗളി",
    deliveryEn: "Home Delivery Available (Free above ₹500)",
    deliveryMl: "ഹോം ഡെലിവറി ലഭ്യമാണ് (₹500 ന് മുകളിൽ സൌജന്യം)",
    itemsEn: "Organic Honey, Local Ragi Flour, Attappadi Spices, Pure Coconut Oil, Cardamom",
    itemsMl: "വന തേൻ, മുത്താറി പൊടി (രhost), അട്ടപ്പാടി സുഗന്ധവ്യഞ്ജനങ്ങൾ, വെളിച്ചെണ്ണ, ഏലം"
  },
  {
    id: "shop-2",
    nameEn: "Attappadi Bakers & Cafe",
    nameMl: "അട്ടപ്പാടി ബേക്കേഴ്സ് & കഫേ",
    category: "bakery",
    contact: "9447471224",
    locationEn: "Goolikkadavu",
    locationMl: "ഗൂളിക്കടവ്",
    deliveryEn: "Delivery within Goolikkadavu & Agali",
    deliveryMl: "ഗൂളിക്കടവ്, അഗളി പരിസരങ്ങളിൽ ഡെലിവറി",
    itemsEn: "Fresh Banana Chips, Karikku Halwa, Ela Ada, Cream Bun, Hot Samosa, Black Forest Cake",
    itemsMl: "ഉപ്പേരി (കായ വറുത്തത്), കരിക്കിൻ ഹൽവ, ഇല അട, ക്രീം ബൺ, ചൂട് സമോസ, കേക്കുകൾ"
  },
  {
    id: "shop-3",
    nameEn: "Mukkali Eco Supermarket",
    nameMl: "മുക്കാലി എക്കോ സൂപ്പർമാർക്കറ്റ്",
    category: "grocery",
    contact: "9447471224",
    locationEn: "Mukkali",
    locationMl: "മുക്കാലി",
    deliveryEn: "Delivery to Silent Valley checkpost & Mukkali",
    deliveryMl: "മുക്കാലി, സൈലന്റ് വാലി ചെക്ക്പോസ്റ്റ് പരിസരങ്ങളിൽ",
    itemsEn: "Tribal Forest Honey, Wild Arrowroot Powder, Local Tea Leaves, Pure Ghee, Millets",
    itemsMl: "കാട്ടുതേൻ, കൂവപ്പൊടി, നാടൻ ചായപ്പൊടി, നെയ്യ്, ചെറുധാന്യങ്ങൾ"
  },
  {
    id: "shop-4",
    nameEn: "Valluvanad Medicals",
    nameMl: "വള്ളുവനാട് മെഡിക്കൽസ്",
    category: "medical",
    contact: "9447471224",
    locationEn: "Agali",
    locationMl: "അഗളി",
    deliveryEn: "Urgent medicine delivery inside Agali town",
    deliveryMl: "അഗളി ടൗണിൽ അടിയന്തര മരുന്ന് ഡെലിവറി",
    itemsEn: "Prescription Medicines, First Aid Kits, Baby Care Needs, Thermal Scanner, Oximeter",
    itemsMl: "പ്രിസ്ക്രിപ്ഷൻ മരുന്നുകൾ, ഫസ്റ്റ് എയ്ഡ് ബോക്സ്, ബേബി കെയർ ഉൽപ്പന്നങ്ങൾ, മാസ്ക്"
  },
  {
    id: "shop-5",
    nameEn: "Modern Mobiles & Electronics",
    nameMl: "മോഡേൺ മൊബൈൽസ് & ഇലക്ട്രോണിക്സ്",
    category: "electronics",
    contact: "9447471224",
    locationEn: "Anakatti",
    locationMl: "ആനക്കട്ടി",
    deliveryEn: "Delivery around Anakatti border / Sholayur",
    deliveryMl: "ആനക്കട്ടി അതിർത്തി, ഷോളയൂർ പരിസരങ്ങളിൽ",
    itemsEn: "Fast Chargers, OTG Cables, Bluetooth Earphones, Tempered Glass, Power Banks",
    itemsMl: "ഫാസ്റ്റ് ചാർജർ, ഡാറ്റ കേബിൾ, ബ്ലൂടൂത്ത് ഹെഡ്സെറ്റ്, ടെമ്പർഡ് ഗ്ലാസ്, പവർ ബാങ്ക്"
  },
  {
    id: "shop-6",
    nameEn: "Vandanam Textiles & Readymades",
    nameMl: "വന്ദനം ടെക്സ്റ്റൈൽസ് & റെഡിമെയ്ഡ്സ്",
    category: "clothing",
    contact: "9447471224",
    locationEn: "Sholayur",
    locationMl: "ഷോളയൂർ",
    deliveryEn: "No-contact pickup or home delivery",
    deliveryMl: "ഹോം ഡെലിവറി അല്ലെങ്കിൽ കടയിൽ നിന്നും നേരിട്ട് വാങ്ങാം",
    itemsEn: "Kerala Kasavu Mundu, Traditional Sarees, Kids Wear, Raincoats, Umbrellas",
    itemsMl: "കേരള കസവ് മുണ്ട്, കുർത്തകൾ, കുട്ടികളുടെ വസ്ത്രങ്ങൾ, കുടകൾ, റെയിൻകോട്ട്"
  },
  {
    id: "shop-7",
    nameEn: "Farmers Green Vegetables",
    nameMl: "ഫാർമേഴ്‌സ് പച്ചക്കറി കട",
    category: "vegetables",
    contact: "9447471224",
    locationEn: "Pudur",
    locationMl: "പുതൂർ",
    deliveryEn: "Fresh farm vegetables delivered daily",
    deliveryMl: "പച്ചക്കറികൾ ദിവസേന വീട്ടിലെത്തിക്കുന്നു",
    itemsEn: "Fresh Tapioca, Farm Tomatoes, Organic Bananas, Elephant Foot Yam, Drumsticks",
    itemsMl: "നാടൻ മരച്ചീനി, തക്കാളി, കായ്കൾ, ചേന, മുരിങ്ങക്കായ, അട്ടപ്പാടി പച്ചക്കറികൾ"
  }
];

const TOWN_LOCATIONS = [
  { en: "Agali", ml: "അഗളി" },
  { en: "Goolikkadavu", ml: "ഗൂളിക്കടവ്" },
  { en: "Sholayur", ml: "ഷോളയൂർ" },
  { en: "Pudur", ml: "പുതൂർ" },
  { en: "Anakatti", ml: "ആനക്കട്ടി" },
  { en: "Thavalam", ml: "താവളം" },
  { en: "Jelipara", ml: "ജല്ലിപ്പാറ" },
  { en: "Mukkali", ml: "മുക്കാലി" },
  { en: "Kalkandiyur", ml: "കൽക്കണ്ടി" },
  { en: "Mulli", ml: "മുള്ളി" }
];

export default function DirectoryWidget({ 
  lang, 
  onDownloadCard,
  initialTab,
  hideHeaderTabs = false
}: { 
  lang: "en" | "ml"; 
  onDownloadCard?: (item: LpgDelivery) => void;
  initialTab?: "emergency" | "lpg" | "commercial" | "autorikshaw" | "shopping";
  hideHeaderTabs?: boolean;
}) {
  const [directory, setDirectory] = useState<DirectoryItem[]>([]);
  const [emergency, setEmergency] = useState<EmergencyContact[]>([]);
  const [lpgList, setLpgList] = useState<LpgDelivery[]>([]);
  const [autos, setAutos] = useState<AutoTaxi[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currTab, setCurrTab] = useState<"emergency" | "lpg" | "commercial" | "autorikshaw" | "shopping">(initialTab || "lpg");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Local Shopping states
  const [selectedShopTown, setSelectedShopTown] = useState("all");
  const [selectedShopCat, setSelectedShopCat] = useState("all");
  const [customOrderText, setCustomOrderText] = useState<{ [key: string]: string }>({});
  const [orderSuccess, setOrderSuccess] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (initialTab) {
      setCurrTab(initialTab);
    }
  }, [initialTab]);

  // Autorikshaw state variables
  const [selectedAutoLocation, setSelectedAutoLocation] = useState("all");
  const [isRegisteringAuto, setIsRegisteringAuto] = useState(false);
  const [regNameEn, setRegNameEn] = useState("");
  const [regNameMl, setRegNameMl] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [regContact, setRegContact] = useState("");
  const [regLocationEn, setRegLocationEn] = useState("Agali");
  const [isTranslating, setIsTranslating] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const [myAutoId, setMyAutoId] = useState<string | null>(null);
  const [myListing, setMyListing] = useState<AutoTaxi | null>(null);

  useEffect(() => {
    fetchDirectory();
    fetchEmergency();
    fetchLpg();
    fetchAutos();

    const savedId = localStorage.getItem("my_registered_auto_id");
    if (savedId) {
      setMyAutoId(savedId);
    }
  }, []);

  useEffect(() => {
    if (myAutoId && autos.length > 0) {
      const matched = autos.find(a => a.id === myAutoId);
      if (matched) {
        setMyListing(matched);
      } else {
        setMyListing(null);
      }
    } else {
      setMyListing(null);
    }
  }, [myAutoId, autos]);

  const fetchDirectory = async () => {
    const res = await fetch("/api/directory");
    const data = await res.json();
    setDirectory(data);
  };

  const fetchEmergency = async () => {
    const res = await fetch("/api/emergency");
    const data = await res.json();
    setEmergency(data);
  };

  const fetchLpg = async () => {
    try {
      const res = await fetch("/api/lpg");
      const data = await res.json();
      setLpgList(data);
    } catch (e) {
      console.error("Failed to fetch LPG deliveries:", e);
    }
  };

  const fetchAutos = async () => {
    try {
      const res = await fetch("/api/autos");
      const data = await res.json();
      setAutos(data);
    } catch (e) {
      console.error("Failed to fetch autos:", e);
    }
  };

  const handleAutoTranslateName = async () => {
    if (!regNameEn.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: regNameEn, targetLang: "ml" })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.translatedText) {
          setRegNameMl(data.translatedText);
        }
      }
    } catch (err) {
      console.error("Auto translation failed:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRegisterAutoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (!regNameEn.trim() || !regNameMl.trim() || !regNumber.trim() || !regContact.trim()) {
      setRegError(lang === "en" ? "Please fill all fields" : "ദയവായി എല്ലാ വിവരങ്ങളും നൽകുക");
      return;
    }

    const selectedTown = TOWN_LOCATIONS.find(t => t.en === regLocationEn);
    const matchedMl = selectedTown ? selectedTown.ml : "അഗളി";

    try {
      const res = await fetch("/api/autos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverNameEn: regNameEn.trim(),
          driverNameMl: regNameMl.trim(),
          autoNumber: regNumber.trim().toUpperCase(),
          contact: regContact.trim(),
          locationEn: regLocationEn,
          locationMl: matchedMl,
          isAvailable: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRegSuccess(lang === "en" ? "Service registered successfully!" : "ഓട്ടോ സർവീസ് വിജയകരമായി രജിസ്റ്റർ ചെയ്തു!");
        localStorage.setItem("my_registered_auto_id", data.id);
        setMyAutoId(data.id);

        setRegNameEn("");
        setRegNameMl("");
        setRegNumber("");
        setRegContact("");

        await fetchAutos();

        setTimeout(() => {
          setIsRegisteringAuto(false);
          setRegSuccess("");
        }, 1500);
      } else {
        const errData = await res.json();
        setRegError(errData.error || "Failed to register auto service.");
      }
    } catch (err) {
      setRegError("Server error. Please retry.");
    }
  };

  const toggleMyAvailability = async () => {
    if (!myListing) return;
    const updatedStatus = !myListing.isAvailable;

    setMyListing({ ...myListing, isAvailable: updatedStatus });
    setAutos(prev => prev.map(a => a.id === myListing.id ? { ...a, isAvailable: updatedStatus } : a));

    try {
      const res = await fetch(`/api/autos/${myListing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: updatedStatus })
      });
      if (res.ok) {
        fetchAutos();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const deleteMyListing = async () => {
    if (!myListing) return;
    if (!confirm(lang === "en" 
      ? "Do you want to delete your registered Autorikshaw taxi listing?" 
      : "നിങ്ങളുടെ ഓട്ടോ സർവീസ് ലിസ്റ്റ് പൂർണ്ണമായും ഒഴിവാക്കണോ?")) return;

    try {
      const res = await fetch(`/api/autos/${myListing.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        localStorage.removeItem("my_registered_auto_id");
        setMyAutoId(null);
        setMyListing(null);
        fetchAutos();
      }
    } catch (err) {
      console.error("Failed to delete listing:", err);
    }
  };

  const getEmergencyIcon = (type: string) => {
    switch (type) {
      case "ambulance": return <Truck className="w-4 h-4 text-emerald-600" />;
      case "police": return <ShieldAlert className="w-4 h-4 text-blue-600" />;
      case "fire": return <Flame className="w-4 h-4 text-red-600" />;
      case "forest": return <TreePine className="w-4 h-4 text-emerald-800" />;
      default: return <HeartHandshake className="w-4 h-4 text-amber-600" />;
    }
  };

  const filteredDirectory = directory.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      item.nameEn.toLowerCase().includes(query) || 
      item.nameMl.toLowerCase().includes(query) || 
      item.contact.includes(query) || 
      (item.locationEn && item.locationEn.toLowerCase().includes(query));
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const filteredAutos = autos.filter((auto) => {
    const matchesLocation = selectedAutoLocation === "all" || auto.locationEn === selectedAutoLocation;
    const query = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === "" || 
      auto.driverNameEn.toLowerCase().includes(query) ||
      auto.driverNameMl.toLowerCase().includes(query) ||
      auto.autoNumber.toLowerCase().includes(query) ||
      auto.contact.includes(query);

    return matchesLocation && matchesSearch;
  });

  return (
    <div className={hideHeaderTabs 
      ? "bg-white text-gray-800" 
      : "bg-white border-t-2 border-[#052962] rounded-lg shadow overflow-hidden text-gray-800"
    }>
      
      {/* Tab Switcher */}
      {!hideHeaderTabs && (
        <div className="flex border-b border-gray-150 font-bold text-[11px] sm:text-xs bg-slate-50 overflow-x-auto select-none scrollbar-none">
          <button
            onClick={() => setCurrTab("lpg")}
            className={`flex-1 min-w-[90px] py-3 text-center transition flex justify-center items-center gap-1 border-r cursor-pointer ${currTab === "lpg" ? "bg-amber-50 text-amber-800 border-b-2 border-amber-500 font-extrabold" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
            <span className="truncate">{lang === "en" ? "LPG TODAY" : "ഇന്നത്തെ ഗ്യാസ്"}</span>
          </button>
          <button
            onClick={() => setCurrTab("emergency")}
            className={`flex-1 min-w-[90px] py-3 text-center transition flex justify-center items-center gap-1 border-r cursor-pointer ${currTab === "emergency" ? "bg-red-50 text-red-700 border-b-2 border-red-600 font-extrabold" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">{lang === "en" ? "EMERGENCY" : "ഹെൽപ്‌ലൈനുകൾ"}</span>
          </button>
          <button
            onClick={() => setCurrTab("commercial")}
            className={`flex-1 min-w-[90px] py-3 text-center transition flex justify-center items-center gap-1 border-r cursor-pointer ${currTab === "commercial" ? "bg-sky-50 text-sky-800 border-b-2 border-sky-600 font-extrabold" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <Phone className="w-3.5 h-3.5 text-sky-700 shrink-0" />
            <span className="truncate">{lang === "en" ? "DIRECTORY" : "ഡയറക്ടറി"}</span>
          </button>
          <button
            onClick={() => setCurrTab("autorikshaw")}
            className={`flex-1 min-w-[90px] py-3 text-center transition flex justify-center items-center gap-1 border-r cursor-pointer ${currTab === "autorikshaw" ? "bg-emerald-50 text-emerald-800 border-b-2 border-emerald-600 font-extrabold" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse" />
            <span className="truncate">{lang === "en" ? "AUTO TAXI" : "ഓട്ടോ റിക്ഷ"}</span>
          </button>
          <button
            onClick={() => setCurrTab("shopping")}
            className={`flex-1 min-w-[90px] py-3 text-center transition flex justify-center items-center gap-1 cursor-pointer ${currTab === "shopping" ? "bg-fuchsia-50 text-fuchsia-800 border-b-2 border-fuchsia-600 font-extrabold" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-fuchsia-600 shrink-0" />
            <span className="truncate">{lang === "en" ? "LOCAL SHOPPING" : "വ്യാപാരശാലകൾ"}</span>
          </button>
        </div>
      )}

      <div className={hideHeaderTabs ? "" : "p-4 space-y-4"}>
        {currTab === "lpg" ? (
          /* LPG DELIVERY LIST */
          <div className="space-y-3 animate-fade-in">
            <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded leading-tight border border-amber-100">
              {lang === "en" 
                ? "Daily Gas delivering schedules, routes and agency hotline support across Attappadi hills."
                : "അട്ടപ്പാടിയിലുടനീളമുള്ള ഇന്നത്തെ എൽ.പി.ജി ഗ്യാസ് വിതരണ വിവരങ്ങൾ, വാഹനങ്ങൾ എത്തുന്ന സ്ഥലങ്ങൾ."}
            </p>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
              {lpgList.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  {lang === "en" ? "No LPG deliveries scheduled today." : "ഇന്ന് ഗ്യാസ് ഡെലിവറി വിവരങ്ങൾ ലഭ്യമല്ല."}
                </div>
              ) : (
                lpgList.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white p-3 rounded-md border border-slate-200 hover:border-amber-400 shadow-2xs transition duration-200"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ⚡ {lang === "en" ? item.statusEn : item.statusMl}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold font-mono">📅 {item.date}</span>
                        </div>
                        
                        <h4 className="text-xs font-black text-slate-900 leading-tight">
                          {lang === "en" ? item.agencyNameEn : item.agencyNameMl}
                        </h4>
                        
                        <div className="text-[11px] text-slate-700 leading-normal">
                          <span className="font-extrabold text-amber-700">📍 {lang === "en" ? "Areas: " : "സ്ഥലങ്ങൾ: "}</span>
                          <span className="font-medium bg-amber-50/50 px-1 py-0.5 rounded border border-amber-100/45">{lang === "en" ? item.areasEn : item.areasMl}</span>
                        </div>

                        {(item.notesEn || item.notesMl) && (
                          <p className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded inline-block italic leading-tight">
                            ℹ️ {lang === "en" ? item.notesEn : item.notesMl}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-1.5 shrink-0 select-none">
                        <a 
                          href={`tel:${item.contact}`}
                          className="flex flex-col items-center justify-center gap-1 p-2 bg-amber-50 hover:bg-[#ffe500] text-amber-950 rounded-md border border-amber-200 hover:border-transparent transition text-center shrink-0 cursor-pointer min-w-[76px] w-full"
                          title={lang === "en" ? "Call Agency" : "ഏജൻസി വിളിക്കുക"}
                        >
                          <Flame className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                          <span className="text-[8px] font-bold uppercase tracking-wider">{lang === "en" ? "CALL NOW" : "വിളിക്കുക"}</span>
                          <span className="text-[8px] font-mono font-bold text-slate-600 leading-none">{item.contact}</span>
                        </a>

                        {onDownloadCard && (
                          <button
                            type="button"
                            onClick={() => onDownloadCard(item)}
                            className="w-full flex items-center justify-center gap-1 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 rounded font-black text-[9px] uppercase tracking-wider cursor-pointer transition active:scale-95 text-center leading-none"
                            title={lang === "en" ? "Download as styled greeting card graphic" : "നിറമുള്ള അറിയിപ്പ് കാർഡ് രൂപത്തിൽ ഡൗൺലോഡ് ചെയ്യാം"}
                          >
                            <IdCard className="w-3.5 h-3.5 text-amber-700 font-bold shrink-0" /> {lang === "en" ? "CARD" : "കാർഡ്"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : currTab === "emergency" ? (
          /* EMERGENCY LIST */
          <div className="space-y-3 animate-fade-in">
            <p className="text-[11px] text-red-800 bg-red-50 p-2 rounded leading-tight border border-red-100">
              {lang === "en" 
                ? "Immediate relief, police patrol, wild elephant/snake captures, and specialty tribal hospital contacts in Attappadi block."
                : "അട്ടപ്പാടി മേഖലയിലെ അടിയന്തര സഹായങ്ങൾക്കും കാട്ടാന ശല്യം തടയാൻ ഫോറസ്റ്റ് ഡിപ്പാർട്ട്മെന്റിനും വിളിക്കേണ്ട ഫോൺ നമ്പറുകൾ."}
            </p>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
              {emergency.map((em) => (
                <div 
                  key={em.id} 
                  className="flex justify-between items-center bg-[#fcfcfb] p-3 rounded border-l-4 border-red-600 border border-gray-100 hover:bg-red-50/20 transition shadow-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-slate-100 rounded-lg mt-0.5 shrink-0">
                      {getEmergencyIcon(em.type)}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-800 leading-tight">
                        {lang === "en" ? em.nameEn : em.nameMl}
                      </h4>
                      <span className="text-[10px] text-gray-400 capitalize">{em.type} Desk</span>
                    </div>
                  </div>
                  
                  <a 
                    href={`tel:${em.number}`}
                    className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded transition tracking-wider"
                  >
                    <Phone className="w-3 h-3" />
                    {em.number}
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : currTab === "commercial" ? (
          /* PUBLIC SERVICES DIRECTORY */
          <div className="space-y-3.5 animate-fade-in">
            {/* Search filter input */}
            <div className="relative">
              <span className="absolute left-3 inset-y-0 flex items-center text-gray-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input 
                type="text"
                placeholder={lang === "en" ? "Search plumber, jeep operators, hospital..." : "ഡയറക്ടറിയിൽ തിരയുക..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 pl-8 pr-3 py-1.5 rounded text-xs focus:ring-1 focus:ring-[#005689] focus:outline-none placeholder-gray-400"
              />
            </div>

            {/* Quick Filter categories */}
            <div className="flex gap-1 overflow-x-auto pb-1 max-w-full text-[10px] pr-1">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-2.5 py-1 rounded-full shrink-0 border transition ${categoryFilter === "all" ? "bg-[#052962] text-white font-bold" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter("hospital")}
                className={`px-2.5 py-1 rounded-full shrink-0 border transition ${categoryFilter === "hospital" ? "bg-[#052962] text-white font-bold" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                Clinical Medical
              </button>
              <button
                onClick={() => setCategoryFilter("taxi")}
                className={`px-2.5 py-1 rounded-full shrink-0 border transition ${categoryFilter === "taxi" ? "bg-[#052962] text-white font-bold" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                Jeeps & Eco Cabs
              </button>
              <button
                onClick={() => setCategoryFilter("plumber")}
                className={`px-2.5 py-1 rounded-full shrink-0 border transition ${categoryFilter === "plumber" ? "bg-[#052962] text-white font-bold" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                Repair & Plumbing
              </button>
              <button
                onClick={() => setCategoryFilter("government")}
                className={`px-2.5 py-1 rounded-full shrink-0 border transition ${categoryFilter === "government" ? "bg-[#052962] text-white font-bold" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                Government Info Desk
              </button>
            </div>

            {/* Directory Listings lists */}
            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-0.5">
              {filteredDirectory.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  {lang === "en" ? "No service directory match." : "വിവരങ്ങൾ ലഭ്യമല്ല."}
                </div>
              ) : (
                filteredDirectory.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center text-xs p-2.5 bg-slate-50 hover:bg-sky-50/20 border border-gray-100 rounded transition"
                  >
                    <div>
                      <h4 className="font-bold text-[#052962] leading-tight mb-0.5">
                        {lang === "en" ? item.nameEn : item.nameMl}
                      </h4>
                      <p className="text-[9px] text-gray-400 uppercase font-semibold">
                        {item.category} • {lang === "en" ? item.locationEn : item.locationMl}
                      </p>
                    </div>
                    
                    <a
                      href={`tel:${item.contact}`}
                      className="p-1 px-2 border hover:bg-[#052962] group text-[#052962] hover:text-white rounded flex items-center gap-1 text-[11px] font-bold transition shrink-0"
                    >
                      <Phone className="w-3 h-3 group-hover:animate-shake" />
                      <span>{item.contact}</span>
                    </a>
                  </div>
                ))
              )}
            </div>
            
            <p className="text-[10px] text-gray-400 text-center italic">
              Want to list your local service? Contact an administrator or editor to register immediately.
            </p>
          </div>
        ) : currTab === "autorikshaw" ? (
          /* AUTORIKSHAW TAXI SERVICE TAB */
          <div className="space-y-4 animate-fade-in relative">
            
            {/* Header / Intro banner */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950">
              <div className="space-y-0.5">
                <h4 className="text-xs font-black flex items-center gap-1.5 text-emerald-800">
                  <span className="p-1 bg-emerald-100 rounded text-base animate-bounce">🛺</span>
                  {lang === "en" ? "Autorikshaw Taxi Finder" : "പ്രാദേശിക ഓട്ടോ ടാക്സി ഡയറക്ടറി"}
                </h4>
                <p className="text-[11px] text-emerald-800/90 leading-snug">
                  {lang === "en" 
                    ? "Hire nearby regional autorikshaw drivers easily. If you are a driver, register your service today!"
                    : "അട്ടപ്പാടിയിലെ പ്രദേശങ്ങൾ കേന്ദ്രീകരിച്ച് പ്രവർത്തിക്കുന്ന വിശ്വസ്തരായ ഓട്ടോ ഡ്രൈവർമാരെ ഇവിടെ ബന്ധപ്പെടാം. ഡ്രൈവർമാർക്ക് സ്വന്തം സർവീസ് ഇവിടെ ചേർക്കാവുന്നതാണ്."}
                </p>
              </div>

              {!myListing && !isRegisteringAuto && (
                <button
                  onClick={() => setIsRegisteringAuto(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] sm:text-xs rounded-md shadow-xs transition uppercase tracking-wider flex items-center justify-center gap-1 shrink-0 self-start sm:self-center cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {lang === "en" ? "Join as Driver" : "ഓട്ടോ രജിസ്റ്റർ ചെയ്യാം"}
                </button>
              )}
            </div>

            {/* MY ACTIVE LISTING MANAGEMENT (If registered on this device) */}
            {myListing && (
              <div className="bg-gradient-to-r from-emerald-600 to-[#047857] text-white p-3.5 rounded-lg shadow-sm border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-yellow-400 text-[#0c4035] font-black uppercase px-2 py-0.5 rounded shadow-sm tracking-widest leading-none">
                      {lang === "en" ? "My Registered Active Service" : "നിങ്ങളുടെ സജീവ ഓട്ടോ സർവീസ്"}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${myListing.isAvailable ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${myListing.isAvailable ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                      {myListing.isAvailable ? (lang === "en" ? "Online" : "ലഭ്യമാണ്") : (lang === "en" ? "Busy" : "തിരക്കിലാണ്")}
                    </span>
                  </div>
                  <h4 className="text-sm font-black leading-tight">
                    {lang === "en" ? myListing.driverNameEn : myListing.driverNameMl}
                  </h4>
                  <p className="text-[11px] text-emerald-100 font-medium font-sans flex items-center gap-1.5">
                    🛺 {myListing.autoNumber} • 📍 {lang === "en" ? myListing.locationEn : myListing.locationMl}
                  </p>
                </div>

                <div className="flex items-center flex-wrap gap-2.5">
                  <button
                    onClick={toggleMyAvailability}
                    className={`px-3 py-1.5 font-bold text-xs rounded-md transition flex items-center gap-1 cursor-pointer shadow-xs ${
                      myListing.isAvailable 
                        ? "bg-amber-400 hover:bg-amber-300 text-amber-950" 
                        : "bg-emerald-100 hover:bg-emerald-200 text-emerald-950"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>
                      {myListing.isAvailable 
                        ? (lang === "en" ? "Set Busy (Offline)" : "ബിസി ആക്കുക (ഓഫ്ലൈൻ)") 
                        : (lang === "en" ? "Set Active (Online)" : "ലഭ്യമാക്കുക (ഓൺലൈൻ)")}
                    </span>
                  </button>

                  <button
                    onClick={deleteMyListing}
                    className="p-1.5 border border-red-300 hover:bg-red-700 text-red-100 hover:text-white rounded-md transition"
                    title={lang === "en" ? "Delete Listing Entirely" : "ലിസ്റ്റ് പൂർണ്ണമായി ഒഴിവാക്കുക"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* DRIVER REGISTRATION COLLAPSIBLE DRAWER */}
            {isRegisteringAuto && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3.5 animate-slide-up relative">
                <button
                  type="button"
                  onClick={() => setIsRegisteringAuto(false)}
                  className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  <h4 className="font-serif-guardian font-extrabold text-[#052962] text-sm">
                    {lang === "en" ? "Register Your Autorikshaw Taxi" : "ഡ്രൈവർമാരുടെ രജിസ്ട്രേഷൻ"}
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    {lang === "en" 
                      ? "Submit your mobile and auto details to get localized trip requests from native travelers."
                      : "യാത്രക്കാരുമായി നേരിട്ട് ബന്ധപ്പെടാൻ നിങ്ങളുടെ മൊബൈൽ നമ്പറും മറ്റ് വിവരങ്ങളും ചേർക്കുക."}
                  </p>
                </div>

                {regError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded text-[11px] text-red-600 font-semibold italic">
                    ⚠️ {regError}
                  </div>
                )}

                {regSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800 font-extrabold">
                    ✅ {regSuccess}
                  </div>
                )}

                <form onSubmit={handleRegisterAutoSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Name English */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      {lang === "en" ? "Driver Name (English)*" : "ഡ്രൈവർ പേര് (ഇംഗ്ലീഷിൽ)*"}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g., Ramesh Kumar"
                      value={regNameEn}
                      onChange={(e) => setRegNameEn(e.target.value)}
                      className="w-full border border-gray-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-gray-400 bg-white"
                    />
                  </div>

                  {/* Name Malayalam with AI Translation Assistance */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-bold text-slate-700">
                        {lang === "en" ? "Driver Name (Malayalam)*" : "ഡ്രൈവർ പേര് (മലയാളത്തിൽ)*"}
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoTranslateName}
                        disabled={isTranslating}
                        className="text-[9px] font-black text-emerald-700 hover:text-emerald-900 bg-emerald-100/55 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-200"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        {isTranslating ? "..." : (lang === "en" ? "AUTO FILL ML" : "ഓട്ടോ ഫിൽ")}
                      </button>
                    </div>
                    <input 
                      type="text"
                      required
                      placeholder="ഉദാ: രമേശ് കുമാർ"
                      value={regNameMl}
                      onChange={(e) => setRegNameMl(e.target.value)}
                      className="w-full border border-gray-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-gray-400 bg-white"
                    />
                  </div>

                  {/* Auto Number */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      {lang === "en" ? "Vehicle Registration Number*" : "ഓട്ടോ വണ്ടി നമ്പർ*"}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. KL-48-B-1234"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      className="w-full border border-gray-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-gray-400 bg-white"
                    />
                  </div>

                  {/* Phone Contact */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      {lang === "en" ? "Mobile Phone Number (WhatsApp)*" : "മൊബൈൽ ഫോൺ നമ്പർ*"}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. 9495123456"
                      value={regContact}
                      onChange={(e) => setRegContact(e.target.value)}
                      className="w-full border border-gray-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-gray-400 bg-white"
                    />
                  </div>

                  {/* Target Town Location */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700">
                      {lang === "en" ? "Major Stand / Station Location*" : "കൂടുതൽ സമയം പാർക്ക് ചെയ്യുന്ന സ്റ്റാൻഡ് / സ്ഥലം*"}
                    </label>
                    <select
                      value={regLocationEn}
                      onChange={(e) => setRegLocationEn(e.target.value)}
                      className="w-full border border-gray-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white font-semibold"
                    >
                      {TOWN_LOCATIONS.map((town) => (
                        <option key={town.en} value={town.en}>
                          {town.en} ({town.ml})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-md shadow uppercase tracking-wider transition cursor-pointer"
                    >
                      🚀 {lang === "en" ? "Register My Auto Service" : "റെജിസ്ട്രേഷൻ പൂർത്തിയാക്കുക"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRegisteringAuto(false)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-md uppercase tracking-wider transition"
                    >
                      {lang === "en" ? "Cancel" : "റദ്ദാക്കുക"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* DRIVER FINDER & FILTERS */}
            <div className="space-y-3.5 pt-1">
              {/* Location Select and Search input row */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                
                {/* Search text filter inside the tab list */}
                <div className="relative flex-1">
                  <span className="absolute left-3 inset-y-0 flex items-center text-gray-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input 
                    type="text"
                    placeholder={lang === "en" ? "Search driver name or number..." : "ഡ്രൈവർമാരെ പേരോ നമ്പറോ വെച്ച് തിരയാം..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-250 pl-8 pr-3 py-1.5 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-gray-400"
                  />
                </div>

                {/* Local Stand selector */}
                <div className="min-w-[130px] shrink-0">
                  <select
                    value={selectedAutoLocation}
                    onChange={(e) => setSelectedAutoLocation(e.target.value)}
                    className="w-full border border-gray-250 p-1.5 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white font-bold"
                  >
                    <option value="all">{lang === "en" ? "All Locations" : "എല്ലാ സ്ഥലങ്ങളും"}</option>
                    {TOWN_LOCATIONS.map((town) => (
                      <option key={town.en} value={town.en}>
                        📍 {lang === "en" ? town.en : town.ml}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* LIST OF AUTORIKSHAW TAXIS */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-0.5">
                {filteredAutos.length === 0 ? (
                  <div className="p-12 text-center text-xs text-gray-400 bg-slate-50/50 rounded-xl border border-dashed border-gray-150">
                    <span className="text-3xl block mb-2 opacity-50">🛺</span>
                    {lang === "en" ? "No registered autorikshaw taxis match your query." : "ഈ സ്ഥലത്ത് ഓട്ടോ വിവരങ്ങൾ ലഭ്യമായിട്ടില്ല."}
                  </div>
                ) : (
                  filteredAutos.map((auto) => {
                    const cleanPhone = auto.contact.replace(/[^\d+]/g, "");
                    const isMyOwn = auto.id === myAutoId;
                    
                    return (
                      <div 
                        key={auto.id} 
                        className={`flex justify-between items-center text-xs p-3.5 border rounded-lg transition shadow-3xs hover:border-emerald-300 select-none ${
                          isMyOwn 
                            ? "bg-emerald-50/40 border-emerald-400" 
                            : !auto.isAvailable 
                              ? "bg-slate-50/80 opacity-70 border-gray-100" 
                              : "bg-[#fffdfd] border-gray-150"
                        }`}
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className={`inline-flex items-center gap-1 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                              auto.isAvailable 
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                                : "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${auto.isAvailable ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} />
                              {auto.isAvailable ? (lang === "en" ? "Available" : "ലഭ്യമാണ്") : (lang === "en" ? "Busy / Offline" : "തിരക്കിലാണ്")}
                            </span>

                            <span className="text-[9px] text-slate-400 font-bold font-mono bg-slate-100 px-1 py-0.5 rounded truncate max-w-[120px]">
                              {auto.autoNumber}
                            </span>
                            
                            {isMyOwn && (
                              <span className="text-[8px] font-black bg-[#cfecd5] text-[#144d18] px-1 py-0.5 rounded">
                                {lang === "en" ? "YOU" : "നിങ്ങൾ"}
                              </span>
                            )}
                          </div>

                          <h4 className="font-extrabold text-[#052962] text-sm leading-tight truncate">
                            {lang === "en" ? auto.driverNameEn : auto.driverNameMl}
                          </h4>

                          <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {lang === "en" ? auto.locationEn : auto.locationMl} Stand
                          </p>
                        </div>

                        {/* Call and WhatsApp triggers */}
                        <div className="flex items-center gap-1.5 shrink-0 select-none">
                          {/* Direct Phone Call */}
                          <a
                            href={`tel:${auto.contact}`}
                            className="p-2 border bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border-gray-200 hover:border-emerald-300 rounded shadow-3xs flex items-center justify-center transition shrink-0 cursor-pointer"
                            title={lang === "en" ? "Call Driver" : "വിളിക്കുക"}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {/* WhatsApp Chat prefilled */}
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                              lang === "en" 
                                ? `Hello, I saw your auto taxi service (No: ${auto.autoNumber}) listed on Attappadi Online. Are you available for a ride?`
                                : `ഹലോ, അട്ടപ്പാടി ഓൺലൈൻ പോർട്ടലിൽ നിങ്ങളുടെ ഓട്ടോ ടാക്സി (No: ${auto.autoNumber}) ലിസ്റ്റ് കണ്ടു വിളിക്കുകയാണ്. ഒരു യാത്ര ആവശ്യമുണ്ട്, ലഭ്യമാണോ?`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 border bg-emerald-600 hover:bg-emerald-700 text-white border-transparent rounded shadow-3xs flex items-center justify-center transition shrink-0 cursor-pointer"
                            title={lang === "en" ? "WhatsApp Chat" : "വാട്സാപ്പ് ചാറ്റ്"}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <p className="text-[10px] text-gray-400 text-center italic mt-1 bg-slate-50 p-1.5 rounded">
              {lang === "en" 
                ? "💡 Note: Trips, fares and passenger safety are negotiated directly between you and the driver."
                : "💡 ശ്രദ്ധിക്കുക: ചാർജ്ജ് വിവരങ്ങളും സുരക്ഷിത യാത്രയും ഡ്രൈവറുമായി നേരിട്ട് ഉറപ്പുവരുത്തുക."}
            </p>
          </div>
        ) : (
          /* LOCAL SHOPPING TAB CONTAINER */
          <div className="space-y-4 animate-fade-in text-slate-800">
            {/* Intro Header */}
            <div className="bg-fuchsia-50/50 border border-fuchsia-100 rounded-lg p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-fuchsia-950">
              <div className="space-y-1">
                <h4 className="text-sm font-black flex items-center gap-1.5 text-fuchsia-800">
                  <span className="p-1.5 bg-fuchsia-100 rounded text-base">🛍️</span>
                  {lang === "en" ? "Attappadi Local Shopping & Orders" : "അട്ടപ്പാടി ലോക്കൽ ഷോപ്പിംഗ് പോർട്ടൽ"}
                </h4>
                <p className="text-xs text-fuchsia-900 leading-relaxed font-sans">
                  {lang === "en" 
                    ? "Find local shops across Agali, Goolikkadavu, Pudur, Sholayur & Mukkali. Type your items list and send order instantly over WhatsApp!"
                    : "അഗളി, ഗൂളിക്കടവ്, പുതൂർ, ഷോളയൂർ, മുക്കാലി തുടങ്ങിയ സ്ഥലങ്ങളിലെ കടകൾ കണ്ടെത്താം. നിങ്ങൾക്ക് ആവശ്യമുള്ള സാധനങ്ങൾ ടൈപ്പ് ചെയ്ത് നേരിട്ട് വാട്സാപ്പ് വഴി ഓർഡർ ചെയ്യാം!"}
                </p>
              </div>
            </div>

            {/* Filter and Search Row */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search query input */}
                <div className="relative flex-1">
                  <span className="absolute left-3 inset-y-0 flex items-center text-gray-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input 
                    type="text"
                    placeholder={lang === "en" ? "Search for shops or items (e.g. honey, ragi)..." : "കടകളോ സാധനങ്ങളോ ടൈപ്പ് ചെയ്ത് തിരയുക..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-200 pl-8 pr-3 py-1.5 rounded text-xs focus:ring-1 focus:ring-fuchsia-500 focus:outline-none bg-white placeholder-gray-400 font-semibold"
                  />
                </div>

                {/* Town selector */}
                <div className="min-w-[130px] shrink-0">
                  <select
                    value={selectedShopTown}
                    onChange={(e) => setSelectedShopTown(e.target.value)}
                    className="w-full border border-gray-205 p-1.5 rounded text-xs focus:ring-1 focus:ring-fuchsia-500 focus:outline-none bg-white font-bold"
                  >
                    <option value="all">{lang === "en" ? "All Towns" : "എല്ലാ നഗരങ്ങളും"}</option>
                    {TOWN_LOCATIONS.map((town) => (
                      <option key={town.en} value={town.en}>
                        📍 {lang === "en" ? town.en : town.ml}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Categorical filters */}
              <div className="flex gap-1 overflow-x-auto pb-1 max-w-full text-[10px] select-none scrollbar-none">
                {[
                  { key: "all", en: "All Categories", ml: "എല്ലാം" },
                  { key: "grocery", en: "Groceries", ml: "പലചരക്ക്" },
                  { key: "bakery", en: "Bakery", ml: "ബേക്കറി" },
                  { key: "medical", en: "Medicals", ml: "മരുന്ന് കട" },
                  { key: "vegetables", en: "Vegetables", ml: "പച്ചക്കറികൾ" },
                  { key: "clothing", en: "Clothing", ml: "വസ്ത്രങ്ങൾ" },
                  { key: "electronics", en: "Electronics", ml: "മൊബൈൽസ്" }
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedShopCat(cat.key)}
                    className={`px-3 py-1 rounded-full shrink-0 border transition font-bold ${
                      selectedShopCat === cat.key 
                        ? "bg-fuchsia-700 text-white border-transparent" 
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {lang === "en" ? cat.en : cat.ml}
                  </button>
                ))}
              </div>
            </div>

            {/* List of filtered shops */}
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-0.5">
              {PRE_SEEDED_SHOPS.filter(shop => {
                const query = searchQuery.toLowerCase();
                const matchesSearch = searchQuery === "" ||
                  shop.nameEn.toLowerCase().includes(query) ||
                  shop.nameMl.toLowerCase().includes(query) ||
                  shop.itemsEn.toLowerCase().includes(query) ||
                  shop.itemsMl.toLowerCase().includes(query);
                  
                const matchesTown = selectedShopTown === "all" || shop.locationEn === selectedShopTown;
                const matchesCat = selectedShopCat === "all" || shop.category === selectedShopCat;
                
                return matchesSearch && matchesTown && matchesCat;
              }).length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-400 bg-slate-50/50 rounded-xl border border-dashed border-gray-155">
                  <span className="text-3xl block mb-2 opacity-60">🛍️</span>
                  {lang === "en" ? "No local shops match your filters." : "തിരഞ്ഞെടുത്ത വിഭാഗത്തിൽ വ്യാപാരശാലകൾ ലഭ്യമല്ല."}
                </div>
              ) : (
                PRE_SEEDED_SHOPS.filter(shop => {
                  const query = searchQuery.toLowerCase();
                  const matchesSearch = searchQuery === "" ||
                    shop.nameEn.toLowerCase().includes(query) ||
                    shop.nameMl.toLowerCase().includes(query) ||
                    shop.itemsEn.toLowerCase().includes(query) ||
                    shop.itemsMl.toLowerCase().includes(query);
                  
                  const matchesTown = selectedShopTown === "all" || shop.locationEn === selectedShopTown;
                  const matchesCat = selectedShopCat === "all" || shop.category === selectedShopCat;
                  
                  return matchesSearch && matchesTown && matchesCat;
                }).map((shop) => {
                  const itemsList = lang === "en" ? shop.itemsEn : shop.itemsMl;
                  const targetMsg = customOrderText[shop.id] || "";
                  const successOrder = orderSuccess[shop.id] || false;
                  
                  const handleSendWhatsAppOrder = (sh: LocalShop) => {
                    if (!targetMsg.trim()) return;
                    
                    const introText = lang === "en"
                      ? `Hello *${sh.nameEn}*, I saw your shop listed on *Attappadi Online*. I would like to order the following items:\n\n`
                      : `ഹലോ *${sh.nameMl}*, അട്ടപ്പാടി ഓൺലൈൻ പോർട്ടൽ വഴി കണ്ടാണ് മെസ്സേജ് അയക്കുന്നത്. താഴെ പറയുന്ന സാധനങ്ങൾ ഓർഡർ ചെയ്യാൻ താല്പര്യപ്പെടുന്നു:\n\n`;
                      
                    const finalWhatsAppText = `${introText}${targetMsg}\n\n_Please confirm availability and delivery slot._`;
                    const cleanPhone = sh.contact.replace(/[^\d+]/g, "");
                    
                    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalWhatsAppText)}`, "_blank");
                    
                    // Show confirmation feedback
                    setOrderSuccess(prev => ({ ...prev, [sh.id]: true }));
                    setTimeout(() => {
                      setOrderSuccess(prev => ({ ...prev, [sh.id]: false }));
                    }, 5000);
                  };

                  return (
                    <div key={shop.id} className="bg-white border border-gray-150 hover:border-fuchsia-300 rounded-xl p-3.5 transition shadow-xs flex flex-col md:flex-row gap-3.5">
                      {/* Left side: details */}
                      <div className="flex-1 space-y-2.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 text-[9px] font-black tracking-wider uppercase bg-fuchsia-100 text-fuchsia-800 rounded">
                            {shop.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold text-slate-500 bg-slate-150 px-2 py-0.5 rounded">
                            📍 {lang === "en" ? `${shop.locationEn} Town` : shop.locationMl}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-[#052962] text-sm leading-tight">
                            {lang === "en" ? shop.nameEn : shop.nameMl}
                          </h4>
                          <p className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-100 font-bold px-2 py-0.5 rounded inline-block mt-1">
                            🚚 {lang === "en" ? shop.deliveryEn : shop.deliveryMl}
                          </p>
                        </div>

                        <div className="text-xs bg-slate-50 p-2 rounded border border-gray-100">
                          <span className="text-[9.5px] font-extrabold text-slate-400 block uppercase mb-1 leading-none">
                            {lang === "en" ? "Available Items & Specialities:" : "ലഭ്യമായ പ്രധാന സാധനങ്ങൾ:"}
                          </span>
                          <p className="text-slate-650 font-semibold leading-relaxed">
                            {itemsList}
                          </p>
                        </div>
                      </div>

                      {/* Right side: direct WhatsApp ordering module */}
                      <div className="w-full md:w-[250px] bg-slate-50 border border-gray-200 p-3 rounded-lg flex flex-col justify-between gap-2.5 select-none self-stretch shrink-0">
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-black text-slate-500 uppercase leading-none block">
                            📋 {lang === "en" ? "Write Order List here:" : "വാങ്ങേണ്ട സാധനങ്ങളുടെ ലിസ്റ്റ്:"}
                          </label>
                          <textarea
                            placeholder={lang === "en" ? "e.g. 5kg ragi, honey bucket, 2L coconut oil" : "ഉദാഹരത്തിന്: കാട്ടുതേൻ 1 കുപ്പി, മുത്താറിപ്പൊടി 2 കിലോ..."}
                            value={targetMsg}
                            onChange={(e) => setCustomOrderText(prev => ({ ...prev, [shop.id]: e.target.value }))}
                            className="w-full h-[65px] border border-gray-250 rounded p-1.5 text-xs focus:ring-1 focus:ring-fuchsia-400 focus:outline-none bg-white font-semibold resize-none leading-normal"
                          />
                        </div>

                        <button
                          onClick={() => handleSendWhatsAppOrder(shop)}
                          disabled={!targetMsg.trim()}
                          className={`w-full py-2 flex items-center justify-center gap-1.5 text-[10.5px] font-black rounded text-white shadow-xs transition cursor-pointer select-none ${
                            !targetMsg.trim() 
                              ? "bg-slate-300 cursor-not-allowed opacity-50" 
                              : "bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.01]"
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{lang === "en" ? "ORDER VIA WHATSAPP" : "വാട്സാപ്പിൽ ഓർഡർ ചെയ്യുക"}</span>
                        </button>

                        {successOrder && (
                          <span className="text-[9.5px] font-bold text-center text-emerald-700 animate-pulse bg-emerald-50 py-0.5 border border-emerald-100 rounded">
                            ✔ {lang === "en" ? "Opening WhatsApp..." : "വാട്സാപ്പ് തുറക്കുന്നു..."}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <p className="text-[10px] text-slate-400 text-center italic mt-1 bg-slate-50 p-1.5 rounded border border-gray-150/40">
              {lang === "en" 
                ? "💡 Support: All deliveries, payments & communications are handled independently using direct WhatsApp chat with the corresponding merchants."
                : "💡 നിർദ്ദേശം: പണമിടപാടുകളും സാധനങ്ങളുടെ ലഭ്യതയും വിലവിവരങ്ങളും അതതു കടക്കാരുമായി നേരിട്ട് ചാറ്റിൽ സംസാരിച്ചു തീരുമാനിക്കുക."}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
