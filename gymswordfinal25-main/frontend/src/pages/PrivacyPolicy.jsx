import LuxuryPage from "@/components/LuxuryPage";

export default function PrivacyPolicy() {
  return (
    <LuxuryPage title="Privacy Policy" breadcrumbs={[{ to: "/", label: "Home" }, { label: "Privacy Policy" }]}>
      <div className="prose-luxury max-w-3xl space-y-10">
        <p className="text-[12px] text-black/40">Last updated: June 2025</p>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Information We Collect</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            We collect information you provide directly: name, email, phone number, shipping address, and payment information.
            We also collect usage data including IP address, browser type, and pages visited.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">How We Use Your Information</h2>
          <ul className="text-[14px] text-black/60 leading-[1.9] space-y-2 list-disc pl-5">
            <li>To process and fulfill your orders</li>
            <li>To send order updates and shipping notifications</li>
            <li>To improve our products and services</li>
            <li>To send marketing communications (with your consent)</li>
            <li>To prevent fraud and ensure security</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Data Security</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            We implement industry-standard security measures to protect your personal information. All payment data
            is encrypted and processed through secure payment gateways.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Contact</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            For privacy-related inquiries, contact us at support@gymsword.com.
          </p>
        </section>
      </div>
    </LuxuryPage>
  );
}
