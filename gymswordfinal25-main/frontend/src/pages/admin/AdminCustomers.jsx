import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";
import { Shield, ShieldOff, Mail, X } from "lucide-react";

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);

  const load = useCallback(() => api.get("/admin/users" + (filter !== "all" ? `?verified=${filter}` : "")).then(({ data }) => setUsers(data || [])).catch(() => {}), [filter]);
  useEffect(() => { load(); }, [load]);

  const toggleDisable = async (id, current) => {
    try {
      await api.patch(`/admin/users/${id}/disable`, { disabled: !current });
      toast.success(current ? "Account enabled" : "Account disabled");
      load();
    } catch { toast.error("Failed"); }
  };

  const resendVerification = async (id) => {
    try {
      await api.post(`/admin/users/${id}/resend-verification`);
      toast.success("Verification email resent");
    } catch { toast.error("Failed"); }
  };

  const viewLoginHistory = async (user) => {
    setSelectedUser(user);
    try {
      const { data } = await api.get(`/admin/users/${user.id}/login-history`);
      setLoginHistory(data || []);
    } catch { setLoginHistory([]); }
  };

  const filtered = users.filter((u) =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="text-overline text-white/50">People</div>
        <h1 className="font-display uppercase font-black text-4xl mt-2">Customers</h1>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <input type="text" placeholder="Search by name or email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm bg-white/5 border border-white/20 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="bg-[#111] border border-white/20 px-3 py-2 text-xs text-white">
          <option value="all">All Users</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
        <span className="text-overline text-white/40">{filtered.length} found</span>
      </div>

      <div className="bg-white/5 border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="text-overline text-white/40 border-b border-white/10">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left">Email</th>
              <th className="text-left">Joined</th>
              <th className="text-left">Verified</th>
              <th className="text-left">Status</th>
              <th className="text-left">Orders</th>
              <th className="text-left">Spent</th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-medium">{u.name || "—"}</td>
                <td className="text-white/70 text-xs">{u.email}</td>
                <td className="text-white/50 text-xs">{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                <td>
                  <span className={`px-2 py-0.5 text-xs font-semibold ${u.email_verified ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-300"}`}>
                    {u.email_verified ? "Yes" : "No"}
                  </span>
                </td>
                <td>
                  <span className={`px-2 py-0.5 text-xs font-semibold ${u.is_disabled ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                    {u.is_disabled ? "Disabled" : "Active"}
                  </span>
                </td>
                <td>{u.order_count || 0}</td>
                <td>{u.total_spent ? formatPrice(u.total_spent) : "—"}</td>
                <td className="text-right pr-4">
                  <div className="flex justify-end gap-1">
                    {!u.email_verified && (
                      <button onClick={() => resendVerification(u.id)} className="p-2 hover:bg-white/10 rounded" title="Resend Verification">
                        <Mail size={14} />
                      </button>
                    )}
                    <button onClick={() => viewLoginHistory(u)} className="p-2 hover:bg-white/10 rounded" title="Login History">
                      <Shield size={14} />
                    </button>
                    <button onClick={() => toggleDisable(u.id, u.is_disabled)} className="p-2 hover:bg-white/10 rounded" title={u.is_disabled ? "Enable Account" : "Disable Account"}>
                      {u.is_disabled ? <ShieldOff size={14} /> : <Shield size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Login History Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 p-8 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold">Login History</h2>
                <p className="text-sm text-white/50">{selectedUser.name} — {selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-white/10 rounded"><X size={18} /></button>
            </div>
            {loginHistory.length === 0 ? (
              <p className="text-white/40 text-sm">No login history found.</p>
            ) : (
              <div className="space-y-3">
                {loginHistory.map((h) => (
                  <div key={h.id} className="border border-white/10 p-4 text-sm">
                    <div className="flex justify-between text-white/70">
                      <span>{new Date(h.created_at).toLocaleString("en-IN")}</span>
                      <span className="text-overline">{h.device_info || "Unknown"} · {h.browser_info || "Unknown"}</span>
                    </div>
                    <div className="text-xs text-white/40 mt-1">IP: {h.ip_address}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
