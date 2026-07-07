import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Gift, Copy, Check, Share2, Wallet, TrendingUp, Award,
  ArrowRight, Sparkles, Link as LinkIcon, Star, Download, Users,
  Mail, PhoneCall, Tag, Shield, Infinity, Zap, Send,
  MessageCircle, Camera, ThumbsUp, Hash, Smartphone,
  RefreshCw, Clock, Percent,
  AlertCircle, CheckCircle, UserPlus, Medal,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import useReferral from "@/hooks/useReferral";
import Confetti from "@/components/Confetti";
import CopySuccess from "@/components/CopySuccess";
import RewardCardPopup from "@/components/RewardCardPopup";
import QRCodeLib from "qrcode";

const SHARE_PLATFORMS = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "#25D366" },
  { id: "telegram", label: "Telegram", icon: Send, color: "#0088cc" },
  { id: "instagram", label: "Instagram", icon: Camera, color: "#E4405F" },
  { id: "facebook", label: "Facebook", icon: ThumbsUp, color: "#1877F2" },
  { id: "twitter", label: "X / Twitter", icon: Hash, color: "#000000" },
  { id: "email", label: "Email", icon: Mail, color: "#666666" },
  { id: "sms", label: "SMS", icon: Smartphone, color: "#333333" },
  { id: "native", label: "Share", icon: Share2, color: "#111111" },
];

const BENEFITS = [
  {
    icon: Send,
    title: "Share Your Referral Link",
    desc: "Share your personal GymSword referral link with your friends and family.",
  },
  {
    icon: Tag,
    title: "Friend Gets Reward",
    desc: "They receive 10% OFF or ₹500 Welcome Coupon on their first purchase.",
    reward: "10% OFF",
    rewardSub: "or ₹500 Welcome Coupon",
  },
  {
    icon: Gift,
    title: "You Get Reward",
    desc: "Earn ₹500 Wallet Credit + Reward Coins + Exclusive Coupons.",
    reward: "₹500",
    rewardSub: "Wallet Credit + Rewards",
  },
];

function formatCount(n) {
  if (n >= 100000) return (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n;
}

function AnimatedCounter({ value, suffix = "", duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value, duration]);
  return <span>{display}{suffix}</span>;
}

export default function ReferralModal({ onClose }) {
  const { user, refresh } = useAuth();
  const {
    data, loading, fetchDetails, fetchHistory, copyLink, share,
    sendOTP, verifyOTP, generateCode
  } = useReferral();

  const [step, setStep] = useState("input");
  const [contactMethod, setContactMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [historyData, setHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const qrCanvasRef = useRef(null);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (user) fetchDetails();
  }, [user, fetchDetails]);

  useEffect(() => {
    if (user && data?.referral_code && qrCanvasRef.current) {
      const link = `${window.location.origin}/register?ref=${data.referral_code}`;
      QRCodeLib.toCanvas(qrCanvasRef.current, link, {
        width: 140,
        margin: 1.5,
        color: { dark: "#000000", light: "#ffffff" },
      });
      QRCodeLib.toDataURL(link, { width: 300, margin: 1.5, color: { dark: "#000000", light: "#ffffff" } })
        .then(setQrDataUrl);
    }
  }, [user, data]);

  const link = data?.referral_code
    ? `${window.location.origin}/register?ref=${data.referral_code}`
    : "";

  const handleSendOTP = async () => {
    setError("");
    if (contactMethod === "email" && !email) { setError("Enter your email address"); return; }
    if (contactMethod === "mobile" && !mobile) { setError("Enter your mobile number"); return; }
    setSendingOtp(true);
    try {
      const payload = contactMethod === "email" ? { email } : { mobile };
      await sendOTP(payload);
      setStep("otp");
    } catch (e) {
      setError(e.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) return;
    setVerifyingOtp(true);
    setError("");
    try {
      const payload = contactMethod === "email"
        ? { email, otp }
        : { mobile, otp };
      await verifyOTP(payload);
      await refresh();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } catch (e) {
      setError(e.message || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCopyLink = async () => {
    const ok = await copyLink();
    if (ok) {
      setCopied(true);
      setShowCopySuccess(true);
      setTimeout(() => { setCopied(false); setShowCopySuccess(false); }, 2500);
    }
  };

  const handleOpenHistory = async () => {
    setActiveTab("history");
    if (!historyData && !loadingHistory) {
      setLoadingHistory(true);
      try {
        const res = await fetchHistory();
        setHistoryData(res);
      } catch { } finally {
        setLoadingHistory(false);
      }
    }
  };

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const referralsList = data?.referrals || [];
  const successfulReferrals = referralsList.filter((r) => r.reward_given);
  const pendingReferrals = referralsList.filter((r) => !r.reward_given);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-[1200px] h-[92vh] max-h-[860px] bg-white overflow-hidden flex shadow-2xl"
        initial={{ scale: 0.92, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 28, stiffness: 240 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors text-black/40 hover:text-black"
        >
          <X className="w-4 h-4" />
        </button>

        {showConfetti && <Confetti />}
        <RewardCardPopup show={showRewardPopup} walletCoins={500} rewardCoins={50} onClose={() => setShowRewardPopup(false)} />

        {/* ─── LEFT PANEL ─── */}
        <div className="hidden lg:flex w-[45%] bg-black flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.01] pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          <div className="relative z-10 flex flex-col h-full p-10">
            {/* Brand */}
            <motion.div
              className="flex items-center gap-3 mb-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">GymSword</p>
                <p className="text-sm font-bold tracking-tight text-white/90">Refer & Earn</p>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-5xl font-black uppercase tracking-[-0.03em] leading-[0.95] text-white">
                Refer
                <br />
                <span className="text-white/60">&amp; Earn</span>
              </h2>
              <p className="text-sm text-white/40 leading-relaxed mt-4 max-w-xs">
                Invite your friends to GymSword and earn exclusive rewards every time they complete their first purchase.
              </p>
            </motion.div>

            {/* 3 Benefit Cards */}
            <div className="space-y-3 flex-1">
              {BENEFITS.map((b, i) => {
                const Icon = b.icon;
                return (
                  <motion.div
                    key={b.title}
                    className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-default"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                  >
                    <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 group-hover:border-white/20 transition-all duration-300">
                      <Icon className="w-5 h-5 text-white/60 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="min-w-0 pt-0.5 flex-1">
                      <p className="text-sm font-semibold text-white/90">{b.title}</p>
                      <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{b.desc}</p>
                      {b.reward && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-lg font-black text-white">{b.reward}</span>
                          <span className="text-[10px] text-white/30">{b.rewardSub}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust badges */}
            <motion.div
              className="border-t border-white/[0.08] pt-5 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-5">
                {[
                  { icon: Infinity, label: "Unlimited Referrals" },
                  { icon: Shield, label: "No Joining Fee" },
                  { icon: Zap, label: "Instant Tracking" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-white/30" />
                      <span className="text-[10px] text-white/30 font-medium tracking-wide">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className="w-full lg:w-[55%] bg-white flex flex-col overflow-hidden">
          {/* Premium header illustration */}
          <div className="relative h-48 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 shrink-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 w-56 h-56 border border-white/[0.03] rounded-full" />
            <div className="absolute right-24 top-8 w-24 h-24 border border-white/[0.02] rounded-full" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/[0.03] rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

            <div className="relative h-full flex flex-col justify-end p-8 pb-6">
              <motion.div
                className="flex items-center gap-2 mb-2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                  <Medal className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[9px] uppercase tracking-[0.25em] text-white/30 font-semibold">
                  Premium Rewards Program
                </span>
              </motion.div>
              <motion.h2
                className="text-2xl font-black text-white uppercase tracking-tight leading-tight"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                Invite Friends. Earn Rewards.
              </motion.h2>
              <motion.p
                className="text-sm text-white/40 mt-1 max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Share your referral link and both get rewarded
              </motion.p>
            </div>
          </div>

          {/* Content area - scrollable */}
          <div className="flex-1 overflow-y-auto scrollbar-thin relative">
            <CopySuccess show={showCopySuccess} />
            <div className="p-6 md:p-8">
              {!user ? (
                /* ─── NOT LOGGED IN ─── */
                <div className="max-w-sm mx-auto pt-2">
                  <motion.div
                    className="text-center mb-6"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center mx-auto mb-3">
                      <UserPlus className="w-5 h-5 text-black/40" />
                    </div>
                    <p className="text-sm font-semibold text-black">Join the Rewards Program</p>
                    <p className="text-xs text-black/40 mt-1">Enter your details to get started</p>
                  </motion.div>

                  {/* Contact method toggle */}
                  <div className="flex bg-black/5 rounded-xl p-1 mb-5">
                    {[
                      { id: "email", label: "Email", icon: Mail },
                      { id: "mobile", label: "Mobile", icon: PhoneCall },
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          onClick={() => { setContactMethod(m.id); setError(""); setStep("input"); }}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] rounded-lg transition-all ${
                            contactMethod === m.id
                              ? "bg-white text-black shadow-sm"
                              : "text-black/30 hover:text-black/50"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence mode="wait">
                    {step === "input" && (
                      <motion.div
                        key="input"
                        className="space-y-4"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                      >
                        {contactMethod === "email" ? (
                          <div>
                            <label className="block text-[10px] uppercase tracking-[0.15em] text-black/40 mb-2 font-semibold">
                              Email Address
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-transparent border border-black/20 pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-black text-black placeholder:text-black/20 transition-colors"
                                onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[10px] uppercase tracking-[0.15em] text-black/40 mb-2 font-semibold">
                              Mobile Number
                            </label>
                            <div className="flex gap-2">
                              <div className="flex items-center gap-1 px-3.5 py-3.5 border border-black/20 bg-black/[0.02] shrink-0">
                                <Smartphone className="w-3.5 h-3.5 text-black/30" />
                                <span className="text-sm font-medium text-black/50">+91</span>
                              </div>
                              <input
                                type="tel"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                placeholder="9876543210"
                                className="flex-1 bg-transparent border border-black/20 px-4 py-3.5 text-sm focus:outline-none focus:border-black text-black placeholder:text-black/20 transition-colors"
                                onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                              />
                            </div>
                          </div>
                        )}

                        {error && (
                          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-4 py-3 border border-red-100">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {error}
                          </div>
                        )}

                        <button
                          onClick={handleSendOTP}
                          disabled={sendingOtp}
                          className="w-full bg-black text-white text-sm font-bold uppercase tracking-[0.15em] py-3.5 hover:bg-black/80 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                        >
                          {sendingOtp ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              Continue
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </motion.div>
                    )}

                    {step === "otp" && (
                      <motion.div
                        key="otp"
                        className="space-y-5"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="text-center">
                          <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mx-auto mb-3">
                            <Mail className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-sm text-black/60">Enter the verification code sent to</p>
                          <p className="text-sm font-semibold text-black mt-1">
                            {contactMethod === "email" ? email : "+91 " + mobile}
                          </p>
                          <button
                            onClick={() => setStep("input")}
                            className="text-xs text-black/30 hover:text-black transition-colors mt-1 underline underline-offset-2"
                          >
                            Change
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.15em] text-black/40 mb-3 font-semibold text-center">
                            One-Time Password
                          </label>
                          <div className="flex gap-2.5 justify-center">
                            {Array.from({ length: 6 }, (_, i) => (
                              <input
                                key={i}
                                ref={(el) => { otpRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={otp[i] || ""}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  if (!val && i > 0) return;
                                  const newOtp = otp.split("");
                                  newOtp[i] = val[val.length - 1] || "";
                                  const joined = newOtp.join("").slice(0, 6);
                                  handleOtpChange(joined);
                                  if (val && i < 5) {
                                    otpRefs.current[i + 1]?.focus();
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Backspace" && !otp[i] && i > 0) {
                                    otpRefs.current[i - 1]?.focus();
                                  }
                                  if (e.key === "Enter" && otp.length >= 4) {
                                    handleVerifyOTP();
                                  }
                                }}
                                className={`w-11 h-13 text-center text-xl font-bold border focus:outline-none transition-all ${
                                  otp[i]
                                    ? "border-black bg-black text-white"
                                    : "border-black/15 bg-white text-black focus:border-black/40"
                                }`}
                                autoFocus={i === 0}
                              />
                            ))}
                          </div>
                        </div>

                        {error && (
                          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-4 py-3 border border-red-100">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {error}
                          </div>
                        )}

                        <button
                          onClick={handleVerifyOTP}
                          disabled={verifyingOtp || otp.length < 4}
                          className="w-full bg-black text-white text-sm font-bold uppercase tracking-[0.15em] py-3.5 hover:bg-black/80 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                        >
                          {verifyingOtp ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              Verify & Get Started
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleSendOTP}
                          disabled={sendingOtp}
                          className="w-full text-xs text-black/30 hover:text-black transition-colors py-1 flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className={`w-3 h-3 ${sendingOtp ? "animate-spin" : ""}`} />
                          Resend Code
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-black/30 font-medium tracking-wide uppercase">Loading</p>
                  </div>
                </div>
              ) : (
                /* ─── LOGGED IN - DASHBOARD ─── */
                <div className="space-y-5">
                  {/* Referral Code Card */}
                  <motion.div
                    className="bg-black text-white relative overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                    <div className="relative z-10 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-semibold">Your Referral Code</p>
                        <button
                          onClick={handleCopyLink}
                          className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-[0.1em]"
                        >
                          {copied ? (
                            <><Check className="w-3 h-3" /> Copied</>
                          ) : (
                            <><Copy className="w-3 h-3" /> Copy Code</>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/5 border border-white/10 px-5 py-3 flex-1">
                          <span className="text-2xl font-black tracking-[0.25em]">
                            {data?.referral_code || "------"}
                          </span>
                        </div>
                        <button
                          onClick={handleCopyLink}
                          className="w-12 h-14 bg-white text-black flex items-center justify-center hover:bg-white/90 transition-colors shrink-0"
                        >
                          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 bg-white/5 px-4 py-2.5 border border-white/[0.06]">
                        <LinkIcon className="w-3.5 h-3.5 text-white/30 shrink-0" />
                        <p className="text-xs text-white/40 truncate flex-1 font-mono">{link}</p>
                        <button
                          onClick={handleCopyLink}
                          className="text-[10px] font-semibold text-white/50 hover:text-white transition-colors shrink-0 uppercase tracking-[0.1em]"
                        >
                          {copied ? "Copied!" : "Copy Link"}
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Wallet & Earnings */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      className="bg-black/[0.03] border border-black/5 p-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 }}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <Wallet className="w-4 h-4 text-black/30" />
                        <p className="text-[9px] uppercase tracking-[0.15em] text-black/40 font-semibold">Wallet</p>
                      </div>
                      <p className="text-2xl font-black">
                        <AnimatedCounter value={data?.wallet_coins || 0} />
                      </p>
                      <p className="text-[10px] text-black/30 font-medium">reward coins</p>
                    </motion.div>

                    <motion.div
                      className="bg-black/[0.03] border border-black/5 p-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <TrendingUp className="w-4 h-4 text-black/30" />
                        <p className="text-[9px] uppercase tracking-[0.15em] text-black/40 font-semibold">Earnings</p>
                      </div>
                      <p className="text-2xl font-black">
                        ₹<AnimatedCounter value={data?.total_coins_earned || 0} />
                      </p>
                      <p className="text-[10px] text-black/30 font-medium">total earned</p>
                    </motion.div>
                  </div>

                  {/* Stats */}
                  <motion.div
                    className="grid grid-cols-3 gap-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                  >
                    {[
                      { icon: Users, label: "Total", value: referralsList.length },
                      { icon: Award, label: "Successful", value: successfulReferrals.length },
                      { icon: Clock, label: "Pending", value: pendingReferrals.length },
                    ].map((s) => {
                      const Icon = s.icon;
                      return (
                        <div key={s.label} className="bg-black/[0.02] border border-black/5 p-4 text-center hover:bg-black/[0.04] transition-colors">
                          <Icon className="w-4 h-4 text-black/20 mx-auto mb-1.5" />
                          <p className="text-xl font-black">{s.value}</p>
                          <p className="text-[9px] text-black/30 uppercase tracking-[0.1em] font-medium">{s.label}</p>
                        </div>
                      );
                    })}
                  </motion.div>

                  {/* Tabs */}
                  <div className="flex gap-6 border-b border-black/10">
                    {[
                      { id: "overview", label: "Rewards" },
                      { id: "share", label: "Share" },
                      { id: "history", label: "History" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          if (tab.id === "history") handleOpenHistory();
                        }}
                        className={`pb-3 text-[10px] uppercase tracking-[0.2em] font-semibold transition-colors relative ${
                          activeTab === tab.id ? "text-black" : "text-black/25 hover:text-black/50"
                        }`}
                      >
                        {tab.label}
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="referralTab"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    {activeTab === "overview" && (
                      <motion.div
                        key="overview"
                        className="grid sm:grid-cols-2 gap-3"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="border border-black/10 p-5 hover:border-black/20 transition-colors">
                          <div className="w-10 h-10 flex items-center justify-center mb-3 bg-black/5">
                            <Percent className="w-[18px] h-[18px] text-black/40" />
                          </div>
                          <p className="text-[9px] uppercase tracking-[0.15em] text-black/40 font-semibold mb-1">Friend Gets</p>
                          <p className="text-xl font-black">10% OFF</p>
                          <p className="text-xs text-black/40 mt-0.5 leading-relaxed">or ₹500 Welcome Coupon on their first order</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Sparkles className="w-3 h-3 text-black/30" />
                            <span className="text-[10px] text-black/30">Min. purchase ₹1,500</span>
                          </div>
                        </div>
                        <div className="border border-black/10 p-5 hover:border-black/20 transition-colors">
                          <div className="w-10 h-10 flex items-center justify-center mb-3 bg-black/5">
                            <Gift className="w-4.5 h-4.5 text-black/40" />
                          </div>
                          <p className="text-[9px] uppercase tracking-[0.15em] text-black/40 font-semibold mb-1">You Earn</p>
                          <p className="text-xl font-black">₹500</p>
                          <p className="text-xs text-black/40 mt-0.5 leading-relaxed">Wallet Credit + Reward Coins + Exclusive Coupons</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="w-3 h-3 text-black/30" />
                            <span className="text-[10px] text-black/30">Per successful referral</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "share" && (
                      <motion.div
                        key="share"
                        className="space-y-5"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="grid grid-cols-4 gap-2">
                          {SHARE_PLATFORMS.map((p) => {
                            const Icon = p.icon;
                            return (
                              <motion.button
                                key={p.id}
                                onClick={() => share(p.id)}
                                className="flex flex-col items-center gap-2 p-3.5 border border-black/5 bg-black/[0.02] hover:bg-black/[0.05] hover:border-black/15 transition-all group"
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/5 group-hover:bg-black/10 transition-colors">
                                  <Icon className="w-4 h-4 text-black/50 group-hover:text-black transition-colors" />
                                </div>
                                <span className="text-[8px] text-black/40 font-medium tracking-wide uppercase">{p.label}</span>
                              </motion.button>
                            );
                          })}
                        </div>

                        <div className="border border-black/10 p-5 text-center">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-[9px] uppercase tracking-[0.15em] text-black/40 font-semibold">Scan QR Code</p>
                            <button
                              onClick={() => {
                                if (qrDataUrl) {
                                  const a = document.createElement("a");
                                  a.href = qrDataUrl;
                                  a.download = "gymsword-referral-qr.png";
                                  a.click();
                                }
                              }}
                              className="text-[10px] text-black/30 hover:text-black transition-colors flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> Download
                            </button>
                          </div>
                          <div className="flex justify-center">
                            <canvas ref={qrCanvasRef} className="border border-black/5" />
                          </div>
                          <p className="text-[10px] text-black/25 mt-3">Scan to open referral link</p>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "history" && (
                      <motion.div
                        key="history"
                        className="space-y-2"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                      >
                        {loadingHistory ? (
                          <div className="flex justify-center py-10">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                              <p className="text-xs text-black/20">Loading history...</p>
                            </div>
                          </div>
                        ) : (historyData?.referrals || referralsList).length === 0 ? (
                          <div className="text-center py-10">
                            <div className="w-14 h-14 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-3">
                              <Users className="w-6 h-6 text-black/20" />
                            </div>
                            <p className="text-sm font-semibold text-black/50">No referrals yet</p>
                            <p className="text-xs text-black/30 mt-1">Share your code to start earning rewards</p>
                          </div>
                        ) : (
                          (historyData?.referrals || referralsList).map((r, i) => (
                            <motion.div
                              key={r.id}
                              className="flex items-center justify-between py-3.5 border-b border-black/5 last:border-0"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center text-sm font-bold text-black/40 bg-black/5">
                                  {r.referred_user?.name?.charAt(0)?.toUpperCase() ||
                                   r.referred_user?.email?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-black/80">
                                    {r.referred_user?.name || "New User"}
                                  </p>
                                  <p className="text-[10px] text-black/30">
                                    {new Date(r.created_at).toLocaleDateString("en-IN", {
                                      day: "numeric", month: "short", year: "numeric"
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {r.reward_given ? (
                                  <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 px-2.5 py-1 border border-green-100">
                                    <CheckCircle className="w-3 h-3" />
                                    +{r.reward_coins || 500}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[10px] font-semibold text-black/40 bg-black/5 px-2.5 py-1 border border-black/10">
                                    <Clock className="w-3 h-3" />
                                    Pending
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
