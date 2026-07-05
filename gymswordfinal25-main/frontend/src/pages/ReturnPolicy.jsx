import LuxuryPage from "@/components/LuxuryPage";

export default function ReturnPolicy() {
  return (
    <LuxuryPage title="Return Policy" breadcrumbs={[{ to: "/", label: "Home" }, { label: "Return Policy" }]}>
      <div className="prose-luxury max-w-3xl space-y-10">
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Return Eligibility</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            You may return items within 15 days of delivery. Items must be unworn, unwashed, with all original tags attached and in their original packaging.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">How to Initiate a Return</h2>
          <ul className="text-[14px] text-black/60 leading-[1.9] space-y-2 list-disc pl-5">
            <li>Go to My Orders and select the order containing the item you wish to return.</li>
            <li>Click "Cancel" or "Return" and select your reason.</li>
            <li>We will arrange a free pickup from your address within 48 hours.</li>
            <li>Once received and inspected, your refund will be processed.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Non-Returnable Items</h2>
          <ul className="text-[14px] text-black/60 leading-[1.9] space-y-2 list-disc pl-5">
            <li>Items worn, washed, or altered from their original condition</li>
            <li>Items without original tags or packaging</li>
            <li>Items purchased during final sale events</li>
            <li>Gift cards</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Refund Timeline</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            Wallet refunds are instant. Bank refunds are processed within 5-7 business days after the returned item is received and inspected at our warehouse.
          </p>
        </section>
      </div>
    </LuxuryPage>
  );
}
