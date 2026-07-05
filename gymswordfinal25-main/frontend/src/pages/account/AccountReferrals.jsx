import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function AccountReferrals() {
  const [data, setData] = useState(null);

  useEffect(() => {
  api.get("/referrals").then(({ data }) => {
      setData(data);
    });
  }, []);

  if (!data) return null;

console.log("Referral Code:", data.referral_code);

 const link =
  `${window.location.origin}/register?ref=${data.referral_code}`;

  return (
    <div>
      <h1 className="font-display uppercase font-black text-4xl mb-8">
        Referral Center
      </h1>

      <div className="bg-[#F5F5F7] p-6">
        <p className="text-black/60 mb-2">
          Your Referral Code
        </p>

        <h2 className="text-3xl font-black mb-4">
          {data.referral_code}
        </h2>

        <button
          className="btn-luxury-primary"
          onClick={() => {
            navigator.clipboard.writeText(link);
            toast.success("Referral link copied");
          }}
        >
          Copy Referral Link
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="bg-[#F5F5F7] p-6">
          <p>Total Referrals</p>
          <h2 className="text-3xl font-black">
            {data.total_referrals}
          </h2>
        </div>

        <div className="bg-[#F5F5F7] p-6">
          <p>Referral Coins</p>
          <h2 className="text-3xl font-black">
            {data.total_coins_earned}
          </h2>
        </div>

        <div className="bg-[#F5F5F7] p-6">
          <p>Available Coins</p>
          <h2 className="text-3xl font-black">
            0
          </h2>
        </div>
      </div>
  <div className="mt-10">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
    <div>
      <h2 className="text-2xl md:text-3xl font-black uppercase">
        Referral History
      </h2>
      <p className="text-black/50 mt-1">
        All users who joined using your referral code
      </p>
    </div>

    {/* <div className="bg-black text-white px-5 py-3 rounded-xl">
      {/* <p className="text-xs text-white/70 uppercase">
        Total Referrals
      </p> */}
      {/* <h3 className="text-2xl font-black">
        {data.totalReferrals}
      </h3> */}
    {/* </div> */} 
  </div>

  <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-lg">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-black text-white">
            <th className="px-6 py-4 text-left text-sm font-semibold">
              #
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold">
              User
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold">
              Email
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold">
              Joined Date
            </th>

            <th className="px-6 py-4 text-center text-sm font-semibold">
              Coins Earned
            </th>

            <th className="px-6 py-4 text-center text-sm font-semibold">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {data.referrals?.length > 0 ? (
            data.referrals.map((user, index) => (
              <tr
                key={user.id}
                className="border-b border-black/5 hover:bg-gray-50 transition-all"
              >
                <td className="px-6 py-5 font-bold text-black/80">
                  {index + 1}
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-bold">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-black">
                        {user.name}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5 text-black/60">
                  {user.email}
                </td>

                <td className="px-6 py-5 text-black/70">
                  {new Date(
                    user.joinedAt
                  ).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

                <td className="px-6 py-5 text-center">
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                    +{user.earnedCoins || 50}
                  </span>
                </td>

                <td className="px-6 py-5 text-center">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Active
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                className="text-center py-16"
              >
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-3">🎯</div>

                  <h3 className="font-bold text-xl">
                    No Referrals Yet
                  </h3>

                  <p className="text-black/50 mt-2">
                    Share your referral link to start earning rewards.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>
    </div>
  );
}