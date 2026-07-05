import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, count: 0 });
  const [loading, setLoading] = useState(false);

  // The api interceptor unwraps the envelope so response.data is already the
  // inner payload. For GET /cart the backend returns { success, data: [...], total }
  // but the interceptor only hoists body.data, so `total` is lost.
  // We receive the raw cart array and compute subtotal ourselves.
  const transformCart = (items) => {
    const safeItems = Array.isArray(items) ? items : [];
    const mapped = safeItems.map((item) => ({
      id: item.id,
      product_id: item.product_id,
      qty: item.quantity,
      size: item.size || null,
      color: item.color || null,
      line_total: (item.products?.sale_price || item.products?.price || 0) * item.quantity,
      product: {
        name: item.products?.name || "",
        images: item.products?.image_url ? [{ url: item.products.image_url }] : [],
        price: item.products?.price || 0,
        sale_price: item.products?.sale_price || null,
      },
    }));
    const subtotal = mapped.reduce((s, i) => s + i.line_total, 0);
    return { items: mapped, subtotal, count: mapped.length };
  };

  const refresh = useCallback(async () => {
    if (!user || user === false) {
      setCart({ items: [], subtotal: 0, count: 0 });
      return;
    }
    try {
      const { data } = await api.get("/cart");
      // data is the unwrapped array directly (interceptor hoisted body.data)
      setCart(transformCart(data));
    } catch {}
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = async (productId, qty = 1, size = null, color = null) => {
    setLoading(true);
    try {
      await api.post("/cart", { product_id: productId, quantity: qty });
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const update = async (itemId, qty) => {
    if (qty < 1) {
      await api.delete(`/cart/${itemId}`);
    } else {
      await api.put(`/cart/${itemId}`, { quantity: qty });
    }
    await refresh();
  };

  const remove = async (itemId) => {
    await api.delete(`/cart/${itemId}`);
    await refresh();
  };

  const clear = async () => {
    await api.delete("/cart/clear");
    await refresh();
  };

  return (
    <CartContext.Provider value={{ cart, loading, add, update, remove, clear, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
