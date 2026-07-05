import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen, HelpCircle, Shield, Settings, LayoutDashboard, TrendingUp, Package, Box, Tag, Image, Zap, ShoppingCart, RotateCcw, Ticket, Users, UserPlus, UserCheck, Star, Mail, Users2, FileText, Download, BarChart3, Search } from "lucide-react";

const SECTIONS = [
  {
    icon: LayoutDashboard,
    title: "Home (Dashboard)",
    items: [
      "Quick overview: total revenue, orders, customers, products",
      "Top Products chart shows best-selling items by order count",
      "Recent Orders table shows latest 5 transactions",
    ],
  },
  {
    icon: TrendingUp,
    title: "Business Dashboard",
    items: [
      "Full analytics suite with date range filter (Today / Yesterday / 7d / 30d / Month / Custom)",
      "12 KPI cards: Revenue, Orders, Customers, Products, COD/Prepaid, Delivered/Cancelled, Return/Refund rates, AOV, Conversion rate",
      "Revenue Trend line chart, COD vs Prepaid pie chart",
      "Weekly / Monthly / Yearly bar charts",
      "Top 10 Selling Products table",
      "Product Performance table — search, sort by any column, paginate",
      "Customer Analytics — new / returning / active / referral counts, growth chart, top customers table",
      "Inventory Analytics — total stock, value, low stock alerts, out of stock",
      "Order Status Breakdown with color-coded badges",
      "Payment Analytics — COD vs Prepaid breakdown",
      "Recent Activities timeline",
      "Export Report button downloads CSV",
    ],
  },
  {
    icon: Package,
    title: "Inventory (Products)",
    items: [
      "View, search, and manage all products",
      "Create new product with name, price, images, sizes, description",
      "Edit existing products — inline size toggle (XS-3XL + Free)",
      "Delete products with confirmation",
      "Toggle product active/sale status",
    ],
  },
  {
    icon: Box,
    title: "Stock Management",
    items: [
      "View all products with current stock quantities",
      "Inline edit stock quantity for individual products",
      "Bulk save — edit multiple stock values then save all at once",
      "Low stock indicator (≤5 units shown in red)",
    ],
  },
  {
    icon: Tag,
    title: "Categories",
    items: [
      "Manage product categories (e.g. Oversized T-Shirts, Joggers, Hoodies)",
      "Create, edit, and delete categories",
      "Categories appear in storefront navigation",
    ],
  },
  {
    icon: Image,
    title: "Banners",
    items: [
      "Manage homepage hero banners and promotional banners",
      "Upload banner images, set link URLs, enable/disable",
      "Banners display in storefront carousel",
    ],
  },
  {
    icon: Zap,
    title: "Flash Sales",
    items: [
      "Create time-limited discount campaigns",
      "Set discount percentage, start/end dates",
      "Active flash sales show on product pages with countdown timer",
    ],
  },
  {
    icon: ShoppingCart,
    title: "Orders",
    items: [
      "View all orders with status, payment method, amount",
      "Update order status (pending → confirmed → processing → packed → shipped → out_for_delivery → delivered)",
      "Cancel orders when needed",
      "Search orders by order number or customer email",
    ],
  },
  {
    icon: RotateCcw,
    title: "Returns",
    items: [
      "View customer return requests with reason and details",
      "Approve or reject returns",
      "Add admin notes when processing returns",
    ],
  },
  {
    icon: Ticket,
    title: "Coupons",
    items: [
      "Create discount coupons (percentage or fixed amount)",
      "Set minimum order amount, max uses, and expiry date",
      "Enable/disable coupons anytime",
    ],
  },
  {
    icon: Users,
    title: "Customers",
    items: [
      "View all registered customers",
      "Toggle account disable status",
      "Resend verification emails",
      "View login history for each customer",
    ],
  },
  {
    icon: UserPlus,
    title: "Referrals",
    items: [
      "View customer referral program data",
      "Track referred customers and rewards",
    ],
  },
  {
    icon: UserCheck,
    title: "Leads",
    items: [
      "View and manage sales leads",
      "Track lead status and follow-ups",
    ],
  },
  {
    icon: Star,
    title: "Reviews",
    items: [
      "View all product reviews from customers",
      "Approve or reject reviews before they appear on storefront",
    ],
  },
  {
    icon: BookOpen,
    title: "Blog",
    items: [
      "Create and manage blog posts",
      "Add title, content, images, and publish/unpublish posts",
      "Blog posts appear on storefront blog page",
    ],
  },
  {
    icon: Mail,
    title: "Messages",
    items: [
      "View customer contact form submissions",
      "Mark messages as read/unread/resolved",
      "Delete spam or resolved messages",
    ],
  },
  {
    icon: Users2,
    title: "Newsletter",
    items: [
      "View all newsletter subscribers with email and date",
      "Export subscriber list as CSV",
    ],
  },
  {
    icon: FileText,
    title: "Email Logs",
    items: [
      "View all sent transactional emails",
      "Check email status (sent/failed), recipient, and timestamp",
    ],
  },
  {
    icon: Download,
    title: "Export",
    items: [
      "Export Products, Orders, or Users as PDF or Excel",
      "PDF includes styled table with header and generation date",
      "Excel file opens directly in Excel / Google Sheets",
    ],
  },
  {
    icon: Shield,
    title: "Staff",
    items: [
      "Manage admin staff accounts",
      "Assign roles: super_admin (full access), admin (limited), user (read-only)",
    ],
  },
  {
    icon: HelpCircle,
    title: "FAQ",
    items: [
      "Create and manage Frequently Asked Questions",
      "Organize by category, enable/disable individually",
      "FAQs display on storefront FAQ page",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics",
    items: [
      "Quick stats overview — total revenue, orders, customers, products",
      "Recent orders and top products summary",
    ],
  },
  {
    icon: Settings,
    title: "Settings",
    items: [
      "General: Store name, contact email/phone, address",
      "Shipping: Free shipping threshold, standard/express fees",
      "Payment: COD toggle, Razorpay API keys (live/test)",
      "SEO: Meta title, meta description, OG image URL",
      "Tax: GST percentage",
      "Social: Links for Instagram, Facebook, Twitter, YouTube, LinkedIn",
      "Theme: Logo URL, primary/accent color hex pickers",
    ],
  },
];

function Section({ section, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = section.icon;
  return (
    <div className="border border-white/10 bg-white/[0.02]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
            <Icon size={15} className="text-white" />
          </div>
          <span className="font-semibold text-sm">{section.title}</span>
        </div>
        {open ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 space-y-1.5">
          {section.items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-white/60">
              <span className="text-white/20 mt-0.5">&#8226;</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminGuide() {
  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <div className="text-overline text-white/50">Docs</div>
        <h1 className="font-display uppercase font-black text-4xl sm:text-5xl mt-2">Admin Guide</h1>
        <p className="text-white/50 mt-4 text-sm leading-relaxed max-w-2xl">
          Complete reference for managing your GymSword store. Each section covers features, 
          workflows, and best practices for the admin panel.
        </p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s, i) => (
          <Section key={s.title} section={s} defaultOpen={i < 3} />
        ))}
      </div>

      <div className="border border-white/10 p-6 bg-white/[0.02]">
        <h2 className="font-semibold text-sm mb-3">Quick Tips</h2>
        <ul className="space-y-2 text-sm text-white/60">
          <li className="flex items-start gap-2"><Search size={14} className="text-white/30 mt-0.5 shrink-0" /> Use the sidebar collapse button (<strong>top-right</strong> of sidebar) to maximise content area</li>
          <li className="flex items-start gap-2"><Search size={14} className="text-white/30 mt-0.5 shrink-0" /> Business Dashboard loads 9 data sources in parallel — refresh for latest data</li>
          <li className="flex items-start gap-2"><Search size={14} className="text-white/30 mt-0.5 shrink-0" /> Export formats: PDF for reports, Excel for data analysis</li>
          <li className="flex items-start gap-2"><Search size={14} className="text-white/30 mt-0.5 shrink-0" /> Changes to Settings (Shipping, Tax, Payment) reflect immediately on storefront</li>
        </ul>
      </div>
    </div>
  );
}