import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({ total_referrals: 0, total_coins_given: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/referrals");
      setReferrals(data || []);
      setStats(data?.stats || { total_referrals: 0, total_coins_given: 0 });
    } catch (err) {
      toast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = referrals.filter((r) => {
    const referrerName = r.referrer?.name?.toLowerCase() || "";
    const referrerEmail = r.referrer?.email?.toLowerCase() || "";
    const referredName = r.referred_user?.name?.toLowerCase() || "";
    const referredEmail = r.referred_user?.email?.toLowerCase() || "";
    const searchTerm = search.toLowerCase();

    return (
      referrerName.includes(searchTerm) ||
      referrerEmail.includes(searchTerm) ||
      referredName.includes(searchTerm) ||
      referredEmail.includes(searchTerm)
    );
  });

  if (loading) {
    return <div className="text-overline text-white/50">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="text-overline text-white/50">Referral Program</div>
        <h1 className="font-display uppercase font-black text-4xl mt-2">Referrals</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 p-6">
          <div className="text-overline text-white/50">Total Referrals</div>
          <div className="font-display text-3xl font-black mt-2">{stats.total_referrals}</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6">
          <div className="text-overline text-white/50">Coins Given</div>
          <div className="font-display text-3xl font-black mt-2">{stats.total_coins_given}</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6">
          <div className="text-overline text-white/50">Rewards Given</div>
          <div className="font-display text-3xl font-black mt-2">
            {referrals.filter(r => r.reward_given).length}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm bg-white/5 border border-white/20 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
        />
        <span className="text-overline text-white/40">{filtered.length} found</span>
      </div>

      {/* Referrals Table */}
      <div className="bg-white/5 border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="text-overline text-white/40 border-b border-white/10">
            <tr>
              <th className="text-left p-4">Date</th>
              <th className="text-left">Referrer</th>
              <th className="text-left">Referred User</th>
              <th className="text-left">Referral Code</th>
              <th className="text-left">Reward</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-white/50">
                  No referrals found
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 text-white/60 text-xs">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td>
                    <div className="text-white/70">{r.referrer?.name || "Unknown"}</div>
                    <div className="text-xs text-white/50">{r.referrer?.email}</div>
                    {r.referrer?.public_id && (
                      <div className="text-xs text-white/40">ID: {r.referrer.public_id}</div>
                    )}
                  </td>
                  <td>
                    <div className="text-white/70">{r.referred_user?.name || "Unknown"}</div>
                    <div className="text-xs text-white/50">{r.referred_user?.email}</div>
                    {r.referred_user?.public_id && (
                      <div className="text-xs text-white/40">ID: {r.referred_user.public_id}</div>
                    )}
                  </td>
                  <td className="font-mono-display text-xs">{r.referral_code}</td>
                  <td className="text-white/70">{r.reward_coins} coins</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs border ${
                        r.reward_given
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                      }`}
                    >
                      {r.reward_given ? "Given" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
