import { useEffect, useState, useMemo, useCallback } from "react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package,
  BarChart3, Download, Search, ArrowUpDown, AlertTriangle, CheckCircle, XCircle,
  Clock, Activity, Eye, MousePointer, Star, RefreshCw,
  ArrowUp, ArrowDown, CreditCard, Banknote, Percent, UserPlus, UserCheck,
  RotateCcw, Truck, PackageCheck, Archive, AlertCircle,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area,
} from "recharts";

const CHART_COLORS = ["#FFFFFF", "#E5E5E5", "#A3A3A3", "#737373", "#525252"];

const DATE_RANGES = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last_7" },
  { label: "Last 30 Days", value: "last_30" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Year", value: "this_year" },
  { label: "Custom", value: "custom" },
];

const STATUS_COLORS = {
  delivered: "text-green-400 bg-green-400/10 border-green-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
  returned: "text-red-400 bg-red-400/10 border-red-400/20",
  pending: "text-white/50 bg-white/5 border-white/10",
  confirmed: "text-white/50 bg-white/5 border-white/10",
  processing: "text-white/50 bg-white/5 border-white/10",
  packed: "text-white/50 bg-white/5 border-white/10",
  shipped: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  out_for_delivery: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

function formatCompact(num) {
  if (num == null || isNaN(num)) return "0";
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return Math.round(num).toString();
}

function StatCard({ label, value, growth, prefix, suffix, icon, compact }) {
  const isPositive = growth != null && growth >= 0;
  return (
    <div className="bg-white/5 border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div className="text-overline text-white/50 text-[10px] uppercase tracking-widest">{label}</div>
        {icon && <div className="text-white/30">{icon}</div>}
      </div>
      <div className="font-display text-2xl font-black mt-1">
        {prefix}{compact ? formatCompact(value) : (value ?? "-")}{suffix}
      </div>
      {growth != null && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? "text-green-400" : "text-red-400"}`}>
          {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {Math.abs(growth).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || "text-white/50 bg-white/5 border-white/10";
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-widest border ${cls}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

export default function BusinessDashboard() {
  const [dateRange, setDateRange] = useState("last_30");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overview: null,
    sales: null,
    products: null,
    customers: null,
    inventory: null,
    traffic: null,
    orders: null,
    payments: null,
    activities: null,
  });

  const [productSearch, setProductSearch] = useState("");
  const [productSort, setProductSort] = useState({ key: null, dir: "asc" });
  const [productPage, setProductPage] = useState(1);
  const PRODUCTS_PER_PAGE = 10;

  const fetchAll = useCallback(async (range) => {
    setLoading(true);
    const rangeParam = range !== "custom" ? `?range=${range}` : "";
    const endpoints = [
      "overview", "sales", "products", "customers", "inventory",
      "traffic", "orders", "payments", "activities",
    ];
    try {
      const results = await Promise.all(
        endpoints.map((ep) =>
          api.get(`/admin/business-dashboard/${ep}${rangeParam}`)
            .then((res) => ({ key: ep, data: res.data }))
            .catch((err) => {
              console.error(`Failed to fetch ${ep}:`, err);
              toast.error(`Failed to load ${ep}`);
              return { key: ep, data: null };
            })
        )
      );
      const merged = {};
      results.forEach((r) => { merged[r.key] = r.data; });
      setData(merged);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(dateRange);
  }, [dateRange, fetchAll]);

  const handleDateChange = (val) => {
    setDateRange(val);
    setProductPage(1);
  };

  const overview = data.overview || {};
  const sales = data.sales || {};
  const products = data.products || {};
  const customers = data.customers || {};
  const inventory = data.inventory || {};
  const traffic = data.traffic || {};
  const orders = data.orders || {};
  const payments = data.payments || {};
  const activities = data.activities?.activities || data.activities || [];

  const topSelling = (products.top_selling || []).slice(0, 10);
  const allProducts = products.products || products.all_products || [];
  const productPerformance = products.performance || allProducts;

  const filteredProducts = useMemo(() => {
    let list = [...productPerformance];
    if (productSearch) {
      const q = productSearch.toLowerCase();
      list = list.filter((p) => (p.name || "").toLowerCase().includes(q) || (p.id || "").toLowerCase().includes(q));
    }
    if (productSort.key) {
      list.sort((a, b) => {
        const av = a[productSort.key] ?? 0;
        const bv = b[productSort.key] ?? 0;
        if (typeof av === "string") {
          return productSort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        }
        return productSort.dir === "asc" ? av - bv : bv - av;
      });
    }
    return list;
  }, [productPerformance, productSearch, productSort]);

  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, productPage]);

  const totalProductPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const toggleSort = (key) => {
    setProductSort((prev) => {
      if (prev.key === key) return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      return { key, dir: "asc" };
    });
    setProductPage(1);
  };

  const SortHeader = ({ label, sortKey }) => (
    <th
      className="text-left py-3 px-2 cursor-pointer select-none hover:text-white/80 transition-colors"
      onClick={() => toggleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {productSort.key === sortKey && (
          <ArrowUpDown size={10} className={productSort.dir === "desc" ? "rotate-180" : ""} />
        )}
      </div>
    </th>
  );

  if (loading && !data.overview) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2 text-white/50">
          <RefreshCw size={18} className="animate-spin" />
          <span className="text-overline">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-overline text-white/50">Admin</div>
          <h1 className="font-display uppercase font-black text-4xl sm:text-5xl mt-2">Business Dashboard</h1>
        </div>
        <button
          onClick={() => toast.info("Export feature coming soon")}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs uppercase tracking-widest font-bold hover:bg-white/90 transition-colors"
        >
          <Download size={14} />
          Export Report
        </button>
      </div>

      {/* A. Date Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {DATE_RANGES.map((dr) => (
          <button
            key={dr.value}
            onClick={() => handleDateChange(dr.value)}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-bold border transition-colors ${
              dateRange === dr.value
                ? "bg-white text-black border-white"
                : "bg-transparent text-white/60 border-white/10 hover:text-white hover:border-white/30"
            }`}
          >
            {dr.label}
          </button>
        ))}
        {loading && (
          <div className="flex items-center gap-1 ml-2 text-white/30">
            <RefreshCw size={12} className="animate-spin" />
            <span className="text-[10px]">refreshing…</span>
          </div>
        )}
      </div>

      {/* B. KPI Cards Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={overview.total_revenue}
          growth={overview.revenue_growth}
          prefix="₹"
          compact
          icon={<DollarSign size={16} />}
        />
        <StatCard
          label="Total Orders"
          value={overview.total_orders}
          growth={overview.order_growth}
          icon={<ShoppingCart size={16} />}
        />
        <StatCard
          label="Total Customers"
          value={overview.total_customers}
          icon={<Users size={16} />}
        />
        <StatCard
          label="Total Products"
          value={overview.total_products}
          icon={<Package size={16} />}
        />
        <StatCard
          label="COD Orders"
          value={overview.total_cod}
          icon={<Banknote size={16} />}
        />
        <StatCard
          label="Prepaid Orders"
          value={overview.total_prepaid}
          icon={<CreditCard size={16} />}
        />
        <StatCard
          label="Delivered Orders"
          value={overview.total_delivered}
          icon={<PackageCheck size={16} />}
        />
        <StatCard
          label="Cancelled Orders"
          value={overview.total_cancelled}
          icon={<XCircle size={16} />}
        />
        <StatCard
          label="Return Rate"
          value={overview.return_rate}
          suffix="%"
          icon={<RotateCcw size={16} />}
        />
        <StatCard
          label="AOV"
          value={overview.aov}
          prefix="₹"
          compact
          icon={<BarChart3 size={16} />}
        />
        <StatCard
          label="Conversion Rate"
          value={overview.conversion_rate}
          suffix="%"
          icon={<Percent size={16} />}
        />
        <StatCard
          label="Refund Rate"
          value={overview.refund_rate}
          suffix="%"
          icon={<AlertCircle size={16} />}
        />
      </div>

      {/* C. Sales Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6">
          <div className="text-overline text-white/50 mb-4">Revenue Trend</div>
          <div className="h-72">
            {sales.daily_sales && sales.daily_sales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sales.daily_sales}>
                  <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickFormatter={(v) => v?.slice(5, 10) || v} />
                  <YAxis stroke="#666" fontSize={10} tickFormatter={(v) => formatCompact(v)} />
                  <Tooltip
                    contentStyle={{ background: "#0A0A0A", border: "1px solid #333", borderRadius: 0 }}
                    formatter={(v) => [formatPrice(v), "Revenue"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#fff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-white/40">No data</div>
            )}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6">
          <div className="text-overline text-white/50 mb-4">COD vs Prepaid</div>
          <div className="h-72">
            {sales.cod_vs_prepaid ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "COD", value: sales.cod_vs_prepaid.cod_orders || 0 },
                      { name: "Prepaid", value: sales.cod_vs_prepaid.prepaid_orders || 0 },
                    ]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    stroke="none"
                  >
                    {["#FFFFFF", "#525252"].map((c, i) => (
                      <Cell key={i} fill={c} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0A0A0A", border: "1px solid #333", borderRadius: 0 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-white/40">No data</div>
            )}
          </div>
          {sales.cod_vs_prepaid && (
            <div className="flex justify-center gap-6 mt-2 text-xs text-white/60">
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-white" /> COD: {sales.cod_vs_prepaid.cod_orders || 0}</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#525252]" /> Prepaid: {sales.cod_vs_prepaid.prepaid_orders || 0}</div>
            </div>
          )}
        </div>
      </div>

      {/* Mini Sales Charts Row */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 p-4">
          <div className="text-overline text-white/50 text-[10px] mb-3">Weekly Sales</div>
          <div className="h-36">
            {sales.weekly_sales && sales.weekly_sales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sales.weekly_sales}>
                  <CartesianGrid stroke="#222" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" stroke="#666" fontSize={8} hide />
                  <Tooltip contentStyle={{ background: "#0A0A0A", border: "1px solid #333", borderRadius: 0 }} />
                  <Bar dataKey="revenue" fill="#fff" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-white/40">No data</div>
            )}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-4">
          <div className="text-overline text-white/50 text-[10px] mb-3">Monthly Sales</div>
          <div className="h-36">
            {sales.monthly_sales && sales.monthly_sales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sales.monthly_sales}>
                  <CartesianGrid stroke="#222" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" stroke="#666" fontSize={8} hide />
                  <Tooltip contentStyle={{ background: "#0A0A0A", border: "1px solid #333", borderRadius: 0 }} />
                  <Bar dataKey="revenue" fill="#E5E5E5" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-white/40">No data</div>
            )}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-4">
          <div className="text-overline text-white/50 text-[10px] mb-3">Yearly Sales</div>
          <div className="h-36">
            {sales.yearly_sales && sales.yearly_sales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sales.yearly_sales}>
                  <CartesianGrid stroke="#222" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" stroke="#666" fontSize={8} hide />
                  <Tooltip contentStyle={{ background: "#0A0A0A", border: "1px solid #333", borderRadius: 0 }} />
                  <Bar dataKey="revenue" fill="#A3A3A3" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-white/40">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* D. Top Selling Products */}
      <div className="bg-white/5 border border-white/10 p-6">
        <div className="text-overline text-white/50 mb-4">Top Selling Products</div>
        {topSelling.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-overline text-white/40 border-b border-white/10">
                <tr>
                  <th className="text-left py-3 px-2">Product</th>
                  <th className="text-left py-3 px-2">Name</th>
                  <th className="text-right py-3 px-2">Orders</th>
                  <th className="text-right py-3 px-2">Revenue</th>
                  <th className="text-right py-3 px-2">Conv. Rate</th>
                  <th className="text-right py-3 px-2">Rating</th>
                </tr>
              </thead>
              <tbody>
                {topSelling.map((p, i) => (
                  <tr key={p.id || i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-2">
                      <img
                        src={p.image || p.thumbnail || ""}
                        alt={p.name}
                        className="w-10 h-12 object-cover bg-white/5"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    </td>
                    <td className="py-3 px-2 text-white/80 max-w-[200px] truncate">{p.name}</td>
                    <td className="py-3 px-2 text-right">{p.orders ?? p.sold ?? 0}</td>
                    <td className="py-3 px-2 text-right font-medium">{formatPrice(p.revenue ?? 0)}</td>
                    <td className="py-3 px-2 text-right">{p.conversion_rate != null ? `${p.conversion_rate}%` : "-"}</td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star size={12} className="text-white/40" />
                        <span>{p.rating ?? "-"}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-white/40 py-8 text-center">No top selling data</div>
        )}
      </div>

      {/* E. Product Performance */}
      <div className="bg-white/5 border border-white/10 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="text-overline text-white/50">Product Performance</div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search products…"
              value={productSearch}
              onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
              className="w-full sm:w-64 bg-transparent border border-white/10 pl-9 pr-3 py-2 text-xs text-white/80 placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>
        {filteredProducts.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-overline text-white/40 border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-2">Image</th>
                    <SortHeader label="Name" sortKey="name" />
                    <SortHeader label="ID" sortKey="id" />
                    <SortHeader label="Views" sortKey="views" />
                    <SortHeader label="Clicks" sortKey="clicks" />
                    <SortHeader label="Add to Cart" sortKey="add_to_cart" />
                    <SortHeader label="Orders" sortKey="orders" />
                    <SortHeader label="Conv. Rate" sortKey="conversion_rate" />
                    <SortHeader label="Revenue" sortKey="revenue" />
                    <SortHeader label="Returns" sortKey="returns" />
                    <SortHeader label="Rating" sortKey="rating" />
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((p, i) => (
                    <tr key={p.id || i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-2">
                        <img
                          src={p.image || p.thumbnail || ""}
                          alt={p.name}
                          className="w-10 h-12 object-cover bg-white/5"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </td>
                      <td className="py-3 px-2 text-white/80 max-w-[180px] truncate">{p.name}</td>
                      <td className="py-3 px-2 text-white/40 text-[10px]">{p.id || "-"}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1"><Eye size={12} className="text-white/30" />{p.views ?? 0}</div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1"><MousePointer size={12} className="text-white/30" />{p.clicks ?? 0}</div>
                      </td>
                      <td className="py-3 px-2">{p.add_to_cart ?? 0}</td>
                      <td className="py-3 px-2">{p.orders ?? 0}</td>
                      <td className="py-3 px-2">{p.conversion_rate != null ? `${p.conversion_rate}%` : "-"}</td>
                      <td className="py-3 px-2 font-medium">{formatPrice(p.revenue ?? 0)}</td>
                      <td className="py-3 px-2">{p.returns ?? 0}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-white/40" />
                          {p.rating ?? "-"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalProductPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-xs text-white/50">
                <div>
                  Showing {(productPage - 1) * PRODUCTS_PER_PAGE + 1}–{Math.min(productPage * PRODUCTS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                    disabled={productPage <= 1}
                    className="px-3 py-1 border border-white/10 hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  {Array.from({ length: Math.min(totalProductPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalProductPages <= 5) {
                      pageNum = i + 1;
                    } else if (productPage <= 3) {
                      pageNum = i + 1;
                    } else if (productPage >= totalProductPages - 2) {
                      pageNum = totalProductPages - 4 + i;
                    } else {
                      pageNum = productPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setProductPage(pageNum)}
                        className={`w-7 h-7 text-center ${
                          productPage === pageNum ? "bg-white text-black" : "hover:bg-white/10"
                        } transition-colors`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
                    disabled={productPage >= totalProductPages}
                    className="px-3 py-1 border border-white/10 hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-white/40 py-8 text-center">
            {productSearch ? "No products match your search" : "No product data available"}
          </div>
        )}
      </div>

      {/* F. Customer Analytics */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="text-overline text-white/50">Customer Overview</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-4">
              <div className="text-overline text-white/50 text-[10px]">New</div>
              <div className="font-display text-xl font-black mt-1">{customers.new_customers ?? overview.new_customers ?? 0}</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4">
              <div className="text-overline text-white/50 text-[10px]">Returning</div>
              <div className="font-display text-xl font-black mt-1">{customers.returning_customers ?? 0}</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4">
              <div className="text-overline text-white/50 text-[10px]">Active</div>
              <div className="font-display text-xl font-black mt-1">{customers.active_customers ?? 0}</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4">
              <div className="text-overline text-white/50 text-[10px]">Referral</div>
              <div className="font-display text-xl font-black mt-1">{customers.referral_customers ?? 0}</div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-4">
            <div className="text-overline text-white/50 text-[10px]">Total Customers</div>
            <div className="font-display text-2xl font-black mt-1">{customers.total_customers ?? overview.total_customers ?? 0}</div>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6">
          <div className="text-overline text-white/50 mb-4">Customer Growth</div>
          <div className="h-72">
            {customers.customer_growth && customers.customer_growth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={customers.customer_growth}>
                  <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip contentStyle={{ background: "#0A0A0A", border: "1px solid #333", borderRadius: 0 }} />
                  <Area type="monotone" dataKey="count" stroke="#fff" fill="#fff" fillOpacity={0.08} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-white/40">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Customers */}
      {customers.top_customers && customers.top_customers.length > 0 && (
        <div className="bg-white/5 border border-white/10 p-6">
          <div className="text-overline text-white/50 mb-4">Top Customers</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-overline text-white/40 border-b border-white/10">
                <tr>
                  <th className="text-left py-3 px-2">Name</th>
                  <th className="text-left py-3 px-2">Email</th>
                  <th className="text-right py-3 px-2">Orders</th>
                  <th className="text-right py-3 px-2">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {customers.top_customers.map((c, i) => (
                  <tr key={c.id || i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-2 text-white/80">{c.name || c.full_name || "-"}</td>
                    <td className="py-3 px-2 text-white/50">{c.email || "-"}</td>
                    <td className="py-3 px-2 text-right">{c.orders ?? 0}</td>
                    <td className="py-3 px-2 text-right font-medium">{formatPrice(c.total_spent ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* G. Inventory Analytics */}
      <div>
        <div className="text-overline text-white/50 mb-4">Inventory</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard label="Total Stock" value={inventory.total_stock ?? 0} icon={<Archive size={16} />} />
          <StatCard label="Inventory Value" prefix="₹" compact value={inventory.inventory_value ?? 0} icon={<DollarSign size={16} />} />
          <div className="bg-white/5 border border-white/10 p-4 border-l-2 border-l-red-500">
            <div className="text-overline text-white/50 text-[10px]">Low Stock</div>
            <div className="font-display text-2xl font-black mt-1 text-red-400">{inventory.low_stock_count ?? 0}</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 border-l-2 border-l-red-500">
            <div className="text-overline text-white/50 text-[10px]">Out of Stock</div>
            <div className="font-display text-2xl font-black mt-1 text-red-400">{inventory.out_of_stock_count ?? 0}</div>
          </div>
        </div>
        {inventory.low_stock && inventory.low_stock.length > 0 && (
          <div className="bg-white/5 border border-white/10 p-6">
            <div className="text-overline text-white/50 mb-4">Low Stock Alerts</div>
            <div className="space-y-2">
              {inventory.low_stock.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-sm text-white/80">{item.name || item.product_name}</span>
                  </div>
                  <span className="text-sm text-red-400 font-medium">{item.stock ?? item.quantity ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* H. Order Analytics */}
      <div className="bg-white/5 border border-white/10 p-6">
        <div className="text-overline text-white/50 mb-4">Order Status Breakdown</div>
        {orders.order_analytics ? (
          <div className="flex flex-wrap gap-3">
            {Object.entries(orders.order_analytics).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-3">
                <StatusBadge status={status} />
                <span className="font-display text-lg font-black">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-white/40 py-4">No order data</div>
        )}
      </div>

      {/* I. Payment Analytics */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 p-6">
          <div className="text-overline text-white/50 mb-4">COD Payments</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Orders</span>
              <span className="font-display text-xl font-black">{payments.total_cod ?? overview.cod_orders ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Revenue</span>
              <span className="font-display text-xl font-black">{formatPrice(payments.cod_revenue ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Percentage</span>
              <span className="font-display text-xl font-black">{payments.cod_percentage ?? 0}%</span>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6">
          <div className="text-overline text-white/50 mb-4">Prepaid Payments</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Orders</span>
              <span className="font-display text-xl font-black">{payments.total_prepaid ?? overview.prepaid_orders ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Revenue</span>
              <span className="font-display text-xl font-black">{formatPrice(payments.prepaid_revenue ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Percentage</span>
              <span className="font-display text-xl font-black">{payments.prepaid_percentage ?? 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* J. Recent Activities */}
      <div className="bg-white/5 border border-white/10 p-6">
        <div className="text-overline text-white/50 mb-4">Recent Activities</div>
        {activities.length > 0 ? (
          <div className="space-y-0">
            {activities.map((act, i) => (
              <div key={act.id || i} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                <div className="mt-0.5">
                  <Activity size={14} className="text-white/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 truncate">{act.description || act.message || act.action || "-"}</div>
                  <div className="text-[10px] text-white/40 mt-1">
                    {act.created_at || act.timestamp || act.date || ""}
                  </div>
                </div>
                {act.user && <div className="text-xs text-white/40 shrink-0">{act.user}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-white/40 py-4">No recent activities</div>
        )}
      </div>
    </div>
  );
}
