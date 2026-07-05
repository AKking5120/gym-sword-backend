import LuxuryPage from "@/components/LuxuryPage";

export default function Affiliate() {
  return (
    <LuxuryPage title="Affiliate Program" breadcrumbs={[{ to: "/", label: "Home" }, { label: "Affiliate Program" }]}>
      <div className="prose-luxury max-w-3xl space-y-10">
        <section>
          <h2 className="text-2xl font-display uppercase font-black mb-4">Earn With GymSword</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            Join our affiliate program and earn commission on every sale you drive. Whether you're a fitness
            influencer, blogger, or content creator, GymSword rewards your influence.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">How It Works</h2>
          <ul className="text-[14px] text-black/60 leading-[1.9] space-y-2 list-disc pl-5">
            <li>Sign up and get your unique referral link.</li>
            <li>Share your link on social media, blogs, or YouTube.</li>
            <li>Earn up to 10% commission on every sale through your link.</li>
            <li>Get paid monthly via bank transfer or wallet credit.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Benefits</h2>
          <ul className="text-[14px] text-black/60 leading-[1.9] space-y-2 list-disc pl-5">
            <li>Up to 10% commission on all sales</li>
            <li>30-day cookie duration</li>
            <li>Exclusive discounts for your audience</li>
            <li>Free products for top affiliates</li>
            <li>Dedicated affiliate support</li>
          </ul>
        </section>
      </div>
    </LuxuryPage>
  );
}
