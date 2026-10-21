import React, { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCircle2, User, Sparkles, BookOpen } from "lucide-react";
import { OpinionItem } from "../types";

export default function OpinionsWidget({ lang }: { lang: "en" | "ml" | "ta" }) {
  const [opinions, setOpinions] = useState<OpinionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const labels = {
    en: { invalid: "Please fill in all blanks.", failed: "Action failed. Try again.", connection: "Connection timeout.", loading: "Loading opinion columns...", empty: "No editorial columns approved yet.", heading: "Attappadi Citizen Voices", question: "Have an outlook on Attappadi's local reforms?", intro: "Submit your views on local development, the environment, farming, healthcare or infrastructure. Submissions are reviewed before publication.", success: "Opinion Submitted Successfully!", successDetail: "Our editorial desk has queued your column for moderation review. Thank you for contributing to Attappadi's local journalism.", name: "Your Full Name & Designation", topic: "Topic / Headline of Opinion", body: "Write your opinion here...", submit: "Submit for Moderation", policy: "All submissions are strictly moderated to prevent hate speech." },
    ml: { invalid: "എല്ലാ വിവരങ്ങളും പൂരിപ്പിക്കുക.", failed: "സമർപ്പിക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.", connection: "കണക്ഷൻ സമയം കഴിഞ്ഞു.", loading: "അഭിപ്രായങ്ങൾ ലഭ്യമാക്കുന്നു...", empty: "അംഗീകരിച്ച അഭിപ്രായങ്ങൾ ഇതുവരെ ഇല്ല.", heading: "അട്ടപ്പാടിയിലെ ജനങ്ങളുടെ അഭിപ്രായങ്ങൾ", question: "അട്ടപ്പാടിയുടെ വികസനത്തെക്കുറിച്ച് അഭിപ്രായമുണ്ടോ?", intro: "പ്രാദേശിക വികസനം, പരിസ്ഥിതി, കൃഷി, ആരോഗ്യം, അടിസ്ഥാന സൗകര്യങ്ങൾ എന്നിവയെക്കുറിച്ചുള്ള അഭിപ്രായങ്ങൾ അയയ്ക്കുക. പ്രസിദ്ധീകരിക്കുന്നതിന് മുമ്പ് പരിശോധിക്കും.", success: "അഭിപ്രായം വിജയകരമായി സമർപ്പിച്ചു!", successDetail: "നിങ്ങളുടെ അഭിപ്രായം പരിശോധനയ്ക്കായി അയച്ചിട്ടുണ്ട്. നന്ദി.", name: "പേരും പദവിയും", topic: "അഭിപ്രായത്തിന്റെ തലക്കെട്ട്", body: "നിങ്ങളുടെ അഭിപ്രായം എഴുതുക...", submit: "പരിശോധനയ്ക്കായി സമർപ്പിക്കുക", policy: "വിദ്വേഷ പ്രസംഗം തടയുന്നതിനായി എല്ലാ അഭിപ്രായങ്ങളും പരിശോധിക്കും." },
    ta: { invalid: "அனைத்து விவரங்களையும் நிரப்பவும்.", failed: "சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.", connection: "இணைப்பு நேரம் முடிந்தது.", loading: "கருத்துகள் ஏற்றப்படுகின்றன...", empty: "அங்கீகரிக்கப்பட்ட கருத்துகள் இதுவரை இல்லை.", heading: "அட்டப்பாடி மக்களின் கருத்துகள்", question: "அட்டப்பாடியின் வளர்ச்சி குறித்து கருத்து உள்ளதா?", intro: "உள்ளூர் வளர்ச்சி, சுற்றுச்சூழல், விவசாயம், சுகாதாரம் மற்றும் உள்கட்டமைப்பு குறித்து உங்கள் கருத்துகளை அனுப்புங்கள். வெளியிடுவதற்கு முன் மதிப்பாய்வு செய்யப்படும்.", success: "கருத்து வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!", successDetail: "உங்கள் கருத்து மதிப்பாய்வுக்கு அனுப்பப்பட்டுள்ளது. நன்றி.", name: "பெயர் மற்றும் பதவி", topic: "கருத்தின் தலைப்பு", body: "உங்கள் கருத்தை எழுதுங்கள்...", submit: "மதிப்பாய்வுக்கு சமர்ப்பிக்கவும்", policy: "வெறுப்புப் பேச்சைத் தடுக்க அனைத்து கருத்துகளும் மதிப்பாய்வு செய்யப்படும்." }
  }[lang];

  const fetchOpinions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/opinions");
      const data = await res.json();
      // Only show approved columns
      setOpinions(data.filter((op: OpinionItem) => op.approved));
    } catch (err) {
      console.error("Opinion loading error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpinions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !title.trim() || !content.trim()) {
      alert(labels.invalid);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/opinions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName,
          titleEn: lang === "en" ? title : "",
          titleMl: lang === "ml" ? title : "",
          titleTa: lang === "ta" ? title : "",
          contentEn: lang === "en" ? content : "",
          contentMl: lang === "ml" ? content : "",
          contentTa: lang === "ta" ? content : ""
        })
      });

      if (res.ok) {
        setAuthorName("");
        setTitle("");
        setContent("");
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 9000);
      } else {
        alert(labels.failed);
      }
    } catch (_) {
      alert(labels.connection);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border p-4 text-center rounded-lg shadow-sm">
        <span className="animate-spin text-[#052962] rounded-full h-4.5 w-4.5 border-2 border-current border-t-transparent inline-block mr-2"></span>
        <span className="text-xs text-gray-400">{labels.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-800">
      
      {/* Dynamic Grid: Opinions list on left, Submit opinion on right (Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* OPINION COLUMNS FEED */}
        <div className="bg-white border-t-2 border-[#052962] rounded-lg shadow p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            EDITORIAL & OUTLOOKS
          </h3>
          <h4 className="font-serif-guardian text-base font-extrabold text-[#052962] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600 shrink-0" />
            {labels.heading}
          </h4>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {opinions.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                {labels.empty}
              </div>
            ) : (
              opinions.map((op) => (
                <div 
                  key={op.id} 
                  className="p-4 rounded-lg bg-[#fcfcfb] border border-gray-100 space-y-2 hover:border-sky-200 transition"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-slate-100 rounded-full text-slate-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-800 tracking-tight block leading-tight">
                        {op.authorName}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {new Date(op.createdAt).toLocaleDateString(lang === "ml" ? "ml-IN" : lang === "ta" ? "ta-IN" : "en-US")}
                      </span>
                    </div>
                  </div>

                  <h5 className="font-serif-guardian font-bold text-sm text-[#052962] leading-snug">
                    {lang === "ml" ? (op.titleMl || op.titleEn) : lang === "ta" ? (op.titleTa || op.titleEn) : op.titleEn}
                  </h5>

                  <p className="text-xs text-gray-600 leading-relaxed italic border-l-2 border-amber-300 pl-3">
                    "{lang === "ml" ? (op.contentMl || op.contentEn) : lang === "ta" ? (op.contentTa || op.contentEn) : op.contentEn}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SUBMISSION FORM */}
        <div className="bg-gradient-to-br from-[#052962] to-[#052962]/90 text-white rounded-lg shadow-md p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              OPINION SUBMISSION
            </h3>
            <h4 className="font-serif-guardian text-base font-extrabold mb-4 leading-tight">
              {labels.question}
            </h4>
            
            <p className="text-xs text-slate-200 leading-relaxed mb-6">
              {labels.intro}
            </p>

            {submitSuccess && (
              <div className="p-4 bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 rounded text-xs space-y-1 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold">{labels.success}</span>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {labels.successDetail}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-slate-800 text-xs font-sans">
              <div>
                <input 
                  type="text"
                  placeholder={labels.name}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-amber-300 focus:outline-none"
                  required
                />
              </div>

              <div>
                <input 
                  type="text"
                  placeholder={labels.topic}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-amber-300 focus:outline-none"
                  required
                />
              </div>

              <div>
                <textarea 
                  rows={4}
                  placeholder={labels.body}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-amber-300 focus:outline-none leading-relaxed"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 disabled:bg-gray-400 text-slate-900 font-extrabold rounded-lg hover:scale-101 hover:shadow transition flex justify-center items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="animate-spin text-slate-900 rounded-full h-4 h-4 border-2 border-slate-900 border-t-transparent inline-block mr-1"></span>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {labels.submit}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <span className="text-[10px] text-white/50 block">
              {labels.policy}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
