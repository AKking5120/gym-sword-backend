import { Check } from "lucide-react";

const STEPS = [
  { label: "Cart", path: "/checkout" },
  { label: "Address", path: "/checkout/address" },
  { label: "Payment", path: "/checkout/payment" },
  { label: "Summary", path: "/checkout/summary" },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10 max-w-2xl mx-auto">
      {STEPS.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;

        return (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 ${
                  isDone
                    ? "bg-black border-black text-white"
                    : isActive
                    ? "border-black text-black bg-white"
                    : "border-black/20 text-black/30 bg-white"
                }`}
              >
                {isDone ? <Check size={12} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={`text-[11px] font-bold uppercase tracking-[0.1em] whitespace-nowrap hidden sm:block ${
                  isActive ? "text-black" : isDone ? "text-black" : "text-black/30"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-[1px] mx-3 transition-all duration-300 ${
                  isDone ? "bg-black" : "bg-black/15"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
