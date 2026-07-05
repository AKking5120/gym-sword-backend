import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { GymSwordLogoLarge } from "@/components/GymSwordLogo";
import { ADMIN } from "@/constants/testIds";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const { adminLogin, formatErr } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(email, password);
      toast.success("Welcome, owner.");
      navigate("/admin");
    } catch (e) {
      const msg =
        e.response?.data?.detail ||
        e.message ||
        "Login failed";
      setError(formatErr(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="grain-overlay absolute inset-0" />
      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-12 flex justify-center"><GymSwordLogoLarge /></div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10">
            <div className="flex items-center gap-3 mb-2">
              <Lock size={16} className="text-white/60" />
              <div className="text-overline text-white/60">Owner Access Only</div>
            </div>
            <h1 className="font-display uppercase font-black text-3xl mb-8">Admin Sign In</h1>
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <div className="text-overline text-white/60 mb-2">Email</div>
                <input
                  data-testid={ADMIN.loginEmail}
                  type="email"
                  required
                  className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="block">
                <div className="text-overline text-white/60 mb-2">Password</div>
                <input
                  data-testid={ADMIN.loginPass}
                  type="password"
                  required
                  className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              {error && <div className="text-sm text-white bg-white/10 p-3 border border-white/20">{error}</div>}
              <button data-testid={ADMIN.loginSubmit} disabled={loading} className="btn-luxury-light w-full mt-4">
                {loading ? "Authenticating…" : "Sign In to Admin"}
              </button>
            </form>
          </div>
          <div className="mt-8 text-center text-xs text-white/40 tracking-luxury uppercase">
            Protected. Unauthorized access prohibited.
          </div>
        </div>
      </div>
    </div>
  );
}