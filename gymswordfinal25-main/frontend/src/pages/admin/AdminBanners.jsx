import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, MoveUp, MoveDown, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const PLACEHOLDER = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [form, setForm] = useState({ title: "", subtitle: "", image_url: "", link: "", btn_text: "Shop Now", is_active: true });

  const load = () => {
    setLoading(true);
    api.get("/admin/banners").then(({ data }) => setBanners(data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditBanner(null); setForm({ title: "", subtitle: "", image_url: "", link: "", btn_text: "Shop Now", is_active: true }); setShowModal(true); };
  const openEdit = (b) => { setEditBanner(b); setForm({ title: b.title, subtitle: b.subtitle || "", image_url: b.image_url || "", link: b.link || "", btn_text: b.btn_text || "Shop Now", is_active: b.is_active !== false }); setShowModal(true); };

  const save = async () => {
    if (!form.title) return toast.error("Title is required");
    try {
      if (editBanner) {
        await api.put(`/admin/banners/${editBanner.id}`, form);
        toast.success("Banner updated");
      } else {
        await api.post("/admin/banners", form);
        toast.success("Banner created");
      }
      setShowModal(false);
      load();
    } catch { toast.error("Failed to save"); }
  };

  const del = async (id) => {
    if (!confirm("Delete this banner?")) return;
    try { await api.delete(`/admin/banners/${id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Banners</h1>
          <p className="text-sm text-black/50 mt-1">{banners.length} banners | Controls homepage hero slider</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-black text-white text-xs font-bold uppercase tracking-wider px-5 py-3 hover:bg-black/80 transition">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {loading && <div className="text-center py-12 text-sm text-black/40">Loading...</div>}

      {!loading && (
        <div className="space-y-4">
          {banners.sort((a, b) => (a.position || 0) - (b.position || 0)).map((b, idx) => (
            <div key={b.id} className={`border ${b.is_active !== false ? "border-black/10" : "border-black/5 bg-black/[0.02]"} p-4`}>
              <div className="flex gap-4">
                <div className="w-40 aspect-[16/9] bg-[#f5f5f7] flex-shrink-0 overflow-hidden">
                  <img src={b.image_url || PLACEHOLDER} alt={b.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-sm">{b.title}</p>
                    {b.is_active === false && <span className="text-[10px] uppercase tracking-wider bg-black/10 px-2 py-0.5">Inactive</span>}
                  </div>
                  {b.subtitle && <p className="text-xs text-black/50 mt-1">{b.subtitle}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-black/40">
                    <span>Pos: {b.position || 0}</span>
                    {b.btn_text && <span>Btn: "{b.btn_text}"</span>}
                    {b.link && <span>Link: {b.link}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => del(b.id)} className="p-2 hover:bg-red-50 text-red-400 transition"><Trash2 size={15} /></button>
                  <button onClick={() => openEdit(b)} className="p-2 hover:bg-black/5 transition"><Edit3 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
          {!banners.length && (
            <div className="text-center py-12 border border-dashed border-black/15">
              <p className="text-sm text-black/40 mb-3">No banners yet</p>
              <button onClick={openCreate} className="text-xs font-bold uppercase tracking-wider border border-black px-6 py-3 hover:bg-black hover:text-white transition">Create First Banner</button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-lg p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-black/30 hover:text-black"><X size={18} /></button>
            <h2 className="text-lg font-black uppercase tracking-tight mb-5">{editBanner ? "Edit Banner" : "New Banner"}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-black/50 font-semibold mb-1 block">Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-black/50 font-semibold mb-1 block">Subtitle</label>
                <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-black/50 font-semibold mb-1 block">Image URL</label>
                <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder={PLACEHOLDER} className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black" />
                {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-20 object-cover border" />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-black/50 font-semibold mb-1 block">Button Text</label>
                  <input value={form.btn_text} onChange={e => setForm({ ...form, btn_text: e.target.value })} className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-black/50 font-semibold mb-1 block">Link</label>
                  <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
                  <span className="text-xs">Active on homepage</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-black/15 text-sm py-3 hover:bg-black/5">Cancel</button>
              <button onClick={save} className="flex-1 bg-black text-white text-sm py-3 hover:bg-black/80">{editBanner ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
