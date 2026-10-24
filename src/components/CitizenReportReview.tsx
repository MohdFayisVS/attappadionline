import { useEffect, useState } from "react";
import { adminFetch } from "../services/adminAuth";
type Report = { id: string; area: string; language: string; headline: string; content: string; originalHeadline: string; originalContent: string; photo?: string; aiStatus: string; status: string; createdAt: string };
export default function CitizenReportReview() {
  const [reports, setReports] = useState<Report[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const response = await adminFetch("/api/citizen-reports");
      if (!response.ok) throw new Error("Unable to load reports");
      setReports((await response.json()).filter((r: Report) => r.status === "pending"));
    } catch { setError("Unable to load pending reports."); }
  };
  useEffect(() => { void load(); }, []);
  const edit = (id: string, field: "headline" | "content", value: string) => setReports(items => items.map(item => item.id === id ? { ...item, [field]: value } : item));
  const action = async (report: Report, choice: "approve" | "reject") => {
    if (!window.confirm(choice === "approve" ? "Publish this report as news?" : "Reject this report?")) return;
    setBusy(report.id); setError("");
    try {
      const response = await adminFetch(`/api/citizen-reports/${encodeURIComponent(report.id)}/${choice}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline: report.headline, content: report.content })
      });
      if (!response.ok) throw new Error("Action failed");
      await load();
    } catch { setError("Unable to complete action. Check the report status before retrying."); }
    finally { setBusy(""); }
  };
  return <section className="p-4 bg-white rounded-xl space-y-4 text-slate-800">
    <h3 className="text-lg font-bold">CITIZEN JOURNALISM — PENDING APPROVAL ({reports.length})</h3>
    <p className="text-xs text-slate-500">AI edits are not fact checks. Verify facts, sources, consent and images before publishing. Edit the draft below before approval.</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {reports.length === 0 && <p className="text-sm">No pending reports.</p>}
    {reports.map(report => <article key={report.id} className="border rounded-xl p-4 space-y-3">
      <p className="text-xs text-slate-500">{report.area} · {report.language} · {report.aiStatus === "edited" ? "AI copy-edited" : "Original text — AI unavailable"} · {new Date(report.createdAt).toLocaleString()}</p>
      <label className="block text-sm">Headline<input className="block w-full border rounded p-2" value={report.headline} onChange={e => edit(report.id, "headline", e.target.value)} /></label>
      <label className="block text-sm">Report<textarea className="block w-full border rounded p-2" rows={6} value={report.content} onChange={e => edit(report.id, "content", e.target.value)} /></label>
      <details className="text-xs"><summary>Original submission</summary><strong>{report.originalHeadline}</strong><p className="whitespace-pre-wrap">{report.originalContent}</p></details>
      {report.photo && <img src={report.photo} alt="Citizen-submitted supporting photograph" className="max-h-56 object-contain rounded" />}
      <div className="flex flex-wrap gap-2">
        <button disabled={!!busy} onClick={() => void action(report, "approve")} className="bg-emerald-700 text-white rounded px-4 py-2 disabled:opacity-50">Approve & Publish</button>
        <button disabled={!!busy} onClick={() => void action(report, "reject")} className="bg-red-700 text-white rounded px-4 py-2 disabled:opacity-50">Reject</button>
      </div>
    </article>)}
  </section>;
}
