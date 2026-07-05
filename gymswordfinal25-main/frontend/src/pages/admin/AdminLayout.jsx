import { useEffect, useState, useCallback } from "react";
import { NavLink, Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, Package, Box, Tag, Image, Zap,
  ShoppingCart, RotateCcw, Ticket, Users, UserPlus, UserCheck, Star,
  BookOpen, Mail, Users2, FileText, Download, Shield, HelpCircle,
  BarChart3, Settings as Cog, LogOut, ChevronDown, ChevronRight,
  PanelLeftClose, PanelLeft, BookText,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GymSwordLogo } from "@/components/GymSwordLogo";
import { ADMIN } from "@/constants/testIds";

const SECTIONS = [
  {
    title: "Overview",
    items: [
      { to: "/admin", end: true, label: "Home", icon: LayoutDashboard },
      { to: "/admin/business-dashboard", label: "Business Dashboard", icon: TrendingUp },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Inventory & Catalog",
    items: [
      { to: "/admin/products", label: "Inventory", icon: Package },
      { to: "/admin/stock", label: "Stock", icon: Box },
      { to: "/admin/categories", label: "Categories", icon: Tag },
      { to: "/admin/banners", label: "Banners", icon: Image },
      { to: "/admin/flash-sales", label: "Flash Sales", icon: Zap },
    ],
  },
  {
    title: "Sales",
    items: [
      { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { to: "/admin/returns", label: "Returns", icon: RotateCcw },
      { to: "/admin/coupons", label: "Coupons", icon: Ticket },
    ],
  },
  {
    title: "Customers",
    items: [
      { to: "/admin/customers", label: "Customers", icon: Users },
      { to: "/admin/referrals", label: "Referrals", icon: UserPlus },
      { to: "/admin/leads", label: "Leads", icon: UserCheck },
      { to: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    title: "Marketing",
    items: [
      { to: "/admin/blog", label: "Blog", icon: BookOpen },
      { to: "/admin/messages", label: "Messages", icon: Mail },
      { to: "/admin/newsletter", label: "Newsletter", icon: Users2 },
      { to: "/admin/email-logs", label: "Email Logs", icon: FileText },
    ],
  },
  {
    title: "Reports",
    items: [
      { to: "/admin/export", label: "Export", icon: Download },
    ],
  },
  {
    title: "Administration",
    items: [
      { to: "/admin/staff", label: "Staff", icon: Shield },
      { to: "/admin/faqs", label: "FAQ", icon: HelpCircle },
      { to: "/admin/guide", label: "Guide", icon: BookText },
      { to: "/admin/settings", label: "Settings", icon: Cog },
    ],
  },
];

const LS_KEY = "gs_admin_sidebar_sections";
const LS_COLLAPSED = "gs_admin_sidebar_collapsed";

function getStoredSections() {
  try {
    const stored = localStorage.getItem(LS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    localStorage.getItem(LS_COLLAPSED) === "true"
  );
  const [expandedSections, setExpandedSections] = useState(getStoredSections);

  const toggleCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(LS_COLLAPSED, next);
      return next;
    });
  }, []);

  const toggleSection = useCallback((title) => {
    setExpandedSections((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  const sidebarW = sidebarCollapsed ? "w-16" : "w-64";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      <aside
        data-testid={ADMIN.sidebar}
        className={`${sidebarW} border-r border-white/10 flex flex-col sticky top-0 self-start h-screen overflow-y-auto transition-all duration-300 group`}
      >
        {/* Logo + Collapse */}
        <div className={`px-4 py-5 border-b border-white/10 flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
          {!sidebarCollapsed && (
            <div>
              <Link to="/admin"><GymSwordLogo variant="light" /></Link>
              <div className="text-overline text-white/40 mt-3 text-[10px]">Owner Console</div>
            </div>
          )}
          <button onClick={toggleCollapsed} className="text-white/40 hover:text-white transition-colors">
            {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Nav Sections */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {SECTIONS.map((section) => {
            const isExpanded = expandedSections[section.title] !== false;
            const hasActive = section.items.some((n) =>
              n.end ? pathname === n.to : pathname.startsWith(n.to)
            );

            if (sidebarCollapsed) {
              return (
                <div key={section.title} className="space-y-1">
                  {section.items.map((n) => {
                    const isActive = n.end ? pathname === n.to : pathname.startsWith(n.to);
                    return (
                      <NavLink
                        key={n.to}
                        to={n.to}
                        end={n.end}
                        data-testid={`admin-nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                        className={({ isActive: ia }) =>
                          `relative flex items-center justify-center w-full h-10 rounded transition ${
                            ia ? "bg-white text-black" : "text-white/50 hover:text-white hover:bg-white/5"
                          }`
                        }
                        title={n.label}
                      >
                        <n.icon size={16} />
                      </NavLink>
                    );
                  })}
                </div>
              );
            }

            return (
              <div key={section.title}>
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.title)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-[10px] uppercase tracking-[0.15em] transition ${
                    hasActive ? "text-white/70" : "text-white/40"
                  } hover:text-white/70`}
                >
                  <span>{section.title}</span>
                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
                {/* Section Items */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="space-y-0.5 pl-2">
                    {section.items.map((n) => {
                      const isActive = n.end ? pathname === n.to : pathname.startsWith(n.to);
                      return (
                        <NavLink
                          key={n.to}
                          to={n.to}
                          end={n.end}
                          data-testid={`admin-nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                          className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded transition ${
                            isActive
                              ? "bg-white text-black font-medium"
                              : "text-white/60 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <n.icon size={15} className="shrink-0" />
                          <span className="truncate">{n.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`border-t border-white/10 space-y-2 p-3 ${sidebarCollapsed ? "text-center" : ""}`}>
          {!sidebarCollapsed && (
            <>
              <div className="px-3 py-2 text-xs text-white/50 truncate">{user?.email}</div>
              <Link to="/" className="block px-3 py-2 text-xs text-white/50 hover:text-white transition">
                View Storefront →
              </Link>
            </>
          )}
          <button
            onClick={async () => { await logout(); navigate("/admin/login"); }}
            className={`flex items-center gap-3 w-full px-3 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-white transition rounded ${sidebarCollapsed ? "justify-center" : ""}`}
            title="Sign Out"
          >
            <LogOut size={14} />
            {!sidebarCollapsed && "Sign Out"}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-12 overflow-x-auto relative min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

