import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, Plus, MapPin, Edit3, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

import StepIndicator from "@/components/StepIndicator";

const emptyAddr = {
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

export default function CheckoutAddress() {
  const navigate = useNavigate();
  const location = useLocation();
  const prev = location.state || {};

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAddr);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    api.get("/auth/addresses").then(({ data }) => {
      const list = data || [];
      setAddresses(list);
      const def = list.find((a) => a.is_default) || list[0];
      if (def) setSelectedId(def.id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSelect = (id) => setSelectedId(id);

  const handleSave = async () => {
    if (!form.full_name || !form.phone || !form.address_line1 || !form.city || !form.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/auth/addresses/${editingId}`, form);
        toast.success("Address updated");
      } else {
        await api.post("/auth/addresses", { ...form, is_default: addresses.length === 0 });
        toast.success("Address saved");
      }
      const { data } = await api.get("/auth/addresses");
      setAddresses(data || []);
      setShowForm(false);
      setForm(emptyAddr);
      setEditingId(null);
      if (!selectedId && data?.length) setSelectedId(data[0].id);
    } catch (e) {
      toast.error("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr) => {
    setForm({
      full_name: addr.full_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country || "India",
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/auth/addresses/${id}`);
      const updated = addresses.filter((a) => a.id !== id);
      setAddresses(updated);
      if (selectedId === id) setSelectedId(updated[0]?.id || null);
      toast.success("Address deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleContinue = () => {
    if (!selectedId) { toast.error("Please select or add an address"); return; }
    navigate("/checkout/payment", { state: { ...prev, addressId: selectedId } });
  };

  return (
    <main className="flex-1">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 py-8 md:py-12">
        <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-black/40 mb-6">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={9} />
          <Link to="/checkout" className="hover:text-black transition-colors">Bag</Link>
          <ChevronRight size={9} />
          <span className="text-black font-semibold">Address</span>
        </nav>

        <StepIndicator currentStep={1} />

        <div className="max-w-3xl mx-auto">
          <h2 className="text-[13px] uppercase tracking-[0.15em] font-bold mb-6">Delivery Address</h2>

          {loading ? (
            <div className="py-16 text-center text-[12px] text-black/40 animate-pulse">Loading addresses...</div>
          ) : (
            <>
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => handleSelect(addr.id)}
                    className={`p-5 border cursor-pointer transition-all duration-200 ${
                      selectedId === addr.id
                        ? "border-black bg-[#f8f8f8]"
                        : "border-black/15 hover:border-black/40 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          selectedId === addr.id ? "border-black bg-black" : "border-black/30"
                        }`}>
                          {selectedId === addr.id && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-bold text-black">{addr.full_name}</span>
                            <span className="text-[11px] text-black/50">{addr.phone}</span>
                          </div>
                          <p className="text-[12px] text-black/60 leading-relaxed">
                            {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}<br />
                            {addr.city}, {addr.state} - {addr.pincode}<br />
                            {addr.country || "India"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(addr); }}
                          className="p-2 text-black/30 hover:text-black transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(addr.id); }}
                          className="p-2 text-black/30 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!showForm && (
                <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyAddr); }}
                  className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black/50 hover:text-black transition-colors">
                  <Plus size={14} />
                  Add New Address
                </button>
              )}

              {showForm && (
                <div className="mt-6 p-6 border border-black/15 bg-[#fafafa]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-black/40" />
                      <span className="text-[12px] uppercase tracking-[0.12em] font-bold">{editingId ? "Edit Address" : "New Address"}</span>
                    </div>
                    <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-[11px] text-black/40 hover:text-black transition-colors">Cancel</button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Full Name *" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
                    <Field label="Phone *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                    <Field label="Address Line 1 *" value={form.address_line1} onChange={(v) => setForm({ ...form, address_line1: v })} className="sm:col-span-2" />
                    <Field label="Apartment / Suite" value={form.address_line2} onChange={(v) => setForm({ ...form, address_line2: v })} className="sm:col-span-2" />
                    <Field label="City *" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                    <Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
                    <Field label="Pincode *" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
                    <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
                  </div>
                  <button onClick={handleSave} disabled={saving}
                    className="mt-5 bg-black text-white text-[11px] font-bold uppercase tracking-[2px] px-8 py-3 hover:bg-black/80 disabled:opacity-50 transition-all">
                    {saving ? "Saving..." : "Save Address"}
                  </button>
                </div>
              )}

              <div className="mt-8">
                <button onClick={handleContinue}
                  className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-4 hover:bg-black/80 transition-all">
                  Continue to Payment
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <div className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold mb-1.5">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-black/15 px-4 py-3 text-[13px] focus:outline-none focus:border-black transition-colors" />
    </label>
  );
}
