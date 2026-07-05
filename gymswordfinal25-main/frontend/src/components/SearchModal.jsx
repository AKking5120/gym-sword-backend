import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, TrendingUp, Clock, Package } from "lucide-react";
import { api, resolveImage, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { useSite } from "@/context/SiteContext";

const TRENDING = ["Oversized", "Hoodie", "Joggers", "Crop Jacket", "Leggings"];

const POPULAR_CATEGORIES = [
  { name: "Men", slug: "men" },
  { name: "Women", slug: "women" },
  { name: "Accessories", slug: "accessories" },
];

const RECENT_KEY = "gymsword_recent_searches";

function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 5);
  } catch { return []; }
}

function addRecent(term) {
  try {
    const arr = [term, ...getRecent().filter((s) => s !== term)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
  } catch { /* noop */ }
}

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const { settings } = useSite();
  const showPrices = settings.show_prices !== false;
  const [selectedIdx, setSelectedIdx] = useState(-1);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
      setSearched(false);
      setSelectedIdx(-1);
    }
  }, [open]);

  const doSearch = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await api.get("/products/search", { params: { q: term, limit: 10 } });
      setResults(data?.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value) => {
    setQuery(value);
    setSelectedIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  const handleSelect = (product) => {
    addRecent(query.trim());
    onClose();
    navigate(`/product/${product.id}`);
  };

  const handleSuggestionClick = (term) => {
    setQuery(term);
    doSearch(term);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      if (selectedIdx >= 0 && results[selectedIdx]) {
        handleSelect(results[selectedIdx]);
      } else if (query.trim()) {
        addRecent(query.trim());
        onClose();
        navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const recentSearches = getRecent();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]" onClick={onClose} />
      <div className="fixed top-0 left-0 right-0 z-[1000] bg-white shadow-2xl animate-slide-down">
        <div className="max-w-[800px] mx-auto px-6 py-6">
          <div className="flex items-center gap-4 border-b border-black/10 pb-4">
            <Search size={20} className="text-black/30 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products, categories..."
              className="flex-1 text-lg bg-transparent border-none outline-none placeholder:text-black/30 text-black"
            />
            <button onClick={onClose} className="p-2 hover:opacity-60 transition flex-shrink-0">
              <X size={20} className="text-black/50" />
            </button>
          </div>

          <div className="mt-6 max-h-[65vh] overflow-y-auto scrollbar-hide">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && searched && results.length === 0 && (
              <div className="py-12 text-center">
                <Package size={40} className="mx-auto text-black/20 mb-4" />
                <div className="text-lg font-semibold text-black/60">No products found</div>
                <p className="text-sm text-black/40 mt-1">Try a different search term</p>
                <div className="mt-6">
                  <div className="text-xs uppercase tracking-[0.15em] text-black/40 font-semibold mb-3">Suggested Categories</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {POPULAR_CATEGORIES.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => { onClose(); navigate(`/shop/${cat.slug}`); }}
                        className="px-4 py-2 bg-black/5 text-sm font-medium rounded-full hover:bg-black/10 transition"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!loading && !searched && query.length < 2 && (
              <div className="space-y-6">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-black/40 font-semibold mb-3">
                      <Clock size={14} /> Recent Searches
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSuggestionClick(s)}
                          className="px-3 py-1.5 bg-black/5 text-sm rounded-full hover:bg-black/10 transition"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-black/40 font-semibold mb-3">
                    <TrendingUp size={14} /> Trending Searches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestionClick(s)}
                        className="px-3 py-1.5 bg-black/5 text-sm rounded-full hover:bg-black/10 transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-black/40 font-semibold mb-3">
                    <Package size={14} /> Popular Categories
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_CATEGORIES.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => { onClose(); navigate(`/shop/${cat.slug}`); }}
                        className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-[0.1em] rounded-full hover:bg-black/85 transition"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!loading && searched && results.length > 0 && (
              <div className="space-y-2">
                {results.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl text-left transition ${
                      idx === selectedIdx ? "bg-black/5" : "hover:bg-black/[0.03]"
                    }`}
                  >
                    <div className="w-16 h-20 bg-[#f5f5f7] rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={p.images?.[0]?.url ? resolveImage(p.images[0].url) : PRODUCT_IMAGE_PLACEHOLDER}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{p.name}</div>
                      <div className="text-xs text-black/40 capitalize mt-0.5">
                        {p.category || p.gender || "General"}
                      </div>
                    </div>
                    <div className="text-sm font-bold flex-shrink-0">
                      {showPrices ? formatPrice(p.price) : <span className="text-[9px] uppercase tracking-wider text-black/40">Coming Soon</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
