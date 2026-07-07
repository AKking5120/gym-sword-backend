import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, ChevronRight } from "lucide-react";
import ReferralModal from "@/components/ReferralModal";

export default function ReferralTab() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-[90] flex items-center cursor-pointer group"
        style={{ perspective: "1000px" }}
        initial={false}
        aria-label="Refer & Earn"
      >
        <motion.div
          className="relative flex items-center gap-3 bg-black text-white py-5 pr-5 pl-4 rounded-r-2xl shadow-2xl overflow-hidden"
          animate={{
            x: hovered ? 6 : 0,
            boxShadow: hovered
              ? "8px 0 40px rgba(0,0,0,0.35), 0 0 30px rgba(255,255,255,0.08)"
              : "4px 0 25px rgba(0,0,0,0.25), 0 0 15px rgba(255,255,255,0.03)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] to-transparent pointer-events-none" />
          <div className="absolute -right-10 -top-10 w-24 h-24 bg-white/[0.03] rounded-full blur-xl pointer-events-none" />

          <motion.div
            className="relative flex flex-col items-center gap-2.5"
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-md scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                <Gift className="w-[18px] h-[18px] text-white" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <span
                className="text-[9px] font-bold uppercase tracking-[0.25em] leading-none"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              >
                Refer &amp; Earn
              </span>
              <motion.div
                className="w-5 h-[1.5px] bg-white/30 rounded-full mt-1"
                animate={{ width: hovered ? "1.5rem" : "1.25rem", opacity: hovered ? 0.6 : 0.3 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>

          <motion.div
            className="relative flex items-center justify-center"
            animate={{ x: hovered ? 0 : -4, opacity: hovered ? 1 : 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-3.5 h-3.5 text-white/60" />
          </motion.div>
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && <ReferralModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
