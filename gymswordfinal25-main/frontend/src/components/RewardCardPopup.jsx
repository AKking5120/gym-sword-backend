import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Wallet, Sparkles, CheckCircle, Coins, Medal } from "lucide-react";

function AnimatedNumber({ value, suffix = "", duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{display}{suffix}</span>;
}

export default function RewardCardPopup({ show, walletCoins, rewardCoins, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white shadow-2xl max-w-sm w-full mx-auto overflow-hidden"
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="bg-gray-950 px-7 py-7 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.15 }}
              >
                <div className="w-16 h-16 rounded-full bg-white/10 mx-auto flex items-center justify-center border border-white/20 mb-3">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <h3 className="text-lg font-black text-white relative z-10 tracking-tight">Reward Unlocked!</h3>
              <p className="text-xs text-white/40 mt-1 relative z-10">You earned rewards from your referral</p>
            </div>

            <div className="px-7 py-6 space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black/10 flex items-center justify-center">
                    <Wallet className="w-[18px] h-[18px] text-black/60" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-black/40 font-semibold">Wallet Credit</p>
                    <p className="text-xl font-black">
                      ₹<AnimatedNumber value={walletCoins} />
                    </p>
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </motion.div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black/10 flex items-center justify-center">
                    <Coins className="w-4.5 h-4.5 text-black/60" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-black/40 font-semibold">Reward Coins</p>
                    <p className="text-xl font-black">
                      +<AnimatedNumber value={rewardCoins} />
                    </p>
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </motion.div>
              </div>

              <motion.button
                onClick={onClose}
                className="w-full bg-black text-white text-sm font-bold uppercase tracking-[0.15em] py-3.5 hover:bg-black/80 transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Awesome!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
