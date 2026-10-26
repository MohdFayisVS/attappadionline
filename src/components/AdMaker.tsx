import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Image as ImageIcon, WandSparkles } from "lucide-react";

type Props = { onUse: (image: string, title: string) => void; notify: (message: string) => void };
const themes = [
  { name: "Midnight Blue", a: "#09234b", b: "#1759a1", accent: "#ffe500", ink: "#ffffff" },
  { name: "Emerald", a: "#063b34", b: "#13866b", accent: "#fef08a", ink: "#ffffff" },
  { name: "Sunset", a: "#7f1d1d", b: "#ed8936", accent: "#fff2a8", ink: "#ffffff" },
  { name: "Clean Light", a: "#f8fafc", b: "#dbeafe", accent: "#1d4ed8", ink: "#10203b" }
];
export default function AdMaker({ onUse, notify }: Props) {
  const [title, setTitle] = useState("Your business deserves to be seen");
  const [subtitle, setSubtitle] = useState("Advertise with Attappadi Online");
  const [eyebrow, setEyebrow] = useState("LOCAL BUSINESS • LOCAL REACH");
  const [cta, setCta] = useState("CONTACT US TODAY");
  const [theme, setTheme] = useState(0);
  const [image, setImage] = useState("");
  const [showBrand, setShowBrand] = useState(true);
  const [fontSize, setFontSize] = useState(62);
  const [imageOpacity, setImageOpacity] = useState(40);
  const [working, setWorking] = useState(false);
  const [language, setLanguage] = useState<"en"|"ml"|"ta">("en");
  const ref = useRef<HTMLDivElement>(null);
  const current = themes[theme];
  const readImage = (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 3 * 1024 * 1024) { notify("Choose an image smaller than 3 MB."); return; }
    const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === "string") setImage(reader.result); }; reader.readAsDataURL(file);
  };
  const exportImage = async (attach: boolean) => {
    if (!ref.current) return;
    setWorking(true);
    try {
      await document.fonts.ready;
      const node = ref.current;
      const originalTransform = node.style.transform;
      node.style.transform = "none";
      let canvas: HTMLCanvasElement;
      try { canvas = await html2canvas(node, { scale: 1, width: 1200, height: 400, useCORS: true, backgroundColor: current.a, logging: false }); }
      finally { node.style.transform = originalTransform; }
      const data = canvas.toDataURL("image/jpeg", 0.86);
      if (attach) { onUse(data, title); notify("Ad design added as an image slide. Save Ad Configurations Live to publish."); }
      else {
        const link = document.createElement("a"); link.href = data; link.download = "attappadi-ad-1200x400.jpg"; document.body.appendChild(link); link.click(); link.remove();
        notify("Advertisement downloaded.");
      }
    } catch (error) { console.error(error); notify("Unable to export this design. Try a locally uploaded background image."); }
    finally { setWorking(false); }
  };
  return <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] gap-5">
    <div className="space-y-4 rounded-xl border bg-white p-4">
      <div className="flex items-center gap-2 text-[#0a3060] font-bold"><WandSparkles className="w-5 h-5" /> Ad Maker · 1200 × 400</div>
      <p className="text-xs text-slate-500">Design a professional advertisement like Social Card Maker. Edit the content and see a live preview, then download or add it directly to a carousel window.</p>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs font-semibold">Theme<select className="mt-1 w-full rounded border p-2" value={theme} onChange={e=>setTheme(Number(e.target.value))}>{themes.map((item,i)=><option key={item.name} value={i}>{item.name}</option>)}</select></label>
        <label className="text-xs font-semibold">Content language<select className="mt-1 w-full rounded border p-2" value={language} onChange={e=>setLanguage(e.target.value as any)}><option value="en">English</option><option value="ml">Malayalam</option><option value="ta">Tamil</option></select></label>
      </div>
      {([["Eyebrow / Label",eyebrow,setEyebrow],["Headline",title,setTitle],["Supporting text",subtitle,setSubtitle],["Call to action",cta,setCta]] as const).map(([label,value,setter])=><label key={label} className="block text-xs font-semibold">{label}<input lang={language} value={value} onChange={e=>setter(e.target.value)} className="mt-1 block w-full rounded border p-2" /></label>)}
      <label className="block text-xs font-semibold">Optional background photo<input type="file" accept="image/*" className="mt-1 block w-full text-xs" onChange={e=>e.target.files?.[0] && readImage(e.target.files[0])}/></label>
      {image && <button type="button" className="text-xs text-red-700 underline" onClick={()=>setImage("")}>Remove background image</button>}
      <label className="block text-xs font-semibold">Headline size: {fontSize}px<input type="range" min="34" max="88" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} className="block w-full" /></label>
      {image && <label className="block text-xs font-semibold">Background photo opacity: {imageOpacity}%<input type="range" min="10" max="85" value={imageOpacity} onChange={e=>setImageOpacity(Number(e.target.value))} className="block w-full" /></label>}
      <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={showBrand} onChange={e=>setShowBrand(e.target.checked)} /> Show Attappadi Online branding</label>
      <div className="grid grid-cols-2 gap-2"><button type="button" disabled={working} onClick={()=>exportImage(false)} className="flex items-center justify-center gap-2 rounded bg-slate-800 p-2.5 text-sm font-bold text-white disabled:opacity-50"><Download className="w-4 h-4"/> Download JPG</button><button type="button" disabled={working} onClick={()=>exportImage(true)} className="flex items-center justify-center gap-2 rounded bg-blue-700 p-2.5 text-sm font-bold text-white disabled:opacity-50"><ImageIcon className="w-4 h-4"/> Add to carousel</button></div>
    </div>
    <div className="min-w-0 space-y-2"><h4 className="font-bold text-[#0a3060]">Live advertisement preview</h4><div className="w-full overflow-x-auto rounded-xl border bg-slate-100 p-2">
      <div style={{width:600,height:200,position:"relative"}}>
        <div ref={ref} lang={language} style={{width:1200,height:400,position:"absolute",left:0,top:0,transform:"scale(0.5)",transformOrigin:"top left",background:`linear-gradient(115deg, ${current.a}, ${current.b})`,color:current.ink,overflow:"hidden",fontFamily:language==="ml" ? '"Anek Malayalam", sans-serif' : language==="ta" ? '"Anek Tamil", sans-serif' : '"Anek Latin", sans-serif'}} className="ad-maker-canvas">
          {image && <img src={image} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:imageOpacity/100}} />}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg, rgba(0,0,0,.38), transparent 85%)"}}/>
          <div style={{position:"absolute",inset:0,padding:"34px 55px",display:"flex",flexDirection:"column",justifyContent:"center",gap:10}}>
            <div style={{fontSize:20,fontWeight:800,letterSpacing:3,color:current.accent}}>{eyebrow}</div>
            <div style={{fontSize,fontWeight:900,lineHeight:1.1,maxWidth:1070,overflowWrap:"anywhere"}}>{title}</div>
            <div style={{fontSize:29,fontWeight:600,maxWidth:1030}}>{subtitle}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}><span style={{background:current.accent,color:current.a,padding:"9px 18px",fontSize:20,fontWeight:900,borderRadius:7}}>{cta}</span>{showBrand && <span style={{fontSize:22,fontWeight:900}}>ATTAPPADI ONLINE</span>}</div>
          </div>
        </div>
      </div>
    </div><p className="text-xs text-slate-500">Export size: 1200 × 400 pixels. Use the controls to adjust the design before saving.</p></div>
  </div>;
}
