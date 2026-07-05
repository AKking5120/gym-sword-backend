import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "@/lib/api";
import { GymSwordLogo } from "@/components/GymSwordLogo";
import OTPInput from "@/components/OTPInput";
import { AUTH } from "@/constants/testIds";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [step, setStep] = useState("email"); // email | otp | reset | done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const sendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setStep("otp");
      setCountdown(60);
      toast.success("OTP sent to your email");
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (enteredOTP) => {
    if (enteredOTP.length !== 6) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-reset-otp", { email, otp: enteredOTP });
      setResetToken(data.reset_token);
      setStep("reset");
      toast.success("OTP verified");
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || "Invalid OTP");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one number");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { reset_token: resetToken, new_password: newPassword });
      setStep("done");
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: "Email", done: step === "otp" || step === "reset" || step === "done" },
    { label: "Verify", done: step === "reset" || step === "done" },
    { label: "Reset", done: step === "done" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md">
        <div className="mb-10"><Link to="/"><GymSwordLogo /></Link></div>

        {/* Steps indicator */}
        <div className="flex items-center gap-0 mb-10">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                s.done ? "bg-black border-black text-white" : "border-black/20 text-black/30"
              }`}>
                {s.done ? "\u2713" : i + 1}
              </div>
              <span className={`ml-2 text-[10px] uppercase tracking-[0.12em] font-semibold ${
                s.done ? "text-black" : "text-black/30"
              }`}>
                {s.label}
              </span>
              {i < 2 && <div className={`flex-1 h-[1px] mx-3 ${s.done ? "bg-black" : "bg-black/15"}`} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 text-[12px] text-red-600 bg-red-50 border border-red-200 px-4 py-3">
            {error}
          </div>
        )}

        {/* Step 1: Email */}
        {step === "email" && (
          <>
            <h1 className="font-display uppercase font-black text-3xl sm:text-4xl mb-3">Forgot Password</h1>
            <p className="text-sm text-black/50 mb-8">Enter your email and we'll send you a verification code.</p>
            <form onSubmit={sendOTP} className="space-y-5">
              <label className="block">
                <div className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold mb-2">Email</div>
                <input
                  data-testid={AUTH.emailInput}
                  type="email"
                  required
                  className="w-full bg-white border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                />
              </label>
              <button
                data-testid={AUTH.submit}
                disabled={loading}
                className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-4 hover:bg-black/80 disabled:opacity-50 transition-all"
              >
                {loading ? "Sending\u2026" : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <>
            <h1 className="font-display uppercase font-black text-3xl sm:text-4xl mb-3">Verify OTP</h1>
            <p className="text-sm text-black/50 mb-8">
              Enter the 6-digit code sent to<br />
              <span className="font-semibold text-black">{email}</span>
            </p>

            <OTPInput
              length={6}
              value={otp}
              onChange={setOtp}
              onComplete={handleVerifyOTP}
              disabled={loading}
            />

            {loading && (
              <div className="text-center text-[12px] text-black/50 mt-4">Verifying\u2026</div>
            )}

            <div className="text-center mt-6">
              {countdown > 0 ? (
                <span className="text-[12px] text-black/40">Resend OTP in {countdown}s</span>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      await api.post("/auth/forgot-password", { email });
                      setCountdown(60);
                      toast.success("OTP resent");
                    } catch (e) {
                      toast.error("Failed to resend");
                    }
                  }}
                  className="text-[12px] font-semibold text-black underline underline-offset-4 hover:text-black/70 transition-colors"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={() => handleVerifyOTP(otp)}
              disabled={loading || otp.length !== 6}
              className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-4 hover:bg-black/80 disabled:opacity-50 transition-all mt-6"
            >
              {loading ? "Verifying\u2026" : "Verify"}
            </button>
          </>
        )}

        {/* Step 3: Reset Password */}
        {step === "reset" && (
          <>
            <h1 className="font-display uppercase font-black text-3xl sm:text-4xl mb-3">Reset Password</h1>
            <p className="text-sm text-black/50 mb-8">Choose a strong new password for your account.</p>
            <form onSubmit={resetPassword} className="space-y-5">
              <label className="block">
                <div className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold mb-2">New Password</div>
                <input
                  type="password"
                  required
                  className="w-full bg-white border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                />
              </label>
              <label className="block">
                <div className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold mb-2">Confirm Password</div>
                <input
                  type="password"
                  required
                  className="w-full bg-white border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                />
              </label>

              {/* Password rules */}
              <div className="bg-[#f8f8f8] px-4 py-3 space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.12em] text-black/40 font-semibold mb-2">Password must contain:</p>
                {[
                  { label: "At least 8 characters", met: newPassword.length >= 8 },
                  { label: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
                  { label: "One lowercase letter", met: /[a-z]/.test(newPassword) },
                  { label: "One number", met: /[0-9]/.test(newPassword) },
                ].map((rule) => (
                  <div key={rule.label} className={`text-[11px] flex items-center gap-2 ${rule.met ? "text-green-600" : "text-black/40"}`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] border ${rule.met ? "bg-green-600 border-green-600 text-white" : "border-black/20"}`}>
                      {rule.met && "\u2713"}
                    </span>
                    {rule.label}
                  </div>
                ))}
              </div>

              <button
                disabled={loading}
                className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-4 hover:bg-black/80 disabled:opacity-50 transition-all"
              >
                {loading ? "Updating\u2026" : "Update Password"}
              </button>
            </form>
          </>
        )}

        {/* Step 4: Done */}
        {step === "done" && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className="font-display uppercase font-black text-3xl sm:text-4xl mb-3">Password Updated</h1>
            <p className="text-sm text-black/50 mb-8">Your password has been changed successfully. You can now sign in with your new password.</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-4 hover:bg-black/80 transition-all"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Back link */}
        {step !== "done" && (
          <div className="mt-8 text-center">
            <Link to="/login" className="text-[12px] text-black/40 hover:text-black underline underline-offset-4 transition-colors">
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
