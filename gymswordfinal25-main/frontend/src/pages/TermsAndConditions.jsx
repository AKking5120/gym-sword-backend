import LuxuryPage from "@/components/LuxuryPage";

export default function TermsAndConditions() {
  return (
    <LuxuryPage title="Terms & Conditions" breadcrumbs={[{ to: "/", label: "Home" }, { label: "Terms & Conditions" }]}>
      <div className="prose-luxury max-w-3xl space-y-10">
        <p className="text-[12px] text-black/40">Last updated: June 2025</p>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Acceptance of Terms</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            By accessing or using GymSword, you agree to be bound by these Terms & Conditions. If you do not agree,
            please do not use our website.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Products & Pricing</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            All product descriptions, images, and prices are as accurate as possible. We reserve the right to modify
            prices without notice. In case of a pricing error, we may cancel the order and issue a full refund.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Orders</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order.
            Orders are confirmed only after payment verification and order confirmation email.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Intellectual Property</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            All content on this website, including logos, images, text, and designs, is the property of GymSword and
            protected by intellectual property laws.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Governing Law</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in India.
          </p>
        </section>
      </div>
    </LuxuryPage>
  );
}
