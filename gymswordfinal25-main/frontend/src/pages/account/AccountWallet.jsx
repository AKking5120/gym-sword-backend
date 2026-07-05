import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Coins, Wallet, Crown, BadgeDollarSign } from "lucide-react";
export default function AccountWallet() {
  const [wallet, setWallet] = useState(null);
const [redeemCoins, setRedeemCoins] = useState("");
  useEffect(() => {
    api.get("/wallet").then(({ data }) => {
      setWallet(data);
    });
  }, []);

  if (!wallet) return <div>Loading...</div>;
const redeemCoinsNow = async () => {
  try {
    const { data } = await api.post(
      "/auth/redeem-coins",
      {
        coins: Number(redeemCoins),
      }
    );

    toast.success(
      `₹${data.discount} Discount Generated`
    );

    window.location.reload();
  } catch (err) {
    toast.error(
      err.response?.data?.detail
    );
  }
};



return (
  <div className="space-y-8">

    {/* Hero */}
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-black via-zinc-900 to-black p-8 md:p-10 text-white">

      <div className="absolute -top-20 -right-20 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

        <div>
          <p className="uppercase tracking-[5px] text-white/50 text-xs">
            GymSword Rewards
          </p>

          <h1 className="text-5xl font-black mt-3">
            My Wallet
          </h1>

          <p className="text-white/60 mt-4 max-w-lg">
            Earn coins through referrals and shopping rewards.
            Redeem them for exclusive discounts and member benefits.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 min-w-[280px]">

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-black flex items-center justify-center">
              <Coins size={30} />
            </div>

            <div>
              <p className="text-white/60 text-sm">
                Available Coins
              </p>

              <h2 className="text-5xl font-black text-yellow-400">
                {wallet.availableCoins}
              </h2>
            </div>

          </div>

        </div>

      </div>

    </div>

    {/* Stats */}
    <div className="grid lg:grid-cols-4 gap-5">

      <div className="bg-white rounded-3xl border border-black/10 p-6 hover:shadow-xl transition">
        <div className="flex items-center justify-between">
          <Wallet size={24} />
          <span className="text-xs text-black/40">
            WALLET
          </span>
        </div>

        <p className="text-black/50 text-sm mt-4">
          Earned Coins
        </p>

        <h3 className="text-4xl font-black mt-2">
          {wallet.totalEarnedCoins}
        </h3>
      </div>

      <div className="bg-white rounded-3xl border border-black/10 p-6 hover:shadow-xl transition">
        <div className="flex items-center justify-between">
          <Coins size={24} className="text-yellow-500" />
          <span className="text-xs text-black/40">
            REFERRALS
          </span>
        </div>

        <p className="text-black/50 text-sm mt-4">
          Referral Coins
        </p>

        <h3 className="text-4xl font-black text-yellow-500 mt-2">
          {wallet.referralCoins}
        </h3>
      </div>

      <div className="bg-white rounded-3xl border border-black/10 p-6 hover:shadow-xl transition">
        <div className="flex items-center justify-between">
          <Crown size={24} />
          <span className="text-xs text-black/40">
            MEMBERSHIP
          </span>
        </div>

        <p className="text-black/50 text-sm mt-4">
          Membership
        </p>

        <h3 className="text-3xl font-black mt-2">
          {wallet.membershipLevel}
        </h3>
      </div>

      <div className="bg-black text-white rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <BadgeDollarSign
            size={24}
            className="text-yellow-400"
          />

          <span className="text-xs text-white/40">
            VALUE
          </span>
        </div>

        <p className="text-white/60 text-sm mt-4">
          Wallet Value
        </p>

        <h3 className="text-4xl font-black text-yellow-400 mt-2">
          ₹{((wallet.availableCoins || 0) / 100) * 40}
        </h3>
      </div>

    </div>

    {/* Coin Exchange */}
    <div className="bg-white border border-black/10 rounded-[32px] p-8">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">

        <div>
          <h2 className="text-3xl font-black">
            Coin Exchange
          </h2>

          <p className="text-black/50 mt-2">
            Convert your reward coins into discounts.
          </p>
        </div>

        <div className="bg-yellow-100 text-yellow-700 px-5 py-3 rounded-2xl font-bold">
          100 Coins = ₹40
        </div>

      </div>

      <input
        type="number"
        value={redeemCoins}
        onChange={(e) =>
          setRedeemCoins(e.target.value)
        }
        placeholder="Enter Coins"
        className="w-full h-14 border border-black/10 rounded-2xl px-5"
      />

      <div className="mt-6 bg-zinc-50 rounded-2xl p-6">

        <p className="text-black/50">
          Estimated Discount
        </p>

        <h3 className="text-5xl font-black text-yellow-500 mt-2">
          ₹{((Number(redeemCoins) || 0) / 100) * 40}
        </h3>

      </div>

      <button
        onClick={redeemCoinsNow}
        className="w-full mt-6 bg-black hover:bg-zinc-800 text-white h-14 rounded-2xl font-bold transition"
      >
        Redeem Coins
      </button>

    </div>

    {/* Transaction History */}
  <div className="bg-white rounded-[32px] border border-black/10 overflow-hidden">

  <div className="px-8 py-6 border-b">
    <h2 className="text-3xl font-black">
      Coin History
    </h2>
    <p className="text-black/50 mt-1">
      All coin earnings and redemptions
    </p>
  </div>

  {wallet.transactions?.length > 0 ? (
    <div className="divide-y">

      {wallet.transactions
        .slice()
        .reverse()
        .map((tx) => (

          <div
            key={tx._id}
            className="flex items-center justify-between px-8 py-5 hover:bg-gray-50 transition"
          >

            <div className="flex items-center gap-4">

              <div
  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
    tx.coins > 0
      ? "bg-green-100 text-green-600"
      : "bg-red-100 text-red-600"
  }`}
>
  <Coins size={24} />
</div>
<div className="text-xs text-black/40 uppercase">
  Transaction ID
</div>

<div className="font-mono text-xs">
  {tx._id}
</div>

              <div>
                <h4 className="font-bold">
                  {tx.description}
                </h4>

                <p className="text-sm text-black/50">
                  {tx.createdAt
                    ? new Date(
                        tx.createdAt
                      ).toLocaleString()
                    : "Recent"}
                </p>
              </div>

            </div>

            <div
              className={`text-xl font-black ${
                tx.coins > 0
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {tx.coins > 0 ? "+" : ""}
              {tx.coins} Coins
            </div>

          </div>

        ))}

    </div>
  ) : (
    <div className="p-16 text-center">
      <Coins
        size={60}
        className="mx-auto text-yellow-500 mb-4"
      />
      <h3 className="text-2xl font-black">
        No Transactions Yet
      </h3>
      <p className="text-black/50 mt-2">
        Earn referral rewards to start building
        your wallet history.
      </p>
    </div>
  )}

</div>

  </div>
);
}