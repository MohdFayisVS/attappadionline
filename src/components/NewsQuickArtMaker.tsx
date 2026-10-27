import React, { useEffect, useRef, useState } from "react";

type Props = { defaultHeadline?: string; onApply: (image: string) => void };
const themes = [
  { name: "Breaking", bg: "#981b1b", accent: "#facc15", fg: "#ffffff" },
  { name: "Community", bg: "#123f64", accent: "#75d4d4", fg: "#ffffff" },
  { name: "Nature", bg: "#155e43", accent: "#bbf7d0", fg: "#ffffff" },
  { name: "Notice", bg: "#1d4ed8", accent: "#fef08a", fg: "#ffffff" },
  { name: "Minimal", bg: "#f1f5f9", accent: "#0f172a", fg: "#0f172a" }
];
const symbols = ["📰", "⚠️", "🌧️", "🚧", "🚌", "🏥", "🎓", "🌳", "🏞️", "📢", "🚗", "🏠", "🌾", "⚡", "🎉", "📍"];
export default function NewsQuickArtMaker({ defaultHeadline = "", onApply }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [themeIndex, setThemeIndex] = useState(0);
  const [background, setBackground] = useState(themes[0].bg);
  const [foreground, setForeground] = useState(themes[0].fg);
  const [accent, setAccent] = useState(themes[0].accent);
  const [headline, setHeadline] = useState(defaultHeadline);
  const [subtitle, setSubtitle] = useState("");
  const [symbol, setSymbol] = useState("📰");
  const [style, setStyle] = useState<"solid" | "gradient" | "shapes">("shapes");
  const [size, setSize] = useState(58);
  const [showBrand, setShowBrand] = useState(true);
  const [status, setStatus] = useState("");
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    const bg = style === "solid" ? background : ctx.createLinearGradient(0, 0, w, h);
    if (typeof bg !== "string") { bg.addColorStop(0, background); bg.addColorStop(1, "#091827"); }
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    if (style === "shapes") {
      ctx.globalAlpha = .16; ctx.fillStyle = accent;
      ctx.beginPath(); ctx.arc(w * .91, h * .13, 290, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * .1, h * .95, 220, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = accent; ctx.fillRect(0, 0, 18, h);
    if (showBrand) {
      ctx.font = "bold 26px Arial, sans-serif"; ctx.fillStyle = foreground;
      ctx.fillText("ATTAPPADI ONLINE", 62, 65);
      ctx.fillStyle = accent; ctx.fillRect(62, 82, 210, 5);
    }
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "145px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
    ctx.fillText(symbol, w / 2, 215);
    const wrap = (value: string, maxWidth: number, font: string, maxLines: number) => {
      ctx.font = font;
      const words = value.trim().split(/\\s+/).filter(Boolean);
      const lines: string[] = [];
      let line = "";
      for (const word of words) {
        const test = line ? line + " " + word : word;
        if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
        else line = test;
      }
      if (line) lines.push(line);
      return lines.slice(0, maxLines);
    };
    ctx.fillStyle = foreground;
    const titleFont = `bold ${size}px 'Anek Malayalam','Anek Tamil','Anek Latin',Arial,sans-serif`;
    const lines = wrap(headline || "NEWS HEADLINE", w - 140, titleFont, 3);
    ctx.font = titleFont;
    lines.forEach((line, index) => ctx.fillText(line, w / 2, 370 + index * (size + 12)));
    if (subtitle.trim()) {
      ctx.font = "30px 'Anek Malayalam','Anek Tamil','Anek Latin',Arial,sans-serif";
      wrap(subtitle, w - 140, ctx.font, 2).forEach((line, index) => ctx.fillText(line, w / 2, 600 + index * 38));
    }
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  };
  useEffect(() => { draw(); }, [themeIndex, background, foreground, accent, headline, subtitle, symbol, style, size, showBrand]);
  const apply = async () => {
    await document.fonts.ready;
    draw();
    const image = canvasRef.current?.toDataURL("image/png");
    if (image) { onApply(image); setStatus("Image added to news. Publish the article to save it."); }
  };
  return <div className="rounded-lg border border-blue-200 bg-white p-4 space-y-4">
    <div><h4 className="font-bold text-[#0a3060]">Quick News Image Designer</h4><p className="text-xs text-slate-500">Create a news illustration without an external photo. Exported as 1200 × 675 PNG.</p></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <label className="block text-sm font-semibold">Theme<select value={themeIndex} onChange={e => { const index = Number(e.target.value); setThemeIndex(index); setBackground(themes[index].bg); setForeground(themes[index].fg); setAccent(themes[index].accent); }} className="w-full border rounded p-2">{themes.map((t, i) => <option key={t.name} value={i}>{t.name}</option>)}</select></label>
        <label className="block text-sm font-semibold">Background style<select value={style} onChange={e => setStyle(e.target.value as typeof style)} className="w-full border rounded p-2"><option value="shapes">Decorative shapes</option><option value="gradient">Gradient</option><option value="solid">Solid color</option></select></label>
        <div className="grid grid-cols-3 gap-2">{([["Background", background, setBackground], ["Text", foreground, setForeground], ["Accent", accent, setAccent]] as const).map(([label, value, setter]) => <label key={label} className="text-xs font-semibold">{label}<input type="color" value={value} onChange={e => setter(e.target.value)} className="w-full h-10 cursor-pointer" /></label>)}</div>
        <label className="block text-sm font-semibold">Headline<textarea rows={2} value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Enter Malayalam / English / Tamil headline" className="w-full border rounded p-2 font-anek-malayalam" /></label>
        <label className="block text-sm font-semibold">Optional subheading<input value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full border rounded p-2" /></label>
        <label className="block text-sm font-semibold">Headline size: {size}px<input type="range" min="32" max="78" value={size} onChange={e => setSize(Number(e.target.value))} className="w-full" /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showBrand} onChange={e => setShowBrand(e.target.checked)} /> Include Attappadi Online branding</label>
        <p className="text-xs font-semibold">Choose a news icon</p>
        <div className="flex flex-wrap gap-1">{symbols.map(icon => <button key={icon} type="button" onClick={() => setSymbol(icon)} className={`text-xl border rounded p-2 ${symbol === icon ? "border-blue-600 bg-blue-50" : "border-slate-200"}`} aria-label={icon}>{icon}</button>)}</div>
      </div>
      <div className="space-y-3">
        <canvas ref={canvasRef} width={1200} height={675} className="w-full rounded border bg-slate-100" aria-label="News image preview" />
        <button type="button" onClick={apply} className="w-full bg-[#0a3060] text-white rounded px-4 py-3 font-bold">Use This Image for News</button>
        {status && <p role="status" className="text-sm text-emerald-700">{status}</p>}
      </div>
    </div>
  </div>;
}
