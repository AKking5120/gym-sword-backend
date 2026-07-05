import LuxuryPage from "@/components/LuxuryPage";

export default function RefundPolicy() {
  return (
    <LuxuryPage title="Refund Policy" breadcrumbs={[{ to: "/", label: "Home" }, { label: "Refund Policy" }]}>
      <div className="prose-luxury max-w-3xl space-y-10">
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Refund Methods</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            Refunds are issued to the original payment method. For COD orders, refunds are credited to your GymSword wallet or via bank transfer.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Wallet Refunds</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            Wallet refunds are processed instantly once the return is approved. Wallet balance can be used for any future purchase on GymSword.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Bank Refunds</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            Bank refunds take 5-7 business days to reflect in your account after the return is processed. You will receive an email confirmation once the refund is initiated.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Partial Refunds</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            In some cases, partial refunds may be issued if items show signs of use or are returned without original tags.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Cancelled Orders</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            If you cancel an order before it ships, a full refund will be issued to your original payment method within 3-5 business days.
          </p>
        </section>
      </div>
    </LuxuryPage>
  );
}
