import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiErrorDetail } from "@/lib/api";
import { GymSwordLogo } from "@/components/GymSwordLogo";
import OTPInput from "@/components/OTPInput";
import { AUTH } from "@/constants/testIds";

export default function Login() {
  const { login, formatErr, refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.from || "/account";

  const [mode, setMode] = useState("password"); // "password" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // Password login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate(next);
    } catch (e) {
      setError(formatErr(e.response?.data?.detail) || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!email) { setError("Please enter your email"); return; }
    setError("");
    setOtpLoading(true);
    try {
      await api.post("/auth/send-login-otp", { email });
      setOtpSent(true);
      setCountdown(60);
      setOtp("");
      toast.success("OTP sent to your email");
    } catch (e) {
      setError(formatErr(e.response?.data?.detail) || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (enteredOTP) => {
    if (enteredOTP.length !== 6) return;
    setError("");
    setOtpVerifying(true);
    try {
      const { data } = await api.post("/auth/verify-login-otp", { email, otp: enteredOTP });
      if (data?.token) {
        localStorage.setItem("gs_token", data.token);
      }
      await refresh();
      toast.success("Welcome back");
      navigate(next);
    } catch (e) {
      setError(formatErr(e.response?.data?.detail) || "Invalid OTP");
      setOtp("");
    } finally {
      setOtpVerifying(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setOtpSent(false);
    setOtp("");
    setCountdown(0);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — Image */}
      <div className="hidden lg:block relative bg-black">
        <img
          src="/images/login.jpeg"
          alt=""
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
        <div className="absolute top-12 left-12">
          <Link to="/"><GymSwordLogo variant="light" /></Link>
        </div>
        <div className="absolute bottom-16 left-12 right-12 text-white">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-3">Forge Your Strength</div>
          <h2 className="font-display uppercase font-black text-4xl lg:text-5xl leading-tight">Sign in.<br />Step into the arena.</h2>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10"><Link to="/"><GymSwordLogo /></Link></div>

          <div className="text-[10px] uppercase tracking-[0.2em] text-black/50 mb-3 font-semibold">Account</div>
          <h1 className="font-display uppercase font-black text-4xl sm:text-5xl mb-8">Sign In</h1>

          {/* Mode Tabs */}
          <div className="flex border-b border-black/15 mb-8">
            <button
              onClick={() => switchMode("password")}
              className={`flex-1 pb-3 text-[11px] font-bold uppercase tracking-[0.15em] border-b-2 transition-all ${
                mode === "password" ? "border-black text-black" : "border-transparent text-black/40 hover:text-black/60"
              }`}
            >
              Password Login
            </button>
            <button
              onClick={() => switchMode("otp")}
              className={`flex-1 pb-3 text-[11px] font-bold uppercase tracking-[0.15em] border-b-2 transition-all ${
                mode === "otp" ? "border-black text-black" : "border-transparent text-black/40 hover:text-black/60"
              }`}
            >
              OTP Login
            </button>
          </div>

          {/* Error */}
          {error && (
            <div data-testid={AUTH.error} className="mb-6 text-[12px] text-red-600 bg-red-50 border border-red-200 px-4 py-3">
              {error}
            </div>
          )}

          {/* Password Login */}
          {mode === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <label className="block">
                <div className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold mb-2">Email</div>
                <input
                  data-testid={AUTH.emailInput}
                  type="email"
                  required
                  className="w-full bg-white border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="block">
                <div className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold mb-2">Password</div>
                <input
                  data-testid={AUTH.passwordInput}
                  type="password"
                  required
                  className="w-full bg-white border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <button
                data-testid={AUTH.submit}
                disabled={loading}
                className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-4 hover:bg-black/80 disabled:opacity-50 transition-all"
              >
                {loading ? "Signing in\u2026" : "Sign In"}
              </button>
            </form>
          )}

          {/* OTP Login */}
          {mode === "otp" && (
            <div className="space-y-5">
              {!otpSent ? (
                <>
                  <label className="block">
                    <div className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold mb-2">Email</div>
                    <input
                      type="email"
                      required
                      className="w-full bg-white border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    />
                  </label>
                  <button
                    onClick={handleSendOTP}
                    disabled={otpLoading || !email}
                    className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-4 hover:bg-black/80 disabled:opacity-50 transition-all"
                  >
                    {otpLoading ? "Sending\u2026" : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center mb-2">
                    <p className="text-sm text-black/60">
                      Enter the 6-digit code sent to<br />
                      <span className="font-semibold text-black">{email}</span>
                    </p>
                  </div>

                  <OTPInput
                    length={6}
                    value={otp}
                    onChange={setOtp}
                    onComplete={handleVerifyOTP}
                    disabled={otpVerifying}
                  />

                  {otpVerifying && (
                    <div className="text-center text-[12px] text-black/50 mt-2">
                      Verifying\u2026
                    </div>
                  )}

                  <div className="text-center mt-4">
                    {countdown > 0 ? (
                      <span className="text-[12px] text-black/40">
                        Resend OTP in {countdown}s
                      </span>
                    ) : (
                      <button
                        onClick={handleSendOTP}
                        disabled={otpLoading}
                        className="text-[12px] font-semibold text-black underline underline-offset-4 hover:text-black/70 transition-colors"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleVerifyOTP(otp)}
                    disabled={otpVerifying || otp.length !== 6}
                    className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-4 hover:bg-black/80 disabled:opacity-50 transition-all mt-2"
                  >
                    {otpVerifying ? "Verifying\u2026" : "Verify & Sign In"}
                  </button>

                  <button
                    onClick={() => { setOtpSent(false); setOtp(""); setError(""); }}
                    className="w-full text-[11px] font-bold uppercase tracking-[0.12em] text-black/40 hover:text-black py-2 transition-colors"
                  >
                    Use a different email
                  </button>
                </>
              )}
            </div>
          )}

          {/* Links */}
          <div className="mt-6 flex justify-between text-[12px] text-black/60">
            <Link to="/forgot-password" data-testid={AUTH.forgotLink} className="underline underline-offset-4 hover:text-black transition-colors">
              Forgot password?
            </Link>
            <Link to="/register" data-testid={AUTH.switch} className="underline underline-offset-4 hover:text-black transition-colors">
              Create account
            </Link>
          </div>

          <div className="mt-12 text-[11px] text-black/30 uppercase tracking-wider text-center font-semibold">
            Admin? <Link to="/admin/login" className="text-black/60 hover:text-black underline transition-colors">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
