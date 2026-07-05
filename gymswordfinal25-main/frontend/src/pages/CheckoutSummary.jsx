import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, MapPin, CreditCard, Package, Shield, Lock } from "lucide-react";
import { toast } from "sonner";
import { api, resolveImage, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/context/CartContext";
import { useSite } from "@/context/SiteContext";

import StepIndicator from "@/components/StepIndicator";

const PAYMENT_LABELS = {
  cod: "Cash on Delivery",
  razorpay: "Razorpay (Online Payment)",
};

export default function CheckoutSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const prev = location.state || {};
  const { cart, refresh } = useCart();
  const { settings } = useSite();

  const [address, setAddress] = useState(null);
  const [placing, setPlacing] = useState(false);
  const showPrices = settings.show_prices !== false;

  const subtotal = cart.subtotal;
  const deliveryCharge = subtotal > 4999 ? 0 : 499;
  const platformFee = cart.items.length > 0 ? 10 : 0;
  const tax = Math.round(subtotal * 0.18);
  const couponDiscount = prev.couponDiscount || 0;
  const walletDiscount = prev.walletDiscount || 0;
  const totalDiscount = couponDiscount + walletDiscount;
  const orderTotal = Math.max(0, subtotal + deliveryCharge + platformFee + tax - totalDiscount);

  useEffect(() => {
    if (!prev.addressId) {
      navigate("/checkout/address");
      return;
    }
    api.get("/auth/addresses").then(({ data }) => {
      const addr = (data || []).find((a) => a.id === prev.addressId);
      setAddress(addr);
    }).catch(() => {});
  }, [prev.addressId, navigate]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!prev.addressId) { toast.error("No address selected"); return; }
    setPlacing(true);

    try {
      if (prev.paymentMethod === "razorpay") {
        const loaded = await loadRazorpay();
        if (!loaded) { toast.error("Payment SDK failed to load"); setPlacing(false); return; }

        const { data: orderData } = await api.post("/payment/create-order", { amount: orderTotal });
        if (!orderData?.orderId) { toast.error("Failed to create payment order"); setPlacing(false); return; }

        const rzp = new window.Razorpay({
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "GymSword",
          description: "Order Payment",
          order_id: orderData.orderId,
          handler: async (response) => {
            try {
              const { data: verifyData } = await api.post("/payment/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              if (verifyData?.verified) {
                const { data } = await api.post("/orders", {
                  address_id: prev.addressId,
                  payment_method: "razorpay",
                  coupon_code: prev.couponCode || null,
                  discount_amount: couponDiscount,
                  use_wallet_coins: 0,
                  razorpay_payment_id: response.razorpay_payment_id,
                });
                await refresh();
                navigate("/order-success", { state: { orderId: data?.order?.id } });
              } else {
                toast.error("Payment verification failed");
                setPlacing(false);
              }
            } catch (err) {
              toast.error("Payment verification failed");
              setPlacing(false);
            }
          },
          prefill: { name: address?.full_name || "", email: "", contact: address?.phone || "" },
          theme: { color: "#000000" },
          modal: { ondismiss: () => { setPlacing(false); toast.info("Payment cancelled"); } },
        });
        rzp.on("payment.failed", (resp) => { setPlacing(false); toast.error(resp.error?.description || "Payment failed"); });
        rzp.open();
      } else {
        const { data } = await api.post("/orders", {
          address_id: prev.addressId,
          payment_method: "cod",
          coupon_code: prev.couponCode || null,
          discount_amount: couponDiscount,
          use_wallet_coins: 0,
        });
        await refresh();
        navigate("/order-success", { state: { orderId: data?.order?.id } });
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Failed to place order");
      setPlacing(false);
    }
  };

  return (
    <main className="flex-1">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 py-8 md:py-12">
        <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-black/40 mb-6">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={9} />
          <Link to="/checkout" className="hover:text-black transition-colors">Bag</Link>
          <ChevronRight size={9} />
          <Link to="/checkout/address" className="hover:text-black transition-colors">Address</Link>
          <ChevronRight size={9} />
          <Link to="/checkout/payment" className="hover:text-black transition-colors">Payment</Link>
          <ChevronRight size={9} />
          <span className="text-black font-semibold">Summary</span>
        </nav>

        <StepIndicator currentStep={3} />

        <div className="max-w-4xl mx-auto">
          <h2 className="text-[13px] uppercase tracking-[0.15em] font-bold mb-8">Order Summary</h2>

          <div className="grid md:grid-cols-[1fr,380px] gap-8">
            <div className="space-y-6">
              {/* Items */}
              <div className="border border-black/15 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Package size={16} className="text-black/40" />
                  <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-black/60">
                    Items ({cart.items.length})
                  </span>
                </div>
                <div className="space-y-4">
                  {cart.items.map((it) => {
                    const product = it.product || {};
                    const img = product.images?.[0]?.url ? resolveImage(product.images[0].url) : PRODUCT_IMAGE_PLACEHOLDER;
                    const itemPrice = product.sale_price || product.price || 0;
                    return (
                      <div key={it.id} className="flex gap-3 pb-3 border-b border-black/5 last:border-0 last:pb-0">
                        <div className="w-16 aspect-[4/5] bg-[#f5f5f7] flex-shrink-0 overflow-hidden">
                          <img src={img} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-black line-clamp-1">{product.name}</p>
                          <p className="text-[11px] text-black/50 mt-0.5">
                            Qty: {it.qty}{it.size ? ` · ${it.size}` : ""}{it.color ? ` · ${it.color}` : ""}
                          </p>
                        </div>
                        {showPrices && <span className="text-[13px] font-bold text-black flex-shrink-0">{formatPrice(itemPrice * it.qty)}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Address */}
              {address && (
                <div className="border border-black/15 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={16} className="text-black/40" />
                    <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-black/60">Delivery Address</span>
                  </div>
                  <p className="text-[12px] text-black/70 leading-relaxed">
                    <span className="font-bold text-black">{address.full_name}</span> — {address.phone}<br />
                    {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ""}<br />
                    {address.city}, {address.state} - {address.pincode}<br />
                    {address.country || "India"}
                  </p>
                  <button onClick={() => navigate("/checkout/address", { state: prev })}
                    className="mt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-black/40 hover:text-black transition-colors underline underline-offset-2">
                    Change
                  </button>
                </div>
              )}

              {/* Payment Method */}
              <div className="border border-black/15 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={16} className="text-black/40" />
                  <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-black/60">Payment Method</span>
                </div>
                <p className="text-[13px] font-bold text-black">
                  {PAYMENT_LABELS[prev.paymentMethod] || "Cash on Delivery"}
                </p>
                <button onClick={() => navigate("/checkout/payment", { state: prev })}
                  className="mt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-black/40 hover:text-black transition-colors underline underline-offset-2">
                  Change
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="lg:sticky lg:top-24 self-start">
              <div className="bg-[#f8f8f8] p-6">
                <h3 className="text-[13px] uppercase tracking-[0.15em] font-bold mb-5">Price Details</h3>
                {showPrices ? (
                  <>
                    <div className="space-y-3 text-[13px]">
                      <Row label="Bag Total" value={formatPrice(subtotal)} />
                      {couponDiscount > 0 && <Row label={`Coupon${prev.couponCode ? ` (${prev.couponCode})` : ""}`} value={`-${formatPrice(couponDiscount)}`} green />}
                      {walletDiscount > 0 && <Row label="Wallet Coins" value={`-${formatPrice(walletDiscount)}`} green />}
                      <Row label="Delivery" value={deliveryCharge === 0 ? "Free" : formatPrice(deliveryCharge)} free={deliveryCharge === 0} />
                      <Row label="Platform Fee" value={formatPrice(platformFee)} />
                      <Row label="Tax (18% GST)" value={formatPrice(tax)} />
                      <div className="border-t border-black/15 pt-3 mt-3 flex justify-between">
                        <span className="text-[15px] font-bold">Total Payable</span>
                        <span className="text-[15px] font-bold">{formatPrice(orderTotal)}</span>
                      </div>
                    </div>

                    {totalDiscount > 0 && (
                      <div className="mt-4 text-center text-[11px] text-green-600 font-semibold">
                        Total Savings: {formatPrice(totalDiscount)}
                      </div>
                    )}

                    <div className="mt-5 flex items-center gap-2 text-[10px] text-black/40">
                      <Lock size={12} />
                      <span className="uppercase tracking-wider font-semibold">Secure 256-bit SSL Encrypted</span>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-4 mt-5 hover:bg-black/80 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {placing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <Shield size={14} />
                          {prev.paymentMethod === "razorpay" ? `Pay ${formatPrice(orderTotal)}` : "Place Order"}
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-[11px] uppercase tracking-[0.15em] text-black/40 font-semibold">Price Revealing Soon</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, green, free }) {
  return (
    <div className="flex justify-between">
      <span className="text-black/60">{label}</span>
      <span className={`font-semibold ${green ? "text-green-600" : free ? "text-green-600" : ""}`}>{value}</span>
    </div>
  );
}
