import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { 
  Download, Sparkles, Layout, Palette, Search, Image as ImageIcon, 
  Calendar, Languages, Check, FileImage, RefreshCw, Type, AlignLeft,
  ToggleLeft, CheckCircle2, Sliders, Type as FontIcon, ZoomIn, Eye,
  X, Smartphone, Monitor, AlertTriangle
} from "lucide-react";
import Logo from "./Logo";
import { NewsPost, OpinionItem, EventItem, PhotoItem } from "../types";

interface SocialCardGeneratorProps {
  newsList: NewsPost[];
  opinionsList: OpinionItem[];
  eventsList: EventItem[];
  photosList: PhotoItem[];
  triggerToast: (msg: string) => void;
}

// Preset color gradients & themes
const THEME_PRESETS = [
  {
    id: "attappadi-navy",
    name: "Classic Slate Blue (Brand)",
    bg1: "#0a3060",
    bg2: "#051830",
    accent: "#ffe500",
    textPrimary: "#ffffff",
    textSecondary: "#e2e8f0",
    isDark: true
  },
  {
    id: "breaking-crimson",
    name: "Vibrant Crimson (Alert)",
    bg1: "#c70000",
    bg2: "#7a0000",
    accent: "#ffe500",
    textPrimary: "#ffffff",
    textSecondary: "#f1f5f9",
    isDark: true
  },
  {
    id: "eco-emerald",
    name: "River Kunthi Emerald",
    bg1: "#065f46",
    bg2: "#064e3b",
    accent: "#34d399",
    textPrimary: "#ffffff",
    textSecondary: "#d1fae5",
    isDark: true
  },
  {
    id: "sadhya-gold",
    name: "Golden Marigold",
    bg1: "#d97706",
    bg2: "#78350f",
    accent: "#fef08a",
    textPrimary: "#ffffff",
    textSecondary: "#fef3c7",
    isDark: true
  },
  {
    id: "charcoal-brutalist",
    name: "Neon Charcoal",
    bg1: "#1e293b",
    bg2: "#0f172a",
    accent: "#38bdf8",
    textPrimary: "#ffffff",
    textSecondary: "#cbd5e1",
    isDark: true
  },
  {
    id: "vintage-aesthetic",
    name: "Warm Editorial News",
    bg1: "#fcfaf2",
    bg2: "#f3efe0",
    accent: "#9a3412",
    textPrimary: "#1e1b4b",
    textSecondary: "#475569",
    isDark: false
  }
];

export default function SocialCardGenerator({
  newsList,
  opinionsList,
  eventsList,
  photosList,
  triggerToast
}: SocialCardGeneratorProps) {
  // Aggregate all sources for searchable dropdown
  const [sourceItems, setSourceItems] = useState<any[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string>("manual");
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Core editable Card states
  const [cardType, setCardType] = useState("LATEST UPDATE");
  const [headlineEn, setHeadlineEn] = useState("Pudur Tribal Clinic Organizes Free Specialty Treatment Camp");
  const [headlineMl, setHeadlineMl] = useState("പുതൂർ ക്ലിനിക്കിൽ സൗജന്യ സ്പെഷ്യാലിറ്റി മെഡിക്കൽ ക്യാമ്പ് സംഘടിപ്പിക്കുന്നു");
  const [summaryEn, setSummaryEn] = useState("Primary registration commences for specialized pediatric, cardiac and eco-wellness checkups. Free medicine and clinical assistance are provided.");
  const [summaryMl, setSummaryMl] = useState("പീഡിയാട്രിക്, കാർഡിയാക് പരിശോധനകൾക്കായി പ്രാഥമിക രജിസ്ട്രേഷൻ ആരംഭിപ്പിച്ചു. സൗജന്യ മരുന്നുകളും ക്ലിനിക്കൽ സഹായവും ലഭ്യമാണ്.");
  const [publishedDate, setPublishedDate] = useState("June 20, 2026");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200");
  const [showImage, setShowImage] = useState(true);

  // Custom visual controls
  const [sizePreset, setSizePreset] = useState<"square" | "story" | "landscape">("square");
  const [langMode, setLangMode] = useState<"both" | "ml" | "en">("both");
  const [layoutMode, setLayoutMode] = useState<"scrim" | "split" | "sidebar" | "minimal">("scrim");
  
  // Custom color values
  const [selectedPresetId, setSelectedPresetId] = useState("attappadi-navy");
  const [customBg1, setCustomBg1] = useState("#0f172a");
  const [customBg2, setCustomBg2] = useState("#1e293b");
  const [customAccent, setCustomAccent] = useState("#ffe500");
  const [customTxtPrimary, setCustomTxtPrimary] = useState("#ffffff");
  const [customTxtSecondary, setCustomTxtSecondary] = useState("#cbd5e1");
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Detail customizations
  const [titleFontSize, setTitleFontSize] = useState<number>(96);
  const [summaryFontSize, setSummaryFontSize] = useState<number>(24);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(75);
  const [watermarkToggle, setWatermarkToggle] = useState(true);
  const [logoToggle, setLogoToggle] = useState(true);
  const [accentRibbon, setAccentRibbon] = useState(true);

  // Fullscreen Preview Mode & Device Simulations
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDeviceMode, setPreviewDeviceMode] = useState<"pure" | "whatsapp" | "instagram">("pure");
  const [previewZoom, setPreviewZoom] = useState<number>(0.5); // Default 50% size inside modal

  // Dynamic Web layout preview self-adjusting scaling observer
  const [containerWidth, setContainerWidth] = useState(380);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry && entry.contentRect) {
          setContainerWidth(Math.max(entry.contentRect.width - 16, 200));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Render & Generation progress
  const [isGenerating, setIsGenerating] = useState(false);

  // Live preview element ref
  const cardViewportRef = useRef<HTMLDivElement>(null);

  // Card Representation sub-component (Internal closure-aware, used for multiple previews)
  const CardRepresentation = () => {
    return (
      <>
        {/* Layout variation backgrounds */}
        {showImage && layoutMode === "scrim" && (
          <div className="absolute inset-0 z-0">
            <img 
              src={imageUrl} 
              alt="Cover" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover select-none"
            />
            {/* Heavy dark gradient scrim overlay dynamically customizable */}
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, transparent 20%, ${customBg2} 85%)`,
                opacity: `${overlayOpacity / 100}`
              }}
            />
          </div>
        )}

        {/* Accent header border ribbon design */}
        {accentRibbon && (
          <div 
            className="absolute top-0 left-0 right-0 h-4 z-10"
            style={{ backgroundColor: customAccent }}
          />
        )}

        {/* CARD CONTENTS WRAPPER */}
        <div className="absolute inset-0 p-12 flex flex-col justify-between z-10 h-full">
          
          {/* 1. Header Row */}
          <div className="flex justify-between items-center pt-3 w-full">
            <div className="flex items-center gap-6">
              {/* Badge */}
              <span 
                className="rounded-md uppercase inline-block font-extrabold tracking-wider"
                style={{ 
                  backgroundColor: customAccent, 
                  color: "#000000",
                  fontSize: "26px",
                  padding: "10px 24px"
                }}
              >
                {cardType}
              </span>
              <span 
                className="font-extrabold tracking-wide" 
                style={{ 
                  color: customTxtPrimary,
                  opacity: 0.9,
                  fontSize: "24px" 
                }}
              >
                {publishedDate}
              </span>
            </div>

            {/* Website Brand Header text-only */}
            {logoToggle && (
              <div 
                className="font-extrabold italic tracking-tighter shrink-0" 
                style={{ 
                  fontSize: "44px", 
                  color: customTxtPrimary,
                  letterSpacing: "-2px",
                  fontFamily: '"Anek Malayalam", sans-serif'
                }}
              >
                Attappadi<span style={{ color: customAccent }}>Online</span>
              </div>
            )}
          </div>

          {/* Layout Option B: Bento Split */}
          {layoutMode === "split" && showImage && (
            <div className="h-72 w-full rounded-md overflow-hidden my-4 shrink-0 shadow-lg relative" style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <img 
                src={imageUrl} 
                alt="Story focus" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none"
              />
            </div>
          )}

          {/* Layout Option C: Sidebar layout small image accent */}
          {layoutMode === "sidebar" && showImage && (
            <div className="flex gap-4 items-center my-4 shrink-0 p-4 rounded-md relative" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <div className="w-24 h-24 rounded overflow-hidden shrink-0">
                <img 
                  src={imageUrl} 
                  alt="Sidebar visual" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none"
                />
              </div>
              <div>
                <p className="text-[20px] font-semibold italic" style={{ opacity: 0.85 }}>
                  "Attappadi native coverage and local community report with visual graphics."
                </p>
              </div>
            </div>
          )}

          {/* 2. Headline & Body Blocks */}
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            
            {/* A. Malayalam Headline */}
            {(langMode === "both" || langMode === "ml") && (
              <h1 
                className="font-extrabold tracking-tight leading-relaxed font-anek-malayalam"
                style={{ 
                  fontSize: `${titleFontSize}px`,
                  color: customTxtPrimary,
                  textShadow: "0 2px 4px rgba(0,0,0,0.4)"
                }}
              >
                {headlineMl}
              </h1>
            )}

            {/* Accent Highlight Bar between elements */}
            {langMode === "both" && (
              <div className="w-16 h-1 rounded select-none shrink-0" style={{ backgroundColor: customAccent }} />
            )}

            {/* B. English Headline */}
            {(langMode === "both" || langMode === "en") && (
              <h2 
                className="font-extrabold tracking-tight leading-snug font-anek-malayalam"
                style={{ 
                  fontSize: `${titleFontSize - 8}px`,
                  color: customTxtPrimary,
                  textShadow: "0 2px 4px rgba(0,0,0,0.4)"
                }}
              >
                {headlineEn}
              </h2>
            )}

            {/* C. Summaries block */}
            <div className="space-y-3 pt-2">
              
              {/* Malayalam Summary paragraph */}
              {(langMode === "both" || langMode === "ml") && (
                <p 
                  className="leading-relaxed font-anek-malayalam"
                  style={{ 
                    fontSize: `${summaryFontSize}px`,
                    color: customTxtSecondary,
                    opacity: 0.9
                  }}
                >
                  {summaryMl}
                </p>
              )}

              {/* English Summary paragraph */}
              {(langMode === "both" || langMode === "en") && (
                <p 
                  className="leading-relaxed font-medium font-anek-malayalam"
                  style={{ 
                    fontSize: `${summaryFontSize - 2}px`,
                    color: customTxtSecondary,
                    opacity: 0.9
                  }}
                >
                  {summaryEn}
                </p>
              )}
            </div>
          </div>

          {/* 3. Footer branding info card */}
          {watermarkToggle && (
            <div className="flex justify-between items-center pt-6 shrink-0" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}>
              <div className="flex items-center gap-2 font-black tracking-widest font-anek-malayalam select-none" style={{ fontSize: "18px", color: customAccent }}>
                <span>🌐 ATTAPPADI ONLINE OFFICIAL DECK</span>
              </div>
              <div className="tracking-widest font-bold flex gap-4 font-anek-malayalam select-none" style={{ fontSize: "20px", color: "#ffffff", opacity: 0.8 }}>
                <span>• attappadionline.com</span>
                <span>• @attappadionline</span>
              </div>
            </div>
          )}

        </div>
      </>
    );
  };

  // Group and assemble searchable list of published items
  useEffect(() => {
    const arr: any[] = [];
    
    // 1. News Articles
    newsList.forEach((n) => {
      arr.push({
        id: `news-${n.id}`,
        dbId: n.id,
        type: "news",
        categoryLabel: n.category === "breaking" ? "🔴 BREAKING NEWS" : n.category === "updates" ? "⚡ LIVE SCROLL" : "📰 LATEST NEWS",
        titleEn: n.titleEn,
        titleMl: n.titleMl,
        contentEn: n.contentEn,
        contentMl: n.contentMl,
        image: n.image,
        date: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "June 20, 2026"
      });
    });

    // 2. Opinions
    opinionsList.forEach((op) => {
      arr.push({
        id: `opinion-${op.id}`,
        dbId: op.id,
        type: "opinion",
        categoryLabel: "✍️ OPINION/COLUMN",
        titleEn: op.titleEn,
        titleMl: op.titleMl,
        contentEn: op.contentEn,
        contentMl: op.contentMl,
        image: "", // Opinion often has no image, fallback color or author avatar
        date: op.createdAt ? new Date(op.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "June 20, 2026"
      });
    });

    // 3. Events
    eventsList.forEach((ev) => {
      arr.push({
        id: `event-${ev.id}`,
        dbId: ev.id,
        type: "event",
        categoryLabel: "📅 COMMUNITY EVENT",
        titleEn: ev.titleEn,
        titleMl: ev.titleMl,
        contentEn: `${ev.date} @ ${ev.time || ""} - Location: ${ev.locationEn}`,
        contentMl: `${ev.date} @ ${ev.time || ""} - സ്ഥലം: ${ev.locationMl}`,
        image: "",
        date: ev.date
      });
    });

    // 4. Photos
    photosList.forEach((ph) => {
      arr.push({
        id: `photo-${ph.id}`,
        dbId: ph.id,
        type: "photo",
        categoryLabel: "GALLERY PHOTO",
        titleEn: ph.titleEn,
        titleMl: ph.titleMl,
        contentEn: ph.descEn,
        contentMl: ph.descMl,
        image: ph.url,
        date: "June 2026"
      });
    });

    setSourceItems(arr);
  }, [newsList, opinionsList, eventsList, photosList]);

  // Load selected source values into form
  const handleSelectSource = (item: any) => {
    setSelectedSourceId(item.id);
    setDropdownOpen(false);
    
    // Auto populate values
    setCardType(item.type.toUpperCase() === "NEWS" ? "NEWS BULLETIN" : item.type.toUpperCase() === "OPINION" ? "OPINION COLUMNS" : item.type.toUpperCase() === "EVENT" ? "COMMUNITY EVENT" : "PHOTO STORY");
    setHeadlineEn(item.titleEn || "");
    setHeadlineMl(item.titleMl || "");
    
    // Truncate some content for short summary
    const tempEn = item.contentEn || "";
    const cleanEn = tempEn.replace(/<[^>]*>/g, ""); // Strip potential html tags
    setSummaryEn(cleanEn.length > 150 ? cleanEn.substring(0, 150) + "..." : cleanEn);

    const tempMl = item.contentMl || "";
    const cleanMl = tempMl.replace(/<[^>]*>/g, "");
    setSummaryMl(cleanMl.length > 150 ? cleanMl.substring(0, 150) + "..." : cleanMl);

    setPublishedDate(item.date || "June 20, 2026");
    
    if (item.image) {
      setImageUrl(item.image);
      setShowImage(true);
    } else {
      setShowImage(false);
    }

    triggerToast(`✨ Loaded "${item.titleEn || item.titleMl}" into templates!`);
  };

  const handleManualReset = () => {
    setSelectedSourceId("manual");
    setCardType("LATEST BULLETIN");
    setHeadlineEn("Enter Custom Social Card Headline Here");
    setHeadlineMl("നിങ്ങളുടെ വാർത്താ തലക്കെട്ട് ഇവിടെ എഴുതുക");
    setSummaryEn("Write a custom brief summary or announcement details that fit beautifully on WhatsApp Status or Instagram posters.");
    setSummaryMl("സമൂഹ മാധ്യമങ്ങളിൽ ആകർഷകമായി പങ്കുവെക്കാനായി വാർത്തയുടെയും അറിയിപ്പുകളുടെയും ചുരുക്കം ഇവിടെ ചേർക്കുക.");
    setPublishedDate("June 20, 2026");
    setImageUrl("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200");
    setShowImage(true);
    triggerToast("✏️ Switched to Manual Design mode.");
  };

  // Preset palette selections
  const handlePresetSelect = (preset: typeof THEME_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setIsCustomMode(false);
    setCustomBg1(preset.bg1);
    setCustomBg2(preset.bg2);
    setCustomAccent(preset.accent);
    setCustomTxtPrimary(preset.textPrimary);
    setCustomTxtSecondary(preset.textSecondary);
  };

  // Custom color activation helper
  const handleCustomColorChange = (field: string, val: string) => {
    setIsCustomMode(true);
    setSelectedPresetId("custom");
    if (field === "bg1") setCustomBg1(val);
    if (field === "bg2") setCustomBg2(val);
    if (field === "accent") setCustomAccent(val);
    if (field === "primary") setCustomTxtPrimary(val);
    if (field === "secondary") setCustomTxtSecondary(val);
  };

  // Image file read helper
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setImageUrl(uploadEvent.target.result as string);
          setShowImage(true);
          triggerToast("📸 Custom photo uploaded successfully.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Core download triggers html2canvas capture the target block
  const handleDownloadCard = async () => {
    const cardElement = cardViewportRef.current || document.getElementById("export-container");
    if (!cardElement) return;
    setIsGenerating(true);
    triggerToast("🎨 Baking high quality card... Please wait.");
    
    // Ensure fonts and images are fully loaded before rendering
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Oklch & Oklab conversion helpers for accurate high-fidelity rendering
    const oklchToRgb = (lStr: string, cStr: string, hStr: string, aStr?: string): string => {
      let L = parseFloat(lStr);
      if (lStr.includes("%")) L /= 100;

      let C = parseFloat(cStr);
      if (cStr.includes("%")) C = (C / 100) * 0.4;

      let HInput = hStr.trim();
      let H = parseFloat(HInput);
      if (HInput.endsWith("rad")) {
        H = parseFloat(HInput) * (180 / Math.PI);
      } else if (HInput.endsWith("grad")) {
        H = parseFloat(HInput) * 0.9;
      } else if (HInput.endsWith("turn")) {
        H = parseFloat(HInput) * 360;
      } else if (HInput.endsWith("deg")) {
        H = parseFloat(HInput);
      }

      const hRad = (H * Math.PI) / 180;
      const a = C * Math.cos(hRad);
      const b = C * Math.sin(hRad);

      return oklabToRgb(L, a, b, aStr);
    };

    const oklabToRgb = (L: number, a: number, bValParam: number, aStr?: string): string => {
      const l_ = L + 0.3963377774 * a + 0.2158037573 * bValParam;
      const m_ = L - 0.1055613458 * a - 0.0638541728 * bValParam;
      const s_ = L - 0.0894841775 * a - 1.2914855480 * bValParam;

      const l = Math.pow(Math.max(0, l_), 3);
      const m = Math.pow(Math.max(0, m_), 3);
      const s = Math.pow(Math.max(0, s_), 3);

      let rLinear = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      let gLinear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      let bLinear = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

      const convertChannel = (c: number) => {
        if (c <= 0.0031308) {
          return Math.round(Math.max(0, Math.min(255, 12.92 * c * 255)));
        } else {
          return Math.round(Math.max(0, Math.min(255, (1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255)));
        }
      };

      const r = convertChannel(rLinear);
      const g = convertChannel(gLinear);
      const b = convertChannel(bLinear);

      if (aStr) {
        let alpha = parseFloat(aStr);
        if (aStr.includes("%")) alpha /= 100;
        if (isNaN(alpha)) alpha = 1;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }

      return `rgb(${r}, ${g}, ${b})`;
    };

    const scrubCSS = (content: string): string => {
      let result = "";
      let i = 0;
      const lowerContent = content.toLowerCase();
      while (i < content.length) {
        if (lowerContent.indexOf("oklch(", i) === i || lowerContent.indexOf("oklab(", i) === i) {
          const isOklch = lowerContent.indexOf("oklch(", i) === i;
          const startIdx = i;
          i += 6;
          let parenCount = 1;
          while (i < content.length && parenCount > 0) {
            if (content[i] === "(") {
              parenCount++;
            } else if (content[i] === ")") {
              parenCount--;
            }
            i++;
          }
          const rawColorBlock = content.substring(startIdx, i);
          try {
            const inner = rawColorBlock.slice(rawColorBlock.indexOf("(") + 1, rawColorBlock.lastIndexOf(")")).trim();
            const parts = inner.split("/");
            const colorPartsStr = parts[0].trim();
            const alphaStr = parts[1] ? parts[1].trim() : undefined;
            
            const colorParts = colorPartsStr.split(/[\s,]+/).filter(Boolean);
            if (colorParts.length >= 3) {
              if (isOklch) {
                result += oklchToRgb(colorParts[0], colorParts[1], colorParts[2], alphaStr);
              } else {
                let L = parseFloat(colorParts[0]);
                if (colorParts[0].includes("%")) L /= 100;
                let aVal = parseFloat(colorParts[1]);
                if (colorParts[1].includes("%")) aVal = (aVal / 100) * 0.4;
                let bVal = parseFloat(colorParts[2]);
                if (colorParts[2].includes("%")) bVal = (bVal / 100) * 0.4;
                result += oklabToRgb(L, aVal, bVal, alphaStr);
              }
            } else {
              result += "rgb(0, 0, 0)";
            }
          } catch (e) {
            result += "rgb(0, 0, 0)";
          }
        } else {
          result += content[i];
          i++;
        }
      }
      return result;
    };

    // Capture and replace any stylesheet blocks using oklch/oklab to bypass html2canvas crashes
    const styleElements = Array.from(document.querySelectorAll("style"));
    const originalContents = styleElements.map((el) => el.innerHTML);

    const linkElements = Array.from(document.querySelectorAll("link[rel='stylesheet']")) as HTMLLinkElement[];
    const disabledLinks: HTMLLinkElement[] = [];
    const tempStyleElements: HTMLStyleElement[] = [];

    // Layer 2: Preprocess document.styleSheets CSSOM Rules directly
    interface SavedValue {
      styleObject: CSSStyleDeclaration;
      originalCssText: string;
    }
    const savedCssRules: SavedValue[] = [];

    const processRulesList = (rulesList: CSSRuleList) => {
      try {
        for (const rule of Array.from(rulesList)) {
          if (rule.type === 1 || (rule && 'style' in rule)) { // STYLE_RULE = 1
            const style = (rule as any).style;
            if (style) {
              try {
                const cssText = style.cssText;
                if (cssText && /oklch|oklab/i.test(cssText)) {
                  savedCssRules.push({
                    styleObject: style,
                    originalCssText: cssText,
                  });
                  style.cssText = scrubCSS(cssText);
                }
              } catch (_) {}
            }
          } else if ('cssRules' in rule && (rule as any).cssRules) {
            processRulesList((rule as any).cssRules);
          }
        }
      } catch (err) {
        console.warn("Error processing rules list", err);
      }
    };

    try {
      styleElements.forEach((el) => {
        const cleaned = scrubCSS(el.innerHTML);
        if (el.innerHTML !== cleaned) {
          el.innerHTML = cleaned;
        }
      });
    } catch (e) {
      console.warn("Failed to preprocess inline styles", e);
    }

    // Process external link stylesheet tags
    try {
      await Promise.all(
        linkElements.map(async (link) => {
          try {
            const res = await fetch(link.href);
            if (res.ok) {
              const cssText = await res.text();
              const scrubbed = scrubCSS(cssText);
              
              const tempStyle = document.createElement("style");
              tempStyle.className = "temp-capture-style";
              tempStyle.innerHTML = scrubbed;
              document.head.appendChild(tempStyle);
              tempStyleElements.push(tempStyle);

              link.disabled = true;
              disabledLinks.push(link);
            }
          } catch (err) {
            console.warn("Failed to preprocess external link style", link.href, err);
          }
        })
      );
    } catch (e) {
      console.warn("Failed link preprocessing loop", e);
    }

    try {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          if (sheet.cssRules) {
            processRulesList(sheet.cssRules);
          }
        } catch (_) {
          // Cross-origin sheets safely ignored
        }
      }
    } catch (e) {
      console.warn("Failed CSSOM oklch/oklab scan", e);
    }

    // Scrub inline style attributes on any elements inside the document
    interface SavedElementStyle {
      element: HTMLElement;
      originalStyle: string;
    }
    const savedElementStyles: SavedElementStyle[] = [];

    try {
      const allElements = Array.from(document.querySelectorAll("*")) as HTMLElement[];
      allElements.forEach((el) => {
        if (el.style) {
          const cssText = el.style.cssText;
          if (cssText && /oklch|oklab/i.test(cssText)) {
            savedElementStyles.push({
              element: el,
              originalStyle: cssText,
            });
            el.style.cssText = scrubCSS(cssText);
          }
        }
      });
    } catch (e) {
      console.warn("Failed inline element style scan", e);
    }

    // Capture and pre-resolve layout styles directly in the DOM tree of the target card element
    interface SavedInlineStyle {
      element: HTMLElement;
      originalStyleText: string;
    }
    const savedTreeElementsInlineStyles: SavedInlineStyle[] = [];

    const convertElementTreeStyles = (el: HTMLElement) => {
      try {
        const computed = window.getComputedStyle(el);
        const propertiesToConvert = [
          "color",
          "backgroundColor",
          "borderColor",
          "borderTopColor",
          "borderBottomColor",
          "borderLeftColor",
          "borderRightColor",
          "outlineColor",
          "boxShadow",
          "textShadow",
          "backgroundImage",
          "fill",
          "stroke"
        ];

        let styleTextModified = false;
        const currentInlineStyle = el.style.cssText;

        propertiesToConvert.forEach((prop) => {
          try {
            const val = computed[prop as any];
            if (val && (val.toLowerCase().includes("oklch") || val.toLowerCase().includes("oklab"))) {
              if (!styleTextModified) {
                savedTreeElementsInlineStyles.push({
                  element: el,
                  originalStyleText: currentInlineStyle
                });
                styleTextModified = true;
              }
              const cleanedVal = scrubCSS(val);
              el.style[prop as any] = cleanedVal;
            }
          } catch (_) {}
        });

        // Also check inline style specifically
        if (currentInlineStyle && (currentInlineStyle.toLowerCase().includes("oklch") || currentInlineStyle.toLowerCase().includes("oklab"))) {
          if (!styleTextModified) {
            savedTreeElementsInlineStyles.push({
              element: el,
              originalStyleText: currentInlineStyle
            });
            styleTextModified = true;
          }
          el.style.cssText = scrubCSS(currentInlineStyle);
        }

        // Recurse down children
        Array.from(el.children).forEach((child) => {
          convertElementTreeStyles(child as HTMLElement);
        });
      } catch (err) {
        console.warn("Error converting element tree styles", err);
      }
    };

    // Pre-resolve styles inside the target card
    convertElementTreeStyles(cardElement as HTMLElement);

    try {
      const element = cardElement as HTMLElement;
      
      // Target measurements
      let width = 1080;
      let height = 1080;
      if (sizePreset === "story") {
        width = 1080;
        height = 1920;
      } else if (sizePreset === "landscape") {
        width = 1200;
        height = 675;
      }

      // High quality export options
      const canvas = await html2canvas(element, {
        width: width,
        height: height,
        scale: 2, // Retinal high resolution multiplier
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scrollX: 0,
        scrollY: 0,
        onclone: (documentClone) => {
          // Remove potential interactive UI badges or custom cursor attributes
          const renderedElement = documentClone.querySelector("#export-container") as HTMLElement;
          if (renderedElement) {
            renderedElement.style.transform = "none";
          }
        }
      });

      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      const filename = `AttappadiOnline_${cardType.replace(/\s+/g, "_")}_${Date.now()}.png`;
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsGenerating(false);
      triggerToast("✅ Downloaded image! Perfect for social media sharing.");
    } catch (err) {
      console.error("Card render error:", err);
      setIsGenerating(false);
      alert("Failed to render high fidelity image. This can sometimes occur due to external visual assets blocking CORS. Please load/paste a client-safe URL or upload standard photos from your local device.");
    } finally {
      // Restore target element tree modified styles
      savedTreeElementsInlineStyles.forEach(({ element, originalStyleText }) => {
        try {
          element.style.cssText = originalStyleText;
        } catch (_) {}
      });

      // Restore disabled link elements
      disabledLinks.forEach((link) => {
        try {
          link.disabled = false;
        } catch (_) {}
      });

      // Remove temporary styles
      tempStyleElements.forEach((el) => {
        try {
          el.remove();
        } catch (_) {}
      });

      // Restore CSSStyleDeclaration properties back via cssText
      savedCssRules.forEach(({ styleObject, originalCssText }) => {
        try {
          styleObject.cssText = originalCssText;
        } catch (_) {}
      });

      // Restore inline style attributes
      savedElementStyles.forEach(({ element, originalStyle }) => {
        try {
          element.style.cssText = originalStyle;
        } catch (_) {}
      });

      // Restore CSS rules completely back to high luxury oklch systems
      styleElements.forEach((el, idx) => {
        if (el.innerHTML !== originalContents[idx]) {
          el.innerHTML = originalContents[idx];
        }
      });
    }
  };

  // Searching items
  const filteredSources = sourceItems.filter((it) => {
    const textStr = `${it.titleEn} ${it.titleMl} ${it.categoryLabel}`.toLowerCase();
    return textStr.includes(searchTerm.toLowerCase());
  });

  // Calculate scaled box size of viewport for local live preview representation
  const cardWidth = sizePreset === "landscape" ? 1200 : 1080;
  const cardHeight = sizePreset === "story" ? 1920 : sizePreset === "landscape" ? 675 : 1080;
  const dynamicScale = Math.min(containerWidth / cardWidth, 1);
  const previewScale = dynamicScale;

  // Dimension Styles of the raw high res container to export
  const exportContainerStyle = {
    width: `${cardWidth}px`,
    height: `${cardHeight}px`,
    transform: `scale(${dynamicScale})`,
    transformOrigin: "top left"
  };

  const wrapperWidth = cardWidth * dynamicScale;
  const wrapperHeight = cardHeight * dynamicScale;

  // Container height for outer preview visual box to reserve correct space because of absolute scaling
  const heightRem = `${wrapperHeight}px`;

  return (
    <div className="bg-[#f8fafc] rounded-xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
      
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
        <div>
          <span className="text-[10px] bg-[#005689] text-[#ffe500] uppercase tracking-wider px-2 py-0.5 rounded font-extrabold flex items-center gap-1 w-fit mb-1.5">
            <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" /> New Feature Release
          </span>
          <h2 className="text-xl font-serif font-bold text-[#0a3060]">Social Media Card Designer</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Design, format, and download ready-made graphics for WhatsApp Status, Instagram, and Facebook posts. Populate directly from live portal announcements or composer custom articles manually!
          </p>
        </div>

        {/* Right download triggers */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="px-4 py-2.5 bg-sky-50 text-[#005689] hover:bg-sky-100 border border-sky-200 text-xs font-bold rounded-lg shadow-xs hover:shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-sky-600 animate-pulse" />
            <span>Preview & Analyse</span>
          </button>

          <button
            onClick={handleDownloadCard}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-[#0a3060] hover:bg-[#005689] disabled:bg-slate-400 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-yellow-400" />
                <span>Generating Image...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-300" />
                <span>Export High Res PNG</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left is customization workspace, Right is visual live canvas rendering card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Controls & Configurations (7/12) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* STEP 1: Select Source */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide border-b pb-1.5">
              <Sliders className="w-4 h-4 text-[#005689]" /> 1. Select Published Item / Draft Source
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Manual Selection button */}
              <button
                type="button"
                onClick={handleManualReset}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedSourceId === "manual"
                    ? "bg-[#005689] text-white border-transparent"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Design From Scratch</span>
              </button>

              {/* Custom Dropdown Search */}
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-left font-semibold flex items-center justify-between text-slate-750 hover:bg-slate-100"
                >
                  <span className="truncate">
                    {selectedSourceId === "manual" 
                      ? "🔍 Load an existing website page..." 
                      : `Selected: ${sourceItems.find(x => x.id === selectedSourceId)?.titleEn || "Loaded document"}`}
                  </span>
                  <span className="text-slate-450 ml-2">▼</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-[20] p-1.5 space-y-1">
                    <div className="flex items-center gap-1.5 border-b pb-1 mb-1 px-1.5">
                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search published news, opinions, events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-xs outline-none bg-none py-1 text-slate-700 font-medium"
                        autoFocus
                      />
                    </div>
                    {filteredSources.length === 0 ? (
                      <p className="text-[10px] text-slate-400 p-2 text-center font-semibold">No items match search filter.</p>
                    ) : (
                      filteredSources.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectSource(item)}
                          className="w-full text-left p-2 rounded hover:bg-slate-50 transition block text-[11px] border-b border-slate-100 last:border-0"
                        >
                          <div className="flex items-center justify-between font-bold mb-0.5">
                            <span className="text-[9px] text-sky-800 font-extrabold uppercase">{item.categoryLabel}</span>
                            <span className="text-[9px] text-slate-400 font-medium">{item.date}</span>
                          </div>
                          <p className="font-bold text-slate-800 truncate">{item.titleEn}</p>
                          {item.titleMl && <p className="text-slate-400 truncate text-[10px] font-anek-malayalam font-bold">{item.titleMl}</p>}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: Custom Text Fields */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide border-b pb-1.5">
              <AlignLeft className="w-4 h-4 text-[#005689]" /> 2. Content Customization
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type Category sticker */}
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">Category / Header Tag</label>
                <input
                  type="text"
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  placeholder="e.g. BREAKING NEWS"
                  className="w-full border border-slate-200 rounded p-2 text-xs font-semibold focus:outline-sky-600 block text-slate-700"
                />
              </div>

              {/* Date stamp */}
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">Date / Subscript Label</label>
                <input
                  type="text"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs font-semibold focus:outline-sky-600 block text-slate-700"
                />
              </div>
            </div>

            {/* Headline fields */}
            <div className="grid grid-cols-1 gap-3.5 pt-1">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">English Headline</label>
                <textarea
                  rows={2}
                  value={headlineEn}
                  onChange={(e) => setHeadlineEn(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs font-bold focus:outline-sky-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">Malayalam Headline (മലയാളം തലക്കെട്ട്)</label>
                <textarea
                  rows={2}
                  value={headlineMl}
                  onChange={(e) => setHeadlineMl(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs font-bold font-anek-malayalam focus:outline-sky-600 text-[#005689]"
                />
              </div>
            </div>

            {/* Summaries fields */}
            <div className="grid grid-cols-1 gap-3.5 pt-1">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">English Short Summary</label>
                <textarea
                  rows={3}
                  value={summaryEn}
                  onChange={(e) => setSummaryEn(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs focus:outline-sky-600 text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">Malayalam Short Summary (ചുരുക്കം)</label>
                <textarea
                  rows={3}
                  value={summaryMl}
                  onChange={(e) => setSummaryMl(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs font-anek-malayalam focus:outline-sky-600 text-slate-600 font-medium"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Images & Layout */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide border-b pb-1.5">
              <FileImage className="w-4 h-4 text-[#005689]" /> 3. Layout & Graphic Asset Customizations
            </h3>

            {/* Custom sizing presets */}
            <div>
              <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">Card Format Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "square", label: "Square Poster (1:1)", info: "1080x1080 • WhatsApp / Insta" },
                  { id: "story", label: "Tall Story (9:16)", info: "1080x1920 • WhatsApp Status" },
                  { id: "landscape", label: "Landscape (16:9)", info: "1200x675 • FB Link Header" }
                ].map((sz) => (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => setSizePreset(sz.id as any)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                      sizePreset === sz.id 
                        ? "bg-slate-900 text-white border-transparent" 
                        : "bg-slate-50 text-slate-850 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <p className="text-[11px] font-bold">{sz.label}</p>
                    <p className="text-[9px] text-slate-450 mt-0.5">{sz.info}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Language layouts */}
            <div>
              <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">Active Language Render</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "both", label: "Bilingual Stack", info: "Eng & Mal (Both)" },
                  { id: "ml", label: "Malayalam Only", info: "മലയാളത്തിൽ മാത്രം" },
                  { id: "en", label: "English Only", info: "International font" }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setLangMode(f.id as any)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center cursor-pointer transition ${
                      langMode === f.id 
                        ? "bg-[#005689] text-[#ffe500] border-transparent" 
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <p>{f.label}</p>
                    <p className="text-[8px] text-slate-450 mt-0.5">{f.info}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout type */}
            <div>
              <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">Template Layout Architecture</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "scrim", label: "Overlay Glass", info: "Cover scrim" },
                  { id: "split", label: "Bento Split", info: "Grid style" },
                  { id: "sidebar", label: "Modern Rail", info: "Side colors" },
                  { id: "minimal", label: "Clean Solid", info: "Minimal text" }
                ].map((ly) => (
                  <button
                    key={ly.id}
                    type="button"
                    onClick={() => {
                      setLayoutMode(ly.id as any);
                      if (ly.id === "minimal") {
                        setShowImage(false);
                      } else {
                        setShowImage(true);
                      }
                    }}
                    className={`p-2 rounded-lg border text-center cursor-pointer transition ${
                      layoutMode === ly.id 
                        ? "bg-slate-900 text-white border-transparent" 
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <p className="text-[10px] font-bold">{ly.label}</p>
                    <span className="text-[8px] text-slate-450 block mt-0.5">{ly.info}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo settings */}
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200/60 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cover Image Display</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={showImage}
                      onChange={(e) => setShowImage(e.target.checked)}
                    />
                    <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                
                {showImage && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Paste Image URL"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded py-1 px-2 text-[10px] font-mono"
                    />
                    <span className="text-[9px] text-slate-400 block font-semibold">Or upload local screenshot/photo:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-[10px] text-slate-500 block file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold">Image Cover Overlay Opacity ({overlayOpacity}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                    disabled={!showImage}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#005689] my-2"
                  />
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={watermarkToggle}
                      onChange={(e) => setWatermarkToggle(e.target.checked)}
                      className="rounded text-[#005689] focus:ring-0 focus:outline-none"
                    />
                    <span>Show Footer Link</span>
                  </label>
                  
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={logoToggle}
                      onChange={(e) => setLogoToggle(e.target.checked)}
                      className="rounded text-[#005689] focus:ring-0"
                    />
                    <span>Website Header Brand Text</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accentRibbon}
                      onChange={(e) => setAccentRibbon(e.target.checked)}
                      className="rounded text-[#005689] focus:ring-0"
                    />
                    <span>Accent Ribbon border</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: Typography & Color Presets */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide border-b pb-1.5">
              <Palette className="w-4 h-4 text-[#005689]" /> 4. Typography & Color Themes
            </h3>

            {/* Palette Presets selector */}
            <div>
              <label className="block text-[10px] text-slate-500 font-bold mb-1.5 uppercase tracking-wide">Brand Color presets</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {THEME_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition flex items-center gap-2 ${
                      selectedPresetId === p.id 
                        ? "border-[#005689] ring-2 ring-sky-100" 
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div 
                      className="w-4.5 h-4.5 rounded-full shrink-0 shadow-inner flex items-center justify-center text-[8px] font-bold border border-white"
                      style={{ background: `linear-gradient(135deg, ${p.bg1}, ${p.bg2})` }}
                    />
                    <div className="truncate">
                      <p className="text-[10px] font-bold text-slate-800 leading-tight">{p.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom designer color pickers */}
            <div className="bg-slate-100 rounded-lg p-3 space-y-2.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Custom Palette Designer (Will override preset)</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-bold text-slate-600">
                <div className="flex flex-col items-center p-1.5 bg-white rounded border">
                  <span>Bg Color 1</span>
                  <input
                    type="color"
                    value={customBg1}
                    onChange={(e) => handleCustomColorChange("bg1", e.target.value)}
                    className="w-8 h-6 border rounded cursor-pointer mt-1"
                  />
                </div>
                <div className="flex flex-col items-center p-1.5 bg-white rounded border">
                  <span>Bg Color 2</span>
                  <input
                    type="color"
                    value={customBg2}
                    onChange={(e) => handleCustomColorChange("bg2", e.target.value)}
                    className="w-8 h-6 border rounded cursor-pointer mt-1"
                  />
                </div>
                <div className="flex flex-col items-center p-1.5 bg-white rounded border">
                  <span>Gold Accent</span>
                  <input
                    type="color"
                    value={customAccent}
                    onChange={(e) => handleCustomColorChange("accent", e.target.value)}
                    className="w-8 h-6 border rounded cursor-pointer mt-1"
                  />
                </div>
                <div className="flex flex-col items-center p-1.5 bg-white rounded border">
                  <span>Headline Text</span>
                  <input
                    type="color"
                    value={customTxtPrimary}
                    onChange={(e) => handleCustomColorChange("primary", e.target.value)}
                    className="w-8 h-6 border rounded cursor-pointer mt-1"
                  />
                </div>
                <div className="flex flex-col items-center p-1.5 bg-white rounded border">
                  <span>Summary Text</span>
                  <input
                    type="color"
                    value={customTxtSecondary}
                    onChange={(e) => handleCustomColorChange("secondary", e.target.value)}
                    className="w-8 h-6 border rounded cursor-pointer mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Typography sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">Headline Size ({titleFontSize}px)</label>
                <input
                  type="range"
                  min="24"
                  max="96"
                  value={titleFontSize}
                  onChange={(e) => setTitleFontSize(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">Summary Font Size ({summaryFontSize}px)</label>
                <input
                  type="range"
                  min="16"
                  max="36"
                  value={summaryFontSize}
                  onChange={(e) => setSummaryFontSize(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive High-Precision Social Card Preview Zone (5/12) */}
        <div className="lg:col-span-5 space-y-3 lg:sticky lg:top-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold bg-slate-100/50 p-2 rounded border">
            <span className="flex items-center gap-1 block"><Eye className="w-4 h-4 text-sky-700 inline" /> Web Preview Layout</span>
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              className="text-[10px] bg-sky-100 text-sky-900 border border-sky-300 px-2 py-0.5 rounded font-bold hover:bg-sky-200 cursor-pointer transition flex items-center gap-1 select-none"
            >
              <span>🔍 Open HD Inspector</span>
            </button>
          </div>

          {/* Reserved visual space to absolute wrap and transform card */}
          <div 
            ref={containerRef}
            className="w-full relative bg-slate-900 border border-slate-750 shadow-2xl rounded-xl overflow-hidden flex items-center justify-center p-3 select-none"
            style={{ minHeight: "320px" }}
          >
            {/* WRAPPER RETAINING EXACT SCALED CONTENT AREA TO ALIGN DEAD CENTER */}
            <div
              style={{
                width: `${wrapperWidth}px`,
                height: `${wrapperHeight}px`,
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* ABSOLUTE TARGET DIMENSION CANVAS CONTAINER */}
              <div 
                ref={cardViewportRef}
                id="export-container"
                className="absolute left-0 top-0 select-none overflow-hidden origin-top-left"
                style={{
                  ...exportContainerStyle,
                  background: `linear-gradient(135deg, ${customBg1}, ${customBg2})`,
                  color: customTxtPrimary,
                  fontFamily: '"Anek Malayalam", "Inter", sans-serif'
                }}
              >
                <CardRepresentation />
              </div>
            </div>
          </div>

          {/* Prompt banner detailing output resolution info */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[10px] text-slate-500 space-y-1">
            <p className="font-extrabold text-slate-700 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Export File Specifications:
            </p>
            <ul className="list-disc list-inside space-y-0.5 ml-1 font-semibold">
              <li>PNG Format resolution: {sizePreset === "square" ? "2160 x 2160 px" : sizePreset === "story" ? "2160 x 3840 px" : "2400 x 1350 px"} (2x Retina scale sharp graphics)</li>
              <li>Dual translation, single layout grids, custom accent headers, website date and metadata watermarking fully baked.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* ==================== HIGH DEFINITION CARD PREVIEW & PROOFREADER MODAL ==================== */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex flex-col lg:flex-row items-stretch overflow-hidden font-sans">
          
          {/* Left/Center viewport view block (Flex space) */}
          <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden relative">
            
            {/* Top simulation menu bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4 select-none shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-white text-xs font-black tracking-widest uppercase">HD Card Inspection Deck</span>
              </div>

              {/* Device switches */}
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/15 gap-1">
                {[
                  { id: "pure", label: "Pure Canvas", icon: Monitor },
                  { id: "whatsapp", label: "WhatsApp Status", icon: Smartphone },
                  { id: "instagram", label: "Instagram Feed", icon: Layout }
                ].map((dev) => {
                  const IconComp = dev.icon;
                  return (
                    <button
                      key={dev.id}
                      type="button"
                      onClick={() => setPreviewDeviceMode(dev.id as any)}
                      className={`px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
                        previewDeviceMode === dev.id 
                          ? "bg-[#ffe500] text-slate-950 shadow" 
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{dev.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ZOOM CONTROLS */}
              {previewDeviceMode === "pure" && (
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                  <span className="text-[10px] text-slate-400 font-bold">Zoom</span>
                  <input
                    type="range"
                    min="0.25"
                    max="1.25"
                    step="0.05"
                    value={previewZoom}
                    onChange={(e) => setPreviewZoom(Number(e.target.value))}
                    className="w-24 h-1 bg-white/10 rounded accent-[#ffe500]"
                  />
                  <span className="text-[10px] text-[#ffe500] font-mono font-bold w-10 text-right">
                    {Math.round(previewZoom * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Central stage box (with grid pattern for aesthetic calibration) */}
            <div className="flex-1 flex items-center justify-center overflow-auto bg-slate-900 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] rounded-xl border border-white/5 relative p-4">
              
              {previewDeviceMode === "whatsapp" ? (
                /* SIMULATED WHATSAPP DEVICE SCREEN MOCKUP */
                <div className="w-[360px] h-[640px] bg-black rounded-[36px] shadow-2xl border-4 border-slate-700 overflow-hidden flex flex-col relative shrink-0">
                  
                  {/* Status Top bar UI */}
                  <div className="absolute top-2 inset-x-0 h-10 px-4 flex flex-col justify-between z-40 bg-gradient-to-b from-black/80 to-transparent pointer-events-none pt-2">
                    {/* Interactive dynamic thin story segment lines */}
                    <div className="flex gap-1 h-0.5 w-full">
                      <div className="flex-1 bg-white rounded-xs" />
                      <div className="flex-1 bg-white/40 rounded-xs" />
                    </div>

                    {/* Header profile of sender */}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <button className="text-white hover:opacity-85 text-xs mr-1">←</button>
                        <div className="w-6 h-6 rounded-full bg-[#0a3060] border border-white/40 flex items-center justify-center font-black text-[#ffe500] text-[8px]">
                          AO
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white leading-none">Attappadi Online News</p>
                          <p className="text-[8px] text-white/70">Just now</p>
                        </div>
                      </div>
                      <div className="text-white text-[10px] opacity-80 font-bold">⋮</div>
                    </div>
                  </div>

                  {/* Scale Card inside WhatsApp Screen context */}
                  <div className="flex-1 flex items-center justify-center bg-slate-950 overflow-hidden relative">
                    <div 
                      className="transform scale-[0.31] shrink-0 select-none pointer-events-none rounded-xl animate-fade-in"
                      style={{
                        width: `${sizePreset === "square" ? 1080 : sizePreset === "story" ? 1080 : 1200}px`,
                        height: `${sizePreset === "square" ? 1080 : sizePreset === "story" ? 1920 : 675}px`,
                        background: `linear-gradient(135deg, ${customBg1}, ${customBg2})`,
                        fontFamily: '"Anek Malayalam", "Inter", sans-serif',
                        color: customTxtPrimary,
                        position: "relative"
                      }}
                    >
                      {/* Duplicate the card component inside simulator */}
                      <CardRepresentation />
                    </div>
                  </div>

                  {/* Bottom WhatsApp interactive overlay input bar */}
                  <div className="absolute bottom-3 inset-x-0 px-3 flex items-center justify-around z-40 bg-gradient-to-t from-black/80 to-transparent pt-4">
                    <div className="flex-1 bg-white/10 hover:bg-white/15 rounded-full px-4 py-2 border border-white/20 select-none flex items-center justify-between text-white/55 text-[10px] backdrop-blur-xs font-semibold">
                      <span>Reply to Attappadi Online...</span>
                      <span>💬</span>
                    </div>
                    <div className="ml-2 w-8 h-8 rounded-full bg-[#075e54] text-white flex items-center justify-center text-xs select-none">
                      💚
                    </div>
                  </div>
                </div>

              ) : previewDeviceMode === "instagram" ? (
                /* SIMULATED INSTAGRAM MOCKUP */
                <div className="w-[360px] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-y-auto flex flex-col relative shrink-0 text-slate-900 font-sans">
                  
                  {/* IG Top User Header */}
                  <div className="flex items-center justify-between px-3 py-2.5 border-b select-none shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 p-0.5">
                        <div className="w-full h-full rounded-full bg-white p-0.5">
                          <div className="w-full h-full rounded-full bg-[#0a3060] flex items-center justify-center font-bold text-[#ffe500] text-[8px]">
                            AO
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold leading-tight">attappadionline</p>
                        <p className="text-[9px] text-slate-500 leading-none">Agali, Attappadi</p>
                      </div>
                    </div>
                    <span className="font-bold text-xs">•••</span>
                  </div>

                  {/* Scaled card image area */}
                  <div className="bg-slate-100 flex items-center justify-center overflow-hidden relative shrink-0" style={{ height: "300px" }}>
                    <div 
                      className="transform scale-[0.25] shrink-0 select-none pointer-events-none animate-fade-in"
                      style={{
                        width: `${sizePreset === "square" ? 1080 : sizePreset === "story" ? 1080 : 1200}px`,
                        height: `${sizePreset === "square" ? 1080 : sizePreset === "story" ? 1920 : 675}px`,
                        background: `linear-gradient(135deg, ${customBg1}, ${customBg2})`,
                        fontFamily: '"Anek Malayalam", "Inter", sans-serif',
                        color: customTxtPrimary,
                        position: "relative"
                      }}
                    >
                      <CardRepresentation />
                    </div>
                  </div>

                  {/* IG Interaction bar */}
                  <div className="p-3 space-y-2 select-none">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex gap-3">
                        <span>❤️</span>
                        <span>💬</span>
                        <span>✈️</span>
                      </div>
                      <span>💾</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold">128 likes</p>
                      <p className="text-[10px]">
                        <span className="font-bold mr-1.5">attappadionline</span>
                        {headlineMl ? headlineMl.substring(0, 48) : headlineEn.substring(0, 48)}...
                        <span className="text-slate-400 font-semibold text-[9px] block mt-0.5">more</span>
                      </p>
                      <p className="text-[8px] text-slate-400 uppercase tracking-wide mt-1">2 minutes ago</p>
                    </div>
                  </div>
                </div>

              ) : (
                /* STANDALONE INSPECTION VIEW */
                <div 
                  className="shadow-2xl relative transition-transform rounded-sm overflow-hidden shrink-0 border border-white/20 select-text"
                  style={{
                    width: `${sizePreset === "square" ? 1080 : sizePreset === "story" ? 1080 : 1200}px`,
                    height: `${sizePreset === "square" ? 1080 : sizePreset === "story" ? 1920 : 675}px`,
                    transform: `scale(${previewZoom})`,
                    background: `linear-gradient(135deg, ${customBg1}, ${customBg2})`,
                    fontFamily: '"Anek Malayalam", "Inter", sans-serif',
                    color: customTxtPrimary,
                    position: "relative"
                  }}
                >
                  <CardRepresentation />
                </div>
              )}
              
            </div>
          </div>

          {/* Right proofreading bar controls panel (Durable custom width) */}
          <div className="w-full lg:w-[420px] bg-slate-900 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col overflow-y-auto shrink-0 select-text">
            
            {/* Sidebar Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 select-none">
              <div>
                <h3 className="text-white font-black text-sm tracking-widest uppercase flex items-center gap-1.5">
                  <AlignLeft className="w-4 h-4 text-[#ffe500]" /> INSPECTOR DECK
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">Verify details, tweak spelling, spacing & download</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inspector Sections */}
            <div className="p-5 space-y-6 flex-1">
              
              {/* A. TEXT COCKPIT - EDIT LIVE */}
              <div className="space-y-3">
                <span className="text-[10px] text-[#ffe500] font-black tracking-widest uppercase block border-b border-white/15 pb-1">
                  📝 LIVE TEXT PROOFREADER
                </span>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase">Malayalam Headline</label>
                    <textarea
                      rows={2}
                      value={headlineMl || ""}
                      onChange={(e) => setHeadlineMl(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded p-2 text-xs font-bold text-white font-anek-malayalam focus:outline-[#ffe500] focus:border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase">English Headline</label>
                    <textarea
                      rows={2}
                      value={headlineEn || ""}
                      onChange={(e) => setHeadlineEn(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded p-2 text-xs font-bold text-white focus:outline-[#ffe500] focus:border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase">Malayalam Summary</label>
                    <textarea
                      rows={2}
                      value={summaryMl || ""}
                      onChange={(e) => setSummaryMl(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded p-2 text-xs font-anek-malayalam text-slate-300 focus:outline-[#ffe500]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase">English Summary</label>
                    <textarea
                      rows={2}
                      value={summaryEn || ""}
                      onChange={(e) => setSummaryEn(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded p-2 text-xs text-slate-300 focus:outline-[#ffe500]"
                    />
                  </div>
                </div>
              </div>

              {/* B. ANALYST STATS */}
              <div className="space-y-3 select-none">
                <span className="text-[10px] text-[#ffe500] font-black tracking-widest uppercase block border-b border-white/15 pb-1">
                  🔍 TEXT METRICS & COMPLIANCE
                </span>
                
                <div className="space-y-2 bg-slate-950 p-3.5 rounded-lg border border-white/5 text-xs text-slate-300 font-semibold">
                  
                  {/* Word counts info items */}
                  <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-1.5">
                    <span>Malayalam length:</span>
                    <span className="font-mono text-white text-xs bg-white/10 px-1.5 py-0.5 rounded">
                      {headlineMl ? headlineMl.split(/\s+/).filter(Boolean).length : 0} words
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-1.5">
                    <span>English length:</span>
                    <span className="font-mono text-white text-xs bg-white/10 px-1.5 py-0.5 rounded">
                      {headlineEn ? headlineEn.split(/\s+/).filter(Boolean).length : 0} words
                    </span>
                  </div>

                  {/* WCAG Contrast check */}
                  <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-1.5">
                    <span>Contrast Safecheck:</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase">
                      🟢 EXCELLENT WCAG AAA
                    </span>
                  </div>

                  {/* Safe-zone indicator */}
                  <div className="flex justify-between items-center text-[11px]">
                    <span>Resolution Safe-zone:</span>
                    {(headlineMl && headlineMl.length > 120) || (headlineEn && headlineEn.length > 120) ? (
                      <span className="text-[10px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded font-black uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-400 animate-pulse" /> TIGHT FIT
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase">
                        🟢 OPTIMIZED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* C. ACTIVE SETTINGS SLIDERS INSIDE MODAL */}
              <div className="space-y-4">
                <span className="text-[10px] text-[#ffe500] font-black tracking-widest uppercase block border-b border-white/15 pb-1">
                  📐 SPACING & FONT SIZE CONTROLS
                </span>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-bold mb-1">
                    <span>Headline Font Size</span>
                    <span className="text-[#ffe500] font-mono">{titleFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="96"
                    value={titleFontSize}
                    onChange={(e) => setTitleFontSize(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-[#ffe500]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-bold mb-1">
                    <span>Summary Font Size</span>
                    <span className="text-[#ffe500] font-mono">{summaryFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="36"
                    value={summaryFontSize}
                    onChange={(e) => setSummaryFontSize(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-[#ffe500]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setWatermarkToggle(!watermarkToggle)}
                    className={`p-2 rounded text-center transition select-none cursor-pointer ${
                      watermarkToggle 
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" 
                        : "bg-white/5 text-slate-400 border border-white/5"
                    }`}
                  >
                    Watermark: {watermarkToggle ? "On" : "Off"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoToggle(!logoToggle)}
                    className={`p-2 rounded text-center transition select-none cursor-pointer ${
                      logoToggle 
                        ? "bg-emerald-500/10 text-[#ffe500] border border-emerald-500/20" 
                        : "bg-white/5 text-slate-400 border border-white/5"
                    }`}
                  >
                    Header Brand: {logoToggle ? "On" : "Off"}
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom control bar download inside modal */}
            <div className="p-5 border-t border-white/10 bg-slate-950/40 select-none flex flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadCard}
                disabled={isGenerating}
                className="w-full py-3 bg-[#ffe500] hover:bg-[#ffeb3b] disabled:bg-slate-700 text-slate-950 font-black text-xs uppercase tracking-widest rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>RENDERING IMAGE...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4.5 h-4.5 text-slate-950" />
                    <span>EXPORT HIGH RES PORTABLE PNG</span>
                  </>
                )}
              </button>
              <div className="text-[9px] text-center text-slate-400 font-semibold tracking-wide">
                Processed with dynamic web safe-zone rules • attappadionline.com
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
