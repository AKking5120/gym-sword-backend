import LuxuryPage from "@/components/LuxuryPage";

export default function Membership() {
  return (
    <LuxuryPage title="Membership" breadcrumbs={[{ to: "/", label: "Home" }, { label: "Membership" }]}>
      <div className="prose-luxury max-w-3xl space-y-10">
        <section>
          <h2 className="text-2xl font-display uppercase font-black mb-4">GymSword Elite</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            Join GymSword Elite and unlock exclusive benefits, early access to new drops, and member-only pricing.
          </p>
        </section>

        <section className="grid sm:grid-cols-2 gap-6">
          <div className="border border-black/15 p-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 mb-3">Standard</p>
            <p className="text-3xl font-display font-black mb-4">Free</p>
            <ul className="text-[13px] text-black/60 space-y-2">
              <li>✓ Basic member pricing</li>
              <li>✓ Birthday reward</li>
              <li>✓ Early sale access</li>
              <li>✓ Free shipping above ₹5,000</li>
            </ul>
          </div>
          <div className="border-2 border-black p-8 relative">
            <div className="absolute -top-3 right-4 bg-black text-white text-[9px] uppercase tracking-[0.15em] font-bold px-3 py-1">Premium</div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 mb-3">Elite</p>
            <p className="text-3xl font-display font-black mb-4">₹999<span className="text-sm font-normal text-black/40">/year</span></p>
            <ul className="text-[13px] text-black/60 space-y-2">
              <li>✓ All Standard benefits</li>
              <li>✓ 15% off all orders</li>
              <li>✓ Free express shipping</li>
              <li>✓ Priority customer support</li>
              <li>✓ Exclusive drops access</li>
              <li>✓ Double wallet rewards</li>
            </ul>
          </div>
        </section>
      </div>
    </LuxuryPage>
  );
}
