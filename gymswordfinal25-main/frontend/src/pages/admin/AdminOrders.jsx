import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];

const STATUS_COLORS = {
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  processing: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  shipped: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  delivered: "bg-green-500/20 text-green-300 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
  returned: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [orderHistory, setOrderHistory] = useState([]);

  const load = () => api.get("/admin/orders").then(({ data }) => setOrders(data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      toast.success("Order status updated");
      load();
    } catch { toast.error("Failed to update status"); }
  };

  const viewOrderDetails = async (order) => {
    setActive(order);
    try {
      const { data } = await api.get(`/orders/${order.id}/history`);
      setOrderHistory(data || []);
    } catch {
      setOrderHistory([]);
    }
  };

  const filtered = orders.filter((o) =>
    (o.order_number || `GS-${String(o.id).padStart(6, '0')}`).toLowerCase().includes(search.toLowerCase()) ||
    (o.users?.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.users?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="text-overline text-white/50">Fulfillment</div>
        <h1 className="font-display uppercase font-black text-4xl mt-2">Orders</h1>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by order # or customer email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm bg-white/5 border border-white/20 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
        />
        <span className="text-overline text-white/40">{filtered.length} found</span>
      </div>
      <div className="bg-white/5 border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="text-overline text-white/40 border-b border-white/10">
            <tr>
              <th className="text-left p-4">Order ID</th>
              <th className="text-left">Customer</th>
              <th className="text-left">Date</th>
              <th className="text-left">Items</th>
              <th className="text-left">Total</th>
              <th className="text-left">Payment</th>
              <th className="text-left">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-mono-display text-sm">{o.order_number || `GS-${String(o.id).padStart(6, '0')}`}</td>
                <td>
                  <div className="text-white/70">{o.users?.email}</div>
                  <div className="text-xs text-white/50">{o.users?.name}</div>
                </td>
                <td className="text-white/60 text-xs">{new Date(o.created_at).toLocaleString()}</td>
                <td>{o.order_items?.length || 0}</td>
                <td className="font-medium">{formatPrice(o.total_amount)}</td>
                <td className="text-xs">
                  <span className={`px-2 py-1 rounded border ${
                    o.payment_status === 'paid' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
                    o.payment_status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                    'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}>
                    {o.payment_status}
                  </span>
                </td>
                <td>
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="bg-[#111] border border-white/20 px-3 py-1 text-xs text-white rounded">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="text-right pr-4">
                  <button onClick={() => viewOrderDetails(o)} className="text-overline luxury-link text-white/70">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {active && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-[#111] border border-white/10 w-full max-w-3xl p-8 my-12">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-overline text-white/50">Order Details</div>
                <div className="font-display text-2xl uppercase font-mono-display">
                  {active.order_number || `GS-${String(active.id).padStart(6, '0')}`}
                </div>
                <div className="text-sm text-white/60 mt-1">{active.users?.name} - {active.users?.email}</div>
                <div className="text-xs text-white/40 mt-1">{new Date(active.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => setActive(null)} className="text-overline luxury-link">Close</button>
            </div>

            {/* Order Status Timeline */}
            <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded">
              <div className="text-overline text-white/50 mb-3">Order Progress</div>
              <div className="flex items-center gap-2 flex-wrap">
                {orderHistory.length > 0 ? (
                  orderHistory.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded text-xs border ${STATUS_COLORS[h.status] || 'bg-white/10 text-white border-white/20'}`}>
                        {h.status}
                      </div>
                      {i < orderHistory.length - 1 && <div className="text-white/30">→</div>}
                    </div>
                  ))
                ) : (
                  <div className="text-white/50 text-sm">No status updates yet</div>
                )}
              </div>
              <div className="mt-2 text-xs text-white/40">
                Current: <span className="text-white font-medium">{active.status}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-6">
              <div className="text-overline text-white/50 mb-2">Items Ordered</div>
              {active.order_items?.map((it, i) => (
                <div key={i} className="flex justify-between text-sm border-b border-white/5 pb-2">
                  <span className="text-white/70">{it.products?.name} × {it.quantity}</span>
                  <span className="text-white">{formatPrice(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-2 text-sm">
              <div className="text-white/60">Subtotal</div>
              <div className="text-right text-white">{formatPrice(active.total_amount)}</div>
              {active.discount_amount > 0 && (
                <>
                  <div className="text-white/60">Discount</div>
                  <div className="text-right text-green-400">-{formatPrice(active.discount_amount)}</div>
                </>
              )}
              <div className="text-white/60">Payment Method</div>
              <div className="text-right text-white">{active.payment_method}</div>
              <div className="text-white/60">Payment Status</div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs border ${
                  active.payment_status === 'paid' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
                  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                }`}>
                  {active.payment_status}
                </span>
              </div>
              <div className="font-display text-lg uppercase text-white">Total</div>
              <div className="text-right font-display text-lg text-white">{formatPrice(active.total_amount)}</div>
            </div>

            {/* Status History Log */}
            {orderHistory.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-overline text-white/50 mb-3">Status History</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {orderHistory.map((h, i) => (
                    <div key={i} className="flex justify-between text-xs border-l-2 border-white/20 pl-3">
                      <div>
                        <div className="text-white/70">{h.status}</div>
                        <div className="text-white/40">{h.notes}</div>
                      </div>
                      <div className="text-white/40 text-right">
                        {new Date(h.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
