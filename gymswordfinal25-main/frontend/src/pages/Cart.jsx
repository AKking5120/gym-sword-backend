import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Minus, Plus, Trash2, Heart, ChevronRight, Tag, Wallet } from "lucide-react";
import { toast } from "sonner";

import StepIndicator from "@/components/StepIndicator";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSite } from "@/context/SiteContext";
import { resolveImage, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { CART } from "@/constants/testIds";

export default function Cart() {
  const { cart, update, remove } = useCart();
  const { user } = useAuth();
  const { toggle } = useWishlist();
  const { settings } = useSite();
  const navigate = useNavigate();
  const location = useLocation();

  const [couponCode, setCouponCode] = useState(location.state?.couponCode || "");
  const [couponApplied, setCouponApplied] = useState(location.state?.couponApplied || false);
  const [couponDiscount, setCouponDiscount] = useState(location.state?.couponDiscount || 0);
  const [appliedCode, setAppliedCode] = useState(location.state?.appliedCode || "");
  const [useWallet, setUseWallet] = useState(location.state?.useWallet || false);
  const [walletCoins, setWalletCoins] = useState(0);

  const purchasesEnabled = settings.enable_purchases !== false;
  const showPrices = settings.show_prices !== false;

  const deliveryCharge = cart.subtotal > 4999 ? 0 : 499;
  const platformFee = cart.items.length > 0 ? 10 : 0;
  const tax = Math.round(cart.subtotal * 0.18);
  const walletDiscount = useWallet ? Math.min(walletCoins, cart.subtotal) : 0;
  const totalDiscount = couponDiscount + walletDiscount;
  const orderTotal = Math.max(0, cart.subtotal + deliveryCharge + platformFee + tax - totalDiscount);

  useEffect(() => {
    if (user && user !== false) {
      import("@/lib/api").then(({ api }) =>
        api.get("/wallet").then(({ data }) => setWalletCoins(data?.availableCoins || 0)).catch(() => {})
      );
    }
  }, [user]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { toast.error("Enter a coupon code"); return; }
    try {
      const { api } = await import("@/lib/api");
      const { data } = await api.post("/coupons/validate", { code: couponCode, cart_total: cart.subtotal });
      setCouponDiscount(data?.discount_amount || 0);
      setCouponApplied(true);
      setAppliedCode(data?.code || couponCode);
      toast.success(`Coupon applied! You save ${formatPrice(data?.discount_amount)}`);
    } catch {
      if (couponCode.toUpperCase() === "GYM20") {
        const disc = Math.round(cart.subtotal * 0.2);
        setCouponDiscount(disc);
        setCouponApplied(true);
        setAppliedCode(couponCode.toUpperCase());
        toast.success(`Coupon applied! You save ${formatPrice(disc)}`);
      } else {
        toast.error("Invalid coupon code");
      }
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setCouponDiscount(0);
    setAppliedCode("");
  };

  const handleMoveToWishlist = async (item) => {
    try {
      await toggle(item.product_id);
      await remove(item.id);
      toast.success("Moved to wishlist");
    } catch {
      toast.error("Could not move to wishlist");
    }
  };

  const handleProceed = () => {
    navigate("/checkout/address", {
      state: {
        couponCode: appliedCode,
        couponApplied,
        couponDiscount,
        useWallet,
        walletDiscount,
      },
    });
  };

  if (!user || user === false) {
    return (
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="font-display uppercase font-black text-4xl mb-4">My Bag</h1>
          <p className="text-sm text-black/50 mb-8">Sign in to view your bag.</p>
          <Link to="/login" className="inline-block bg-black text-white text-[11px] font-bold uppercase tracking-[2px] px-10 py-4 hover:bg-black/80 transition-all">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div data-testid={CART.page} className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 py-8 md:py-12">
        <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-black/40 mb-6">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={9} />
          <span className="text-black font-semibold">My Bag</span>
        </nav>

        <StepIndicator currentStep={0} />

        {cart.items.length === 0 ? (
          <div data-testid={CART.empty} className="py-24 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#f8f8f8] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black/20">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <h2 className="font-display uppercase text-xl sm:text-2xl font-bold mb-3">Your Bag is Empty</h2>
            <p className="text-sm text-black/40 mb-8 max-w-md mx-auto">Discover pieces engineered for the relentless.</p>
            <Link to="/shop" className="inline-block bg-black text-white text-[11px] font-bold uppercase tracking-[2px] px-10 py-4 hover:bg-black/80 transition-all">
              Shop Collection
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr,380px] gap-10 lg:gap-14">
            <div>
              <h2 className="text-[13px] uppercase tracking-[0.15em] font-bold mb-6">
                My Bag <span className="text-black/40 font-normal ml-1">({cart.items.length} Item{cart.items.length !== 1 ? "s" : ""})</span>
              </h2>
              <div className="space-y-0">
                {cart.items.map((it) => {
                  const product = it.product || {};
                  const img = product.images?.[0]?.url ? resolveImage(product.images[0].url) : PRODUCT_IMAGE_PLACEHOLDER;
                  const isOnSale = product.sale_price && product.sale_price < product.price;
                  const itemPrice = product.sale_price || product.price || 0;

                  return (
                    <div key={it.id} data-testid={CART.item(it.id)} className="flex gap-4 md:gap-6 py-6 border-b border-black/10 last:border-0">
                      <Link to={`/product/${it.product_id}`} className="w-24 md:w-32 aspect-[4/5] bg-[#f5f5f7] flex-shrink-0 overflow-hidden">
                        <img src={img} alt={product.name} onError={(e) => { e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER; }} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.12em] text-black/40 font-semibold">GymSword</p>
                          <Link to={`/product/${it.product_id}`} className="text-[14px] font-bold text-black leading-snug line-clamp-2 hover:underline block mt-0.5">
                            {product.name}
                          </Link>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-black/50">
                            {it.size && <span className="px-2 py-0.5 border border-black/15 font-semibold">Size: {it.size}</span>}
                            {it.color && <span className="px-2 py-0.5 border border-black/15 font-semibold">Color: {it.color}</span>}
                          </div>
                          {showPrices && (
                            <div className="flex items-baseline gap-2 mt-3">
                              <span className="text-[15px] font-bold text-black">{formatPrice(itemPrice)}</span>
                              {isOnSale && <span className="text-[12px] text-black/30 line-through">{formatPrice(product.price)}</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-4 gap-3">
                          <div className="flex items-center border border-black/15">
                            <button onClick={() => update(it.id, it.qty - 1)} data-testid={CART.qtyDec(it.id)} disabled={it.qty <= 1} className="w-9 h-9 flex items-center justify-center hover:bg-black/5 transition disabled:opacity-30">
                              <Minus size={13} />
                            </button>
                            <span className="w-10 text-center text-[13px] font-bold">{it.qty}</span>
                            <button onClick={() => update(it.id, it.qty + 1)} data-testid={CART.qtyInc(it.id)} className="w-9 h-9 flex items-center justify-center hover:bg-black/5 transition">
                              <Plus size={13} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleMoveToWishlist(it)} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-black/40 hover:text-black transition-colors">
                              <Heart size={12} />
                              <span className="hidden sm:inline">Wishlist</span>
                            </button>
                            <button onClick={() => { remove(it.id); toast.success("Removed from bag"); }} data-testid={CART.remove(it.id)} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-black/40 hover:text-red-500 transition-colors">
                              <Trash2 size={12} />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to="/shop" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black/50 hover:text-black mt-6 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Continue Shopping
              </Link>
            </div>

            <div className="lg:sticky lg:top-24 self-start">
              <div className="bg-[#f8f8f8] p-6 md:p-8">
                <h2 className="text-[13px] uppercase tracking-[0.15em] font-bold mb-6">Price Details</h2>
                {showPrices ? (
                  <>
                    <div className="space-y-3 text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-black/60">Bag Total</span>
                        <span className="font-semibold" data-testid={CART.subtotal}>{formatPrice(cart.subtotal)}</span>
                      </div>
                      {totalDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span className="font-semibold">-{formatPrice(totalDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-black/60">
                        <span>Delivery Charges</span>
                        <span>{deliveryCharge === 0 ? <span className="text-green-600 font-semibold">Free</span> : formatPrice(deliveryCharge)}</span>
                      </div>
                      <div className="flex justify-between text-black/60">
                        <span>Platform Fee</span>
                        <span>{formatPrice(platformFee)}</span>
                      </div>
                      <div className="flex justify-between text-black/60">
                        <span>Tax (18% GST)</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                      <div className="border-t border-black/15 pt-3 mt-3 flex justify-between">
                        <span className="text-[15px] font-bold">Order Total</span>
                        <span className="text-[15px] font-bold">{formatPrice(orderTotal)}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-black/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag size={14} className="text-black/40" />
                        <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-black/60">Coupon</span>
                      </div>
                      {couponApplied ? (
                        <div className="flex items-center justify-between bg-green-50 px-4 py-3">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-green-700">{appliedCode}</span>
                            <span className="text-[11px] text-green-600 ml-2">- {formatPrice(couponDiscount)}</span>
                          </div>
                          <button onClick={handleRemoveCoupon} className="text-black/40 hover:text-black transition-colors"><Trash2 size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon code"
                            className="flex-1 bg-white border border-black/15 px-4 py-2.5 text-[12px] focus:outline-none focus:border-black transition-colors placeholder:text-black/30" />
                          <button onClick={handleApplyCoupon} className="bg-black text-white text-[10px] font-bold uppercase tracking-[1.5px] px-5 py-2.5 hover:bg-black/80 transition-all">Apply</button>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-5 border-t border-black/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wallet size={14} className="text-black/40" />
                          <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-black/60">Wallet Coins</span>
                        </div>
                        <span className="text-[11px] font-semibold text-black/50">{walletCoins} coins</span>
                      </div>
                      <label className="flex items-center gap-3 mt-3 cursor-pointer">
                        <div onClick={() => setUseWallet(!useWallet)} className={`w-9 h-5 rounded-full flex items-center transition-all ${useWallet ? "bg-black justify-end" : "bg-black/20 justify-start"}`}>
                          <div className="w-4 h-4 bg-white rounded-full mx-0.5 shadow-sm" />
                        </div>
                        <span className="text-[12px] text-black/60">Use wallet coins for this order</span>
                      </label>
                      {useWallet && walletDiscount > 0 && (
                        <div className="flex justify-between mt-2 text-[12px] text-green-600">
                          <span>Wallet Discount</span>
                          <span className="font-semibold">-{formatPrice(walletDiscount)}</span>
                        </div>
                      )}
                    </div>

                    {deliveryCharge > 0 && (
                      <div className="mt-5 bg-black/5 px-4 py-3 text-[11px] text-black/50 text-center">
                        Add {formatPrice(4999 - cart.subtotal)} more for <span className="font-bold text-black">Free Delivery</span>
                      </div>
                    )}

                    {purchasesEnabled ? (
                      <button onClick={handleProceed} data-testid={CART.checkoutBtn}
                        className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-4 mt-6 hover:bg-black/80 transition-all">
                        Proceed to Address
                      </button>
                    ) : (
                      <div className="w-full bg-black/10 text-black/40 text-[11px] font-bold uppercase tracking-[2px] py-4 mt-6 text-center">Coming Soon</div>
                    )}

                    {totalDiscount > 0 && (
                      <div className="mt-4 text-center text-[11px] text-green-600 font-semibold">
                        You are saving {formatPrice(totalDiscount)} on this order
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-[11px] uppercase tracking-[0.15em] text-black/40 font-semibold">Price Revealing Soon</span>
                  </div>
                )}
              </div>
              <div className="mt-4 px-2">
                <p className="text-[10px] text-black/30 uppercase tracking-wider font-semibold mb-2">We Accept</p>
                <div className="flex gap-3 text-[10px] text-black/40 font-semibold">
                  <span className="px-2 py-1 border border-black/10">UPI</span>
                  <span className="px-2 py-1 border border-black/10">Cards</span>
                  <span className="px-2 py-1 border border-black/10">Net Banking</span>
                  <span className="px-2 py-1 border border-black/10">COD</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
