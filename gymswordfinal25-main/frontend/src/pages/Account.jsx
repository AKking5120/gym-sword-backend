import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { User, MapPin, Package, Heart, Settings,   Wallet,  Gift,   LogOut } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";
import { ACCOUNT } from "@/constants/testIds";

const NAV = [
  { to: "/account", label: "Overview", icon: User, end: true },
  { to: "/my-orders", label: "Orders", icon: Package },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/settings", label: "Settings", icon: Settings },
    { to: "/account/wallet", label: "Wallet", icon: Wallet },
  { to: "/account/referrals", label: "Referrals", icon: Gift },
];

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

    const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  return (
    <>
      <div data-testid={ACCOUNT.dashboard} className="max-w-[1600px] mx-auto px-6 md:px-12 py-12 md:py-20 grid lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-3">
  <div className="lg:sticky lg:top-24 space-y-6">
          <div>
            <div className="text-overline text-black/50">Account</div>
            <div className="font-display uppercase text-2xl font-black mt-1">{user.name || user.email}</div>
            <div className="text-xs text-black/50 mt-1">{user.email}</div>
            <div className="text-xs text-black/40 mt-1 font-mono">Unique ID: {user.public_id || user.id}</div>
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto scrollbar-hide">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm border-l-2 transition ${
                    isActive ? "border-black bg-black/5 font-medium" : "border-transparent hover:bg-black/5"
                  }`
                }
              >
                <n.icon size={16} />
                {n.label}
              </NavLink>
            ))}
            <button
              onClick={async () => { await logout(); navigate("/"); }}
              className="flex items-center gap-3 px-4 py-3 text-sm border-l-2 border-transparent hover:bg-black/5"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </nav>
            </div>

        </aside>
        <section className="lg:col-span-9">
          <Outlet />
        </section>
      </div>
    </>
  );
}

export function AccountOverview() {
  const { user } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders").then(({ data }) => setOrders(data || []));
  }, []);

  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div>
      <h1 className="font-display uppercase font-black text-4xl sm:text-5xl mb-2">Welcome back</h1>
      <p className="text-black/60">Glad to have you back, {user.name?.split(" ")[0] || "athlete"}.</p>
      <div className="grid sm:grid-cols-3 gap-4 mt-10">
        <Stat label="Total Orders" value={orders.length} />
        <Stat label="Wishlist" value={wishlistItems.length} />
        <Stat label="Lifetime Spend" value={formatPrice(totalSpent)} />
      </div>
      <h2 className="font-display uppercase font-black text-2xl mt-16 mb-6">Recent Orders</h2>
      {orders.length === 0 ? (
        <div className="text-black/50 text-sm">No orders yet.</div>
      ) : (
        <div className="space-y-3">
          {orders.slice(0, 5).map((o) => (
            <NavLink to={`/order/${o.id}`} key={o.id} className="block border border-black/10 p-4 hover:bg-black/5 transition">
              <div className="flex justify-between text-sm">
                <div>
                  <div className="text-overline">{o.order_number}</div>
                  <div className="text-xs text-black/50 mt-1">{new Date(o.created_at).toLocaleString()} · {o.items.length} items</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatPrice(o.total)}</div>
                  <div className="text-overline text-black/60 mt-1">{o.status}</div>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-[#F5F5F7] p-6">
      <div className="text-overline text-black/60">{label}</div>
      <div className="font-display text-3xl font-black mt-2">{value}</div>
    </div>
  );
}

export function AccountOrders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    api.get("/orders").then(({ data }) => setOrders(data || []));
  }, []);
  return (
    <div data-testid={ACCOUNT.orders}>
      <h1 className="font-display uppercase font-black text-4xl mb-8">Orders</h1>
      {orders.length === 0 ? (
        <div className="text-black/50">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <NavLink to={`/order/${o.id}`} key={o.id} className="block border border-black/10 p-5 hover:bg-black/5 transition">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="text-overline">{o.order_number}</div>
                  <div className="text-xs text-black/50 mt-1">{new Date(o.created_at).toLocaleString()}</div>
                  <div className="text-sm mt-2">{o.items.length} items · {o.status}</div>
                </div>
                <div className="font-display text-xl">${o.total.toFixed(2)}</div>
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function AccountAddresses() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    full_name: "", phone: "", line1: "", line2: "", city: "", state: "", postal_code: "", country: "United States", is_default: false,
  });
  const load = () => api.get("/auth/addresses").then(({ data }) => setList(data || []));
  useEffect(() => { load(); }, []);
  const save = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/addresses", form);
      setForm({ ...form, full_name: "", line1: "", line2: "", city: "", state: "", postal_code: "" });
      load();
      toast.success("Address saved");
    } catch { toast.error("Failed to save"); }
  };
  return (
    <div data-testid={ACCOUNT.addresses}>
      <h1 className="font-display uppercase font-black text-4xl mb-8">Addresses</h1>
      <div className="space-y-4 mb-12">
        {list.map((a) => (
          <div key={a.id} className="border border-black/10 p-5 flex justify-between gap-4">
            <div className="text-sm">
              <div className="font-medium">{a.full_name} {a.is_default && <span className="text-overline text-black/50 ml-2">Default</span>}</div>
              <div className="text-black/60 mt-1">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postal_code}</div>
              <div className="text-black/60">{a.country} · {a.phone}</div>
            </div>
            <button onClick={async () => { await api.delete(`/auth/addresses/${a.id}`); load(); }} className="text-overline luxury-link self-start">Delete</button>
          </div>
        ))}
      </div>
      <form onSubmit={save} className="border border-black/10 p-6 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 text-overline">Add Address</div>
        <Field label="Full Name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
        <Field label="Address Line 1" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} className="sm:col-span-2" required />
        <Field label="Address Line 2" value={form.line2} onChange={(v) => setForm({ ...form, line2: v })} className="sm:col-span-2" />
        <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
        <Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} required />
        <Field label="Postal Code" value={form.postal_code} onChange={(v) => setForm({ ...form, postal_code: v })} required />
        <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} required />
        <label className="sm:col-span-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
          Set as default
        </label>
        <button className="btn-luxury-primary sm:col-span-2">Save Address</button>
      </form>
    </div>
  );
}

export function AccountSettings() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [pw, setPw] = useState({ current_password: "", new_password: "", confirm_new_password: "" });

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/profile", { name, phone });
      await refresh();
      toast.success("Profile updated");
    } catch { toast.error("Failed to update"); }
  };
  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/change-password", pw);
      setPw({ current_password: "", new_password: "", confirm_new_password: "" });
      toast.success("Password changed");
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  return (
    <div data-testid={ACCOUNT.settings} className="space-y-12">
      <div>
        <h1 className="font-display uppercase font-black text-4xl mb-8">Profile</h1>
        <form onSubmit={saveProfile} className="grid sm:grid-cols-2 gap-4 max-w-2xl">
          <Field label="Full Name" value={name} onChange={setName} />
          <Field label="Phone" value={phone} onChange={setPhone} />
          <div className="sm:col-span-2"><button className="btn-luxury-primary">Save Profile</button></div>
        </form>
      </div>
      <div>
        <h2 className="font-display uppercase font-black text-3xl mb-6">Change Password</h2>
        <form onSubmit={changePassword} className="grid sm:grid-cols-2 gap-4 max-w-2xl">
          <Field label="Current Password" type="password" value={pw.current_password} onChange={(v) => setPw({ ...pw, current_password: v })} />
          <Field label="New Password" type="password" value={pw.new_password} onChange={(v) => setPw({ ...pw, new_password: v })} />
          <Field label="Confirm New Password" type="password" value={pw.confirm_new_password} onChange={(v) => setPw({ ...pw, confirm_new_password: v })} />
          <div className="sm:col-span-2"><button className="btn-luxury-primary">Update Password</button></div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, className = "", type = "text", required = false }) {
  return (
    <label className={`block ${className}`}>
      <div className="text-overline text-black/60 mb-2">{label}</div>
      <input
        type={type}
        required={required}
        className="w-full bg-white border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
