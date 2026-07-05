import LuxuryPage from "@/components/LuxuryPage";

export default function ShippingPolicy() {
  return (
    <LuxuryPage title="Shipping Policy" breadcrumbs={[{ to: "/", label: "Home" }, { label: "Shipping Policy" }]}>
      <div className="prose-luxury max-w-3xl space-y-10">
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Shipping Overview</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            GymSword ships across India. All orders are processed within 1-2 business days. You will receive a confirmation email with tracking details once your order has been dispatched.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Standard Shipping</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            Free standard shipping on all orders above ₹5,000. For orders below ₹5,000, a flat shipping fee of ₹499 applies. Estimated delivery: 5-7 business days.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Express Shipping</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            Express shipping is available at ₹999. Estimated delivery: 2-3 business days. Express shipping is available in metro cities and major urban areas.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Order Tracking</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            Once your order is shipped, you will receive an SMS and email with your tracking number. You can track your order from the Track Order page or through My Orders in your account.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Cash on Delivery</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            COD is available for orders under ₹5,000. A verification call may be placed before dispatching COD orders.
          </p>
        </section>
      </div>
    </LuxuryPage>
  );
}
