import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useCallback } from "react";
import { ShoppingBag, Heart, User, Menu, X, Search, LogOut, Shield, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import SearchModal from "@/components/SearchModal";
import { NAV } from "@/constants/testIds";

const navLinks = [
  { to: "/shop/men", label: "Men", tid: NAV.men },
  { to: "/shop/women", label: "Women", tid: NAV.women },
  { to: "/shop/accessories", label: "Accessories", tid: NAV.accessories },
  { to: "/shop/new", label: "New", tid: "nav-new" },
  { to: "/shop/sale", label: "Sale", tid: "nav-sale" },
];

const megaMenuData = {
  men: {
    label: "Men",
    to: "/shop/men",
    columns: [
      {
        title: "Clothing",
        items: [
          { label: "Oversized Tees", to: "/shop/men?category=oversized-tees" },
          { label: "Hoodies", to: "/shop/men?category=hoodies" },
          { label: "Joggers", to: "/shop/men?category=joggers" },
          { label: "Shorts", to: "/shop/men?category=shorts" },
          { label: "Tanks", to: "/shop/men?category=tanks" },
        ],
      },
      {
        title: "Training",
        items: [
          { label: "Performance Wear", to: "/shop/men?category=performance-wear" },
          { label: "Compression Wear", to: "/shop/men?category=compression-wear" },
          { label: "Running Collection", to: "/shop/men?category=running-collection" },
        ],
      },
      {
        title: "Footwear",
        items: [
          { label: "Running Shoes", to: "/shop/men?category=running-shoes" },
          { label: "Training Shoes", to: "/shop/men?category=training-shoes" },
          { label: "Slides", to: "/shop/men?category=slides" },
        ],
      },
      {
        title: "Accessories",
        items: [
          { label: "Gym Bags", to: "/shop/men?category=gym-bags" },
          { label: "Bottles", to: "/shop/men?category=bottles" },
          { label: "Shakers", to: "/shop/men?category=shakers" },
          { label: "Caps", to: "/shop/men?category=caps" },
        ],
      },
    ],
  },
  women: {
    label: "Women",
    to: "/shop/women",
    columns: [
      {
        title: "Clothing",
        items: [
          { label: "Leggings", to: "/shop/women?category=leggings" },
          { label: "Sports Bras", to: "/shop/women?category=sports-bras" },
          { label: "Oversized Tees", to: "/shop/women?category=oversized-tees" },
          { label: "Jackets", to: "/shop/women?category=jackets" },
        ],
      },
      {
        title: "Training",
        items: [
          { label: "Yoga Wear", to: "/shop/women?category=yoga-wear" },
          { label: "Running Collection", to: "/shop/women?category=running-collection" },
          { label: "Performance Wear", to: "/shop/women?category=performance-wear" },
        ],
      },
      {
        title: "Accessories",
        items: [
          { label: "Bottles", to: "/shop/women?category=bottles" },
          { label: "Bags", to: "/shop/women?category=bags" },
          { label: "Caps", to: "/shop/women?category=caps" },
        ],
      },
    ],
  },
  accessories: {
    label: "Accessories",
    to: "/shop/accessories",
    columns: [
      {
        title: "Gym Accessories",
        items: [
          { label: "Shakers", to: "/shop/accessories?category=shakers" },
          { label: "Bottles", to: "/shop/accessories?category=bottles" },
          { label: "Towels", to: "/shop/accessories?category=towels" },
          { label: "Gym Bags", to: "/shop/accessories?category=gym-bags" },
        ],
      },
      {
        title: "Apparel Accessories",
        items: [
          { label: "Caps", to: "/shop/accessories?category=caps" },
          { label: "Socks", to: "/shop/accessories?category=socks" },
          { label: "Wrist Wraps", to: "/shop/accessories?category=wrist-wraps" },
        ],
      },
    ],
  },
};

export default function NavBar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { items: wlItems } = useWishlist();

  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileAccordion, setMobileAccordion] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleMouseEnter = useCallback((key) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveDropdown(key);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 100);
  }, []);

  const toggleMobileAccordion = (key) => {
    setMobileAccordion((prev) => (prev === key ? null : key));
  };

  return (
    <>
      <div className="bg-black text-white py-2 text-center text-overline overflow-hidden">
        <div className="whitespace-nowrap">
          <span className="px-6">Free shipping on orders over ₹5,000</span>
          <span className="px-6">·</span>
          <span className="px-6">New Arrivals — Forge Collection</span>
          <span className="px-6">·</span>
          <span className="px-6">Use code WELCOME10 for 10% off</span>
        </div>
      </div>
      <header className="sticky top-0 z-50 bg-white relative">
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-4 flex items-center justify-between gap-2 md:gap-4">
          <Link
            to="/"
            data-testid={NAV.logo}
            className="flex items-center shrink-0 gap-1"
          >
            <img
              src="/images/logo.jpeg"
              alt=""
              className="h-8 sm:h-10 md:h-12 w-auto object-contain"
            />
            <span className="hidden sm:block text-lg md:text-2xl font-black tracking-[1px] text-black leading-none">
              GymSword
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((l) => {
              const megaKey = l.label.toLowerCase();
              const hasDropdown = megaMenuData[megaKey];
              return (
                <div
                  key={l.to}
                  className="relative"
                  onMouseEnter={() => hasDropdown && handleMouseEnter(megaKey)}
                  onMouseLeave={() => hasDropdown && handleMouseLeave()}
                >
                  <NavLink
                    to={l.to}
                    data-testid={l.tid}
                    className={({ isActive }) =>
                      `luxury-link text-overline text-black/90 hover:text-black ${
                        isActive ? "after:!w-full" : ""
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 md:gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 hover:opacity-60 transition flex items-center justify-center"
              aria-label="Search"
              data-testid={NAV.search}
            >
              <Search size={19} />
            </button>

            <Link
              to="/track"
              className="hidden md:inline-flex luxury-link text-overline"
              data-testid="nav-track-order"
            >
              Track Order
            </Link>

            <Link
              to="/wishlist"
              className="p-2.5 hover:opacity-60 transition relative flex items-center justify-center"
              data-testid={NAV.wishlist}
            >
              <Heart size={19} />
              {wlItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                  {wlItems.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="p-2.5 hover:opacity-60 transition relative flex items-center justify-center"
              data-testid={NAV.cart}
            >
              <ShoppingBag size={19} />
              {cart.count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                  {cart.count}
                </span>
              )}
            </Link>

            {user && user !== false ? (
              <div className="flex items-center gap-1">
                {user.role === "admin" ? (
                  <Link to="/admin" className="p-2.5 hover:opacity-60 transition flex items-center justify-center" data-testid="nav-admin">
                    <Shield size={19} />
                  </Link>
                ) : (
                  <Link to="/account" className="p-2.5 hover:opacity-60 transition flex items-center justify-center" data-testid={NAV.account}>
                    <User size={19} />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2.5 hover:opacity-60 transition hidden md:flex items-center justify-center"
                  data-testid={NAV.logout}
                  aria-label="Logout"
                >
                  <LogOut size={19} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex luxury-link text-overline"
                data-testid={NAV.login}
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden p-2.5 flex items-center justify-center"
              data-testid={NAV.mobileToggle}
              aria-label="Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {activeDropdown && megaMenuData[activeDropdown] && (
          <div
            className="absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-sm z-50 animate-mega-dropdown"
            onMouseEnter={() => handleMouseEnter(activeDropdown)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-10">
              <div className="grid grid-cols-4 gap-8">
                {megaMenuData[activeDropdown].columns.map((col) => (
                  <div key={col.title}>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-5">
                      {col.title}
                    </h3>
                    <ul className="space-y-3">
                      {col.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            to={item.to}
                            className="text-sm text-black/60 hover:text-black transition-colors duration-200"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link
                  to={megaMenuData[activeDropdown].to}
                  className="text-xs font-bold uppercase tracking-[0.2em] text-black hover:opacity-60 transition-opacity"
                  onClick={() => setActiveDropdown(null)}
                >
                  View All {megaMenuData[activeDropdown].label} →
                </Link>
              </div>
            </div>
          </div>
        )}

        {open && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] lg:hidden"
              onClick={() => setOpen(false)}
            />
            <div className="fixed top-0 right-0 h-screen w-[85%] max-w-[380px] bg-white shadow-2xl z-[999] lg:hidden overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-5">
                <img
                  src="/images/logo.jpeg"
                  alt="GymSword"
                  className="h-8 w-auto object-contain"
                />
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col px-6 py-6">
                {navLinks.map((l) => {
                  const megaKey = l.label.toLowerCase();
                  const megaData = megaMenuData[megaKey];
                  if (megaData) {
                    const isOpen = mobileAccordion === megaKey;
                    return (
                      <div key={l.to} className="border-b border-gray-100">
                        <button
                          onClick={() => toggleMobileAccordion(megaKey)}
                            className="w-full flex items-center justify-between py-4 text-lg font-semibold uppercase tracking-wider"
                        >
                          <span>{l.label}</span>
                          <ChevronDown
                            size={18}
                            className={`transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="pb-4 animate-slide-down">
                            {megaData.columns.map((col) => (
                              <div key={col.title} className="mb-3">
                                <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-black/40 mb-2">
                                  {col.title}
                                </h4>
                                <ul className="space-y-1 pl-2">
                                  {col.items.map((item) => (
                                    <li key={item.label}>
                                      <Link
                                        to={item.to}
                                        onClick={() => setOpen(false)}
                                        className="block py-1.5 text-sm text-black/60 hover:text-black transition-colors"
                                      >
                                        {item.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                            <Link
                              to={megaData.to}
                              onClick={() => setOpen(false)}
                              className="inline-block mt-2 text-xs font-bold uppercase tracking-[0.15em] text-black hover:opacity-60 transition-opacity"
                            >
                              View All {megaData.label} →
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      data-testid={`${l.tid}-mobile`}
                      className="py-4 border-b border-gray-100 text-lg font-semibold uppercase tracking-wider"
                    >
                      {l.label}
                    </NavLink>
                  );
                })}

                <NavLink
                  to="/track"
                  onClick={() => setOpen(false)}
                  className="py-4 border-b border-gray-100 text-lg font-semibold uppercase tracking-wider"
                >
                  Track Order
                </NavLink>

                <NavLink
                  to="/wishlist"
                  onClick={() => setOpen(false)}
                  className="py-4 border-b border-gray-100 text-lg font-semibold uppercase tracking-wider"
                >
                  Wishlist
                </NavLink>

                <NavLink
                  to="/cart"
                  onClick={() => setOpen(false)}
                  className="py-4 border-b border-gray-100 text-lg font-semibold uppercase tracking-wider"
                >
                  Cart ({cart.count})
                </NavLink>

                {!user || user === false ? (
                  <NavLink
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="mt-6 bg-black text-white text-center py-4 rounded-full font-semibold"
                  >
                    Sign In
                  </NavLink>
                ) : (
                  <>
                    {user.role === "admin" ? (
                      <NavLink
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="py-4 border-b border-gray-100 text-lg font-semibold uppercase tracking-wider"
                      >
                        Admin Dashboard
                      </NavLink>
                    ) : (
                      <NavLink
                        to="/account"
                        onClick={() => setOpen(false)}
                        className="py-4 border-b border-gray-100 text-lg font-semibold uppercase tracking-wider"
                      >
                        My Account
                      </NavLink>
                    )}
                    <button
                      onClick={handleLogout}
                      className="mt-6 bg-red-500 text-white py-4 rounded-full font-semibold"
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </nav>
            </div>
          </>
        )}
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

