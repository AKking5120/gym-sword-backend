import { useEffect, useState } from "react";
import { useParams, useLocation, Link, useSearchParams } from "react-router-dom";
import { Check, Package, Truck, Home as HomeIcon } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/currency";

import { CHECKOUT } from "@/constants/testIds";

const STAGES = ["confirmed", "processing", "shipped", "delivered"];

export default function Order() {
  const { id } = useParams();
  const location = useLocation();
  const [params] = useSearchParams();
  const stripeReturned = params.get("stripe") === "success";
  const showSuccess = location.state?.success || stripeReturned;
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const endpoint = stripeReturned ? `/orders/verify-stripe/${id}` : `/orders/${id}`;
    api.get(endpoint).then(({ data }) => setOrder(data));
  }, [id, stripeReturned]);

  if (!order) return <><div className="min-h-[60vh] flex items-center justify-center text-overline">Loading…</div></>;

  const stageIdx = STAGES.indexOf(order.status);

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-12 md:py-20">
        {showSuccess && (
          <div className="bg-black text-white p-8 mb-12 flex items-center gap-4">
            <Check size={32} />
            <div>
              <div className="font-display text-2xl uppercase">Order Confirmed</div>
              <div className="text-white/70 text-sm mt-1">A confirmation has been sent to {order.user_email}.</div>
            </div>
          </div>
        )}
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="text-overline text-black/50">Order</div>
              <h1 className="font-display uppercase font-black text-3xl sm:text-5xl mt-2" data-testid={CHECKOUT.successId}>
                {order.order_number}
              </h1>
              <div className="text-sm text-black/60 mt-2">Placed {new Date(order.created_at).toLocaleString()}</div>
            </section>

            <section>
              <div className="text-overline mb-6">Tracking</div>
              <div className="grid grid-cols-4 gap-2">
                {STAGES.map((s, i) => (
                  <div key={s} className="text-center">
                    <div className={`mx-auto w-12 h-12 flex items-center justify-center border ${i <= stageIdx ? "bg-black text-white border-black" : "border-black/20 text-black/40"}`}>
                      {i === 0 ? <Check size={18} /> : i === 1 ? <Package size={18} /> : i === 2 ? <Truck size={18} /> : <HomeIcon size={18} />}
                    </div>
                    <div className={`mt-3 text-overline ${i <= stageIdx ? "text-black" : "text-black/40"}`}>{s}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="text-overline mb-6">Items</div>
              <div className="space-y-4">
                {order.items.map((it, i) => (
                  <div key={i} className="flex gap-4 border-b border-black/10 pb-4">
                    {it.image && (
                      <div className="w-20 aspect-[4/5] bg-[#F5F5F7] overflow-hidden">
                        <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-black/50">Qty {it.qty}{it.size ? ` · ${it.size}` : ""}{it.color ? ` · ${it.color}` : ""}</div>
                    </div>
                    <div className="font-semibold">{formatPrice(it.price * it.qty)}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="text-overline mb-3">Shipping Address</div>
              <div className="text-sm text-black/70 leading-relaxed">
                {order.address.full_name}<br />
                {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
                {order.address.city}, {order.address.state} {order.address.postal_code}<br />
                {order.address.country}
              </div>
            </section>
          </div>

          <aside className="bg-[#F5F5F7] p-8 self-start space-y-3 text-sm">
            <div className="text-overline mb-4">Summary</div>
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-black/60"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between text-black/60"><span>Shipping</span><span>{order.shipping ? formatPrice(order.shipping) : "Free"}</span></div>
            <div className="flex justify-between text-black/60"><span>GST</span><span>{formatPrice(order.tax)}</span></div>
            <div className="border-t border-black/20 pt-3 flex justify-between font-display text-lg"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            <Link to="/shop" className="btn-luxury-primary w-full mt-6">Continue Shopping</Link>
            <Link to="/my-orders" className="block text-center mt-3 luxury-link text-overline">All Orders</Link>
          </aside>
        </div>
      </div>
    </>
  );
}
