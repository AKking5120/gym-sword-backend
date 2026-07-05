import { useState, useEffect } from "react";
import { Search, Trash2, Mail, Phone, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/admin/leads").then(({ data }) => setLeads(data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm("Delete this lead?")) return;
    try { await api.delete(`/admin/leads/${id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Failed to delete"); }
  };

  const filtered = leads.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Visitor Leads</h1>
          <p className="text-sm text-black/50 mt-1">{leads.length} submissions</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="w-full border border-black/15 pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-black" />
      </div>

      {loading && <div className="text-center py-12 text-sm text-black/40">Loading...</div>}

      {!loading && (
        <div className="space-y-3">
          {filtered.map(lead => (
            <div key={lead.id} className="border border-black/10 p-4 hover:border-black/30 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-bold text-sm">{lead.name || "Anonymous"}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-black/50">
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-black transition">
                        <Mail size={12} /> {lead.email}
                      </a>
                    )}
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-black transition">
                        <Phone size={12} /> {lead.phone}
                      </a>
                    )}
                    <span>{new Date(lead.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                  {lead.message && <p className="text-sm text-black/60 mt-2 leading-relaxed">{lead.message}</p>}
                  {lead.page_url && (
                    <a href={lead.page_url} target="_blank" rel="noopener noreferrer" className="text-xs text-black/40 hover:text-black mt-1 flex items-center gap-1">
                      <ExternalLink size={10} /> {lead.page_url}
                    </a>
                  )}
                </div>
                <button onClick={() => del(lead.id)} className="p-2 hover:bg-red-50 text-red-400 transition flex-shrink-0"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
          {!filtered.length && <div className="text-center py-12 text-sm text-black/40">No leads found</div>}
        </div>
      )}
    </div>
  );
}
