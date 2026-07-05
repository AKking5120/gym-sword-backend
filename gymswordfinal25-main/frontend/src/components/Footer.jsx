import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { GymSwordLogo } from "@/components/GymSwordLogo";
import { ChevronDown } from "lucide-react";

const SHOP_LINKS = [
  { to: "/shop/men", label: "Men" },
  { to: "/shop/women", label: "Women" },
  { to: "/shop/accessories", label: "Accessories" },
  { to: "/shop/new", label: "New Arrivals" },
  { to: "/shop/best-sellers", label: "Best Sellers" },
  { to: "/shop/premium", label: "Premium Collection" },
  { to: "/shop/sale", label: "Sale" },
  { to: "/gift-cards", label: "Gift Cards" },
];

const SUPPORT_LINKS = [
  { to: "/track", label: "Track Order" },
  { to: "/contact", label: "Contact Us" },
  { to: "/faq", label: "FAQs" },
  { to: "/shipping-policy", label: "Shipping Policy" },
  { to: "/return-policy", label: "Return Policy" },
  { to: "/refund-policy", label: "Refund Policy" },
  { to: "/exchange-policy", label: "Exchange Policy" },
  { to: "/size-guide", label: "Size Guide" },
];

const ACCOUNT_LINKS = [
  { to: "/login", label: "Login" },
  { to: "/register", label: "Register" },
  { to: "/account", label: "My Profile" },
  { to: "/my-orders", label: "My Orders" },
  { to: "/wishlist", label: "Wishlist" },
  { to: "/cart", label: "Cart" },
  { to: "/account/wallet", label: "Wallet" },
  { to: "/membership", label: "Membership" },
];

const COMPANY_LINKS = [
  { to: "/about", label: "About GymSword" },
  { to: "/our-story", label: "Our Story" },
  { to: "/careers", label: "Careers" },
  { to: "/affiliate", label: "Affiliate Program" },
  { to: "/referral-program", label: "Referral Program" },
  { to: "/blog", label: "Blog" },
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms-and-conditions", label: "Terms & Conditions" },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/gym_swordofficial",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "Pinterest",
    href: "https://pinterest.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24 18.635 24 24 18.633 24 12.013 24 5.393 18.635.026 12.017.026V0z"/>
      </svg>
    ),
  },
];

const PAYMENT_METHODS = [
  { label: "Visa", icon: "VISA" },
  { label: "Mastercard", icon: "MC" },
  { label: "RuPay", icon: "RuPay" },
  { label: "UPI", icon: "UPI" },
  { label: "Razorpay", icon: "Rzp" },
  { label: "Paytm", icon: "Paytm" },
  { label: "Google Pay", icon: "GPay" },
  { label: "PhonePe", icon: "PHPe" },
];

const TRUST_BADGES = [
  { icon: "🔒", label: "100% Secure Payments" },
  { icon: "↩", label: "Easy Returns" },
  { icon: "⚡", label: "Fast Shipping" },
  { icon: "✦", label: "Premium Quality" },
];

const FOOTER_COLUMNS = [
  { title: "Shop", links: SHOP_LINKS },
  { title: "Customer Service", links: SUPPORT_LINKS },
  { title: "My Account", links: ACCOUNT_LINKS },
  { title: "Company", links: COMPANY_LINKS },
];

function AccordionSection({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-white">{title}</span>
        <ChevronDown
          size={16}
          className={`text-white/40 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-[500px] pb-4" : "max-h-0"}`}>
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const subscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/settings/subscribe", { email });
      toast.success("Welcome to the GymSword inner circle");
      setEmail("");
    } catch {
      toast.error("Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  const renderLinks = (links) => (
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.to}>
          <Link
            to={link.to}
            className="text-[13px] text-[#A3A3A3] hover:text-white transition-colors duration-200"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <footer ref={ref} className="bg-[#000000] text-white relative">
      <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        {/* Main Footer */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 pt-16 pb-12">
          {/* Desktop: 5-column layout */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-10">
            {/* Column 1: Brand */}
            <div className="col-span-4">
              <Link to="/">
                <GymSwordLogo variant="light" />
              </Link>
              <p className="mt-5 text-[13px] text-[#A3A3A3] leading-[1.8] max-w-[320px]">
                Premium fitness apparel and accessories designed for athletes who demand performance and style.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3 mt-8">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 border border-white/15 flex items-center justify-center text-[#A3A3A3] hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Columns 2-5 */}
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} className="col-span-2">
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-white mb-5">
                  {col.title}
                </h3>
                {renderLinks(col.links)}
              </div>
            ))}
          </div>

          {/* Tablet: 3-column layout */}
          <div className="hidden md:grid lg:hidden md:grid-cols-3 gap-10">
            <div className="col-span-3">
              <Link to="/">
                <GymSwordLogo variant="light" />
              </Link>
              <p className="mt-5 text-[13px] text-[#A3A3A3] leading-[1.8] max-w-[320px]">
                Premium fitness apparel and accessories designed for athletes who demand performance and style.
              </p>
              <div className="flex items-center gap-3 mt-6">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 border border-white/15 flex items-center justify-center text-[#A3A3A3] hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-white mb-5">Shop</h3>
              {renderLinks(SHOP_LINKS)}
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-white mb-5">Customer Service</h3>
              {renderLinks(SUPPORT_LINKS)}
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-white mb-5">My Account</h3>
                {renderLinks(ACCOUNT_LINKS)}
              </div>
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-white mb-5">Company</h3>
                {renderLinks(COMPANY_LINKS)}
              </div>
            </div>
          </div>

          {/* Mobile: Accordion */}
          <div className="md:hidden">
            <Link to="/">
              <GymSwordLogo variant="light" />
            </Link>
            <p className="mt-4 text-[13px] text-[#A3A3A3] leading-[1.8]">
              Premium fitness apparel and accessories designed for athletes who demand performance and style.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 border border-white/15 flex items-center justify-center text-[#A3A3A3] hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            <div className="mt-8">
              {FOOTER_COLUMNS.map((col) => (
                <AccordionSection key={col.title} title={col.title}>
                  {renderLinks(col.links)}
                </AccordionSection>
              ))}
            </div>
          </div>

          {/* Customer Support + Newsletter */}
          <div className="mt-14 grid md:grid-cols-2 gap-10 border-t border-white/10 pt-10">
            {/* Support */}
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-white mb-4">Customer Support</h3>
              <div className="space-y-3">
                <a href="mailto:support@gymsword.com" className="flex items-center gap-2 text-[13px] text-[#A3A3A3] hover:text-white transition-colors">
                  <span className="text-white/40">✉</span> support@gymsword.com
                </a>
                <a href="tel:+918799756074" className="flex items-center gap-2 text-[13px] text-[#A3A3A3] hover:text-white transition-colors">
                  <span className="text-white/40">☎</span> +91 87997 56074
                </a>
                <p className="text-[12px] text-[#A3A3A3]/60">Mon - Sat · 10:00 AM - 7:00 PM</p>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-white mb-4">Join the GymSword Community</h3>
              <form onSubmit={subscribe} className="flex">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent border border-white/15 border-r-0 px-4 py-3 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-white text-black px-6 py-3 text-[11px] uppercase tracking-[0.15em] font-bold hover:bg-white/80 transition-colors disabled:opacity-50"
                >
                  {loading ? "..." : "Subscribe"}
                </button>
              </form>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#A3A3A3]/50 mb-4 text-center md:text-left">Accepted Payment Methods</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {PAYMENT_METHODS.map((m) => (
                <div key={m.label} className="h-8 px-3 border border-white/15 flex items-center justify-center text-[10px] font-bold text-[#A3A3A3] tracking-wider">
                  {m.icon}
                </div>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map((b) => (
              <div key={b.label} className="flex items-center justify-center gap-2 py-3 border border-white/10 text-[11px] text-[#A3A3A3] uppercase tracking-[0.1em]">
                <span className="text-white/40">{b.icon}</span> {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-[#A3A3A3]/60">
              © 2025 GymSword. All Rights Reserved.
            </p>
            <p className="text-[11px] text-[#A3A3A3]/60">
              Made in India 🇮🇳
            </p>
            <div className="flex items-center gap-5">
              <Link to="/privacy-policy" className="text-[11px] text-[#A3A3A3]/60 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="text-[11px] text-[#A3A3A3]/60 hover:text-white transition-colors">Terms</Link>
              <span className="text-[11px] text-[#A3A3A3]/60">Cookies</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
