import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSite } from "@/context/SiteContext";

import { CHECKOUT } from "@/constants/testIds";

const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID || "";

const empty = {
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  is_default: true,
};

export default function Checkout() {
  const { cart, refresh } = useCart();
  const { user } = useAuth();
  const { settings } = useSite();
  const navigate = useNavigate();

  const purchasesEnabled = settings.enable_purchases !== false;
  const showPrices = settings.show_prices !== false;
  const [addr, setAddr] = useState(empty);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [coinsUsed, setCoinsUsed] = useState(0);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    api.get("/wallet")
      .then(({ data }) => setWallet(data))
      .catch((err) => console.error('Wallet fetch error:', err));
  }, []);

  const subtotal = cart.subtotal;
  const shipping = subtotal > 4999 ? 0 : 499;
  const coinDiscount = coinsUsed * 0.1; // 100 coins = ₹10
  const tax = Math.max(0, (subtotal - discount - coinDiscount) * 0.18);
  const total = subtotal - discount - coinDiscount + shipping + tax;

  const applyCoupon = async () => {
    try {
      const { data } = await api.post("/coupons/validate", { code: coupon, cart_total: subtotal });
      setDiscount(data?.discount_amount || 0);
      setAppliedCode(data?.code || coupon);
      toast.success(`Coupon applied — saved ${formatPrice(data?.discount_amount)}`);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.message) || "Invalid coupon");
    }
  };

  const handleRazorpayPayment = async (addressId) => {
    if (typeof window.Razorpay === 'undefined') {
      toast.error("Razorpay SDK not loaded. Try again or use Cash on Delivery.");
      setPlacing(false);
      return;
    }
    // 1. Create Razorpay order on backend
    const { data: orderData } = await api.post("/payment/create-order", { amount: total });
    const rzpOrder = orderData;

    if (!rzpOrder?.orderId) {
      toast.error("Failed to create payment order");
      setPlacing(false);
      return;
    }

    // 2. Open Razorpay checkout
    return new Promise((resolve, reject) => {
      const options = {
        key: rzpOrder.keyId || RAZORPAY_KEY,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "GymSword",
        description: "Order Payment",
        order_id: rzpOrder.orderId,
        handler: async function (response) {
          try {
            // 3. Verify payment signature
            const { data: verifyData } = await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyData?.verified) {
              // 4. Place order with verified payment
              const { data } = await api.post("/orders", {
                address_id: addressId,
                payment_method: "razorpay",
                coupon_code: appliedCode || null,
                discount_amount: discount,
                use_wallet_coins: coinsUsed,
                razorpay_payment_id: response.razorpay_payment_id,
              });
              resolve(data);
            } else {
              reject(new Error("Payment verification failed"));
            }
          } catch (err) {
            reject(err);
          }
        },
        prefill: {
          name: user?.name || addr.full_name,
          email: user?.email || "",
          contact: addr.phone || "",
        },
        theme: { color: "#000000" },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            toast.info("Payment cancelled");
            reject(new Error("Payment cancelled"));
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setPlacing(false);
        toast.error(response.error?.description || "Payment failed");
        reject(new Error("Payment failed"));
      });
      rzp.open();
    });
  };

  const placeOrder = async () => {
    if (!addr.full_name || !addr.line1 || !addr.city || !addr.postal_code) {
      toast.error("Please complete the shipping address");
      return;
    }
    setPlacing(true);
    try {
      // Save address
      const addrRes = await api.post("/auth/addresses", {
        full_name: addr.full_name,
        mobile: addr.phone,
        address_line1: addr.line1,
        address_line2: addr.line2,
        city: addr.city,
        state: addr.state,
        pincode: addr.postal_code,
        country: addr.country,
        is_default: true,
      });
      const addressId = addrRes.data?.id;

      if (paymentMethod === "razorpay") {
        // Razorpay flow
        const orderData = await handleRazorpayPayment(addressId);
        await refresh();
        navigate(`/order/${orderData?.order?.id}`, { state: { success: true } });
      } else {
        // COD flow
        const { data } = await api.post("/orders", {
          address_id: addressId,
          payment_method: paymentMethod,
          coupon_code: appliedCode || null,
          discount_amount: discount,
          use_wallet_coins: coinsUsed,
        });
        await refresh();
        navigate(`/order/${data?.order?.id}`, { state: { success: true } });
      }
    } catch (e) {
      toast.error(e.response ? formatApiErrorDetail(e.response.data?.message) : e.message);
    } finally {
      setPlacing(false);
    }
  };

  if (!purchasesEnabled) {
    return (
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="font-display uppercase font-black text-4xl mb-6">Checkout</h1>
          <p className="text-black/60 mb-8">Purchases are currently disabled.</p>
          <div className="w-full max-w-xs mx-auto bg-black text-white text-xs font-bold uppercase tracking-[2.5px] py-4 rounded-xl text-center opacity-60 cursor-not-allowed mb-6">
            Coming Soon
          </div>
          <Link to="/shop" className="btn-luxury-primary">Continue Browsing</Link>
        </div>
      </main>
    );
  }

  if (cart.items.length === 0) {
    return (
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="font-display uppercase font-black text-4xl mb-6">Checkout</h1>
          <p className="text-black/60 mb-8">Your bag is empty.</p>
          <button onClick={() => navigate("/shop")} className="btn-luxury-primary">Shop Collection</button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-20">
        <h1 className="font-display uppercase font-black text-4xl sm:text-6xl mb-12">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <div className="text-overline mb-6">Shipping Address</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input id={CHECKOUT.fullName} label="Full Name" value={addr.full_name} onChange={(v) => setAddr({ ...addr, full_name: v })} />
                <Input id={CHECKOUT.phone} label="Phone" value={addr.phone} onChange={(v) => setAddr({ ...addr, phone: v })} />
                <Input id={CHECKOUT.line1} label="Address Line 1" value={addr.line1} onChange={(v) => setAddr({ ...addr, line1: v })} className="sm:col-span-2" />
                <Input id={CHECKOUT.line2} label="Apartment, Suite (optional)" value={addr.line2} onChange={(v) => setAddr({ ...addr, line2: v })} className="sm:col-span-2" />
                <Input id={CHECKOUT.city} label="City" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} />
                <Input id={CHECKOUT.state} label="State / Region" value={addr.state} onChange={(v) => setAddr({ ...addr, state: v })} />
                <Input id={CHECKOUT.postal} label="Postal Code" value={addr.postal_code} onChange={(v) => setAddr({ ...addr, postal_code: v })} />
                <Input id={CHECKOUT.country} label="Country" value={addr.country} onChange={(v) => setAddr({ ...addr, country: v })} />
              </div>
            </section>

            <section>
              <div className="text-overline mb-6">Payment Method</div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { v: "cod", label: "Cash on Delivery" },
                  { v: "razorpay", label: "Pay Online (Razorpay)" },
                ].map((p) => (
                  <button
                    key={p.v}
                    onClick={() => setPaymentMethod(p.v)}
                    className={`p-5 border text-sm uppercase tracking-luxury text-left ${
                      paymentMethod === p.v ? "border-black bg-black text-white" : "border-black/20 hover:border-black"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#F5F5F7] p-8 sticky top-32">
              <div className="text-overline mb-6">Order</div>
              <div className="space-y-3 max-h-64 overflow-auto pr-1">
                {cart.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{it.product.name}</div>
                      <div className="text-xs text-black/50">Qty {it.qty}{it.size ? ` · ${it.size}` : ""}</div>
                    </div>
                    {showPrices && <div className="font-semibold">{formatPrice(it.line_total)}</div>}
                  </div>
                ))}
              </div>

              {showPrices && (
                <>
                  <div className="mt-6 pt-6 border-t border-black/15">
                    <div className="text-overline mb-3">Coupon</div>
                    {appliedCode ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3">
                        <div>
                          <span className="text-sm font-semibold text-green-700">{appliedCode}</span>
                          <span className="text-xs text-green-600 ml-2">— saved {formatPrice(discount)}</span>
                        </div>
                        <button
                          onClick={() => { setCoupon(""); setDiscount(0); setAppliedCode(""); }}
                          className="text-green-700 hover:text-green-900 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          data-testid={CHECKOUT.coupon}
                          className="flex-1 bg-white border border-black/20 px-3 py-3 text-sm focus:outline-none"
                          placeholder="Enter code"
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value)}
                        />
                        <button
                          data-testid={CHECKOUT.applyCoupon}
                          onClick={applyCoupon}
                          className="btn-luxury-secondary !px-4 !py-3"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-black/15">
                    <div className="text-overline mb-3">Wallet Coins</div>
                    <div className="bg-white border border-black/10 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-black/60">Available Coins</span>
                        <span className="font-bold">{wallet?.availableCoins || 0}</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max={wallet?.availableCoins || 0}
                        value={coinsUsed}
                        onChange={(e) => setCoinsUsed(Number(e.target.value))}
                        className="w-full bg-white border border-black/20 px-3 py-3 text-sm focus:outline-none"
                        placeholder="Enter coins to redeem"
                      />
                      <div className="text-xs text-black/50 mt-2">100 Coins = ₹10 Discount</div>
                    </div>
                  </div>
                </>
              )}

              {showPrices ? (
                <>
                  <div className="mt-6 space-y-3 text-sm">
                    {coinsUsed > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Wallet Coins</span>
                        <span>-{formatPrice(coinDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                    {discount > 0 && (
                      <div className="flex justify-between text-black/70"><span>Discount ({appliedCode})</span><span>-{formatPrice(discount)}</span></div>
                    )}
                    <div className="flex justify-between text-black/60"><span>Shipping</span><span>{shipping ? formatPrice(shipping) : "Free"}</span></div>
                    <div className="flex justify-between text-black/60"><span>GST (18%)</span><span>{formatPrice(tax)}</span></div>
                    <div className="border-t border-black/20 pt-3 flex justify-between font-display text-lg"><span>Total</span><span>{formatPrice(total)}</span></div>
                  </div>

                  <button
                    data-testid={CHECKOUT.placeOrder}
                    onClick={placeOrder}
                    disabled={placing}
                    className="btn-luxury-primary w-full mt-8"
                  >
                    {placing ? "Placing Order…" : paymentMethod === "razorpay" ? `Pay ${formatPrice(total)}` : `Place Order — ${formatPrice(total)}`}
                  </button>
                </>
              ) : (
                <div className="mt-6 text-center">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-black/50 font-semibold">
                    Price Revealing Soon
                  </div>
                  <div className="mt-6 w-full bg-black text-white text-xs font-bold uppercase tracking-[2.5px] py-4 rounded-xl text-center opacity-60 cursor-not-allowed">
                    Coming Soon
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Input({ id, label, value, onChange, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <div className="text-overline text-black/60 mb-2">{label}</div>
      <input
        data-testid={id}
        className="w-full bg-white border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
