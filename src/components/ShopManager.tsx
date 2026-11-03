import { useEffect, useState, type FormEvent } from "react";
import { adminFetch } from "../services/adminAuth";
import type { LocalShop } from "../types";

type ShopDraft = Omit<LocalShop, "id"> & { published: boolean };
const blank: ShopDraft = { nameEn:"", nameMl:"", nameTa:"", category:"grocery", contact:"", locationEn:"", locationMl:"", locationTa:"", itemsEn:"", itemsMl:"", itemsTa:"", deliveryEn:"", deliveryMl:"", deliveryTa:"", published:false };
const labels: Record<string,string> = {name:"Shop name",location:"Location",items:"Products / items",delivery:"Delivery information"};
export default function ShopManager() {
  const [shops,setShops] = useState<(LocalShop & {published?:boolean})[]>([]);
  const [draft,setDraft] = useState<ShopDraft>(blank);
  const [editing,setEditing] = useState<string | null>(null);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const refresh = async () => {
    const res = await adminFetch("/api/admin/shops");
    if (!res.ok) throw new Error("Could not load shops");
    const data = await res.json();
    setShops(Array.isArray(data) ? data : []);
  };
  useEffect(() => { refresh().catch(e=>setMessage(e.message)); }, []);
  const update = (key: keyof ShopDraft, value: string | boolean) => setDraft(prev=>({...prev,[key]:value}));
  const save = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const res = await adminFetch(editing ? `/api/shops/${editing}` : "/api/shops", {method: editing ? "PUT" : "POST", headers: {"Content-Type":"application/json"}, body:JSON.stringify(draft)});
      if (!res.ok) throw new Error((await res.json()).error || "Unable to save");
      await refresh(); setDraft(blank); setEditing(null); setMessage("Shop saved successfully.");
    } catch(e:any) { setMessage(e.message || "Save failed"); } finally { setBusy(false); }
  };
  const remove = async (id:string) => {
    if (!window.confirm("Delete this shop permanently?")) return;
    setBusy(true);
    try { const res = await adminFetch(`/api/shops/${id}`,{method:"DELETE"}); if(!res.ok) throw new Error("Delete failed"); await refresh(); setMessage("Shop deleted."); }
    catch(e:any){setMessage(e.message)} finally{setBusy(false)}
  };
  return <section className="space-y-5">
    <div><h3 className="font-anek-english text-2xl font-extrabold text-[#052962]">Local Shopping Manager</h3><p className="text-sm text-slate-500">Only published shops appear on the public website. Enter Malayalam, English and Tamil content before publishing.</p></div>
    {message && <p role="status" className="rounded-lg bg-slate-100 p-3 text-sm">{message}</p>}
    <form onSubmit={save} className="rounded-xl border bg-white p-4 space-y-4">
      <h4 className="font-bold">{editing ? "Edit shop" : "Add a new shop"}</h4>
      {(["name","location","items","delivery"] as const).map(field=><fieldset key={field} className="rounded-lg border p-3"><legend className="font-bold text-sm">{labels[field]}</legend><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{(["Ml","En","Ta"] as const).map((suffix)=><label key={suffix} className="text-xs font-semibold">{({Ml:"Malayalam",En:"English",Ta:"Tamil"})[suffix]}{(field==="name"||field==="location") && " *"}<input lang={suffix==="Ml"?"ml":suffix==="Ta"?"ta":"en"} required={field==="name"||field==="location"} className="mt-1 block w-full rounded border p-2 text-sm" value={String(draft[(field+suffix) as keyof ShopDraft] || "")} onChange={e=>update((field+suffix) as keyof ShopDraft,e.target.value)}/></label>)}</div></fieldset>)}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><label className="text-sm font-semibold">Category<select className="block w-full rounded border p-2" value={draft.category} onChange={e=>update("category",e.target.value)}>{["grocery","bakery","medical","footwear","electronics","clothing","vegetables","other"].map(c=><option key={c} value={c}>{c}</option>)}</select></label><label className="text-sm font-semibold">WhatsApp / contact number *<input required className="block w-full rounded border p-2" value={draft.contact} onChange={e=>update("contact",e.target.value)}/></label></div>
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={draft.published} onChange={e=>update("published",e.target.checked)}/> Publish on website</label>
      <div className="flex gap-3"><button disabled={busy} className="rounded bg-[#052962] px-5 py-2 font-bold text-white disabled:opacity-50">{busy?"Saving...":editing?"Update shop":"Save shop"}</button>{editing && <button type="button" className="rounded border px-4 py-2" onClick={()=>{setEditing(null);setDraft(blank)}}>Cancel edit</button>}</div>
    </form>
    <div className="space-y-2"><h4 className="font-bold">Registered shops ({shops.length})</h4>{shops.length===0 && <p className="rounded-lg border border-dashed p-6 text-sm text-slate-500">No shops have been added yet.</p>}{shops.map(shop=><div key={shop.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3"><div><strong>{shop.nameEn}</strong><p className="text-xs text-slate-500">{shop.locationEn} · {shop.published?"Published":"Draft"}</p></div><div className="flex gap-2"><button type="button" className="rounded border px-3 py-1 text-sm" onClick={()=>{setEditing(shop.id);setDraft({...blank,...shop,published:shop.published===true});window.scrollTo({top:0,behavior:"smooth"})}}>Edit</button><button type="button" disabled={busy} className="rounded border border-red-300 px-3 py-1 text-sm text-red-700" onClick={()=>remove(shop.id)}>Delete</button></div></div>)}</div>
  </section>;
}
