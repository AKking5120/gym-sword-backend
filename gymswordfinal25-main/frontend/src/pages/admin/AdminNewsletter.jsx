import { useState, useEffect } from "react";
import { Search, Download } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/admin/subscribers")
      .then(({ data }) => setSubscribers(data || []))
      .catch(() => toast.error("Failed to load subscribers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = subscribers.filter((s) =>
    (s.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-overline text-white/50">Marketing</div>
          <h1 className="font-display uppercase font-black text-4xl mt-2">Newsletter</h1>
          <p className="text-sm text-white/40 mt-1">{subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={async () => {
            setExporting(true);
            try {
              const res = await api.get("/admin/subscribers/export", { responseType: "blob" });
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", "subscribers.csv");
              document.body.appendChild(link);
              link.click();
              link.remove();
              window.URL.revokeObjectURL(url);
              toast.success("Exported");
            } catch { toast.error("Export failed"); }
            finally { setExporting(false); }
          }}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-white/10 border border-white/20 hover:bg-white/20 transition flex-shrink-0 disabled:opacity-50"
        >
          <Download size={14} />
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="w-full bg-white/5 border border-white/20 pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
        />
      </div>

      {loading && <div className="text-center py-12 text-sm text-white/40">Loading...</div>}

      {!loading && (
        <div className="bg-white/5 border border-white/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="text-overline text-white/40 border-b border-white/10">
              <tr>
                <th className="text-left p-4">Email</th>
                <th className="text-left">Date Subscribed</th>
                <th className="text-left">Active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 font-medium">{s.email}</td>
                  <td className="text-white/50 text-xs">
                    {s.created_at
                      ? new Date(s.created_at).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                  <td>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold ${
                        s.is_active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="text-center py-12 text-sm text-white/40">
              {search ? "No subscribers match your search" : "No subscribers yet"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
