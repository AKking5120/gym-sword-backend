import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useSite } from "@/context/SiteContext";
import { ADMIN } from "@/constants/testIds";

const DEFAULT = {
  hero_headline: "", hero_subheadline: "", announcement_bar: "",
  coming_soon: false, show_prices: true, enable_purchases: true,
  free_shipping_threshold: 999, standard_shipping_fee: 49, express_shipping_fee: 149,
  enable_cod: true, razorpay_key_id: "", razorpay_key_secret: "",
  default_meta_title: "", default_meta_description: "", default_og_image: "",
  gst_percentage: 18,
  instagram_url: "", facebook_url: "", youtube_url: "", twitter_url: "", pinterest_url: "",
  logo_url: "", primary_color: "#000000", accent_color: "#ffffff",
};

export default function AdminSettings() {
  const { refresh: refreshSite } = useSite();
  const [s, setS] = useState(DEFAULT);
  const [envFlag, setEnvFlag] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    api.get("/admin/settings").then(({ data }) => {
      setS({ ...DEFAULT, ...data });
      setEnvFlag(!!data.coming_soon_env);
    });
  }, []);

  const persist = async (next) => {
    setSaving(true);
    try { await api.patch("/admin/settings", next); refreshSite(); toast.success("Settings saved"); }
    catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const toggle = async (key) => {
    const next = { ...s, [key]: !s[key] };
    if (key === 'coming_soon' && next.coming_soon) next.show_prices = false;
    setS(next);
    await persist({ [key]: next[key], ...(key === 'coming_soon' ? { show_prices: next.show_prices } : {}) });
  };

  const update = (key, value) => setS({ ...s, [key]: value });
  const saveAll = async () => { await persist(s); };

  const tabs = [
    { id: "general", label: "General" },
    { id: "shipping", label: "Shipping" },
    { id: "payment", label: "Payment" },
    { id: "seo", label: "SEO" },
    { id: "tax", label: "Tax" },
    { id: "social", label: "Social" },
    { id: "theme", label: "Theme" },
  ];

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <div className="text-overline text-white/50">Website Settings</div>
        <h1 className="font-display uppercase font-black text-4xl mt-2">All Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-display uppercase tracking-wider transition ${
              activeTab === t.id ? "bg-white text-black" : "text-white/60 hover:text-white border border-white/10"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {saving && <div className="text-overline text-white/50 animate-pulse">Saving…</div>}

      {/* General */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <section className="bg-white/5 border border-white/10 divide-y divide-white/10">
            <ToggleRow title="Coming Soon Mode" desc="Blurs product imagery. Use for pre-launch teaser." value={s.coming_soon} onToggle={() => toggle("coming_soon")}
              rightHint={<span className="text-overline text-white/40">Env default: {envFlag ? "ON" : "OFF"}</span>} />
            <ToggleRow title="Show Prices" desc="When OFF, all product prices are hidden." value={s.show_prices} onToggle={() => toggle("show_prices")} />
            <ToggleRow title="Enable Purchases" desc="When OFF, customers cannot add to bag or check out." value={s.enable_purchases} onToggle={() => toggle("enable_purchases")} />
          </section>

          <section className="bg-white/5 border border-white/10 p-6 space-y-4">
            <div className="text-overline text-white/50">Storefront Copy</div>
            <F label="Hero Headline" value={s.hero_headline} onChange={v => update("hero_headline", v)} />
            <F label="Hero Subheadline" value={s.hero_subheadline} onChange={v => update("hero_subheadline", v)} />
            <F label="Announcement Bar" value={s.announcement_bar} onChange={v => update("announcement_bar", v)} />
          </section>

          <section className="bg-white/5 border border-white/10 p-6">
            <div className="text-overline text-white/50 mb-2">Currency</div>
            <div className="font-display text-2xl">₹ INR · Indian Rupees</div>
          </section>

          <button onClick={saveAll} className="btn-luxury-light">Save All Settings</button>
        </div>
      )}

      {/* Shipping */}
      {activeTab === "shipping" && (
        <div className="space-y-6">
          <section className="bg-white/5 border border-white/10 p-6 space-y-4">
            <div className="text-overline text-white/50">Shipping Configuration</div>
            <F label="Free Shipping Threshold (₹)" type="number" value={s.free_shipping_threshold} onChange={v => update("free_shipping_threshold", parseFloat(v) || 0)} />
            <F label="Standard Shipping Fee (₹)" type="number" value={s.standard_shipping_fee} onChange={v => update("standard_shipping_fee", parseFloat(v) || 0)} />
            <F label="Express Shipping Fee (₹)" type="number" value={s.express_shipping_fee} onChange={v => update("express_shipping_fee", parseFloat(v) || 0)} />
            <p className="text-xs text-white/40">Orders above the free shipping threshold get free standard shipping.</p>
          </section>
          <button onClick={() => persist({
            free_shipping_threshold: s.free_shipping_threshold,
            standard_shipping_fee: s.standard_shipping_fee,
            express_shipping_fee: s.express_shipping_fee,
          })} className="btn-luxury-light">Save Shipping</button>
        </div>
      )}

      {/* Payment */}
      {activeTab === "payment" && (
        <div className="space-y-6">
          <section className="bg-white/5 border border-white/10 divide-y divide-white/10">
            <ToggleRow title="Cash on Delivery" desc="Allow customers to pay with cash on delivery." value={s.enable_cod} onToggle={() => toggle("enable_cod")} />
          </section>

          <section className="bg-white/5 border border-white/10 p-6 space-y-4">
            <div className="text-overline text-white/50">Razorpay Configuration</div>
            <F label="Razorpay Key ID" value={s.razorpay_key_id} onChange={v => update("razorpay_key_id", v)} />
            <F label="Razorpay Key Secret" value={s.razorpay_key_secret} onChange={v => update("razorpay_key_secret", v)} type="password" />
            <p className="text-xs text-white/40">Get these from <span className="text-white/70">dashboard.razorpay.com</span></p>
          </section>
          <button onClick={() => persist({
            enable_cod: s.enable_cod,
            razorpay_key_id: s.razorpay_key_id,
            razorpay_key_secret: s.razorpay_key_secret,
          })} className="btn-luxury-light">Save Payment</button>
        </div>
      )}

      {/* SEO */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          <section className="bg-white/5 border border-white/10 p-6 space-y-4">
            <div className="text-overline text-white/50">SEO Management</div>
            <F label="Default Meta Title" value={s.default_meta_title} onChange={v => update("default_meta_title", v)} />
            <F label="Default Meta Description" value={s.default_meta_description} onChange={v => update("default_meta_description", v)} big />
            <F label="Default OG Image URL" value={s.default_og_image} onChange={v => update("default_og_image", v)} />
            {s.default_og_image && (
              <img src={s.default_og_image} alt="OG preview" className="h-32 border border-white/10 object-cover" />
            )}
          </section>
          <button onClick={() => persist({
            default_meta_title: s.default_meta_title,
            default_meta_description: s.default_meta_description,
            default_og_image: s.default_og_image,
          })} className="btn-luxury-light">Save SEO</button>
        </div>
      )}

      {/* Tax */}
      {activeTab === "tax" && (
        <div className="space-y-6">
          <section className="bg-white/5 border border-white/10 p-6 space-y-4">
            <div className="text-overline text-white/50">Tax Settings</div>
            <F label="GST Percentage (%)" type="number" value={s.gst_percentage} onChange={v => update("gst_percentage", parseFloat(v) || 0)} />
            <p className="text-xs text-white/40">GST is applied to all orders automatically.</p>
          </section>
          <button onClick={() => persist({ gst_percentage: s.gst_percentage })} className="btn-luxury-light">Save Tax</button>
        </div>
      )}

      {/* Social */}
      {activeTab === "social" && (
        <div className="space-y-6">
          <section className="bg-white/5 border border-white/10 p-6 space-y-4">
            <div className="text-overline text-white/50">Social Links</div>
            <F label="Instagram URL" value={s.instagram_url} onChange={v => update("instagram_url", v)} />
            <F label="Facebook URL" value={s.facebook_url} onChange={v => update("facebook_url", v)} />
            <F label="YouTube URL" value={s.youtube_url} onChange={v => update("youtube_url", v)} />
            <F label="X (Twitter) URL" value={s.twitter_url} onChange={v => update("twitter_url", v)} />
            <F label="Pinterest URL" value={s.pinterest_url} onChange={v => update("pinterest_url", v)} />
          </section>
          <button onClick={() => persist({
            instagram_url: s.instagram_url, facebook_url: s.facebook_url,
            youtube_url: s.youtube_url, twitter_url: s.twitter_url, pinterest_url: s.pinterest_url,
          })} className="btn-luxury-light">Save Social Links</button>
        </div>
      )}

      {/* Theme */}
      {activeTab === "theme" && (
        <div className="space-y-6">
          <section className="bg-white/5 border border-white/10 p-6 space-y-4">
            <div className="text-overline text-white/50">Logo</div>
            <F label="Logo URL" value={s.logo_url} onChange={v => update("logo_url", v)} />
            {s.logo_url && (
              <img src={s.logo_url} alt="Logo preview" className="h-16 border border-white/10 object-contain bg-white" />
            )}
          </section>

          <section className="bg-white/5 border border-white/10 p-6 space-y-4">
            <div className="text-overline text-white/50">Theme Colors</div>
            <div className="flex gap-6">
              <div>
                <label className="text-overline text-white/50 mb-2 block">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={s.primary_color} onChange={e => update("primary_color", e.target.value)}
                    className="w-12 h-12 border border-white/10 cursor-pointer bg-transparent" />
                  <span className="text-sm text-white/70">{s.primary_color}</span>
                </div>
              </div>
              <div>
                <label className="text-overline text-white/50 mb-2 block">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={s.accent_color} onChange={e => update("accent_color", e.target.value)}
                    className="w-12 h-12 border border-white/10 cursor-pointer bg-transparent" />
                  <span className="text-sm text-white/70">{s.accent_color}</span>
                </div>
              </div>
            </div>
          </section>

          <button onClick={() => persist({
            logo_url: s.logo_url, primary_color: s.primary_color, accent_color: s.accent_color,
          })} className="btn-luxury-light">Save Theme</button>
        </div>
      )}
    </div>
  );
}

function ToggleRow({ title, desc, value, onToggle, rightHint }) {
  return (
    <div className="flex items-center justify-between gap-4 p-6">
      <div className="flex-1">
        <div className="font-display uppercase text-base">{title}</div>
        <div className="text-sm text-white/60 mt-1">{desc}</div>
        {rightHint && <div className="mt-2">{rightHint}</div>}
      </div>
      <button onClick={onToggle} aria-pressed={value}
        className={`relative w-14 h-7 flex-shrink-0 border transition ${value ? "bg-white border-white" : "bg-transparent border-white/40"}`}>
        <span className={`absolute top-0.5 w-5 h-5 transition-all ${value ? "left-7 bg-black" : "left-0.5 bg-white"}`} />
      </button>
      <div className="w-20 text-right text-overline text-white/70">{value ? "ON" : "OFF"}</div>
    </div>
  );
}

function F({ label, value, onChange, type = "text", big }) {
  const Tag = big ? "textarea" : "input";
  const cls = "w-full bg-transparent border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white text-white";
  return (
    <label className="block">
      <div className="text-overline text-white/50 mb-2">{label}</div>
      <Tag value={value} onChange={e => onChange(e.target.value)}
        className={big ? `${cls} h-24 resize-none pt-3` : cls} type={type} />
    </label>
  );
}
