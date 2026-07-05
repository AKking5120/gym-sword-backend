import { useState, useEffect } from "react";
import { Search, Check, X, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { api, resolveImage } from "@/lib/api";

const STATUS_FILTERS = [
  { value: "", label: "All Reviews" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit });
    if (statusFilter) params.set("status", statusFilter);
    api.get(`/admin/reviews?${params}`).then(({ data, pagination }) => {
      setReviews(data?.reviews || []);
      if (pagination) setTotal(pagination.total);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const updateStatus = async (id, status) => {
    try { await api.patch(`/admin/reviews/${id}/status`, { status }); toast.success(`Review ${status}`); load(); }
    catch { toast.error("Failed to update"); }
  };

  const del = async (id) => {
    if (!confirm("Delete this review?")) return;
    try { await api.delete(`/admin/reviews/${id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Failed to delete"); }
  };

  const filtered = reviews.filter(r =>
    r.comment?.toLowerCase().includes(search.toLowerCase()) ||
    r.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.users?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const renderStars = (n) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} fill={i <= Math.round(n) ? "#000" : "none"} stroke={i <= Math.round(n) ? "#000" : "#ccc"} />
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Reviews</h1>
          <p className="text-sm text-black/50 mt-1">{total} total</p>
        </div>
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map(f => (
            <button key={f.value} onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`text-xs px-4 py-2 border transition ${statusFilter === f.value ? "bg-black text-white border-black" : "border-black/15 text-black/60 hover:border-black"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or comment..." className="w-full border border-black/15 pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-black" />
      </div>

      {loading && <div className="text-center py-12 text-sm text-black/40">Loading...</div>}

      {!loading && (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="border border-black/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold">{r.users?.name || "Anonymous"}</span>
                    <span className="text-xs text-black/40">{r.users?.email}</span>
                    {renderStars(r.rating || 5)}
                  </div>
                  {r.products?.name && <p className="text-xs text-black/50 mb-2">Product: {r.products.name}</p>}
                  <p className="text-sm text-black/70 leading-relaxed">{r.comment}</p>
                  <p className="text-xs text-black/30 mt-2">{new Date(r.created_at).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(r.id, "approved")} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 transition" title="Approve"><Check size={15} /></button>
                      <button onClick={() => updateStatus(r.id, "rejected")} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 transition" title="Reject"><X size={15} /></button>
                    </>
                  )}
                  {r.status === "approved" && <span className="text-[10px] uppercase tracking-wider font-bold text-green-600 bg-green-50 px-3 py-1">Approved</span>}
                  {r.status === "rejected" && <span className="text-[10px] uppercase tracking-wider font-bold text-red-500 bg-red-50 px-3 py-1">Rejected</span>}
                  <button onClick={() => del(r.id)} className="p-2 hover:bg-red-50 text-red-400 transition" title="Delete"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
          {!filtered.length && <div className="text-center py-12 text-sm text-black/40">No reviews found</div>}
        </div>
      )}

      {total > limit && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="text-sm px-4 py-2 border border-black/15 disabled:opacity-30">Previous</button>
          <span className="text-sm text-black/50">Page {page} of {Math.ceil(total / limit)}</span>
          <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)} className="text-sm px-4 py-2 border border-black/15 disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  );
}
