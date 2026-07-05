import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, X } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ADMIN } from "@/constants/testIds";

const EMPTY = {
  code: "", discount_type: "percentage", discount_value: "",
  min_order: "", one_time_use: false, expiry_date: "", is_active: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get("/admin/coupons").then(({ data }) => setCoupons(data || [])).catch(() => setCoupons([]));
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code || "",
      discount_type: c.discount_type || "percentage",
      discount_value: c.discount_value?.toString() || "",
      min_order: c.min_order?.toString() || "",
      one_time_use: c.one_time_use || false,
      expiry_date: c.expiry_date ? c.expiry_date.split("T")[0] : "",
      is_active: c.is_active !== false,
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
        ...form,
        discount_value: parseFloat(form.discount_value),
        min_order: form.min_order ? parseFloat(form.min_order) : 0,
        expiry_date: form.expiry_date || null,
      };

      if (editing) {
        await api.put(`/admin/coupons/${editing.id}`, payload);
        toast.success("Coupon updated");
      } else {
        await api.post("/admin/coupons", payload);
        toast.success("Coupon created");
      }
      closeForm();
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success("Coupon deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "—";

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-overline text-white/50">Promotions</div>
          <h1 className="font-display uppercase font-black text-4xl mt-2">Coupons</h1>
        </div>
        <button onClick={openCreate} className="btn-luxury-light flex items-center gap-2">
          <Plus size={14} /> New Coupon
        </button>
      </div>

      {/* Create / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 p-8 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">{editing ? "Edit Coupon" : "Create Coupon"}</h2>
              <button onClick={closeForm} className="p-2 hover:bg-white/10 rounded">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <F label="Coupon Code" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} required />
                <div>
                  <Label>Discount Type</Label>
                  <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                    className="w-full bg-[#2a2a2a] border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white text-white">
                    <option value="percentage" className="bg-[#2a2a2a] text-white">Percentage (%)</option>
                    <option value="fixed" className="bg-[#2a2a2a] text-white">Fixed Amount (₹)</option>
                  </select>
                </div>
                <F label={form.discount_type === "percentage" ? "Discount (%)" : "Discount (₹)"} type="number" value={form.discount_value} onChange={(v) => setForm({ ...form, discount_value: v })} required />
                <F label="Min Order (₹)" type="number" value={form.min_order} onChange={(v) => setForm({ ...form, min_order: v })} />
                <F label="Expiry Date" type="date" value={form.expiry_date} onChange={(v) => setForm({ ...form, expiry_date: v })} />
                <div>
                  <Label>Usage</Label>
                  <label className="flex items-center gap-3 text-sm cursor-pointer pt-3">
                    <input type="checkbox" checked={form.one_time_use} onChange={(e) => setForm({ ...form, one_time_use: e.target.checked })}
                      className="w-4 h-4 accent-white" />
                    One Time Use
                  </label>
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 accent-white" />
                Active
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-luxury-light flex-1">
                  {editing ? "Update Coupon" : "Create Coupon"}
                </button>
                <button type="button" onClick={closeForm} className="px-6 py-3 text-sm border border-white/20 text-white/70 hover:bg-white/5 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white/5 border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="text-overline text-white/40 border-b border-white/10">
            <tr>
              <th className="text-left p-4">Code</th>
              <th className="text-left">Type</th>
              <th className="text-left">Value</th>
              <th className="text-left">Min Order</th>
              <th className="text-left">One Time</th>
              <th className="text-left">Used</th>
              <th className="text-left">Expiry</th>
              <th className="text-left">Status</th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-10 text-white/40">No coupons yet</td></tr>
            ) : (
              coupons.map((c) => {
                const expired = c.expiry_date && new Date(c.expiry_date) < new Date();
                const usedUp = c.one_time_use && (c.used_count || 0) >= 1;
                const active = c.is_active !== false && !expired && !usedUp;
                return (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="p-4 font-mono-display font-bold">{c.code}</td>
                    <td className="capitalize">{c.discount_type === "percentage" ? "%" : "₹"}</td>
                    <td>{c.discount_value}{c.discount_type === "percentage" ? "%" : "₹"}</td>
                    <td>₹{c.min_order || 0}</td>
                    <td>{c.one_time_use ? "Yes" : "No"}</td>
                    <td>{c.used_count || 0}</td>
                    <td className={expired ? "text-red-400" : ""}>{formatDate(c.expiry_date)}</td>
                    <td>
                      <span className={`px-2 py-0.5 text-xs font-semibold ${active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {active ? "Active" : expired ? "Expired" : usedUp ? "Used" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-right pr-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="p-2 hover:bg-white/10 rounded" title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => remove(c.id)} className="p-2 hover:bg-white/10 rounded" title="Delete">
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

function F({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <div className="text-overline text-white/50 mb-2">{label}</div>
      <input type={type} required={required} value={value ?? ""} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#2a2a2a] border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white text-white" />
    </label>
  );
}

function Label({ children }) {
  return <div className="text-overline text-white/50 mb-2">{children}</div>;
}
