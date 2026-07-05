import { useState } from "react";
import { ChevronDown } from "lucide-react";
import LuxuryPage from "@/components/LuxuryPage";

const FAQS = [
  { q: "How long does shipping take?", a: "Standard shipping takes 5-7 business days. Express shipping delivers within 2-3 business days across India." },
  { q: "How do I track my order?", a: "Once your order ships, you'll receive a tracking link via email and SMS. You can also track your order from My Orders in your account." },
  { q: "What is your return policy?", a: "We offer a 15-day return policy. Items must be unworn, unwashed, with original tags attached. initiates from the date of delivery." },
  { q: "How do I initiate a return?", a: "Go to My Orders, select the order, and click 'Return Item'. Choose your reason and we'll arrange a free pickup." },
  { q: "Can I exchange an item?", a: "Yes, exchanges are available for different sizes or colors within 15 days of delivery, subject to availability." },
  { q: "When will I receive my refund?", a: "Refunds are processed within 5-7 business days after we receive and inspect the returned item. Wallet refunds are instant." },
  { q: "Do you offer cash on delivery?", a: "Yes, COD is available for orders under ₹5,000. A nominal fee may apply." },
  { q: "How do I use a coupon code?", a: "Enter your coupon code at checkout in the 'Apply Coupon' field. The discount will be applied to your order total." },
  { q: "What sizes do you offer?", a: "We offer sizes from XS to 3XL. Please refer to our Size Guide for detailed measurements." },
  { q: "How do I contact support?", a: "Reach us at support@gymsword.com or call +91 87997 56074, Mon-Sat 10 AM - 7 PM." },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <LuxuryPage title="Frequently Asked Questions" breadcrumbs={[{ to: "/", label: "Home" }, { label: "FAQs" }]}>
      <div className="max-w-3xl">
        <div className="divide-y divide-black/10 border border-black/10">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-black/[0.02] transition-colors"
              >
                <span className="text-[14px] font-semibold text-black pr-4">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-black/40 flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-40" : "max-h-0"}`}>
                <p className="px-6 pb-5 text-[13px] text-black/60 leading-[1.8]">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LuxuryPage>
  );
}
