import { useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";

const LS_KEY = "gs_popup_dismissed";

export default function WelcomePopup({ onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dismiss = () => {
    localStorage.setItem(LS_KEY, "1");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/leads", {
        name: name.trim() || null,
        email: email.trim(),
        phone: phone.trim() || null,
      });
      setSubmitted(true);
      localStorage.setItem(LS_KEY, "1");
      setTimeout(() => onClose(), 1500);
    } catch {
      // silently dismiss on error
      dismiss();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[860px] rounded-2xl overflow-hidden shadow-2xl grid lg:grid-cols-2 bg-white">
        {/* Close Button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow transition"
          aria-label="Close"
        >
          <X size={16} className="text-black" />
        </button>

        {/* LEFT PANEL — Branding */}
        <div className="hidden lg:flex flex-col justify-between bg-black text-white p-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-black tracking-[3px]">GYMSWORD</span>
            </div>
            <div className="text-[10px] tracking-[4px] text-white/50 uppercase">Luxury Performance</div>
          </div>

          <div className="my-10">
            <h2 className="text-3xl font-black leading-tight tracking-tight">
              Unlock Your<br />Elite Identity
            </h2>
            <p className="mt-4 text-white/60 text-sm leading-relaxed max-w-[300px]">
              Premium activewear for athletes, creators, entrepreneurs and disciplined individuals who believe fitness is a lifestyle.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Premium Quality", "Anti-Odour Fabric", "Luxury Streetwear"].map((tag) => (
              <span
                key={tag}
                className="px-4 py-1.5 rounded-full border border-white/20 text-xs tracking-wide text-white/80"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — Form */}
        <div className="flex flex-col justify-center p-8 sm:p-10">
          {submitted ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="text-2xl font-black">Welcome to GymSword</h3>
              <p className="text-black/50 mt-2 text-sm">You're now part of the movement.</p>
            </div>
          ) : (
            <>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">Join GymSword</h3>
              <p className="text-black/50 text-sm mt-1 mb-8">
                Get launch updates, exclusive drops and early access.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-black/70 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full border border-black/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-black/70 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full border border-black/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-black/70 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full border border-black/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-black text-white uppercase tracking-widest text-sm font-bold py-3.5 rounded-lg hover:bg-black/90 disabled:opacity-50 transition"
                >
                  {submitting ? "Joining…" : "Join The Movement"}
                </button>
              </form>

              <p className="text-[11px] text-black/40 mt-4 text-center leading-relaxed">
                By continuing you agree to receive updates, launches and exclusive GymSword offers.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
