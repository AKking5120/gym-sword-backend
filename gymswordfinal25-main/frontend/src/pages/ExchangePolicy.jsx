import LuxuryPage from "@/components/LuxuryPage";

export default function ExchangePolicy() {
  return (
    <LuxuryPage title="Exchange Policy" breadcrumbs={[{ to: "/", label: "Home" }, { label: "Exchange Policy" }]}>
      <div className="prose-luxury max-w-3xl space-y-10">
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Exchange Eligibility</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            You may exchange items within 15 days of delivery for a different size or color of the same product. Items must be unworn, unwashed, with original tags attached.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">How to Exchange</h2>
          <ul className="text-[14px] text-black/60 leading-[1.9] space-y-2 list-disc pl-5">
            <li>Go to My Orders and select the item you wish to exchange.</li>
            <li>Select "Exchange" and choose the new size or color.</li>
            <li>We will arrange a free pickup and ship the replacement item.</li>
            <li>Exchanges are subject to product availability.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Price Differences</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            If the replacement item costs more, you will be charged the difference. If it costs less, the difference will be refunded to your GymSword wallet.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Limited Exchanges</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            Each item can be exchanged once. If the exchanged item also needs a change, you may return it for a refund instead.
          </p>
        </section>
      </div>
    </LuxuryPage>
  );
}
