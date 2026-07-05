import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function AdminStaff() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [changing, setChanging] = useState({});

  const load = () =>
    api.get("/admin/staff").then(({ data }) => setStaff(data || [])).catch(() => {});

  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => {
    setChanging((p) => ({ ...p, [id]: true }));
    try {
      await api.patch(`/admin/staff/${id}/role`, { role });
      toast.success(`Role updated to ${role}`);
      load();
    } catch {
      toast.error("Failed to update role");
    } finally {
      setChanging((p) => ({ ...p, [id]: false }));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-overline text-white/50">Admin</div>
        <h1 className="font-display uppercase font-black text-4xl mt-2">Staff</h1>
      </div>

      <div className="bg-white/5 border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="text-overline text-white/40 border-b border-white/10">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left">Email</th>
              <th className="text-left">Role</th>
              <th className="text-left">Created</th>
              <th className="text-left">Status</th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-medium">
                  <span className="flex items-center gap-2">
                    {u.name || "—"}
                    {currentUser && currentUser.id === u.id && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-white text-black font-bold tracking-wider">You</span>
                    )}
                  </span>
                </td>
                <td className="text-white/70 text-xs">{u.email}</td>
                <td>
                  <span className={`px-2 py-0.5 text-xs font-semibold ${
                    u.role === "super_admin"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="text-white/50 text-xs">{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                <td>
                  <span className={`px-2 py-0.5 text-xs font-semibold ${
                    u.is_disabled
                      ? "bg-red-500/20 text-red-400"
                      : "bg-green-500/20 text-green-400"
                  }`}>
                    {u.is_disabled ? "Disabled" : "Active"}
                  </span>
                </td>
                <td className="text-right pr-4">
                  <select
                    value={u.role}
                    disabled={changing[u.id]}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="bg-[#111] border border-white/20 px-2 py-1.5 text-xs text-white focus:outline-none focus:border-white/40 disabled:opacity-40"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                    <option value="super_admin">super_admin</option>
                  </select>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-white/30 text-sm">No staff found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
