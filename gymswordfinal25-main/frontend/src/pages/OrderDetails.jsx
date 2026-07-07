import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Package, Check, Truck, Clock, MapPin, Download, RefreshCw, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api, resolveImage, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/context/CartContext";


const TRACKING_STEPS = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "processing", label: "Processing", icon: Clock },
  { key: "packed", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Check },
];

const STATUS_COLORS = {
  pending: "text-black/50",
  confirmed: "text-black",
  processing: "text-black",
  packed: "text-black",
  shipped: "text-blue-600",
  out_for_delivery: "text-blue-600",
  delivered: "text-green-600",
  cancelled: "text-red-600",
};

const CANCEL_REASONS = [
  "Ordered by mistake",
  "Found cheaper elsewhere",
  "Delivery taking too long",
  "Change of mind",
  "Wrong address",
  "Wrong size selected",
  "Other",
];

function statusIndex(status) {
  if (status === "cancelled" || status === "returned") return -1;
  return TRACKING_STEPS.findIndex((s) => s.key === status);
}

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelComment, setCancelComment] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(() => {
    api.get(`/orders/${id}`).then(({ data }) => {
      setOrder(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "";
  const formatDateTime = (d) => d ? new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

  const canCancel = order && ["pending", "confirmed", "processing"].includes(order.status);
  const isDelivered = order?.status === "delivered";
  const isCancelled = order?.status === "cancelled";

  const handleCancel = async () => {
    if (!cancelReason) { toast.error("Please select a reason"); return; }
    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`, { reason: cancelReason, comment: cancelComment });
      toast.success("Order cancelled successfully");
      setShowCancel(false);
      fetchOrder();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handleBuyAgain = async () => {
    if (!order?.items?.length) return;
    try {
      for (const item of order.items) {
        if (item.product_id) await add(item.product_id, item.qty || 1);
      }
      toast.success("Items added to bag");
      navigate("/checkout");
    } catch {
      toast.error("Failed to add items");
    }
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    window.open(`${api.defaults.baseURL}/orders/invoice/${order.order_number}?email=${order.user_email}`, "_blank");
  };

  if (loading) {
    return (
      <>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black/15 border-t-black rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
          <AlertCircle size={48} className="text-black/20 mb-4" />
          <h1 className="font-display uppercase font-black text-3xl mb-3">Order Not Found</h1>
          <p className="text-sm text-black/50 mb-6">This order doesn't exist or you don't have access.</p>
          <Link to="/my-orders" className="bg-black text-white text-[11px] font-bold uppercase tracking-[2px] px-8 py-3 hover:bg-black/80 transition-all">
            View All Orders
          </Link>
        </div>
      </>
    );
  }

  const stageIdx = statusIndex(order.status);
  const orderNumber = order.order_number;

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-14 py-8 md:py-12">
        {/* Back */}
        <button onClick={() => navigate("/my-orders")} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-black/40 hover:text-black mb-6 transition-colors">
          <ChevronLeft size={14} /> My Orders
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-display uppercase font-black text-2xl sm:text-3xl">{orderNumber}</h1>
            <p className="text-[12px] text-black/50 mt-1">Placed on {formatDate(order.created_at)}</p>
          </div>
          {isCancelled && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white px-4 py-2 self-start">Cancelled</span>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr,380px] gap-8 lg:gap-12">
          <div className="space-y-8">
            {/* Tracking Timeline */}
            {!isCancelled && (
              <div className="border border-black/10 p-6">
                <h2 className="text-[12px] uppercase tracking-[0.15em] font-bold mb-6">Order Tracker</h2>
                <div className="relative">
                  {TRACKING_STEPS.map((step, i) => {
                    const isCompleted = i <= stageIdx;
                    const isActive = i === stageIdx;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-start gap-4 relative">
                        {/* Line */}
                        {i < TRACKING_STEPS.length - 1 && (
                          <div className={`absolute left-[15px] top-[32px] w-[2px] h-8 ${isCompleted ? "bg-green-600" : "bg-black/10"}`} />
                        )}
                        {/* Circle */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                          isCompleted ? "bg-green-600 border-green-600 text-white" : "border-black/15 text-black/30"
                        }`}>
                          {isCompleted ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
                        </div>
                        {/* Label */}
                        <div className="pb-8">
                          <span className={`text-[13px] font-bold ${isCompleted ? "text-black" : "text-black/30"}`}>
                            {step.label}
                          </span>
                          {isActive && order.updated_at && (
                            <p className="text-[11px] text-black/40 mt-0.5">{formatDateTime(order.updated_at)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cancelled State */}
            {isCancelled && (
              <div className="border border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <X size={20} className="text-red-600" />
                  <span className="text-[14px] font-bold text-red-600">Order Cancelled</span>
                </div>
                {order.cancelled_at && (
                  <p className="text-[12px] text-red-500">Cancelled on {formatDate(order.cancelled_at)}</p>
                )}
                {order.cancel_reason && (
                  <p className="text-[12px] text-red-500 mt-1">Reason: {order.cancel_reason}</p>
                )}
                {order.cancel_comment && (
                  <p className="text-[12px] text-red-400 mt-1">Comment: {order.cancel_comment}</p>
                )}
              </div>
            )}

            {/* Items */}
            <div className="border border-black/10 p-6">
              <h2 className="text-[12px] uppercase tracking-[0.15em] font-bold mb-4">Items</h2>
              <div className="space-y-4">
                {order.items.map((item, i) => {
                  const img = item.image ? resolveImage(item.image) : PRODUCT_IMAGE_PLACEHOLDER;
                  return (
                    <div key={i} className="flex gap-4 pb-4 border-b border-black/5 last:border-0 last:pb-0">
                      <Link to={item.product_id ? `/product/${item.product_id}` : "#"} className="w-20 aspect-[4/5] bg-[#f5f5f7] flex-shrink-0 overflow-hidden">
                        <img src={img} alt={item.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1">
                        <Link to={item.product_id ? `/product/${item.product_id}` : "#"} className="text-[13px] font-bold text-black hover:underline line-clamp-1">
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-black/50">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                          <span>Qty: {item.qty}</span>
                        </div>
                      </div>
                      <span className="text-[14px] font-bold text-black">{formatPrice(item.price * item.qty)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order History */}
            <div className="border border-black/10 p-6">
              <h2 className="text-[12px] uppercase tracking-[0.15em] font-bold mb-4">Order History</h2>
              <div className="space-y-3 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-black/60">Order Placed</span>
                  <span className="text-black/40">{formatDateTime(order.created_at)}</span>
                </div>
                {order.status !== "pending" && (
                  <div className="flex items-center justify-between">
                    <span className="text-black/60 capitalize">{order.status?.replace(/_/g, " ")}</span>
                    <span className="text-black/40">{order.updated_at ? formatDateTime(order.updated_at) : "—"}</span>
                  </div>
                )}
                {isCancelled && order.cancelled_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-red-600">Cancelled</span>
                    <span className="text-black/40">{formatDateTime(order.cancelled_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 self-start space-y-6">
            {/* Price Summary */}
            <div className="bg-[#f8f8f8] p-6">
              <h3 className="text-[12px] uppercase tracking-[0.15em] font-bold mb-4">Price Details</h3>
              <div className="space-y-2.5 text-[13px]">
                <div className="flex justify-between"><span className="text-black/60">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
                <div className="flex justify-between text-black/60"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></div>
                <div className="flex justify-between text-black/60"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
                <div className="border-t border-black/15 pt-3 mt-3 flex justify-between">
                  <span className="text-[14px] font-bold">Total</span>
                  <span className="text-[14px] font-bold">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            {order.address && (
              <div className="border border-black/10 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-black/40" />
                  <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-black/60">Delivery Address</span>
                </div>
                <p className="text-[12px] text-black/60 leading-relaxed">
                  {order.address.full_name}<br />
                  {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
                  {order.address.city}, {order.address.state} {order.address.postal_code}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {canCancel && (
                <button onClick={() => setShowCancel(true)}
                  className="w-full border border-red-300 text-red-600 text-[11px] font-bold uppercase tracking-[2px] py-3 hover:bg-red-50 transition-all">
                  Cancel Order
                </button>
              )}
              {(isDelivered || isCancelled) && (
                <button onClick={handleBuyAgain}
                  className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-3 hover:bg-black/80 transition-all flex items-center justify-center gap-2">
                  <RefreshCw size={14} /> Buy Again
                </button>
              )}
              <button onClick={handleDownloadInvoice}
                className="w-full border border-black/20 text-black text-[11px] font-bold uppercase tracking-[2px] py-3 hover:bg-black/5 transition-all flex items-center justify-center gap-2">
                <Download size={14} /> Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !cancelling && setShowCancel(false)} />
          <div className="relative bg-white w-full max-w-md p-6 sm:p-8 animate-in">
            <button onClick={() => !cancelling && setShowCancel(false)} className="absolute top-4 right-4 text-black/30 hover:text-black transition-colors">
              <X size={18} />
            </button>

            <h3 className="font-display uppercase font-black text-xl mb-1">Cancel Order</h3>
            <p className="text-[12px] text-black/40 mb-5">This action cannot be undone.</p>

            {/* Product Preview */}
            {order.items[0] && (
              <div className="flex gap-3 p-3 bg-[#f8f8f8] mb-5">
                <div className="w-14 aspect-[4/5] bg-white flex-shrink-0 overflow-hidden">
                  <img src={order.items[0].image ? resolveImage(order.items[0].image) : PRODUCT_IMAGE_PLACEHOLDER} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-black line-clamp-1">{order.items[0].name}</p>
                  <p className="text-[12px] text-black/50">{formatPrice(order.total)}</p>
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 p-3 mb-5 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-[12px] text-red-600">You are cancelling this order. This action is permanent and cannot be reversed.</p>
            </div>

            {/* Reason */}
            <label className="block mb-4">
              <div className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold mb-1.5">Reason *</div>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-white border border-black/15 px-4 py-3 text-[13px] focus:outline-none focus:border-black transition-colors appearance-none"
              >
                <option value="">Select a reason</option>
                {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>

            {/* Comment */}
            <label className="block mb-6">
              <div className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold mb-1.5">Comment (optional)</div>
              <textarea
                value={cancelComment}
                onChange={(e) => setCancelComment(e.target.value)}
                rows={3}
                placeholder="Tell us more..."
                className="w-full bg-white border border-black/15 px-4 py-3 text-[13px] focus:outline-none focus:border-black transition-colors resize-none placeholder:text-black/30"
              />
            </label>

            {/* Buttons */}
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)} disabled={cancelling}
                className="flex-1 border border-black/20 text-black text-[11px] font-bold uppercase tracking-[2px] py-3 hover:bg-black/5 transition-all disabled:opacity-50">
                Keep Order
              </button>
              <button onClick={handleCancel} disabled={cancelling || !cancelReason}
                className="flex-1 bg-red-600 text-white text-[11px] font-bold uppercase tracking-[2px] py-3 hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {cancelling ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Cancelling...</>
                ) : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
