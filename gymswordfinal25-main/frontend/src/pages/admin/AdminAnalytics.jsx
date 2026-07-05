import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";
import { api } from "@/lib/api";
import { formatPrice, formatPriceCompact } from "@/lib/currency";

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch(() => setStats({ total_revenue: 0, total_orders: 0, total_users: 0, revenue_trend: [], top_products: [] }));
  }, []);
  if (!stats) return <div className="text-overline text-white/50">Loading…</div>;

  return (
    <div className="space-y-10">
      <div>
        <div className="text-overline text-white/50">Performance</div>
        <h1 className="font-display uppercase font-black text-4xl mt-2">Analytics</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="Revenue" value={formatPriceCompact(stats.total_revenue)} />
        <Card label="Avg Order" value={formatPriceCompact(stats.total_orders ? stats.total_revenue / stats.total_orders : 0)} />
        <Card label="Orders" value={stats.total_orders} />
        <Card label="Customers" value={stats.total_users} />
      </div>

      <div className="bg-white/5 border border-white/10 p-6">
        <div className="text-overline text-white/50 mb-4">Revenue · 30 days</div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.revenue_trend}>
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#fff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#222" strokeDasharray="3 3" />
              <XAxis dataKey="_id" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={10} />
              <Tooltip contentStyle={{ background: "#000", border: "1px solid #333" }} />
              <Area type="monotone" dataKey="revenue" stroke="#fff" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 p-6">
        <div className="text-overline text-white/50 mb-4">Orders · 30 days</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.revenue_trend}>
              <CartesianGrid stroke="#222" strokeDasharray="3 3" />
              <XAxis dataKey="_id" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={10} />
              <Tooltip contentStyle={{ background: "#000", border: "1px solid #333" }} />
              <Line type="monotone" dataKey="orders" stroke="#fff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 p-6">
      <div className="text-overline text-white/50">{label}</div>
      <div className="font-display text-3xl font-black mt-2">{value}</div>
    </div>
  );
}
