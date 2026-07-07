import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, API_BASE } from "@/lib/api";
import { toast } from "sonner";
import {
  Users, Award, TrendingUp, DollarSign, Search, RefreshCw,
  Settings, CheckCircle, Clock, XCircle, BarChart3, Medal,
  Gift, Star, Shield, Eye, EyeOff, Save, ChevronDown,
  Target, Sparkles, UserCheck, Wallet, Coins
} from "lucide-react";

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, total_coins: 0 });
  const [topReferrers, setTopReferrers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    referral_enabled: true,
    referral_reward_amount: 500,
    referral_min_purchase: 1500,
    referral_coupon_days: 30,
    referral_bonus_coins: 50,
    referral_reward_type: "wallet",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data: statsData } = await api.get("/referral/admin/stats");
      setStats(statsData?.stats || { total: 0, completed: 0, pending: 0, total_coins: 0 });
      setTopReferrers(statsData?.top_referrers || []);
      const refs = statsData?.referrals || [];
      setReferrals(refs);
      if (!statsData?.referrals) {
        const { data: legacyData } = await api.get("/admin/referrals");
        setReferrals(legacyData || []);
      }
    } catch (err) {
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const { data } = await api.get("/referral/admin/settings");
      if (data) setSettings((prev) => ({ ...prev, ...data }));
    } catch {}
  };

  useEffect(() => {
    load();
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.put("/referral/admin/settings", settings);
      toast.success("Settings saved");
      setSettingsOpen(false);
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const filtered = referrals.filter((r) => {
    const sw = search.toLowerCase();
    const referrer = r.referrer?.name?.toLowerCase() + r.referrer?.email?.toLowerCase() || "";
    const referred = r.referred_user?.name?.toLowerCase() + r.referred_user?.email?.toLowerCase() || "";
    return referrer.includes(sw) || referred.includes(sw);
  });

  const statsCards = [
    { icon: Users, label: "Total Referrals", value: stats.total, color: "text-white" },
    { icon: CheckCircle, label: "Successful", value: stats.completed, color: "text-emerald-400" },
    { icon: Clock, label: "Pending", value: stats.pending, color: "text-amber-400" },
    { icon: Wallet, label: "Coins Issued", value: stats.total_coins, color: "text-blue-400" },
    { icon: DollarSign, label: "Revenue (est.)", value: stats.completed * 1500, prefix: "₹", color: "text-green-400" },
    { icon: Award, label: "Reward Rate", value: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0, suffix: "%", color: "text-purple-400" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/30 text-xs uppercase tracking-widest">Loading referrals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-semibold">Referral Program</p>
          <h1 className="font-display uppercase font-black text-4xl mt-1 text-white">Referral Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center gap-2 px-4 py-2.5 border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all text-xs uppercase tracking-[0.15em] font-semibold"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-black text-xs uppercase tracking-[0.15em] font-semibold hover:bg-white/90 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            className="border border-white/10 bg-white/5 p-6"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-4 h-4 text-white/40" />
              <span className="text-white/50 text-xs uppercase tracking-[0.2em] font-semibold">Reward Settings</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-white/40 text-[10px] uppercase tracking-[0.15em] font-semibold mb-2">Referral Program</label>
                <button
                  onClick={() => setSettings(s => ({ ...s, referral_enabled: !s.referral_enabled }))}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] border transition-all ${
                    settings.referral_enabled
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-red-500/10 text-red-300 border-red-500/20"
                  }`}
                >
                  {settings.referral_enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {settings.referral_enabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div>
                <label className="block text-white/40 text-[10px] uppercase tracking-[0.15em] font-semibold mb-2">Reward Amount (₹)</label>
                <input
                  type="number"
                  value={settings.referral_reward_amount}
                  onChange={(e) => setSettings(s => ({ ...s, referral_reward_amount: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white/5 border border-white/20 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="block text-white/40 text-[10px] uppercase tracking-[0.15em] font-semibold mb-2">Bonus Coins</label>
                <input
                  type="number"
                  value={settings.referral_bonus_coins}
                  onChange={(e) => setSettings(s => ({ ...s, referral_bonus_coins: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white/5 border border-white/20 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="block text-white/40 text-[10px] uppercase tracking-[0.15em] font-semibold mb-2">Min Purchase (₹)</label>
                <input
                  type="number"
                  value={settings.referral_min_purchase}
                  onChange={(e) => setSettings(s => ({ ...s, referral_min_purchase: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white/5 border border-white/20 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="block text-white/40 text-[10px] uppercase tracking-[0.15em] font-semibold mb-2">Coupon Validity (days)</label>
                <input
                  type="number"
                  value={settings.referral_coupon_days}
                  onChange={(e) => setSettings(s => ({ ...s, referral_coupon_days: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white/5 border border-white/20 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="block text-white/40 text-[10px] uppercase tracking-[0.15em] font-semibold mb-2">Reward Type</label>
                <select
                  value={settings.referral_reward_type}
                  onChange={(e) => setSettings(s => ({ ...s, referral_reward_type: e.target.value }))}
                  className="w-full bg-white/5 border border-white/20 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/40"
                >
                  <option value="wallet">Wallet Credit</option>
                  <option value="coins">Reward Coins</option>
                  <option value="coupon">Coupon</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={saveSettings}
                disabled={savingSettings}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-xs uppercase tracking-[0.15em] font-semibold hover:bg-white/90 transition-all disabled:opacity-40"
              >
                {savingSettings ? "Saving..." : <><Save className="w-3.5 h-3.5" /> Save Settings</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {statsCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              className="bg-white/5 border border-white/10 p-5 hover:bg-white/[0.07] transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5 text-white/30" />
                <span className="text-white/30 text-[9px] uppercase tracking-[0.15em] font-semibold">{card.label}</span>
              </div>
              <div className={`text-2xl font-black ${card.color || "text-white"}`}>
                {card.prefix || ""}{card.value}{card.suffix || ""}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Top Referrers + Search */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Referrers */}
        <div className="bg-white/5 border border-white/10 p-5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Medal className="w-4 h-4 text-amber-400/60" />
            <span className="text-white/40 text-xs uppercase tracking-[0.2em] font-semibold">Top Referrers</span>
          </div>
          {topReferrers.length === 0 ? (
            <p className="text-white/20 text-xs text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-2">
              {topReferrers.map((t, i) => (
                <div key={t.id || i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 flex items-center justify-center text-[9px] font-bold rounded-full ${
                      i === 0 ? "bg-amber-400/20 text-amber-300" :
                      i === 1 ? "bg-gray-400/20 text-gray-300" :
                      i === 2 ? "bg-orange-400/10 text-orange-300" :
                      "bg-white/5 text-white/30"
                    }`}>{i + 1}</span>
                    <span className="text-xs text-white/60">#{t.id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/40">{t.total} refs</span>
                    <span className="text-xs font-semibold text-white/80">{t.coins} coins</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search + Table */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/20 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
              />
            </div>
            <span className="text-white/30 text-[10px] uppercase tracking-[0.1em]">{filtered.length} found</span>
          </div>

          <div className="bg-white/5 border border-white/10 overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-white/30 text-[10px] uppercase tracking-[0.15em] font-semibold">Date</th>
                  <th className="text-left text-white/30 text-[10px] uppercase tracking-[0.15em] font-semibold">Referrer</th>
                  <th className="text-left text-white/30 text-[10px] uppercase tracking-[0.15em] font-semibold">Referred</th>
                  <th className="text-left text-white/30 text-[10px] uppercase tracking-[0.15em] font-semibold">Code</th>
                  <th className="text-left text-white/30 text-[10px] uppercase tracking-[0.15em] font-semibold">Reward</th>
                  <th className="text-left text-white/30 text-[10px] uppercase tracking-[0.15em] font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-white/20 text-xs">No referrals found</td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors">
                      <td className="p-3 text-white/40 text-[11px]">
                        {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="p-3">
                        <div className="text-white/70 text-xs">{r.referrer?.name || "Unknown"}</div>
                        <div className="text-white/30 text-[10px]">{r.referrer?.email || ""}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-white/70 text-xs">{r.referred_user?.name || "Unknown"}</div>
                        <div className="text-white/30 text-[10px]">{r.referred_user?.email || ""}</div>
                      </td>
                      <td className="p-3 text-white/40 text-[11px] font-mono">{r.referral_code || "-"}</td>
                      <td className="p-3 text-white/60 text-xs">{r.reward_coins} coins</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold border ${
                          r.reward_given
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                        }`}>
                          {r.reward_given ? <CheckCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
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
      </div>
    </div>
  );
}
