import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Heart, ShoppingBag, RotateCw, Sparkles, ChevronRight, ChevronLeft, Eye } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSite } from "@/context/SiteContext";
import { resolveImage, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import ComingSoonModal from "@/components/ComingSoonModal";

export default function QuickView({ product, initialSize, onClose }) {
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const { add } = useCart();
  const { settings } = useSite();
  const navigate = useNavigate();

  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(initialSize || product.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [adding, setAdding] = useState(false);
  const [show360, setShow360] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);

  const images = product.images?.length ? product.images : [{ url: "" }];
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;
  const comingSoon = settings.coming_soon;
  const showPrices = settings.show_prices !== false;
  const purchasesEnabled = settings.enable_purchases !== false;
  const sizes = product.sizes || [];
  const colors = product.colors || [];
  const inStock = (product.stock_quantity ?? 0) > 0;

  const handleWishlist = () => {
    if (!user || user === false) { navigate("/login"); return; }
    toggle(product.id);
  };

  const handleAddToCart = async () => {
    if (!user || user === false) { toast.info("Sign in to add to bag"); navigate("/login"); return; }
    if (comingSoon || !purchasesEnabled || !inStock) return;
    setAdding(true);
    try {
      await add(product.id, 1, selectedSize, selectedColor || null);
      toast.success("Added to your bag");
      onClose();
    } catch { toast.error("Could not add to bag"); }
    finally { setAdding(false); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[1000] transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 md:p-8 pointer-events-none">
        <div
          className="bg-white shadow-2xl max-w-[960px] w-full max-h-[90vh] overflow-y-auto pointer-events-auto relative animate-slide-down"
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all"
          >
            <X size={16} strokeWidth={1.5} />
          </button>

          <div className="grid md:grid-cols-[1fr,1fr] min-h-[500px]">
            {/* LEFT — IMAGE GALLERY */}
            <div className="flex bg-[#f8f8f8]">
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="hidden md:flex flex-col gap-2 p-4 overflow-y-auto scrollbar-hide w-[72px] flex-shrink-0">
                  {images.map((im, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-[56px] h-[56px] flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                        i === activeImg ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={resolveImage(im.url) || PRODUCT_IMAGE_PLACEHOLDER}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER; }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="flex-1 relative">
                <div className="aspect-[4/5] overflow-hidden bg-[#f5f5f7]">
                  <img
                    src={resolveImage(images[activeImg]?.url) || PRODUCT_IMAGE_PLACEHOLDER}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER; }}
                  />
                </div>

                {/* Image nav arrows */}
                {images.length > 1 && (
                  <>
                    {activeImg > 0 && (
                      <button
                        onClick={() => setActiveImg((p) => p - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center hover:bg-white shadow-md transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                    )}
                    {activeImg < images.length - 1 && (
                      <button
                        onClick={() => setActiveImg((p) => p + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center hover:bg-white shadow-md transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </>
                )}

                {/* Badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-black text-[9px] font-bold tracking-[1.5px] px-3 py-1.5 rounded-full uppercase shadow-sm">
                  GymSword
                </div>
              </div>
            </div>

            {/* RIGHT — DETAILS */}
            <div className="p-6 md:p-8 flex flex-col">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-black/40 mb-5">
                <Link to="/" onClick={onClose} className="hover:text-black transition-colors">Home</Link>
                <ChevronRight size={9} />
                <Link to="/shop" onClick={onClose} className="hover:text-black transition-colors">Shop</Link>
                {product.gender && (
                  <>
                    <ChevronRight size={9} />
                    <Link to={`/shop/${product.gender}`} onClick={onClose} className="hover:text-black transition-colors capitalize">{product.gender}</Link>
                  </>
                )}
                {product.product_type && (
                  <>
                    <ChevronRight size={9} />
                    <Link to={`/shop/${product.gender}?type=${product.product_type}`} onClick={onClose} className="hover:text-black transition-colors">
                      {product.product_type.replace(/-/g, " ")}
                    </Link>
                  </>
                )}
              </div>

              {/* Name */}
              <h2 className="text-xl md:text-2xl font-bold text-black leading-tight mb-1">{product.name}</h2>

              {/* Subtitle */}
              {product.short_description && (
                <p className="text-[11px] uppercase tracking-[0.12em] text-black/40 mb-4">{product.short_description}</p>
              )}

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-black/10">
                {comingSoon || !showPrices ? (
                  <span className="text-[11px] uppercase tracking-[0.15em] text-black/40 font-semibold">Price Revealing Soon</span>
                ) : (
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-2xl font-bold text-black">{formatPrice(product.price)}</span>
                    {isOnSale && (
                      <>
                        <span className="text-sm text-black/30 line-through">{formatPrice(product.compare_at_price)}</span>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                          {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Colors */}
              {colors.length > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold mb-2.5">
                    Color: <span className="text-black font-medium">{selectedColor || colors[0]}</span>
                  </p>
                  <div className="flex gap-2">
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1.5 text-xs border rounded-full transition-all ${
                          selectedColor === c
                            ? "bg-black text-white border-black"
                            : "border-black/20 text-black/60 hover:border-black/50"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {sizes.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold mb-2.5">
                    Size: <span className="text-black font-medium">{selectedSize || "Select"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`w-10 h-10 text-xs font-semibold rounded-full border flex items-center justify-center transition-all ${
                          selectedSize === s
                            ? "bg-black text-white border-black"
                            : "border-black/20 text-black/60 hover:border-black/50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock */}
              <div className="mb-6">
                {inStock ? (
                  <span className="text-xs font-semibold text-green-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> In Stock
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-red-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Out of Stock
                  </span>
                )}
              </div>

              <div className="flex-1" />

              {/* Actions */}
              <div className="space-y-3 mt-auto">
                {purchasesEnabled && !comingSoon && inStock ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-3.5 hover:bg-black/80 disabled:opacity-50 transition-all duration-300"
                  >
                    <ShoppingBag size={15} />
                    {adding ? "Adding\u2026" : "Add to Bag"}
                  </button>
                ) : (
                  <div className="w-full bg-black/10 text-black/40 text-[11px] font-bold uppercase tracking-[2px] py-3.5 text-center">
                    {comingSoon ? "Coming Soon" : "Out of Stock"}
                  </div>
                )}

                <button
                  onClick={handleWishlist}
                  className="w-full flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black/50 hover:text-black py-2.5 border border-black/10 hover:border-black/30 transition-all"
                >
                  <Heart size={14} fill={has(product.id) ? "currentColor" : "none"} />
                  {has(product.id) ? "Saved" : "Save to Wishlist"}
                </button>

                <button
                  onClick={() => setShow360(true)}
                  className="w-full flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black/50 hover:text-black py-2.5 border border-black/10 hover:border-black/30 transition-all"
                >
                  <RotateCw size={13} />
                  360° View
                </button>

                <button
                  onClick={() => setShowTryOn(true)}
                  className="w-full flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black/50 hover:text-black py-2.5 border border-black/10 hover:border-black/30 transition-all"
                >
                  <Sparkles size={13} />
                  Try Now
                </button>

                <Link
                  to={`/product/${product.id}`}
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-black hover:text-black/70 py-2 transition-colors"
                >
                  <Eye size={13} />
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ComingSoonModal
        open={show360}
        onClose={() => setShow360(false)}
        title="360° Product View"
        message="GymSword immersive 360° viewing experience is under development."
        icon={<RotateCw size={32} className="text-black/30" />}
      />

      <ComingSoonModal
        open={showTryOn}
        onClose={() => setShowTryOn(false)}
        title="Virtual Try-On"
        message="GymSword AI-powered Try-On experience is under development."
        icon={<Sparkles size={32} className="text-black/30" />}
      />
    </>
  );
}

