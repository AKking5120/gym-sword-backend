import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const SiteContext = createContext(null);

const DEFAULTS = {
  coming_soon: false,
  show_prices: true,
  enable_purchases: true,
  brand: "GymSword",
  tagline: "Forge Your Strength.",
  currency: "INR",
  currency_symbol: "₹",
  announcement: "",
  support_email: "support@gymsword.com",
};

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  const refresh = () => {
    api
      .get("/settings/public")
      .then(({ data }) => setSettings({ ...DEFAULTS, ...data }))
      .catch(() => {});
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60_000); // pick up admin toggles within 60s
    return () => clearInterval(id);
  }, []);

  return <SiteContext.Provider value={{ settings, refresh }}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);
