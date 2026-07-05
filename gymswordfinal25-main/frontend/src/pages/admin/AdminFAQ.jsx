import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const s = {
  wrapper: { padding: "32px 48px" },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: "#fff" },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 },
  addBtn: { display: "flex", alignItems: "center", gap: 8, background: "#fff", color: "#0A0A0A", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "12px 20px", border: "none", cursor: "pointer" },
  searchWrap: { position: "relative", marginBottom: 24 },
  searchIcon: { position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" },
  searchInput: { width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 12px 12px 44px", fontSize: 13, color: "#fff", outline: "none" },
  filterRow: { display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" },
  filterBtn: (active) => ({
    padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
    border: active ? "1px solid #fff" : "1px solid rgba(255,255,255,0.15)",
    background: active ? "rgba(255,255,255,0.1)" : "transparent",
    color: active ? "#fff" : "rgba(255,255,255,0.6)",
    textTransform: "uppercase", letterSpacing: "0.05em",
  }),
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  td: { padding: "14px 16px", fontSize: 13, color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "middle" },
  badgeYes: { display: "inline-block", background: "rgba(34,197,94,0.15)", color: "#22c55e", fontSize: 11, fontWeight: 600, padding: "2px 10px", textTransform: "uppercase", letterSpacing: "0.04em" },
  badgeNo: { display: "inline-block", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, padding: "2px 10px", textTransform: "uppercase", letterSpacing: "0.04em" },
  actionBtn: { background: "none", border: "none", cursor: "pointer", padding: 8, color: "rgba(255,255,255,0.4)", borderRadius: 4 },
  actionBtnDanger: { background: "none", border: "none", cursor: "pointer", padding: 8, color: "#ef4444", borderRadius: 4 },
  loading: { textAlign: "center", padding: "48px 0", fontSize: 13, color: "rgba(255,255,255,0.4)" },
  empty: { textAlign: "center", padding: "48px 0", fontSize: 13, color: "rgba(255,255,255,0.3)" },
  overlay: { position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  backdrop: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" },
  modal: { position: "relative", background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.1)", width: "100%", maxWidth: 540, padding: 32 },
  modalClose: { position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" },
  modalTitle: { fontSize: 18, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: "#fff", marginBottom: 24 },
  fieldLabel: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" },
  fieldInput: (isTextarea) => ({
    width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
    padding: "10px 14px", fontSize: 13, color: "#fff", outline: "none",
    resize: isTextarea ? "vertical" : "none", minHeight: isTextarea ? 80 : "auto",
    fontFamily: "inherit",
  }),
  fieldRow: { marginBottom: 16 },
  checkboxRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  checkboxLabel: { fontSize: 13, color: "#fff", cursor: "pointer" },
  modalFooter: { display: "flex", gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 13, padding: "12px 0", cursor: "pointer" },
  submitBtn: { flex: 1, background: "#fff", color: "#0A0A0A", fontSize: 13, fontWeight: 600, border: "none", padding: "12px 0", cursor: "pointer" },
};

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editFaq, setEditFaq] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", category: "", position: 0, is_active: true });

  const load = () => {
    setLoading(true);
    api.get("/admin/faqs").then(({ data }) => setFaqs(data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const categories = ["all", ...new Set(faqs.map((f) => f.category).filter(Boolean))];

  const filtered = faqs.filter((f) => {
    const matchSearch = f.question?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || f.category === activeCategory;
    return matchSearch && matchCat;
  });

  const openCreate = () => {
    setEditFaq(null);
    setForm({ question: "", answer: "", category: "", position: 0, is_active: true });
    setShowModal(true);
  };

  const openEdit = (faq) => {
    setEditFaq(faq);
    setForm({
      question: faq.question || "",
      answer: faq.answer || "",
      category: faq.category || "",
      position: faq.position ?? 0,
      is_active: faq.is_active !== false,
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.question) return toast.error("Question is required");
    setSaving(true);
    try {
      if (editFaq) {
        await api.put(`/admin/faqs/${editFaq.id}`, form);
        toast.success("FAQ updated");
      } else {
        await api.post("/admin/faqs", form);
        toast.success("FAQ created");
      }
      setShowModal(false);
      load();
    } catch {
      toast.error("Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this FAQ entry?")) return;
    try {
      await api.delete(`/admin/faqs/${id}`);
      toast.success("FAQ deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div style={s.wrapper}>
      <div style={s.headerRow}>
        <div>
          <h1 style={s.title}>FAQ</h1>
          <p style={s.subtitle}>{faqs.length} entries</p>
        </div>
        <button onClick={openCreate} style={s.addBtn}><Plus size={16} /> Add FAQ</button>
      </div>

      <div style={s.searchWrap}>
        <Search size={16} style={s.searchIcon} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions..." style={s.searchInput} />
      </div>

      <div style={s.filterRow}>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={s.filterBtn(activeCategory === cat)}>
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={s.loading}>Loading...</div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Question</th>
              <th style={s.th}>Category</th>
              <th style={s.th}>Position</th>
              <th style={s.th}>Active</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((faq) => (
              <tr key={faq.id}>
                <td style={s.td}>{faq.question}</td>
                <td style={s.td}>{faq.category || "—"}</td>
                <td style={s.td}>{faq.position ?? 0}</td>
                <td style={s.td}>
                  <span style={faq.is_active !== false ? s.badgeYes : s.badgeNo}>
                    {faq.is_active !== false ? "Yes" : "No"}
                  </span>
                </td>
                <td style={s.td}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openEdit(faq)} style={s.actionBtn} title="Edit"><Edit3 size={15} /></button>
                    <button onClick={() => del(faq.id)} style={s.actionBtnDanger} title="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && !filtered.length && <div style={s.empty}>No FAQs found</div>}

      {showModal && (
        <div style={s.overlay}>
          <div style={s.backdrop} onClick={() => setShowModal(false)} />
          <div style={s.modal}>
            <button onClick={() => setShowModal(false)} style={s.modalClose}><X size={18} /></button>
            <h2 style={s.modalTitle}>{editFaq ? "Edit FAQ" : "New FAQ"}</h2>

            <div style={s.fieldRow}>
              <label style={s.fieldLabel}>Question *</label>
              <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} style={s.fieldInput(true)} />
            </div>

            <div style={s.fieldRow}>
              <label style={s.fieldLabel}>Answer</label>
              <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} style={s.fieldInput(true)} />
            </div>

            <div style={s.fieldRow}>
              <label style={s.fieldLabel}>Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={s.fieldInput(false)} />
            </div>

            <div style={s.fieldRow}>
              <label style={s.fieldLabel}>Position</label>
              <input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} style={s.fieldInput(false)} />
            </div>

            <div style={s.checkboxRow}>
              <input type="checkbox" id="faq-active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              <label htmlFor="faq-active" style={s.checkboxLabel}>Active</label>
            </div>

            <div style={s.modalFooter}>
              <button onClick={() => setShowModal(false)} style={s.cancelBtn}>Cancel</button>
              <button onClick={save} disabled={saving} style={s.submitBtn}>
                {saving ? "Saving..." : editFaq ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
