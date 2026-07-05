import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";


export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;
  const [animPhase, setAnimPhase] = useState(0);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimPhase(1), 300);
    const t2 = setTimeout(() => setAnimPhase(2), 800);
    const t3 = setTimeout(() => setAnimPhase(3), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    if (orderId) {
      api.get(`/orders/${orderId}`).then(({ data }) => setOrder(data)).catch(() => {});
    }
  }, [orderId]);

  const orderNumber = order?.order_number || (orderId ? `GS-${String(orderId).padStart(6, "0")}` : "GS-XXXXXX");

  return (
    <main className="flex-1">
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
        <div className={`text-center transition-all duration-700 ${animPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

          {/* Animated Checkmark */}
          <div className="relative mx-auto mb-10 w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Outer circle */}
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="#000"
                strokeWidth="2"
                className={`transition-all duration-700 ${animPhase >= 1 ? "opacity-100" : "opacity-0"}`}
                strokeDasharray="283"
                strokeDashoffset={animPhase >= 1 ? 0 : 283}
                style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
              />
              {/* Checkmark */}
              <path
                d="M30 52 L44 66 L70 38"
                fill="none"
                stroke="#000"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-all duration-500 ${animPhase >= 2 ? "opacity-100" : "opacity-0"}`}
                strokeDasharray="60"
                strokeDashoffset={animPhase >= 2 ? 0 : 60}
                style={{ transition: "stroke-dashoffset 0.5s ease-out 0.1s" }}
              />
            </svg>
            {/* Loading spinner behind */}
            {animPhase < 2 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-black/15 border-t-black rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Content Card */}
          <div className={`max-w-md mx-auto transition-all duration-700 delay-300 ${animPhase >= 3 ? "opacity-100" : "opacity-0"}`}>
            <h1 className="font-display uppercase font-black text-3xl sm:text-4xl mb-3">Order Confirmed</h1>
            <p className="text-sm text-black/50 mb-8">
              Thank you for shopping with GymSword.<br />
              Your order has been successfully placed.
            </p>

            <div className="bg-[#f8f8f8] border border-black/10 p-6 mb-8">
              <div className="space-y-3 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-black/50">Order ID</span>
                  <span className="font-bold text-black">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">Estimated Delivery</span>
                  <span className="font-bold text-black">3-5 Business Days</span>
                </div>
                {order?.total && (
                  <div className="flex justify-between">
                    <span className="text-black/50">Total Paid</span>
                    <span className="font-bold text-black">₹{order.total.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={`/track-order/${orderId || ""}`}
                className="bg-black text-white text-[11px] font-bold uppercase tracking-[2px] px-8 py-4 hover:bg-black/80 transition-all text-center"
              >
                Track Order
              </Link>
              <Link
                to="/shop"
                className="border border-black/20 text-black text-[11px] font-bold uppercase tracking-[2px] px-8 py-4 hover:bg-black/5 transition-all text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
