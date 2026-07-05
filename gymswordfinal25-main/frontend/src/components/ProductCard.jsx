import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Eye, RotateCw, Sparkles } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useSite } from "@/context/SiteContext";
import { resolveImage, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { PRODUCT } from "@/constants/testIds";
import QuickView from "@/components/QuickView";
import ComingSoonModal from "@/components/ComingSoonModal";

export default function ProductCard({ product }) {
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const { settings } = useSite();
  const navigate = useNavigate();

  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [show360, setShow360] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);

  const img = product.images?.[0]?.url ? resolveImage(product.images[0].url) : PRODUCT_IMAGE_PLACEHOLDER;
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;
  const comingSoon = settings.coming_soon;
  const showPrices = settings.show_prices !== false;
  const sizes = product.sizes || [];

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user === false) { navigate("/login"); return; }
    toggle(product.id);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handle360 = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShow360(true);
  };

  const handleTryOn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTryOn(true);
  };

  return (
    <>
      <div
        className="group relative bg-white rounded-[18px] shadow-[0_2px_20px_rgba(0,0,0,0.07)] overflow-hidden"
        data-testid={PRODUCT.card(product.id)}
      >
        {/* ── IMAGE AREA ── */}
        <Link to={`/product/${product.id}`} className="block relative">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#f5f5f7]">
            <img
              src={img}
              alt={product.name}
              loading="lazy"
              data-testid={PRODUCT.cardImage(product.id)}
              onError={(e) => { e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER; }}
              className={`w-full h-full object-cover transition-all duration-700 ${
                comingSoon ? "scale-110 blur-[12px]" : "group-hover:scale-105"
              }`}
            />

            {comingSoon && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <img src="/images/287914795.png" alt="" className="w-10 h-10 md:w-14 md:h-14 object-contain drop-shadow-lg" />
                <div className="mt-1 md:mt-2 text-[8px] md:text-[10px] text-white/70 tracking-[0.2em] md:tracking-[0.25em] uppercase drop-shadow-lg">Coming Soon</div>
              </div>
            )}

            <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur-sm text-black text-[8px] md:text-[9px] font-bold tracking-[1.5px] px-2 md:px-3 py-1 rounded-full uppercase">
              GymSword
            </div>

            <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
              <button onClick={handleWishlist} className="w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition shrink-0" aria-label="Wishlist" data-testid={`wishlist-toggle-${product.id}`}>
                <Heart size={11} className="text-black" fill={has(product.id) ? "#000" : "none"} />
              </button>
              <button onClick={handle360} className="w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition shrink-0" aria-label="360° View">
                <RotateCw size={10} className="text-black" />
              </button>
              <button onClick={handleTryOn} className="w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition shrink-0" aria-label="Try Now">
                <Sparkles size={10} className="text-black" />
              </button>
            </div>
          </div>
        </Link>

        {/* ── PRODUCT INFO ── */}
        <div className="px-3 md:px-4 pb-4 md:pb-5 pt-3 md:pt-4">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/product/${product.id}`} className="flex-1 min-w-0">
              <h3 className="text-[13px] md:text-[16px] font-bold text-black leading-tight md:leading-snug">{product.name}</h3>
            </Link>
            {comingSoon && (
              <span className="flex-shrink-0 bg-black text-white text-[7px] md:text-[8px] font-bold tracking-[1px] px-2 py-1 rounded-full uppercase whitespace-nowrap">
                Coming Soon
              </span>
            )}
          </div>

          {product.short_description && (
            <p className="text-[9px] md:text-[10px] uppercase tracking-[1.5px] text-gray-400 mt-1 leading-relaxed">
              {product.short_description}
            </p>
          )}

          {sizes.length > 0 && (
            <div className="flex items-center gap-1.5 md:gap-2 mt-3 md:mt-4">
              {sizes.slice(0, 6).map((s) => (
                <button
                  key={s}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(s);
                    setQuickViewOpen(true);
                  }}
                  className="w-[28px] h-[28px] md:w-[34px] md:h-[34px] rounded-full text-[9px] md:text-[11px] font-semibold flex items-center justify-center bg-white border-[1.5px] border-gray-200 text-gray-500 hover:border-black hover:text-black transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end justify-between mt-3 md:mt-4">
            <div>
              {comingSoon || !showPrices ? (
                <div className="text-[9px] md:text-[10px] uppercase tracking-[1.5px] text-gray-400 font-semibold">
                  PRICE REVEALING SOON
                </div>
              ) : (
                <div>
                  <div className="text-[9px] md:text-[10px] uppercase tracking-[1.5px] text-gray-400 font-semibold">
                    {formatPrice(product.price)}
                  </div>
                  {isOnSale && (
                    <div className="text-[8px] md:text-[9px] text-gray-400 line-through mt-0.5">
                      {formatPrice(product.compare_at_price)}
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className="bg-black text-white text-[8px] md:text-[9px] font-bold tracking-[1px] px-2 md:px-3 py-1 md:py-1.5 rounded-[6px] md:rounded-[8px] uppercase">
              Premium
            </span>
          </div>
        </div>
      </div>

      {quickViewOpen && (
        <QuickView product={product} initialSize={selectedSize} onClose={() => { setQuickViewOpen(false); setSelectedSize(""); }} />
      )}

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

