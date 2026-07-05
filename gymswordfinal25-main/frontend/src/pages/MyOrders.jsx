import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Search, Package, Filter, X } from "lucide-react";
import { api, resolveImage, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/api";
import { formatPrice } from "@/lib/currency";


const STATUS_CONFIG = {
  pending: { label: "Processing", color: "bg-black/10 text-black/60" },
  confirmed: { label: "Confirmed", color: "bg-black text-white" },
  processing: { label: "Processing", color: "bg-black/10 text-black/60" },
  packed: { label: "Packed", color: "bg-black text-white" },
  shipped: { label: "Shipped", color: "bg-blue-600 text-white" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-blue-600 text-white" },
  delivered: { label: "Delivered", color: "bg-green-600 text-white" },
  cancelled: { label: "Cancelled", color: "bg-red-600 text-white" },
  returned: { label: "Returned", color: "bg-red-600 text-white" },
};

const FILTER_OPTIONS = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Processing" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    api.get("/orders").then(({ data }) => {
      setOrders(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchOrder = o.order_number?.toLowerCase().includes(q);
      const matchProduct = o.items?.some((i) => i.name?.toLowerCase().includes(q));
      if (!matchOrder && !matchProduct) return false;
    }
    return true;
  });

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 py-8 md:py-12">
        <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-black/40 mb-6">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={9} />
          <span className="text-black font-semibold">My Orders</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display uppercase font-black text-3xl sm:text-4xl">My Orders</h1>
          <span className="text-[12px] text-black/40">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
            <input
              type="text"
              placeholder="Search by Order ID or Product Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-black/15 pl-11 pr-4 py-3 text-[13px] focus:outline-none focus:border-black transition-colors placeholder:text-black/30"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] transition-all ${
                filter !== "all" ? "border-black bg-black text-white" : "border-black/15 text-black/60 hover:border-black"
              }`}
            >
              <Filter size={14} />
              <span className="hidden sm:inline">Filter</span>
            </button>
            {showFilter && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFilter(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-black/15 shadow-lg z-20">
                  {FILTER_OPTIONS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => { setFilter(f.value); setShowFilter(false); }}
                      className={`w-full text-left px-4 py-2.5 text-[12px] hover:bg-black/5 transition-colors ${
                        filter === f.value ? "font-bold text-black" : "text-black/60"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {filter !== "all" && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] text-black/40">Filtered by:</span>
            <span className="text-[11px] font-bold bg-black text-white px-3 py-1 flex items-center gap-1">
              {FILTER_OPTIONS.find((f) => f.value === filter)?.label}
              <button onClick={() => setFilter("all")} className="hover:text-white/70"><X size={10} /></button>
            </span>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-black/15 border-t-black rounded-full animate-spin mx-auto" />
            <p className="text-[12px] text-black/40 mt-4">Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#f8f8f8] flex items-center justify-center">
              <Package size={32} className="text-black/15" />
            </div>
            <h2 className="font-display uppercase text-xl font-bold mb-3">
              {orders.length === 0 ? "No Orders Yet" : "No Matching Orders"}
            </h2>
            <p className="text-sm text-black/40 mb-8 max-w-md mx-auto">
              {orders.length === 0
                ? "Start shopping to see your orders here."
                : "Try a different search term or filter."}
            </p>
            {orders.length === 0 && (
              <Link to="/shop" className="inline-block bg-black text-white text-[11px] font-bold uppercase tracking-[2px] px-10 py-4 hover:bg-black/80 transition-all">
                Shop Collection
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const firstItem = order.items?.[0];
              const img = firstItem?.image ? resolveImage(firstItem.image) : PRODUCT_IMAGE_PLACEHOLDER;

              return (
                <button
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="w-full text-left border border-black/10 hover:border-black/30 p-4 md:p-5 flex gap-4 transition-all group"
                >
                  <div className="w-20 md:w-24 aspect-[4/5] bg-[#f5f5f7] flex-shrink-0 overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-black truncate">{firstItem?.name || "Order"}</p>
                        {order.itemCount > 1 && (
                          <p className="text-[11px] text-black/40 mt-0.5">+{order.itemCount - 1} more item{order.itemCount > 2 ? "s" : ""}</p>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 flex-shrink-0 ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-[11px] text-black/50">
                      <span className="font-semibold text-black/70">{order.order_number}</span>
                      <span>{formatDate(order.created_at)}</span>
                      {firstItem?.size && <span>Size: {firstItem.size}</span>}
                      {firstItem?.qty && <span>Qty: {firstItem.qty}</span>}
                    </div>
                    <div className="mt-2 text-[14px] font-bold text-black">{formatPrice(order.total)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
