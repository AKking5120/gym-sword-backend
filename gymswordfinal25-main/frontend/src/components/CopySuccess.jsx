import { motion, AnimatePresence } from "framer-motion";
import { Check, Link, Gift } from "lucide-react";

export default function CopySuccess({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-white px-8 py-7 shadow-2xl flex flex-col items-center gap-3 max-w-[280px]"
            initial={{ scale: 0.85, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 250, damping: 18 }}
          >
            <motion.div
              className="w-16 h-16 bg-black flex items-center justify-center"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 12, delay: 0.08 }}
            >
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Check className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>

            <div className="text-center">
              <p className="text-base font-black text-black tracking-tight">Link Copied!</p>
              <p className="text-xs text-black/40 mt-0.5">Referral link copied to clipboard</p>
            </div>

            <motion.div
              className="flex items-center gap-1.5 text-[10px] text-white bg-black/90 px-3 py-1.5"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Gift className="w-3 h-3" />
              Share it with your friends
            </motion.div>

            <motion.div
              className="w-full h-[1px] bg-black/5 mt-1"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
