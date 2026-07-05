import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, CreditCard, Shield, Truck, Wallet, Landmark } from "lucide-react";
import { toast } from "sonner";

import StepIndicator from "@/components/StepIndicator";

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", icon: Truck, desc: "Pay when you receive" },
  { id: "razorpay", label: "Razorpay", icon: CreditCard, desc: "Credit / Debit / UPI / Net Banking" },
];

export default function CheckoutPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const prev = location.state || {};
  const [method, setMethod] = useState("cod");

  const handleContinue = () => {
    if (!prev.addressId) {
      toast.error("Please select an address first");
      navigate("/checkout/address");
      return;
    }
    navigate("/checkout/summary", { state: { ...prev, paymentMethod: method } });
  };

  return (
    <main className="flex-1">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 py-8 md:py-12">
        <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-black/40 mb-6">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={9} />
          <Link to="/checkout" className="hover:text-black transition-colors">Bag</Link>
          <ChevronRight size={9} />
          <Link to="/checkout/address" className="hover:text-black transition-colors">Address</Link>
          <ChevronRight size={9} />
          <span className="text-black font-semibold">Payment</span>
        </nav>

        <StepIndicator currentStep={2} />

        <div className="max-w-3xl mx-auto">
          <h2 className="text-[13px] uppercase tracking-[0.15em] font-bold mb-6">Payment Method</h2>

          <div className="space-y-3">
            {PAYMENT_METHODS.map((pm) => {
              const Icon = pm.icon;
              const selected = method === pm.id;
              return (
                <button
                  key={pm.id}
                  onClick={() => setMethod(pm.id)}
                  className={`w-full p-5 border text-left transition-all duration-200 flex items-center gap-4 ${
                    selected
                      ? "border-black bg-[#f8f8f8]"
                      : "border-black/15 hover:border-black/40 bg-white"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selected ? "border-black bg-black" : "border-black/30"
                  }`}>
                    {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <Icon size={20} className={selected ? "text-black" : "text-black/30"} />
                  <div>
                    <div className="text-[13px] font-bold text-black">{pm.label}</div>
                    <div className="text-[11px] text-black/50 mt-0.5">{pm.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {method === "razorpay" && (
            <div className="mt-6 p-5 bg-[#f8f8f8] border border-black/10">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className="text-black/40" />
                <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-black/60">Secure Payment</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["Credit Card", "Debit Card", "UPI"].map((t) => (
                  <div key={t} className="bg-white border border-black/10 px-3 py-2 text-center text-[11px] font-semibold text-black/60">
                    {t}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-black/40">
                You will be redirected to Razorpay's secure payment page to complete your transaction.
              </p>
            </div>
          )}

          <div className="mt-8">
            <button onClick={handleContinue}
              className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-4 hover:bg-black/80 transition-all">
              Review Order
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
