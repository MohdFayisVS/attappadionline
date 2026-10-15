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
      alert("Please fill in all blanks.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/opinions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName,
          titleEn: title,
          contentEn: content
        })
      });

      if (res.ok) {
        setAuthorName("");
        setTitle("");
        setContent("");
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 9000);
      } else {
        alert("Action failed. Try again.");
      }
    } catch (_) {
      alert("Connection timeout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border p-4 text-center rounded-lg shadow-sm">
        <span className="animate-spin text-[#052962] rounded-full h-4.5 w-4.5 border-2 border-current border-t-transparent inline-block mr-2"></span>
        <span className="text-xs text-gray-400">Loading Opinion columns...</span>
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
            Attappadi Citizen Voices
          </h4>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {opinions.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No editorial columns approved yet.
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
                        {new Date(op.createdAt).toLocaleDateString(lang === "ml" ? "ml-IN" : "en-US")}
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
              Have an outlook on Attappadi's local reforms?
            </h4>
            
            <p className="text-xs text-slate-200 leading-relaxed mb-6">
              Submit your views on local development, the environment, farming, healthcare or infrastructure. Submissions are reviewed before publication.
            </p>

            {submitSuccess && (
              <div className="p-4 bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 rounded text-xs space-y-1 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold">Opinion Submitted Successfully!</span>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Our editorial desk has queued your column for moderation review. Thank you for contributing to Attappadi's local journalism.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-slate-800 text-xs font-sans">
              <div>
                <input 
                  type="text"
                  placeholder="Your Full Name & Designation"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-amber-300 focus:outline-none"
                  required
                />
              </div>

              <div>
                <input 
                  type="text"
                  placeholder="Topic / Headline of Opinion"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-amber-300 focus:outline-none"
                  required
                />
              </div>

              <div>
                <textarea 
                  rows={4}
                  placeholder="Write your opinion here..."
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
                Submit for Moderation
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <span className="text-[10px] text-white/50 block">
              All submissions are strictly moderated to prevent hate speech.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
