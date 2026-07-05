import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, X } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const EMPTY = {
  title: "",
  discount_percent: "",
  starts_at: "",
  ends_at: "",
  product_types: "",
  is_active: true,
};

function nowActive(sale) {
  if (sale.is_active === false) return false;
  const now = new Date();
  const start = sale.starts_at ? new Date(sale.starts_at) : null;
  const end = sale.ends_at ? new Date(sale.ends_at) : null;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

function toDatetimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminFlashSales() {
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () =>
    api.get("/admin/flash-sales").then(({ data }) => setSales(data || [])).catch(() => setSales([]));

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      title: s.title || "",
      discount_percent: s.discount_percent?.toString() || "",
      starts_at: toDatetimeLocal(s.starts_at),
      ends_at: toDatetimeLocal(s.ends_at),
      product_types: Array.isArray(s.product_types) ? s.product_types.join(", ") : "",
      is_active: s.is_active !== false,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        discount_percent: parseFloat(form.discount_percent),
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        product_types: form.product_types
          ? form.product_types.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        is_active: form.is_active,
      };

      if (editing) {
        await api.put(`/admin/flash-sales/${editing.id}`, payload);
        toast.success("Flash sale updated");
      } else {
        await api.post("/admin/flash-sales", payload);
        toast.success("Flash sale created");
      }
      closeForm();
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this flash sale?")) return;
    try {
      await api.delete(`/admin/flash-sales/${id}`);
      toast.success("Flash sale deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString("en-IN") : "—");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-overline text-white/50">Promotions</div>
          <h1 className="font-display uppercase font-black text-4xl mt-2">Flash Sales</h1>
        </div>
        <button onClick={openCreate} className="btn-luxury-light flex items-center gap-2">
          <Plus size={14} /> New Flash Sale
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 p-8 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">{editing ? "Edit Flash Sale" : "Create Flash Sale"}</h2>
              <button onClick={closeForm} className="p-2 hover:bg-white/10 rounded"><X size={18} /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <F label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
              <F label="Discount (%)" type="number" value={form.discount_percent} onChange={(v) => setForm({ ...form, discount_percent: v })} required min="0" max="100" />
              <F label="Starts At" type="datetime-local" value={form.starts_at} onChange={(v) => setForm({ ...form, starts_at: v })} required />
              <F label="Ends At" type="datetime-local" value={form.ends_at} onChange={(v) => setForm({ ...form, ends_at: v })} required />
              <div>
                <Label>Product Types</Label>
                <textarea value={form.product_types} onChange={(e) => setForm({ ...form, product_types: e.target.value })}
                  rows={3} placeholder="e.g. hoodies, t-shirts, shorts"
                  className="w-full bg-[#2a2a2a] border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white text-white resize-none" />
              </div>
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 accent-white" />
                Active
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-luxury-light flex-1">
                  {editing ? "Update Flash Sale" : "Create Flash Sale"}
                </button>
                <button type="button" onClick={closeForm} className="px-6 py-3 text-sm border border-white/20 text-white/70 hover:bg-white/5 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="text-overline text-white/40 border-b border-white/10">
            <tr>
              <th className="text-left p-4">Title</th>
              <th className="text-left">Discount</th>
              <th className="text-left">Start Date</th>
              <th className="text-left">End Date</th>
              <th className="text-left">Active</th>
              <th className="text-left">Products</th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-white/40">No flash sales yet</td></tr>
            ) : (
              sales.map((s) => {
                const withinRange = nowActive(s);
                return (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="p-4 font-semibold">{s.title}</td>
                    <td>{s.discount_percent}%</td>
                    <td>{formatDate(s.starts_at)}</td>
                    <td>{formatDate(s.ends_at)}</td>
                    <td>
                      <span className={`px-2 py-0.5 text-xs font-semibold ${withinRange ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {withinRange ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>{Array.isArray(s.product_types) ? s.product_types.length : 0}</td>
                    <td className="text-right pr-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(s)} className="p-2 hover:bg-white/10 rounded" title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => remove(s.id)} className="p-2 hover:bg-white/10 rounded" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function F({ label, value, onChange, type = "text", required = false, min, max }) {
  return (
    <label className="block">
      <div className="text-overline text-white/50 mb-2">{label}</div>
      <input type={type} required={required} value={value ?? ""} onChange={(e) => onChange(e.target.value)}
        min={min} max={max}
        className="w-full bg-[#2a2a2a] border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white text-white" />
    </label>
  );
}

function Label({ children }) {
  return <div className="text-overline text-white/50 mb-2">{children}</div>;
}
