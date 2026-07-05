import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Mail, Trash2, Reply } from "lucide-react";

const STATUSES = ["new", "read", "replied", "closed"];

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState(null);

  const load = () =>
    api.get("/admin/contact-messages")
      .then(({ data }) => setMessages(data || []))
      .catch(() => {
        setMessages([]);
        toast.error("Could not load messages");
      });
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/contact-messages/${id}`, { status });
      load();
      if (active?.id === id) setActive({ ...active, status });
    } catch { toast.error("Failed"); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    await api.delete(`/admin/contact-messages/${id}`);
    if (active?.id === id) setActive(null);
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-overline text-white/50">Communication</div>
        <h1 className="font-display uppercase font-black text-4xl mt-2">Contact Messages</h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white/5 border border-white/10 max-h-[70vh] overflow-y-auto">
          {messages.length === 0 && <div className="p-6 text-white/50 text-sm">No messages yet.</div>}
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => { setActive(m); if (m.status === "new") updateStatus(m.id, "read"); }}
              data-testid={`admin-message-${m.id}`}
              className={`w-full text-left p-4 border-b border-white/10 hover:bg-white/5 transition ${
                active?.id === m.id ? "bg-white/10" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {m.status === "new" && <span className="w-2 h-2 bg-white rounded-full" />}
                <span className="text-overline text-white/50">{m.status}</span>
                <span className="ml-auto text-xs text-white/40">{new Date(m.created_at).toLocaleString()}</span>
              </div>
              <div className="font-medium mt-1 truncate">{m.subject || "(no subject)"}</div>
              <div className="text-xs text-white/60 mt-1">{m.name || m.email}</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-7">
          {!active ? (
            <div className="bg-white/5 border border-white/10 p-12 text-center text-white/50">
              <Mail size={32} className="mx-auto mb-3 opacity-50" />
              Select a message to view
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 p-8">
              <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                  <div className="text-overline text-white/50">{new Date(active.created_at).toLocaleString()}</div>
                  <div className="font-display text-2xl uppercase mt-1">{active.subject || "(no subject)"}</div>
                  <div className="text-sm text-white/70 mt-2">
                    {active.name || "Anonymous"} · <a href={`mailto:${active.email}`} className="luxury-link">{active.email}</a>
                  </div>
                </div>
                <button onClick={() => del(active.id)} className="p-2 hover:bg-white/10" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="border-t border-white/10 pt-6 whitespace-pre-wrap text-sm text-white/80 leading-relaxed">
                {active.message}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-3 items-center">
                <span className="text-overline text-white/50 mr-2">Status:</span>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(active.id, s)}
                    className={`px-3 py-2 text-overline border ${
                      active.status === s ? "bg-white text-black border-white" : "border-white/30 text-white/70 hover:border-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <a href={`mailto:${active.email}?subject=Re: ${encodeURIComponent(active.subject || "Your message")}`} className="ml-auto btn-luxury-light !px-4 !py-2 text-xs">
                  <Reply size={12} className="mr-2" /> Reply via Email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
