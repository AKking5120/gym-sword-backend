import { useState, useEffect, useCallback } from "react";
import { Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminEmailLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 30;

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/admin/email-logs?page=${page}&limit=${limit}`).then(({ data, pagination }) => {
      setLogs(data?.data || []);
      if (pagination) setTotal(pagination.total);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page]);
  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter(l =>
    l.recipient?.toLowerCase().includes(search.toLowerCase()) ||
    l.email_type?.toLowerCase().includes(search.toLowerCase()) ||
    l.subject?.toLowerCase().includes(search.toLowerCase()) ||
    l.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.users?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Email Logs</h1>
          <p className="text-sm text-white/50 mt-1">{total} emails sent</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by recipient, type, subject..." className="w-full bg-white/5 border border-white/20 pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white" />
      </div>

      {loading && <div className="text-center py-12 text-sm text-white/40">Loading...</div>}

      {!loading && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-white/20 text-[10px] uppercase tracking-wider text-white">
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Recipient</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 hidden md:table-cell">Subject</th>
                  <th className="py-3 px-3 hidden md:table-cell">User</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 hidden lg:table-cell">Error</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => (
                  <tr key={log.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-3">
                      {log.status === "sent" ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <XCircle size={16} className="text-red-400" />
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-white">{log.recipient}</td>
                    <td className="py-3 px-3">
                      <span className="bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/70">{log.email_type}</span>
                    </td>
                    <td className="py-3 px-3 text-white/60 max-w-[200px] truncate hidden md:table-cell">{log.subject || "—"}</td>
                    <td className="py-3 px-3 text-white/60 hidden md:table-cell">{log.users?.name || log.users?.email || "—"}</td>
                    <td className="py-3 px-3 text-white/50 whitespace-nowrap">{new Date(log.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="py-3 px-3 text-red-400 text-[11px] max-w-[200px] truncate hidden lg:table-cell">{log.error_message || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!filtered.length && <div className="text-center py-12 text-sm text-white/40">No logs found</div>}

          {total > limit && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="text-sm px-4 py-2 border border-white/20 text-white/70 disabled:opacity-30 hover:bg-white/10 transition">Previous</button>
              <span className="text-sm text-white/50">Page {page} of {Math.ceil(total / limit)}</span>
              <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)} className="text-sm px-4 py-2 border border-white/20 text-white/70 disabled:opacity-30 hover:bg-white/10 transition">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
