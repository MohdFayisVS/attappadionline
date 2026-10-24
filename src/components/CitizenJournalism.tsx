import { useState, type FormEvent, type ChangeEvent } from "react";
import { Camera, Send, Newspaper } from "lucide-react";

type Language = "en" | "ml" | "ta";
const areas = ["Agali", "Mukkali", "Sholayur", "Pudur", "Kottathara", "Thavalam", "Anaikatty", "Other Attappadi"];
export default function CitizenJournalism({ lang }: { lang: Language }) {
  const [area, setArea] = useState("Agali");
  const [headline, setHeadline] = useState("");
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const t = (en: string, ml: string, ta: string) => lang === "ml" ? ml : lang === "ta" ? ta : en;
  const font = lang === "ml" ? "font-anek-malayalam" : lang === "ta" ? "font-anek-tamil" : "font-anek-latin";
  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 500000) {
      setMessage(t("Choose a JPEG, PNG or WebP photo under 500 KB.", "500 കെബിയിൽ താഴെയുള്ള JPEG, PNG അല്ലെങ്കിൽ WebP ചിത്രം തിരഞ്ഞെടുക്കുക.", "500 KB-க்குக் குறைவான JPEG, PNG அல்லது WebP படத்தைத் தேர்ந்தெடுக்கவும்."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result || ""));
    reader.readAsDataURL(file);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/citizen-reports", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, headline, content, photo, language: lang })
      });
      if (!response.ok) throw new Error("Submission failed");
      setHeadline(""); setContent(""); setPhoto("");
      setMessage(t("Report received. AI copy-editing and editorial approval are required before publication.", "റിപ്പോർട്ട് ലഭിച്ചു. പ്രസിദ്ധീകരണത്തിന് മുമ്പ് എഐ ഭാഷാ പരിശോധനയും എഡിറ്റോറിയൽ അംഗീകാരവും ആവശ്യമാണ്.", "செய்தி பெறப்பட்டது. வெளியீட்டிற்கு முன் AI மொழித் திருத்தமும் ஆசிரியர் ஒப்புதலும் தேவை."));
    } catch {
      setMessage(t("Unable to submit. Please try again.", "സമർപ്പിക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.", "சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்."));
    } finally { setBusy(false); }
  };
  return (
    <section className="bg-white border-t-2 border-amber-400 rounded-xl shadow p-5 space-y-4 min-w-0">
      <h3 lang="en" className="font-anek-latin text-sm font-black uppercase text-[#052962] flex items-center gap-2"><Newspaper className="w-5 h-5" /> CITIZEN JOURNALISM</h3>
      <p lang={lang} className={`text-sm text-slate-600 ${font}`}>{t("Report local news from Attappadi. Our editors verify submissions before publication.", "അട്ടപ്പാടിയിലെ പ്രാദേശിക വാർത്തകൾ അറിയിക്കൂ. പ്രസിദ്ധീകരിക്കുന്നതിന് മുമ്പ് എഡിറ്റർമാർ പരിശോധിക്കും.", "அட்டப்பாடியின் உள்ளூர் செய்திகளை அனுப்புங்கள். வெளியீட்டிற்கு முன் ஆசிரியர்கள் சரிபார்ப்பார்கள்.")}</p>
      <form onSubmit={submit} className={`space-y-3 ${font}`}>
        <label className="block text-sm text-slate-700">{t("Area", "പ്രദേശം", "பகுதி")}
          <select value={area} onChange={e => setArea(e.target.value)} className="mt-1 w-full border rounded-lg p-2.5 bg-white" required>{areas.map(a => <option key={a}>{a}</option>)}</select>
        </label>
        <label className="block text-sm text-slate-700">{t("Headline", "തലക്കെട്ട്", "தலைப்பு")}
          <input value={headline} onChange={e => setHeadline(e.target.value)} maxLength={180} className="mt-1 w-full border rounded-lg p-2.5" required />
        </label>
        <label className="block text-sm text-slate-700">{t("News report", "വാർത്തയുടെ വിശദാംശങ്ങൾ", "செய்தி விவரம்")}
          <textarea value={content} onChange={e => setContent(e.target.value)} minLength={30} maxLength={8000} rows={5} className="mt-1 w-full border rounded-lg p-2.5" required />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700"><Camera className="w-4 h-4" /> {t("Upload photo (optional)", "ചിത്രം ചേർക്കുക (നിർബന്ധമല്ല)", "படம் பதிவேற்றவும் (விருப்பம்)")}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} className="min-w-0 max-w-[160px] text-xs" />
        </label>
        {photo && <img src={photo} alt="Submission preview" className="h-24 w-auto object-contain rounded" />}
        <p lang={lang} className="text-xs text-slate-500">{t("Submit only information you believe is accurate and photos you have permission to share. AI corrects writing, not facts.", "ശരിയാണെന്ന് വിശ്വസിക്കുന്ന വിവരങ്ങളും പങ്കിടാൻ അനുമതിയുള്ള ചിത്രങ്ങളും മാത്രം നൽകുക. എഐ എഴുത്ത് തിരുത്തും; വസ്തുതകൾ പരിശോധിക്കില്ല.", "சரியானதாக நம்பும் தகவல்களையும் பகிர அனுமதியுள்ள படங்களையும் மட்டும் சமர்ப்பிக்கவும். AI எழுத்தைத் திருத்தும்; உண்மைகளைச் சரிபார்க்காது.")}</p>
        <button disabled={busy} className="w-full bg-[#052962] text-white font-bold rounded-lg p-3 flex justify-center items-center gap-2 disabled:opacity-50"><Send className="w-4 h-4" /> {busy ? t("Submitting…", "സമർപ്പിക്കുന്നു…", "சமர்ப்பிக்கப்படுகிறது…") : t("Submit News", "വാർത്ത സമർപ്പിക്കുക", "செய்தி சமர்ப்பிக்கவும்")}</button>
      </form>
      {message && <p role="status" lang={lang} className={`text-sm text-[#052962] ${font}`}>{message}</p>}
    </section>
  );
}
