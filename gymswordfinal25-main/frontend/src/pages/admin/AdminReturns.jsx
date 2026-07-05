import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const STATUSES = ["pending", "approved", "rejected", "completed"];

const STATUS_BADGE = {
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  approved: "bg-green-500/20 text-green-300 border-green-500/30",
  rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  completed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

export default function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [note, setNote] = useState("");
  const [actionTarget, setActionTarget] = useState(null);

  const load = (status) => {
    const params = status && status !== "all" ? { status } : {};
    api.get("/admin/returns", { params }).then(({ data }) => {
      setReturns(data.data || []);
    }).catch(() => toast.error("Failed to load returns"));
  };

  useEffect(() => { load(filter); }, [filter]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/admin/returns/${id}/status`, { status, admin_note: note || undefined });
      toast.success(`Return ${status}`);
      setActionTarget(null);
      setNote("");
      load(filter);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-overline text-white/50">Customer Service</div>
        <h1 className="font-display uppercase font-black text-4xl mt-2">Returns</h1>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 text-xs uppercase tracking-widest border transition ${
              filter === s
                ? "bg-white text-black border-white"
                : "bg-transparent text-white/60 border-white/20 hover:text-white hover:border-white/40"
            }`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="text-overline text-white/40 border-b border-white/10">
            <tr>
              <th className="text-left p-4">ID</th>
              <th className="text-left">Customer</th>
              <th className="text-left">Order #</th>
              <th className="text-left">Reason</th>
              <th className="text-left">Status</th>
              <th className="text-left">Date</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((r) => (
              <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-mono-display text-xs">#{r.id}</td>
                <td>
                  <div className="text-white/80">{r.user?.name || r.name}</div>
                  <div className="text-xs text-white/50">{r.user?.email || r.email}</div>
                </td>
                <td className="font-mono-display text-xs">{r.order_number || r.order_id}</td>
                <td className="text-white/70 max-w-[160px] truncate">{r.reason}</td>
                <td>
                  <span className={`px-2 py-0.5 rounded border text-xs ${STATUS_BADGE[r.status] || "bg-white/10 text-white border-white/20"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="text-xs text-white/50 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td>
                  {r.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActionTarget({ ...r, action: "approved" })}
                        className="px-3 py-1 text-xs border border-green-500/40 text-green-400 hover:bg-green-500/10 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setActionTarget({ ...r, action: "rejected" })}
                        className="px-3 py-1 text-xs border border-red-500/40 text-red-400 hover:bg-red-500/10 transition"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-white/30">—</span>
                  )}
                </td>
              </tr>
            ))}
            {returns.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-white/40 text-sm">
                  No returns found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {actionTarget && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-[#111] border border-white/10 w-full max-w-md p-6">
            <h3 className="font-display uppercase text-lg mb-4">
              {actionTarget.action === "approved" ? "Approve" : "Reject"} Return #{actionTarget.id}
            </h3>
            <textarea
              placeholder="Admin note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setActionTarget(null); setNote(""); }}
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange(actionTarget.id, actionTarget.action)}
                className={`px-4 py-2 text-sm text-white transition ${
                  actionTarget.action === "approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionTarget.action === "approved" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {expandedId && (() => {
        const r = returns.find((x) => x.id === expandedId);
        if (!r) return null;
        return (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 overflow-y-auto">
            <div className="bg-[#111] border border-white/10 w-full max-w-2xl p-8 my-12">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-overline text-white/50">Return Details</div>
                  <div className="font-display text-2xl uppercase mt-1">Return #{r.id}</div>
                  <div className="text-sm text-white/60 mt-1">{r.user?.name || r.name} — {r.user?.email || r.email}</div>
                </div>
                <button onClick={() => setExpandedId(null)} className="text-overline text-white/60 hover:text-white transition">Close</button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10">
                  <div className="text-overline text-white/50 mb-2">Summary</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-white/50">Order #</span>
                    <span className="text-white font-mono-display">{r.order_number || r.order_id}</span>
                    <span className="text-white/50">Status</span>
                    <span>
                      <span className={`px-2 py-0.5 rounded border text-xs ${STATUS_BADGE[r.status] || "bg-white/10 text-white border-white/20"}`}>
                        {r.status}
                      </span>
                    </span>
                    <span className="text-white/50">Date</span>
                    <span className="text-white">{new Date(r.created_at).toLocaleString()}</span>
                    <span className="text-white/50">Reason</span>
                    <span className="text-white">{r.reason}</span>
                  </div>
                </div>

                {(r.comment || r.admin_note) && (
                  <div className="p-4 bg-white/5 border border-white/10">
                    <div className="text-overline text-white/50 mb-2">Notes</div>
                    {r.comment && (
                      <div className="mb-3">
                        <div className="text-xs text-white/40 mb-1">Customer Comment</div>
                        <div className="text-sm text-white/80">{r.comment}</div>
                      </div>
                    )}
                    {r.admin_note && (
                      <div>
                        <div className="text-xs text-white/40 mb-1">Admin Note</div>
                        <div className="text-sm text-white/80">{r.admin_note}</div>
                      </div>
                    )}
                  </div>
                )}

                {r.items && (
                  <div className="p-4 bg-white/5 border border-white/10">
                    <div className="text-overline text-white/50 mb-2">Items</div>
                    <pre className="text-xs text-white/70 whitespace-pre-wrap font-mono-display bg-black/30 p-3 rounded border border-white/10 overflow-x-auto">
                      {typeof r.items === "string" ? r.items : JSON.stringify(r.items, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
