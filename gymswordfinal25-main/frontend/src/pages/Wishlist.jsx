import { Link, useNavigate } from "react-router-dom";
import { Heart, Trash2, ShoppingBag, Eye, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSite } from "@/context/SiteContext";
import { resolveImage, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/api";
import { formatPrice } from "@/lib/currency";

export default function Wishlist() {
  const { user } = useAuth();
  const { items, toggle, refresh } = useWishlist();
  const { add } = useCart();
  const { settings } = useSite();
  const navigate = useNavigate();

  const showPrices = settings.show_prices !== false;
  const comingSoon = settings.coming_soon;
  const purchasesEnabled = settings.enable_purchases !== false;

  // Each wishlist item has: { id, product_id, products: { name, price, ... } }
  const products = items.map((it) => ({
    wishlistItemId: it.id,
    ...it.products,
    product_id: it.product_id,
  })).filter((p) => p && p.product_id);

  const handleRemove = async (productId) => {
    try {
      await toggle(productId);
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Could not remove");
    }
  };

  const handleMoveToBag = async (product) => {
    if (!purchasesEnabled || comingSoon) {
      toast.info("Purchases are not available right now");
      return;
    }
    try {
      await add(product.product_id, 1, product.sizes?.[0] || null, product.colors?.[0] || null);
      await toggle(product.product_id);
      toast.success("Moved to bag");
    } catch {
      toast.error("Could not add to bag");
    }
  };

  if (!user || user === false) {
    return (
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="font-display uppercase font-black text-4xl mb-4">My Wishlist</h1>
          <p className="text-sm text-black/50 mb-8">Sign in to view your saved pieces.</p>
          <Link to="/login" className="inline-block bg-black text-white text-[11px] font-bold uppercase tracking-[2px] px-10 py-4 hover:bg-black/80 transition-all">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 py-8 md:py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-black/40 mb-8">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={9} />
          <span className="text-black font-semibold">Wishlist</span>
        </nav>

        {/* Header */}
        <div className="flex items-baseline justify-between mb-10">
          <h1 className="font-display uppercase font-black text-3xl sm:text-4xl md:text-5xl tracking-tight">
            My Wishlist
          </h1>
          {products.length > 0 && (
            <span className="text-[11px] uppercase tracking-[0.12em] text-black/40 font-semibold">
              {products.length} Item{products.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {products.length === 0 ? (
          /* Empty State */
          <div className="py-24 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#f8f8f8] flex items-center justify-center">
              <Heart size={32} className="text-black/20" />
            </div>
            <h2 className="font-display uppercase text-xl sm:text-2xl font-bold mb-3">Your Wishlist is Empty</h2>
            <p className="text-sm text-black/40 mb-8 max-w-md mx-auto">
              Save your favorite pieces here. Browse our collections and find something you love.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-black text-white text-[11px] font-bold uppercase tracking-[2px] px-10 py-4 hover:bg-black/80 transition-all"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {products.map((p) => {
              const img = p.images?.[0]?.url ? resolveImage(p.images[0].url) : PRODUCT_IMAGE_PLACEHOLDER;
              const isOnSale = p.compare_at_price && p.compare_at_price > p.price;

              return (
                <div key={p.product_id} className="group relative">
                  {/* Image */}
                  <Link to={`/product/${p.product_id}`} className="block relative overflow-hidden bg-[#f5f5f7] aspect-[4/5]">
                    <img
                      src={img}
                      alt={p.name}
                      onError={(e) => { e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER; }}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Brand badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-black text-[9px] font-bold tracking-[1.5px] px-3 py-1.5 uppercase shadow-sm">
                      GymSword
                    </div>
                    {/* Remove button */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(p.product_id); }}
                      className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={14} className="text-black/60" />
                    </button>
                  </Link>

                  {/* Info */}
                  <div className="mt-4 space-y-2">
                    <Link to={`/product/${p.product_id}`}>
                      <h3 className="text-[13px] font-bold text-black leading-snug line-clamp-2 hover:underline">
                        {p.name}
                      </h3>
                    </Link>

                    {p.short_description && (
                      <p className="text-[10px] uppercase tracking-[0.12em] text-black/40 line-clamp-1">
                        {p.short_description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      {comingSoon || !showPrices ? (
                        <span className="text-[10px] uppercase tracking-[0.12em] text-black/40 font-semibold">
                          Coming Soon
                        </span>
                      ) : (
                        <>
                          <span className="text-[13px] font-bold text-black">{formatPrice(p.price)}</span>
                          {isOnSale && (
                            <>
                              <span className="text-[11px] text-black/30 line-through">{formatPrice(p.compare_at_price)}</span>
                              <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5">
                                {Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      {purchasesEnabled && !comingSoon && (p.stock_quantity ?? 0) > 0 ? (
                        <button
                          onClick={() => handleMoveToBag(p)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-[1.5px] py-2.5 hover:bg-black/80 transition-all"
                        >
                          <ShoppingBag size={12} />
                          Move to Bag
                        </button>
                      ) : (
                        <div className="flex-1 bg-black/10 text-black/40 text-[10px] font-bold uppercase tracking-[1.5px] py-2.5 text-center">
                          {comingSoon ? "Coming Soon" : "Out of Stock"}
                        </div>
                      )}
                      <Link
                        to={`/product/${p.product_id}`}
                        className="flex items-center justify-center w-10 border border-black/15 hover:border-black/40 transition-all"
                      >
                        <Eye size={14} className="text-black/40" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
