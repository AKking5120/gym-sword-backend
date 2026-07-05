import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiErrorDetail } from "@/lib/api";
import { GymSwordLogo } from "@/components/GymSwordLogo";
import OTPInput from "@/components/OTPInput";
import { AUTH } from "@/constants/testIds";

export default function Register() {
  const { register, formatErr } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // form | verify | done
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(name, email, password, referralCode);
      if (user?.email) {
        setStep("verify");
        toast.success("Check your email for the verification code");
      }
    } catch (e) {
      setError(formatErr(e.response?.data?.detail) || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (enteredOtp) => {
    setVerifying(true);
    try {
      const { data } = await api.post("/auth/verify-email", { email, otp: enteredOtp || otp });
      if (data?.token) {
        localStorage.setItem("gs_token", data.token);
      }
      toast.success("Email verified! Welcome to GymSword.");
      navigate("/account");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.message) || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const resendOTP = async () => {
    try {
      await api.post("/auth/resend-otp", { email });
      toast.success("OTP resent");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.message) || "Failed to resend");
    }
  };

  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="mb-10"><Link to="/"><GymSwordLogo /></Link></div>
          <h1 className="font-display uppercase font-black text-3xl mb-3">Verify Email</h1>
          <p className="text-sm text-black/50 mb-8">Enter the 6-digit code sent to <strong>{email}</strong></p>

          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            onComplete={(val) => {
              setOtp(val);
              verifyOTP(val);
            }}
            disabled={verifying}
          />

          {verifying && (
            <div className="text-center text-[12px] text-black/50 mt-4">Verifying...</div>
          )}

          <button
            disabled={verifying || otp.length !== 6}
            onClick={() => verifyOTP()}
            className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-[2px] py-4 hover:bg-black/80 disabled:opacity-50 transition-all mt-6"
          >
            {verifying ? "Verifying..." : "Verify Email"}
          </button>

          <p className="mt-6 text-[12px] text-black/40">
            Didn't get the code?{" "}
            <button onClick={resendOTP} className="font-semibold text-black underline underline-offset-4 hover:text-black/70 transition-colors">
              Resend
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-12 order-2 lg:order-1">
        <form onSubmit={submit} className="w-full max-w-md">
          <div className="lg:hidden mb-10"><Link to="/"><GymSwordLogo /></Link></div>
          <div className="text-overline text-black/50 mb-3">Join</div>
          <h1 className="font-display uppercase font-black text-4xl sm:text-5xl mb-8">Create Account</h1>
          <div className="space-y-4">
            <Field id={AUTH.nameInput} label="Full Name" value={name} onChange={setName} />
            <Field id={AUTH.emailInput} label="Email" type="email" value={email} onChange={setEmail} />
            <Field id={AUTH.passwordInput} label="Password" type="password" value={password} onChange={setPassword} />
            <Field label="Referral Code (Optional)" value={referralCode} onChange={setReferralCode} required={false} />
          </div>
          {error && <div data-testid={AUTH.error} className="text-xs text-red-600 mt-4">{error}</div>}
          <button data-testid={AUTH.submit} disabled={loading} className="btn-luxury-primary w-full mt-8">
            {loading ? "Creating account..." : "Create Account"}
          </button>
          <div className="mt-6 text-center text-xs text-black/60">
            Already have an account?{" "}
            <Link to="/login" data-testid={AUTH.switch} className="luxury-link">Sign in →</Link>
          </div>
        </form>
      </div>
      <div className="hidden lg:block relative bg-black order-1 lg:order-2">
        <img
          src="/images/register.jpeg"
          alt=""
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
        <div className="absolute top-12 left-12">
          <Link to="/"><GymSwordLogo variant="light" /></Link>
        </div>
        <div className="absolute bottom-16 left-12 right-12 text-white">
          <div className="text-overline text-white/60 mb-3">Start Your Journey</div>
          <h2 className="font-display uppercase font-black text-4xl lg:text-5xl leading-tight">Join the<br />arena.</h2>
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, type = "text", value, onChange, required = true }) {
  return (
    <label className="block">
      <div className="text-overline text-black/60 mb-2">{label}</div>
      <input
        data-testid={id}
        type={type}
        required={required}
        className="w-full bg-white border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
