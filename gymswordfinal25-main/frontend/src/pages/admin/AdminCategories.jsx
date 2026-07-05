import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const PRODUCT_TYPES = [
  "oversized-t-shirts", "regular-fit-t-shirts", "compression-wear",
  "active-wear", "hoodies", "joggers", "shorts", "tank-tops",
  "track-pants", "sports-bras", "accessories",
];

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: "", product_type: "", gender: "unisex", description: "", image_url: "" });

  const load = () => {
    setLoading(true);
    api.get("/admin/categories").then(({ data }) => setCats(data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditCat(null); setForm({ name: "", product_type: "", gender: "unisex", description: "", image_url: "" }); setShowModal(true); };
  const openEdit = (cat) => { setEditCat(cat); setForm({ name: cat.name, product_type: cat.product_type || "", gender: cat.gender || "unisex", description: cat.description || "", image_url: cat.image_url || "" }); setShowModal(true); };

  const save = async () => {
    if (!form.name) return toast.error("Name is required");
    try {
      if (editCat) {
        await api.put(`/admin/categories/${editCat.id}`, form);
        toast.success("Category updated");
      } else {
        await api.post("/admin/categories", form);
        toast.success("Category created");
      }
      setShowModal(false);
      load();
    } catch { toast.error("Failed to save category"); }
  };

  const del = async (id) => {
    if (!confirm("Delete this category? Products will be uncategorized.")) return;
    try { await api.delete(`/admin/categories/${id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Failed to delete"); }
  };

  const filtered = cats.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.product_type?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Categories</h1>
          <p className="text-sm text-black/50 mt-1">{cats.length} categories</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-black text-white text-xs font-bold uppercase tracking-wider px-5 py-3 hover:bg-black/80 transition">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories..." className="w-full border border-black/15 pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-black" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-black/40">Loading...</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(cat => (
            <div key={cat.id} className="flex items-center justify-between border border-black/10 p-4 hover:border-black/30 transition">
              <div>
                <p className="font-bold text-sm">{cat.name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-black/50">
                  {cat.product_type && <span className="bg-black/5 px-2 py-0.5">{cat.product_type}</span>}
                  {cat.gender && <span>{cat.gender}</span>}
                  <span>{cat.product_count || 0} products</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(cat)} className="p-2 hover:bg-black/5 transition"><Edit3 size={15} /></button>
                <button onClick={() => del(cat.id)} className="p-2 hover:bg-red-50 text-red-500 transition"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
          {!filtered.length && <div className="text-center py-12 text-sm text-black/40">No categories found</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-lg p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-black/30 hover:text-black"><X size={18} /></button>
            <h2 className="text-lg font-black uppercase tracking-tight mb-5">{editCat ? "Edit Category" : "New Category"}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-black/50 font-semibold mb-1 block">Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-black/50 font-semibold mb-1 block">Product Type</label>
                  <select value={form.product_type} onChange={e => setForm({ ...form, product_type: e.target.value })} className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black">
                    <option value="">Select</option>
                    {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-black/50 font-semibold mb-1 block">Gender</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black">
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-black/50 font-semibold mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black resize-none" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-black/50 font-semibold mb-1 block">Image URL</label>
                <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-black/15 text-sm py-3 hover:bg-black/5">Cancel</button>
              <button onClick={save} className="flex-1 bg-black text-white text-sm py-3 hover:bg-black/80">{editCat ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
