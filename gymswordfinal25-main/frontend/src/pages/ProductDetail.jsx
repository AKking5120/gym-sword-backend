import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, RotateCw, Sparkles, Star, Truck, ShieldCheck, RotateCcw, ChevronDown, ChevronRight, ChevronLeft, Package, Award } from "lucide-react";
import { toast } from "sonner";
import { api, resolveImage, PRODUCT_IMAGE_PLACEHOLDER, formatApiErrorDetail } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSite } from "@/context/SiteContext";
import ProductCard from "@/components/ProductCard";
import ComingSoonModal from "@/components/ComingSoonModal";
import { PRODUCT } from "@/constants/testIds";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" });
  const [qty, setQty] = useState(1);
  const [openAccordion, setOpenAccordion] = useState(null);

  const { user } = useAuth();
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const { settings } = useSite();
  const [show360, setShow360] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => {
      setProduct(data);
      setColor(data.colors?.[0] || "");
      setSize(data.sizes?.[0] || "");
      setActiveImg(0);
    }).catch(() => setProduct(null));
    api.get(`/products/${id}/reviews`).then(({ data }) => setReviews(data ?? [])).catch(() => setReviews([]));
    api.get(`/products/${id}/related`).then(({ data }) => setRelated(data ?? [])).catch(() => setRelated([]));
  }, [id]);

  const handleAddCart = async () => {
    if (!user || user === false) { toast.info("Sign in to add to bag"); return navigate("/login"); }
    try {
      await add(product.id, qty, size, color);
      toast.success(`Added ${qty} item${qty > 1 ? "s" : ""} to your bag`);
    } catch (e) {
      toast.error(formatApiErrorDetail(e?.response?.data?.message) || "Could not add to bag");
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user || user === false) { toast.info("Sign in to leave a review"); return navigate("/login"); }
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      const { data } = await api.get(`/products/${id}/reviews`);
      setReviews(data);
      setReviewForm({ rating: 5, title: "", body: "" });
      toast.success("Review submitted");
    } catch { toast.error("Could not submit review"); }
  };

  if (!product) {
    return (
      <>
        <div className="min-h-[60vh] flex items-center justify-center text-overline">Loading…</div>
      </>
    );
  }

  const comingSoon = settings.coming_soon;
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;
  const images = product.images?.length ? product.images : [{ url: "" }];
  const mainImage = resolveImage(images[activeImg]?.url) || PRODUCT_IMAGE_PLACEHOLDER;
  const showPrices = settings.show_prices !== false;
  const purchasesEnabled = settings.enable_purchases !== false;
  const inStock = (product.stock_quantity ?? product.stock ?? 0) > 0;
  const stockLeft = product.stock_quantity ?? product.stock ?? 0;

  const accordions = [
    { key: "details", title: "Product Details", content: (
      <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4">
        {[
          { label: "Brand", value: "GymSword" },
          { label: "Category", value: product.category || "—" },
          { label: "Product Type", value: product.product_type?.replace(/-/g, " ") || "—" },
          { label: "Available Colors", value: product.colors?.join(", ") || "—" },
          { label: "Available Sizes", value: product.sizes?.join(", ") || "—" },
          { label: "Country of Origin", value: product.origin || "India" },
        ].map((row, i) => (
          <div key={i} className="flex border-b border-black/10 pb-3">
            <span className="text-[13px] text-black/40 w-36 flex-shrink-0 font-medium">{row.label}</span>
            <span className="text-[13px] font-medium capitalize">{row.value}</span>
          </div>
        ))}
      </div>
    )},
    { key: "fabric", title: "Fabric & Composition", content: (
      <p className="text-[13px] text-black/60 leading-relaxed">{product.material || "Premium quality fabric. Designed for performance and comfort."}</p>
    )},
    { key: "care", title: "Care Instructions", content: (
      <p className="text-[13px] text-black/60 leading-relaxed">{product.care_instructions || "Machine wash cold with like colors. Do not bleach. Tumble dry low. Do not iron on print."}</p>
    )},
    { key: "shipping", title: "Shipping & Delivery", content: (
      <div className="space-y-3 text-[13px] text-black/60">
        <div className="flex items-start gap-3"><Truck size={16} className="text-black/40 mt-0.5 flex-shrink-0" /><div><p className="font-medium text-black/80">Standard Delivery</p><p>Free on orders above ₹5,000. Estimated 5-7 business days.</p></div></div>
        <div className="flex items-start gap-3"><Package size={16} className="text-black/40 mt-0.5 flex-shrink-0" /><div><p className="font-medium text-black/80">Express Delivery</p><p>Available in select cities. Estimated 2-3 business days.</p></div></div>
      </div>
    )},
    { key: "returns", title: "Returns & Exchanges", content: (
      <div className="space-y-3 text-[13px] text-black/60">
        <div className="flex items-start gap-3"><RotateCcw size={16} className="text-black/40 mt-0.5 flex-shrink-0" /><div><p className="font-medium text-black/80">30-Day Returns</p><p>Return unworn items within 30 days for a full refund.</p></div></div>
        <div className="flex items-start gap-3"><ShieldCheck size={16} className="text-black/40 mt-0.5 flex-shrink-0" /><div><p className="font-medium text-black/80">Quality Guarantee</p><p>Every product is inspected for quality before dispatch.</p></div></div>
      </div>
    )},
  ];

  return (
    <>
      <div data-testid={PRODUCT.detail} className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 py-8 md:py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-black/40 mb-8">
          <Link to="/" onClick={() => {}} className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={9} />
          <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
          {product.gender && (
            <>
              <ChevronRight size={9} />
              <Link to={`/shop/${product.gender}`} className="hover:text-black transition-colors capitalize">{product.gender}</Link>
            </>
          )}
          {product.product_type && (
            <>
              <ChevronRight size={9} />
              <Link to={`/shop/${product.gender}?type=${product.product_type}`} className="hover:text-black transition-colors">
                {product.product_type.replace(/-/g, " ")}
              </Link>
            </>
          )}
        </nav>

        <div className="grid lg:grid-cols-[1fr,1fr] gap-10 lg:gap-14">

          {/* ── LEFT: Gallery ── */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="hidden md:flex flex-col gap-2 overflow-y-auto scrollbar-hide w-[72px] flex-shrink-0">
                {images.map((im, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    data-testid={PRODUCT.thumb(i)}
                    className={`w-[56px] h-[56px] flex-shrink-0 overflow-hidden border-2 transition-all duration-200 ${
                      i === activeImg ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={resolveImage(im.url) || PRODUCT_IMAGE_PLACEHOLDER}
                      alt=""
                      onError={(e) => { e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER; }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 relative">
              <div className={`aspect-[4/5] overflow-hidden bg-[#f5f5f7] ${settings.coming_soon ? "product-blur" : ""}`}>
                <img
                  src={mainImage}
                  alt={product.name}
                  onError={(e) => { e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER; }}
                  className="w-full h-full object-cover"
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

              {/* Badges */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-black text-[9px] font-bold tracking-[1.5px] px-3 py-1.5 uppercase shadow-sm">
                GymSword
              </div>
              {isOnSale && !settings.coming_soon && (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-[9px] font-bold uppercase tracking-[1.5px] px-3 py-1.5 shadow-sm">
                  Sale
                </div>
              )}
              {!inStock && !settings.coming_soon && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                  <div className="bg-white text-black text-[11px] font-bold uppercase tracking-[0.15em] px-6 py-3">
                    Out of Stock
                  </div>
                </div>
              )}
              {settings.coming_soon && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/30">
                  <img src="/images/287914795.png" alt="GymSword" className="w-20 h-20 object-contain drop-shadow-lg" />
                  <div className="text-overline text-white/80 mt-2">Coming Soon</div>
                </div>
              )}

              {/* Mobile thumbnails */}
              {images.length > 1 && (
                <div className="flex md:hidden gap-2 mt-3 overflow-x-auto scrollbar-hide pb-2">
                  {images.map((im, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-14 h-14 flex-shrink-0 overflow-hidden border-2 transition-all ${
                        i === activeImg ? "border-black" : "border-transparent opacity-60"
                      }`}
                    >
                      <img
                        src={resolveImage(im.url) || PRODUCT_IMAGE_PLACEHOLDER}
                        alt=""
                        onError={(e) => { e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER; }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Details ── */}
          <div className="lg:sticky lg:top-28 self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto scrollbar-hide">

            {/* Name */}
            <h1 className="font-display uppercase font-black text-2xl sm:text-3xl lg:text-[2.2rem] leading-[1.15] tracking-tight">
              {product.name}
            </h1>

            {/* Subtitle */}
            {product.short_description && (
              <p className="text-[11px] uppercase tracking-[0.12em] text-black/40 mt-2 font-semibold">{product.short_description}</p>
            )}

            {/* Rating */}
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              {product.rating > 0 ? (
                <>
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={14} fill={n <= Math.round(product.rating) ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth={1.5} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-black/70">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-black/30">|</span>
                  <span className="text-sm text-black/50">{product.review_count} rating{product.review_count !== 1 ? "s" : ""}</span>
                </>
              ) : (
                <span className="text-sm text-black/40">No ratings yet</span>
              )}
            </div>

            {/* Price */}
            <div className="mt-6 pb-6 border-b border-black/10">
              {comingSoon || !showPrices ? (
                <span className="text-[11px] uppercase tracking-[0.15em] text-black/40 font-semibold">Price Revealing Soon</span>
              ) : (
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-black">{formatPrice(product.price)}</span>
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
            {product.colors?.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold mb-3">
                  Color: <span className="text-black font-medium">{color}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      data-testid={PRODUCT.colorBtn(c)}
                      onClick={() => setColor(c)}
                      className={`px-4 py-2 text-[11px] uppercase tracking-[1px] font-semibold border rounded-full transition-all ${
                        c === color
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
            {product.sizes?.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold mb-3">
                  Size: <span className="text-black font-medium">{size}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      data-testid={PRODUCT.sizeBtn(s)}
                      onClick={() => setSize(s)}
                      className={`w-11 h-11 text-xs font-semibold border flex items-center justify-center rounded-full transition-all ${
                        s === size
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
            <div className="mt-5">
              {inStock ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-green-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> In Stock
                  </span>
                  {stockLeft <= 5 && stockLeft > 0 && (
                    <span className="text-[11px] text-orange-600 font-medium">— Only {stockLeft} left</span>
                  )}
                </div>
              ) : (
                <span className="text-xs font-semibold text-red-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Out of Stock
                </span>
              )}
            </div>

            {/* 360° View & Try Now */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShow360(true)}
                className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-black/50 hover:text-black px-4 py-2.5 border border-black/15 hover:border-black/40 transition-all"
              >
                <RotateCw size={13} />
                360° View
              </button>
              <button
                onClick={() => setShowTryOn(true)}
                className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-black/50 hover:text-black px-4 py-2.5 border border-black/15 hover:border-black/40 transition-all"
              >
                <Sparkles size={13} />
                Try Now
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <p className="mt-5 text-[13px] text-black/50 leading-[1.8]">{product.description}</p>
            )}

            {/* Delivery Estimate */}
            <div className="mt-6 bg-[#f8f8f8] px-5 py-4">
              <div className="flex items-start gap-3">
                <Truck size={16} className="text-black/40 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] font-bold text-black/70">Delivery Estimate</p>
                  <p className="text-[13px] text-black/50 mt-1">Enter your pincode at checkout for estimated delivery dates.</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 space-y-3">
              {purchasesEnabled && !comingSoon && inStock ? (
                <button
                  onClick={handleAddCart}
                  data-testid={PRODUCT.addToCart}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-4 hover:bg-black/80 disabled:opacity-50 transition-all duration-300"
                >
                  <ShoppingBag size={15} />
                  {showPrices ? `Add to Bag — ${formatPrice(product.price * qty)}` : "Add to Bag"}
                </button>
              ) : (
                <div className="w-full bg-black/10 text-black/40 text-[11px] font-bold uppercase tracking-[2px] py-4 text-center">
                  {comingSoon ? "Coming Soon" : "Out of Stock"}
                </div>
              )}

              <button
                onClick={() => (user ? toggle(product.id) : navigate("/login"))}
                data-testid={PRODUCT.addToWishlist}
                className="w-full flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black/50 hover:text-black py-3 border border-black/15 hover:border-black/40 transition-all"
              >
                <Heart size={14} fill={has(product.id) ? "currentColor" : "none"} />
                {has(product.id) ? "Saved to Wishlist" : "Save to Wishlist"}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <Truck size={18} className="mx-auto mb-1.5 text-black/40" />
                <div className="text-[9px] font-bold uppercase tracking-[0.1em]">Free Shipping</div>
                <div className="text-[9px] text-black/35 mt-0.5">Orders ₹5,000+</div>
              </div>
              <div>
                <RotateCcw size={18} className="mx-auto mb-1.5 text-black/40" />
                <div className="text-[9px] font-bold uppercase tracking-[0.1em]">Easy Returns</div>
                <div className="text-[9px] text-black/35 mt-0.5">30 days</div>
              </div>
              <div>
                <ShieldCheck size={18} className="mx-auto mb-1.5 text-black/40" />
                <div className="text-[9px] font-bold uppercase tracking-[0.1em]">Authentic</div>
                <div className="text-[9px] text-black/35 mt-0.5">Guaranteed</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Accordion Sections ── */}
        <section className="mt-16 border-t border-black/10 pt-0">
          {accordions.map((acc) => (
            <div key={acc.key} className="border-b border-black/10">
              <button
                onClick={() => setOpenAccordion(openAccordion === acc.key ? null : acc.key)}
                className="w-full flex items-center justify-between py-5 text-left"
              >
                <h2 className="text-[13px] uppercase tracking-[0.15em] font-bold text-black">{acc.title}</h2>
                <ChevronDown
                  size={16}
                  className={`text-black/40 transition-transform duration-300 ${openAccordion === acc.key ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openAccordion === acc.key ? "max-h-[500px] pb-6" : "max-h-0"
                }`}
              >
                {acc.content}
              </div>
            </div>
          ))}
        </section>

        {/* ── Reviews ── */}
        <section className="mt-16 border-t border-black/10 pt-10">
          <h2 className="text-[13px] uppercase tracking-[0.15em] font-bold mb-8">
            Customer Reviews
            {reviews.length > 0 && (
              <span className="text-black/40 font-normal ml-2">({reviews.length})</span>
            )}
          </h2>
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Review Summary + Form */}
            <div className="lg:col-span-1 space-y-4">
              {product.rating > 0 && (
                <div className="text-center bg-[#f8f8f8] px-6 py-8">
                  <div className="text-5xl font-bold">{product.rating.toFixed(1)}</div>
                  <div className="flex justify-center gap-0.5 mt-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={16} fill={n <= Math.round(product.rating) ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth={1.5} />
                    ))}
                  </div>
                  <div className="text-[11px] text-black/40 mt-2">out of 5</div>
                  <div className="text-[11px] text-black/35 mt-0.5">{product.review_count} global rating{product.review_count !== 1 ? "s" : ""}</div>
                </div>
              )}

              {/* Write Review */}
              <form onSubmit={handleReview} className="space-y-3 pt-6">
                <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-black/60">Write a Review</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setReviewForm({ ...reviewForm, rating: n })} className="p-1 hover:scale-110 transition">
                      <Star size={20} fill={n <= reviewForm.rating ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
                <input
                  className="w-full border border-black/15 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition bg-white"
                  placeholder="Headline"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                />
                <textarea
                  className="w-full border border-black/15 px-4 py-2.5 text-sm min-h-[80px] focus:outline-none focus:border-black transition bg-white"
                  placeholder="Tell us about it"
                  value={reviewForm.body}
                  onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                />
                <button
                  data-testid={PRODUCT.reviewSubmit}
                  className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-3 hover:bg-black/85 transition-all"
                >
                  Submit Review
                </button>
              </form>
            </div>

            {/* Review List */}
            <div className="lg:col-span-2 space-y-6">
              {reviews.length === 0 ? (
                <div className="text-black/40 text-sm py-8 text-center">No reviews yet. Be the first to review this product.</div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="border-b border-black/10 pb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} size={12} fill={n <= r.rating ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth={1.5} />
                          ))}
                        </div>
                        <div className="font-semibold text-sm">{r.title || "Great Product"}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-black/35 uppercase tracking-wider font-semibold">Verified</span>
                        <span className="text-[11px] text-black/35">· {r.user_name}</span>
                      </div>
                    </div>
                    <p className="mt-3 text-[13px] text-black/55 leading-relaxed">{r.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ── You May Also Like ── */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-black/10 pt-10">
            <h2 className="text-[13px] uppercase tracking-[0.15em] font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
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
