import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { api } from "@/lib/api";
import { formatPrice, formatPriceCompact } from "@/lib/currency";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch(() => setStats({ total_revenue: 0, total_orders: 0, total_users: 0, total_products: 0, revenue_trend: [], top_products: [], recent_orders: [] }));
  }, []);
  if (!stats) return <div className="text-overline text-white/50">Loading…</div>;

  return (
    <div className="space-y-10">
      <div>
        <div className="text-overline text-white/50">Overview</div>
        <h1 className="font-display uppercase font-black text-4xl sm:text-5xl mt-2">Home</h1>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Revenue" value={formatPriceCompact(stats.total_revenue)} />
        <Stat label="Orders" value={stats.total_orders} />
        <Stat label="Customers" value={stats.total_users} />
        <Stat label="Products" value={stats.total_products} />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6">
          <div className="text-overline text-white/50 mb-4">Revenue · Last 30 days</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenue_trend}>
                <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                <XAxis dataKey="_id" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ background: "#000", border: "1px solid #333" }} />
                <Line type="monotone" dataKey="revenue" stroke="#fff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6">
          <div className="text-overline text-white/50 mb-4">Top Products</div>
          {stats.top_products?.length > 0 ? (
            <>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.top_products}>
                    <XAxis dataKey="name" stroke="#666" fontSize={10} hide />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={{ background: "#000", border: "1px solid #333" }} />
                    <Bar dataKey="qty" fill="#fff" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-1 text-xs text-white/70">
                {stats.top_products.map((p, i) => (
                  <div key={i} className="flex justify-between"><span className="truncate">{p.name}</span><span>{p.qty} sold</span></div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-60 flex items-center justify-center text-sm text-white/40">No sales data yet</div>
          )}
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-overline text-white/50">Recent Orders</div>
          <Link to="/admin/orders" className="text-overline text-white/60 luxury-link">View All →</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="text-overline text-white/40 border-b border-white/10">
            <tr><th className="text-left py-3">Order</th><th className="text-left">Customer</th><th className="text-left">Status</th><th className="text-right">Total</th></tr>
          </thead>
          <tbody>
            {stats.recent_orders.map((o) => (
              <tr key={o.id} className="border-b border-white/5">
                <td className="py-3">{o.order_number}</td>
                <td className="text-white/70">{o.user_email}</td>
                <td className="text-overline text-white/60">{o.status}</td>
                <td className="text-right font-medium">{formatPrice(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 p-6">
      <div className="text-overline text-white/50">{label}</div>
      <div className="font-display text-3xl font-black mt-2">{value}</div>
    </div>
  );
}
