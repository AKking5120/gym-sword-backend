import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!user || user === false) {
      setItems([]);
      return;
    }
    try {
      const { data } = await api.get("/products/user/wishlist");
      // The api interceptor already unwraps the envelope, so `data` is the
      // wishlist array directly — NOT { data: [...] }. Use it as-is.
      setItems(Array.isArray(data) ? data : []);
    } catch {}
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async (productId) => {
    await api.post(`/products/${productId}/wishlist`);
    await refresh();
  };

  const has = (productId) => !!items.find((i) => i.product_id === productId);

  return (
    <WishlistContext.Provider value={{ items, toggle, has, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
