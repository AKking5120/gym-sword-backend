import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  CheckCircle2,
  Circle,
  Truck,
  Clock,
  MapPin,
  ChevronRight,
  Download,
  Printer,
  Headphones,
  ShoppingBag,
  CreditCard,
  MapPinned,
  IndianRupee,
  FileText,
  AlertCircle,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { api, resolveImage, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/api";
import { formatPrice } from "@/lib/currency";


const STATUS_LABELS = {
  pending: "Ordered",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out For Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const TRACKING_STEPS = [
  { key: "pending", label: "Ordered" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out For Delivery" },
  { key: "delivered", label: "Delivered" },
];

const STATUS_ICONS = {
  pending: Package,
  confirmed: CheckCircle2,
  processing: Clock,
  packed: Package,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
};

function statusIndex(status) {
  return TRACKING_STEPS.findIndex((s) => s.key === status);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function humanReadableStatus(status) {
  return STATUS_LABELS[status] || status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-6 bg-black" />
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black">{children}</h2>
    </div>
  );
}

function TrackOrderSearch({ onTrack, loading, error }) {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    onTrack(orderId.trim().toUpperCase(), email.trim());
  };

  return (
    <section className="relative bg-white border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-black mb-6">
            <Search size={22} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-black tracking-tight">
            Track Your Order
          </h1>
          <p className="mt-3 text-sm md:text-base text-gray-500 max-w-md mx-auto">
            Enter your order ID to check the current status of your shipment.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-lg mx-auto space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Order ID (e.g. GS-000534)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition placeholder:text-gray-400"
                required
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white text-sm font-bold uppercase tracking-[0.15em] py-3.5 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              {loading ? "Tracking..." : "Track Order"}
            </button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex items-center justify-center gap-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3"
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function DeliveryProgress({ currentStatus, estimatedDelivery }) {
  const idx = statusIndex(currentStatus);

  if (currentStatus === "cancelled") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-100 rounded-xl p-6 md:p-8 text-center"
      >
        <AlertCircle size={40} className="mx-auto text-red-400" />
        <h3 className="mt-3 text-lg font-bold text-red-600">Order Cancelled</h3>
        <p className="mt-1 text-sm text-red-500">This order has been cancelled and will not be processed further.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {estimatedDelivery && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <Truck size={15} />
          <span>Estimated Delivery: <strong className="text-black">{formatDate(estimatedDelivery)}</strong></span>
        </div>
      )}

      <div className="relative">
        <div className="flex items-center overflow-x-auto pb-2 gap-0 md:gap-0">
          {TRACKING_STEPS.map((step, i) => {
            const isCompleted = i <= idx;
            const isActive = i === idx;
            const isPending = i > idx;
            const shouldShow = i <= idx + 1 || i === TRACKING_STEPS.length - 1;

            if (!shouldShow && i < TRACKING_STEPS.length - 1) return null;

            return (
              <div key={step.key} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center w-20 md:w-24">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isCompleted
                        ? "bg-black border-black text-white"
                        : isActive
                          ? "bg-black border-black text-white"
                          : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted || isActive ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Circle size={14} />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-[9px] font-bold uppercase tracking-[0.1em] text-center leading-tight ${
                      isCompleted || isActive ? "text-black" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < TRACKING_STEPS.length - 1 && (
                  <div className="flex-shrink-0 w-6 md:w-10 h-[2px] relative mx-0">
                    <div className="absolute inset-0 bg-gray-200" />
                    <div
                      className="absolute inset-0 bg-black transition-all duration-700"
                      style={{ width: isCompleted ? "100%" : isActive ? "0%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function OrderTimeline({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <SectionTitle>Order Timeline</SectionTitle>
      <div className="relative">
        <div className="absolute left-[17px] top-3 bottom-3 w-[2px] bg-gray-200" />
        <div className="space-y-0">
          {history.map((h, i) => {
            const Icon = STATUS_ICONS[h.status] || Package;
            const isLast = i === history.length - 1;
            return (
              <motion.div
                key={h.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className={`relative flex gap-5 pb-6 ${isLast ? "" : ""}`}
              >
                <div
                  className={`relative z-10 w-[36px] h-[36px] rounded-full flex items-center justify-center flex-shrink-0 ${
                    isLast
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className="flex-1 pt-1.5">
                  <h4 className="text-sm font-bold text-black">
                    {humanReadableStatus(h.status)}
                  </h4>
                  {h.notes && h.notes !== `Status changed to ${h.status}` && (
                    <p className="text-xs text-gray-500 mt-0.5">{h.notes}</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-[0.1em]">
                    {formatDateTime(h.created_at)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

function ShipmentInfo({ tracking_number, status }) {
  if (!tracking_number) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-gray-50 rounded-xl p-6 md:p-8"
    >
      <SectionTitle>Shipment Information</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-semibold mb-1">Courier Partner</p>
          <p className="text-sm font-semibold text-black">Delhivery</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-semibold mb-1">Tracking Number</p>
          <p className="text-sm font-semibold text-black">{tracking_number}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-semibold mb-1">Current Status</p>
          <p className="text-sm font-semibold text-black">{humanReadableStatus(status)}</p>
        </div>
      </div>
    </motion.section>
  );
}

function OrderProducts({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <SectionTitle>Ordered Products</SectionTitle>
      <div className="space-y-3">
        {items.map((item, i) => {
          const imgUrl = item.image_url ? resolveImage(item.image_url) : PRODUCT_IMAGE_PLACEHOLDER;
          return (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition"
            >
              <div className="w-20 h-24 md:w-24 md:h-28 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={imgUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-black">{item.name}</h4>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                  <span>Qty: <strong className="text-black">{item.quantity}</strong></span>
                  <span>Price: <strong className="text-black">{formatPrice(item.price)}</strong></span>
                </div>
                <div className="mt-2 text-xs font-semibold text-black">
                  Total: {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

function PricingSummary({ order }) {
  if (!order) return null;

  const subtotal = order.items?.reduce((s, i) => s + parseFloat(i.price) * (i.quantity || 1), 0) || 0;
  const discount = parseFloat(order.discount_amount) || 0;
  const shipping = subtotal > 4999 ? 0 : 499;
  const tax = Math.max(0, (subtotal - discount) * 0.18);
  const total = parseFloat(order.total_amount) || 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-gray-50 rounded-xl p-6 md:p-8"
    >
      <SectionTitle>Pricing Summary</SectionTitle>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-semibold text-black">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">
              Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}
            </span>
            <span className="font-semibold text-green-600">-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Shipping</span>
          <span className="font-semibold text-black">{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Tax (GST 18%)</span>
          <span className="font-semibold text-black">{formatPrice(tax)}</span>
        </div>
        <div className="border-t border-gray-300 pt-3 flex justify-between">
          <span className="text-sm font-bold text-black">Total Amount</span>
          <span className="text-sm font-bold text-black">{formatPrice(total)}</span>
        </div>
      </div>
    </motion.section>
  );
}

function ShippingAddress({ address }) {
  if (!address) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <SectionTitle>Shipping Address</SectionTitle>
      <div className="bg-gray-50 rounded-xl p-6 md:p-8">
        <div className="flex items-start gap-3">
          <MapPinned size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-black leading-relaxed">
            <p className="font-bold">{address.full_name}</p>
            {address.phone && <p className="text-gray-500 text-xs mt-0.5">{address.phone}</p>}
            <p className="mt-1 text-gray-600">
              {address.address_line1}
              {address.address_line2 ? `, ${address.address_line2}` : ""}
            </p>
            <p className="text-gray-600">
              {address.city}, {address.state} - {address.pincode}
            </p>
            <p className="text-gray-600">{address.country || "India"}</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function PaymentInfo({ order }) {
  if (!order || !order.payment_method) return null;

  const methodLabels = {
    cod: "Cash on Delivery",
    razorpay: "Razorpay (UPI / Card / Net Banking)",
    stripe: "Credit / Debit Card",
    upi: "UPI",
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
    >
      <SectionTitle>Payment Information</SectionTitle>
      <div className="bg-gray-50 rounded-xl p-6 md:p-8">
        <div className="flex items-start gap-3">
          <CreditCard size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm space-y-2">
            <div>
              <span className="text-gray-500 text-[11px] uppercase tracking-[0.1em] font-semibold">Method</span>
              <p className="font-semibold text-black">{methodLabels[order.payment_method] || order.payment_method}</p>
            </div>
            {order.razorpay_payment_id && (
              <div>
                <span className="text-gray-500 text-[11px] uppercase tracking-[0.1em] font-semibold">Transaction ID</span>
                <p className="font-mono text-xs text-black">{order.razorpay_payment_id}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500 text-[11px] uppercase tracking-[0.1em] font-semibold">Payment Status</span>
              <p className={`font-semibold ${order.payment_status === "paid" ? "text-green-600" : "text-amber-600"}`}>
                {order.payment_status === "paid" ? "Paid" : "Pending"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function SupportSection({ orderNumber }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-black rounded-xl p-6 md:p-8 text-center"
    >
      <Headphones size={32} className="mx-auto text-white/60" />
      <h3 className="mt-3 text-lg font-bold text-white">Need Help With Your Order?</h3>
      <p className="mt-1 text-sm text-white/60 max-w-md mx-auto">
        Our support team is here to help you with any questions about your order.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href="/contact"
          className="w-full sm:w-auto bg-white text-black text-xs font-bold uppercase tracking-[0.15em] px-8 py-3 rounded-lg hover:bg-gray-100 transition"
        >
          Contact Support
        </a>
        {orderNumber && (
          <a
            href={`/track-order/${orderNumber}`}
            className="w-full sm:w-auto border border-white/30 text-white text-xs font-bold uppercase tracking-[0.15em] px-8 py-3 rounded-lg hover:bg-white/10 transition"
          >
            View Order Details
          </a>
        )}
      </div>
    </motion.section>
  );
}

function OrderContent({ order, onBack, orderNumber, email }) {
  const handleDownloadInvoice = () => {
    const params = new URLSearchParams();
    if (email) params.set("email", email);
    const url = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/orders/invoice/${orderNumber}?${params}`;
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.download = `invoice-${orderNumber}.pdf`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black uppercase tracking-[0.1em] font-semibold mb-8 transition"
      >
        <ChevronLeft size={14} />
        Back to Search
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">Order</p>
                <h1 className="text-2xl md:text-4xl font-bold text-black tracking-tight mt-1">
                  {orderNumber}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Placed on {formatDateTime(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {humanReadableStatus(order.status)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2 bg-black text-white text-[10px] font-bold uppercase tracking-[0.15em] px-5 py-2.5 rounded-lg hover:bg-gray-900 transition"
              >
                <Download size={14} />
                Download Invoice
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 text-[10px] font-bold uppercase tracking-[0.15em] px-5 py-2.5 rounded-lg hover:bg-gray-50 transition"
              >
                <Printer size={14} />
                Print Invoice
              </button>
            </div>
          </motion.div>

          <DeliveryProgress currentStatus={order.status} estimatedDelivery={order.estimated_delivery} />

          <OrderTimeline history={order.history} />

          <ShipmentInfo tracking_number={order.tracking_number} status={order.status} />

          <OrderProducts items={order.items} />

          <ShippingAddress address={order.address} />
        </div>

        <div className="space-y-6">
          <PricingSummary order={order} />
          <PaymentInfo order={order} />
        </div>
      </div>

      <div className="mt-10">
        <SupportSection orderNumber={orderNumber} />
      </div>
    </div>
  );
}

export default function TrackOrder() {
  const { id: paramId } = useParams();
  const [orderNumber, setOrderNumber] = useState(paramId || "");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (paramId) {
      setOrderNumber(paramId);
      handleTrack(paramId, "");
    }
  }, [paramId]);

  const handleTrack = async (orderId, emailAddr) => {
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const params = emailAddr ? `?email=${encodeURIComponent(emailAddr)}` : "";
      const { data } = await api.get(`/orders/track/${orderId}${params}`);
      setOrder(data);
      setOrderNumber(orderId);
      setEmail(emailAddr);
    } catch (err) {
      const msg = err.response?.data?.message || "Order not found. Please check your order ID and email.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setOrder(null);
    setError("");
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        {!order ? (
          <TrackOrderSearch onTrack={handleTrack} loading={loading} error={error} />
        ) : (
          <OrderContent order={order} onBack={handleBack} orderNumber={orderNumber} email={email} />
        )}
      </div>
    </>
  );
}