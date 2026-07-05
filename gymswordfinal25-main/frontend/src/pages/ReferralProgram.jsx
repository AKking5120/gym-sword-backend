import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import LuxuryPage from "@/components/LuxuryPage";

export default function ReferralProgram() {
  const { user } = useAuth();
  const code = user?.referral_code || "GIFTED";

  return (
    <LuxuryPage title="Referral Program" breadcrumbs={[{ to: "/", label: "Home" }, { label: "Referral Program" }]}>
      <div className="prose-luxury max-w-3xl space-y-10">
        <section>
          <h2 className="text-2xl font-display uppercase font-black mb-4">Give ₹500, Get ₹500</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            Share your referral code with friends. When they make their first purchase, they get ₹500 off
            and you earn ₹500 in wallet credit.
          </p>
        </section>

        {user && (
          <div className="border border-black/15 p-8 bg-[#f8f8f8]">
            <p className="text-[10px] uppercase tracking-[0.15em] text-black/40 mb-2">Your Referral Code</p>
            <p className="text-3xl font-display font-black tracking-[0.1em]">{code}</p>
            <Link to="/account/referrals" className="inline-block mt-4 text-[11px] uppercase tracking-[0.15em] font-bold border-b border-black pb-0.5 hover:text-black/60 transition-colors">
              View Referral Dashboard →
            </Link>
          </div>
        )}

        {!user && (
          <div className="border border-black/15 p-8 bg-[#f8f8f8] text-center">
            <p className="text-[14px] text-black/60 mb-4">Sign in to get your unique referral code.</p>
            <Link to="/login" className="inline-block bg-black text-white text-[11px] font-bold uppercase tracking-[2px] px-8 py-3 hover:bg-black/80 transition-all">
              Sign In
            </Link>
          </div>
        )}

        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">How It Works</h2>
          <ul className="text-[14px] text-black/60 leading-[1.9] space-y-2 list-disc pl-5">
            <li>Share your unique referral code with friends.</li>
            <li>They enter the code at checkout for ₹500 off their first order.</li>
            <li>After their order is delivered, ₹500 is credited to your wallet.</li>
            <li>Use your wallet balance on any future purchase.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Terms</h2>
          <ul className="text-[14px] text-black/60 leading-[1.9] space-y-2 list-disc pl-5">
            <li>Referral credit is valid for 90 days.</li>
            <li>No limit on the number of referrals.</li>
            <li>The referred friend must be a new customer.</li>
            <li>Minimum order of ₹1,500 required for the referral discount.</li>
          </ul>
        </section>
      </div>
    </LuxuryPage>
  );
}
