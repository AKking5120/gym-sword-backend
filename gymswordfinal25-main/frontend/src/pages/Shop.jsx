import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronRight, Grid2X2, Grid3X3, LayoutGrid } from "lucide-react";
import { api } from "@/lib/api";

import ProductCard from "@/components/ProductCard";

const CATEGORY_LABELS = {
  men: "Men",
  women: "Women",
  accessories: "Accessories",
  new: "New Arrivals",
  sale: "Sale",
};

const PRODUCT_TYPE_LABELS = {
  joggers: "Joggers",
  leggings: "Leggings",
  hoodies: "Hoodies",
  "crop-jackets": "Crop Jackets",
  "oversized-t-shirts": "Oversized T-Shirts",
  "sports-bras": "Sports Bras",
  "regular-fit-t-shirts": "Regular Fit T-Shirts",
  jackets: "Jackets",
  shorts: "Shorts",
  "compression-wear": "Compression Wear",
  tanks: "Tanks",
  "running-shoes": "Running Shoes",
  "training-shoes": "Training Shoes",
  slides: "Slides",
  bottles: "Bottles",
  shakers: "Shakers",
  caps: "Caps",
  "gym-bags": "Gym Bags",
  towels: "Towels",
  socks: "Socks",
  "wrist-wraps": "Wrist Wraps",
};

const ACCESSORY_TYPES = ["accessories"];

const COLLECTIONS_BY_GENDER = {
  men: ["joggers", "hoodies", "oversized-t-shirts", "regular-fit-t-shirts", "jackets", "shorts", "compression-wear", "tanks"],
  women: ["leggings", "crop-jackets", "sports-bras", "hoodies", "jackets"],
};

const PRICE_RANGES = [
  { label: "Under ₹1,000", min: 0, max: 999 },
  { label: "₹1,000 – ₹1,999", min: 1000, max: 1999 },
  { label: "₹2,000 – ₹2,999", min: 2000, max: 2999 },
  { label: "₹3,000+", min: 3000, max: Infinity },
];

const COLORS = ["Black", "White", "Grey", "Blue", "Red", "Green", "Navy", "Pink"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price Low To High" },
  { value: "price-desc", label: "Price High To Low" },
  { value: "best_sellers", label: "Best Selling" },
];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-black/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-black"
      >
        {title}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

function Checkbox({ checked, onChange, label, count }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-3 py-1.5 cursor-pointer group w-full text-left"
    >
      <div className={`w-4 h-4 border-[1.5px] rounded flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? "bg-black border-black" : "border-black/30 group-hover:border-black/60"
      }`}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-[13px] text-black/70 group-hover:text-black transition-colors">{label}</span>
      {count !== undefined && (
        <span className="text-[11px] text-black/30 ml-auto">{count}</span>
      )}
    </button>
  );
}

export default function Shop() {
  const { category } = useParams();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(params.get("q") || "");
  const [searchDebounce, setSearchDebounce] = useState(params.get("q") || "");

  const cat = category || "all";
  const productType = params.get("type") || "";
  const genderParam = params.get("gender") || "";

  const [sort, setSort] = useState("newest");
  const [gridCols, setGridCols] = useState(4);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  const genderFromCat = (cat === "men" || cat === "women") ? cat : "";
  const [selectedGenders, setSelectedGenders] = useState(genderParam ? [genderParam] : genderFromCat ? [genderFromCat] : []);
  const [selectedTypes, setSelectedTypes] = useState(productType ? [productType] : []);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const gender = (cat === "men" || cat === "women") ? cat : null;
  const availableCollections = cat === "accessories"
    ? ACCESSORY_TYPES
    : gender
      ? COLLECTIONS_BY_GENDER[gender]?.filter((key) => key in PRODUCT_TYPE_LABELS) || []
      : Object.keys(PRODUCT_TYPE_LABELS);

  const label = productType
    ? PRODUCT_TYPE_LABELS[productType] || productType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : CATEGORY_LABELS[cat] || "Shop All";

  useEffect(() => {
    const g = (cat === "men" || cat === "women") ? cat : "";
    if (genderParam) setSelectedGenders([genderParam]);
    else if (g) setSelectedGenders([g]);
    else setSelectedGenders([]);
  }, [cat, genderParam]);

  useEffect(() => {
    setSelectedTypes(productType ? [productType] : []);
  }, [productType]);

  useEffect(() => {
    setSearchQuery(params.get("q") || "");
    setSearchDebounce(params.get("q") || "");
  }, [params]);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchDebounce), 350);
    return () => clearTimeout(t);
  }, [searchDebounce]);

  useEffect(() => {
    setLoading(true);
    setProducts([]);
    const q = { limit: 200 };
    const activeType = selectedTypes.length === 1 ? selectedTypes[0] : "";
    if (activeType) q.product_type = activeType;
    else if (cat === "new" || cat === "sale" || cat === "accessories") { /* client-side filter */ }
    else if (cat !== "all") q.category = cat;
    if (selectedGenders.length === 1) q.gender = selectedGenders[0];
    if (selectedPriceRanges.length === 1) {
      const range = PRICE_RANGES[selectedPriceRanges[0]];
      q.min_price = range.min;
      if (range.max !== Infinity) q.max_price = range.max;
    }
    if (searchQuery) q.q = searchQuery;
    if (sort === "best_sellers") q.best_sellers = "true";
    else if (sort === "featured") q.featured = "true";
    else q.sort = sort;

    api.get("/products", { params: q })
      .then(({ data }) => setProducts(data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [cat, productType, selectedGenders, selectedTypes, selectedPriceRanges, searchQuery, sort]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (cat === "accessories") list = list.filter((p) => ACCESSORY_TYPES.includes(p.product_type));
    else if (cat === "new") list = list.filter((p) => p.is_new_arrival);
    else if (cat === "sale") list = list.filter((p) => p.is_sale);
    if (selectedTypes.length > 1) list = list.filter((p) => selectedTypes.includes(p.product_type));
    if (selectedGenders.length > 1) list = list.filter((p) => selectedGenders.includes(p.gender));
    if (selectedPriceRanges.length > 1) {
      list = list.filter((p) =>
        selectedPriceRanges.some((ri) => {
          const range = PRICE_RANGES[ri];
          return p.price >= range.min && p.price <= range.max;
        })
      );
    }
    if (selectedColors.length > 0) {
      list = list.filter((p) => {
        const productColors = (p.colors || []).map((c) => c.toLowerCase());
        return selectedColors.some((c) => productColors.includes(c.toLowerCase()));
      });
    }
    if (selectedSizes.length > 0) {
      list = list.filter((p) => {
        const productSizes = (p.sizes || []).map((s) => s.toUpperCase());
        return selectedSizes.some((s) => productSizes.includes(s));
      });
    }
    return list;
  }, [products, selectedTypes, selectedGenders, selectedPriceRanges, selectedColors, selectedSizes]);

  const activeFilterCount =
    selectedGenders.length + selectedTypes.length + selectedPriceRanges.length + selectedColors.length + selectedSizes.length;

  const clearAllFilters = () => {
    setSelectedGenders([]);
    setSelectedTypes([]);
    setSelectedPriceRanges([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSearchDebounce("");
    setSearchQuery("");
  };

  const toggleGender = (g) => setSelectedGenders((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g]);
  const toggleType = (t) => setSelectedTypes((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);
  const togglePrice = (i) => setSelectedPriceRanges((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);
  const toggleColor = (c) => setSelectedColors((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);
  const toggleSize = (s) => setSelectedSizes((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  const breadcrumbItems = [
    { label: "Home", to: "/" },
    { label: cat === "all" ? "Shop All" : CATEGORY_LABELS[cat] || cat, to: `/shop${cat !== "all" ? `/${cat}` : ""}` },
  ];
  if (productType) {
    breadcrumbItems.push({
      label: PRODUCT_TYPE_LABELS[productType] || productType.replace(/-/g, " "),
      to: null,
    });
  }

  const FilterPanel = () => (
    <div className="space-y-0">
      <FilterSection title="Shop For">
        {["men", "women", "unisex"].map((g) => (
          <Checkbox
            key={g}
            checked={selectedGenders.includes(g)}
            onChange={() => toggleGender(g)}
            label={g.charAt(0).toUpperCase() + g.slice(1)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Category">
        {(availableCollections.length > 0 ? availableCollections : Object.keys(PRODUCT_TYPE_LABELS)).map((key) => (
          <Checkbox
            key={key}
            checked={selectedTypes.includes(key)}
            onChange={() => toggleType(key)}
            label={PRODUCT_TYPE_LABELS[key] || key}
          />
        ))}
      </FilterSection>

      <FilterSection title="Price">
        {PRICE_RANGES.map((range, i) => (
          <Checkbox
            key={i}
            checked={selectedPriceRanges.includes(i)}
            onChange={() => togglePrice(i)}
            label={range.label}
          />
        ))}
      </FilterSection>

      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={`w-10 h-10 text-[11px] font-semibold rounded-full border flex items-center justify-center transition-all ${
                selectedSizes.includes(s)
                  ? "bg-black text-white border-black"
                  : "border-black/20 text-black/60 hover:border-black/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => toggleColor(c)}
              className={`px-3 py-1.5 text-[11px] border rounded-full transition-all ${
                selectedColors.includes(c)
                  ? "bg-black text-white border-black"
                  : "border-black/20 text-black/60 hover:border-black/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <main className="flex-1">
      {/* BREADCRUMBS */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-4 pb-0">
        <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-black/40">
          {breadcrumbItems.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={9} />}
              {item.to ? (
                <Link to={item.to} className="hover:text-black transition-colors">{item.label}</Link>
              ) : (
                <span className="text-black font-semibold">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* COLLECTION HEADER */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-4 pb-3">
        <h1 className="font-display uppercase font-black text-3xl sm:text-4xl md:text-5xl tracking-tight">
          {label}
        </h1>
        <p className="text-[11px] text-black/50 mt-2 uppercase tracking-[0.12em]">
          {filteredProducts.length} Product{filteredProducts.length !== 1 ? "s" : ""} Found
        </p>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pb-16">
        <div className="flex gap-8">
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block w-[240px] flex-shrink-0">
            <div className="sticky top-24 h-[calc(100vh-7rem)] flex flex-col">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.15em]">Filters</h2>
                {activeFilterCount > 0 && (
                  <button onClick={clearAllFilters} className="text-[10px] uppercase tracking-[0.1em] text-black/40 hover:text-black transition-colors">
                    Clear All
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1 scrollbar-thin pr-1">
                <FilterPanel />
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1 min-w-0">
            {/* TOOLBAR */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-black/10">
              <div className="flex items-center gap-3 lg:hidden">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] border border-black/20 px-4 py-2.5 hover:border-black transition-colors"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 bg-black text-white text-[10px] rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setMobileSortOpen(true)}
                  className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] border border-black/20 px-4 py-2.5 hover:border-black transition-colors"
                >
                  Sort
                </button>
              </div>

              <div className="hidden md:block relative max-w-xs flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
                <input
                  type="text"
                  value={searchDebounce}
                  onChange={(e) => setSearchDebounce(e.target.value)}
                  placeholder={`Search ${label}...`}
                  className="w-full bg-transparent border-b border-black/20 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-black transition-colors placeholder:text-black/30"
                />
                {searchDebounce && (
                  <button onClick={() => { setSearchDebounce(""); setSearchQuery(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-black/40 whitespace-nowrap">Sort By</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="text-[11px] font-semibold bg-transparent border-b border-black/20 pb-1 pr-6 focus:outline-none focus:border-black transition-colors cursor-pointer appearance-none"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center border-l border-black/10 pl-4 gap-1">
                  {[
                    { cols: 2, icon: Grid2X2 },
                    { cols: 3, icon: Grid3X3 },
                    { cols: 4, icon: LayoutGrid },
                  ].map(({ cols, icon: Icon }) => (
                    <button
                      key={cols}
                      onClick={() => setGridCols(cols)}
                      className={`p-1.5 transition-colors ${gridCols === cols ? "text-black" : "text-black/25 hover:text-black/50"}`}
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MOBILE SEARCH */}
            <div className="md:hidden mb-4">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
                <input
                  type="text"
                  value={searchDebounce}
                  onChange={(e) => setSearchDebounce(e.target.value)}
                  placeholder={`Search ${label}...`}
                  className="w-full bg-[#f8f8f8] border border-black/10 pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-black transition-colors placeholder:text-black/30"
                />
                {searchDebounce && (
                  <button onClick={() => { setSearchDebounce(""); setSearchQuery(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* APPLIED FILTERS */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {selectedGenders.map((g) => (
                  <button key={`g-${g}`} onClick={() => toggleGender(g)}
                    className="flex items-center gap-1.5 bg-black text-white text-[10px] font-semibold uppercase tracking-[0.1em] px-3 py-1.5">
                    {g} <X size={10} />
                  </button>
                ))}
                {selectedTypes.map((t) => (
                  <button key={`t-${t}`} onClick={() => toggleType(t)}
                    className="flex items-center gap-1.5 bg-black text-white text-[10px] font-semibold uppercase tracking-[0.1em] px-3 py-1.5">
                    {PRODUCT_TYPE_LABELS[t] || t} <X size={10} />
                  </button>
                ))}
                {selectedPriceRanges.map((ri) => (
                  <button key={`p-${ri}`} onClick={() => togglePrice(ri)}
                    className="flex items-center gap-1.5 bg-black text-white text-[10px] font-semibold uppercase tracking-[0.1em] px-3 py-1.5">
                    {PRICE_RANGES[ri].label} <X size={10} />
                  </button>
                ))}
                {selectedColors.map((c) => (
                  <button key={`c-${c}`} onClick={() => toggleColor(c)}
                    className="flex items-center gap-1.5 bg-black text-white text-[10px] font-semibold uppercase tracking-[0.1em] px-3 py-1.5">
                    {c} <X size={10} />
                  </button>
                ))}
                {selectedSizes.map((s) => (
                  <button key={`s-${s}`} onClick={() => toggleSize(s)}
                    className="flex items-center gap-1.5 bg-black text-white text-[10px] font-semibold uppercase tracking-[0.1em] px-3 py-1.5">
                    {s} <X size={10} />
                  </button>
                ))}
                <button onClick={clearAllFilters}
                  className="text-[10px] uppercase tracking-[0.1em] text-black/40 hover:text-black ml-2 transition-colors">
                  Clear All
                </button>
              </div>
            )}

            {/* PRODUCT GRID */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24" data-testid="shop-empty">
                <div className="font-display uppercase text-2xl mb-3">No products found</div>
                <p className="text-sm text-black/40 mb-6">Try adjusting your filters or search terms.</p>
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-bold uppercase tracking-[0.15em] border border-black px-6 py-3 hover:bg-black hover:text-white transition-all duration-300"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-x-6 gap-y-8 ${
                gridCols === 2 ? "grid-cols-2" : gridCols === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              }`}>
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {mobileFiltersOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[998] lg:hidden" onClick={() => setMobileFiltersOpen(false)} />
          <div className="fixed top-0 left-0 h-screen w-[85%] max-w-[380px] bg-white z-[999] lg:hidden overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.15em]">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4">
              <FilterPanel />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-black/10 px-6 py-4 flex gap-3">
              <button onClick={clearAllFilters}
                className="flex-1 text-[11px] font-bold uppercase tracking-[0.12em] border border-black/20 py-3 hover:border-black transition-colors">
                Clear All
              </button>
              <button onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 text-[11px] font-bold uppercase tracking-[0.12em] bg-black text-white py-3 hover:bg-black/80 transition-colors">
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </>
      )}

      {/* MOBILE SORT DRAWER */}
      {mobileSortOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[998] lg:hidden" onClick={() => setMobileSortOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white z-[999] lg:hidden shadow-2xl">
            <div className="px-6 py-5">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4">Sort By</h2>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setMobileSortOpen(false); }}
                  className={`w-full text-left py-3 text-sm border-b border-black/5 last:border-0 transition-colors ${
                    sort === opt.value ? "font-semibold text-black" : "text-black/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
