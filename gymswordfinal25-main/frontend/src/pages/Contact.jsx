import { useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "@/lib/api";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", form);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent. We'll be in touch shortly.");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="relative h-[40vh] min-h-[280px] overflow-hidden bg-black">
        <img
          src="https://images.pexels.com/photos/17211446/pexels-photo-17211446.jpeg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80" />
        <div className="relative h-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col justify-end pb-12 text-white">
          <div className="text-overline text-white/70 mb-3">Get in Touch</div>
          <h1 className="font-display uppercase font-black text-5xl sm:text-7xl tracking-tight">Contact</h1>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <div>
            <div className="text-overline text-black/50 mb-2">Support</div>
            <a href="mailto:support@gymsword.com" className="flex items-center gap-3 luxury-link text-lg">
              <Mail size={18} /> support@gymsword.com
            </a>
            <p className="text-sm text-black/60 mt-3">We respond within 24 hours, Monday through Friday.</p>
          </div>
          <div>
            <div className="text-overline text-black/50 mb-2">Headquarters</div>
            <div className="flex items-start gap-3 text-sm">
              <MapPin size={18} className="mt-1" />
              <div>
                GymSword
                india,faridabad
              </div>
            </div>
          </div>
          <div className="border-t border-black/10 pt-8">
            <div className="text-overline text-black/50 mb-3">Press &amp; Wholesale</div>
            <p className="text-sm text-black/60">For press inquiries, partnerships, or wholesale, please write to support@gymsword.com with the subject prefix [Press] or [Wholesale].</p>
          </div>
        </div>

        <div className="lg:col-span-8 lg:col-start-6">
          {sent ? (
            <div className="bg-black text-white p-12 text-center" data-testid="contact-success">
              <div className="text-overline text-white/70 mb-3">Message received</div>
              <h2 className="font-display uppercase text-3xl mb-4">Thank you</h2>
              <p className="text-white/80">A member of our team will reply within 24 hours.</p>
              <button
                onClick={() => setSent(false)}
                className="btn-luxury-light mt-8"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5" data-testid="contact-form">
              <div className="grid sm:grid-cols-2 gap-5">
                <Field id="contact-name" label="Your Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Field id="contact-email" label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
              </div>
              <Field id="contact-subject" label="Subject" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} required />
              <label className="block">
                <div className="text-overline text-black/60 mb-2">Message</div>
                <textarea
                  data-testid="contact-message"
                  required
                  rows={7}
                  className="w-full bg-white border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </label>
              <button data-testid="contact-submit" disabled={loading} className="btn-luxury-primary">
                <Send size={14} className="mr-3" />
                {loading ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

function Field({ id, label, value, onChange, type = "text", required }) {
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
