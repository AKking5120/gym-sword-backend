import LuxuryPage from "@/components/LuxuryPage";

export default function GiftCards() {
  return (
    <LuxuryPage title="Gift Cards" breadcrumbs={[{ to: "/", label: "Home" }, { label: "Gift Cards" }]}>
      <div className="prose-luxury max-w-3xl space-y-10">
        <section>
          <h2 className="text-2xl font-display uppercase font-black mb-4">The Perfect Gift</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            Give the gift of premium athletic style. GymSword gift cards let your loved ones choose exactly what
            they want from our collection.
          </p>
        </section>
        <section className="grid sm:grid-cols-3 gap-4">
          {["₹1,000", "₹2,500", "₹5,000"].map((val) => (
            <div key={val} className="border border-black/15 p-8 text-center hover:border-black transition-all cursor-pointer group">
              <p className="text-3xl font-display font-black group-hover:scale-105 transition-transform">{val}</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-black/40 mt-2">Gift Card</p>
            </div>
          ))}
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">How It Works</h2>
          <ul className="text-[14px] text-black/60 leading-[1.9] space-y-2 list-disc pl-5">
            <li>Choose a gift card value.</li>
            <li>The recipient receives a unique code via email.</li>
            <li>They can apply the code at checkout.</li>
            <li>Gift cards never expire.</li>
          </ul>
        </section>
      </div>
    </LuxuryPage>
  );
}
