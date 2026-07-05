import { useState, useRef, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Bot, User, Trash2, RefreshCw, Eye, ShoppingBag, Mic, MicOff, ChevronLeft, ChevronRight } from "lucide-react";
import { api, resolveImage, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const WELCOME_MSG = {
  role: "assistant",
  content: "Welcome to **GymSword** ⚔️\n\nI'm your personal AI Shopping Assistant. I can help you discover the perfect gear, find your size, track orders, and more.\n\n**How can I help you today?**",
  timestamp: Date.now(), type: "text",
};

const GUEST_WELCOME = {
  role: "assistant",
  content: "Welcome to **GymSword** ⚔️\n\nI'm your personal AI Shopping Assistant. Browse our collection and find your perfect gear.\n\n**How can I help you today?**",
  timestamp: Date.now(), type: "text",
};

function formatTimestamp(ts) {
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function getImageUrl(product) {
  const img = product.images?.[0];
  const url = typeof img === "string" ? img : img?.url || product.image;
  return url && url !== "undefined" && url !== "null" ? url : null;
}

function renderMarkdown(text) {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = escaped
    .replace(/\|(.+?)\|/g, (match) => {
      if (match.includes("---")) return '<hr class="border-white/10 my-1" />';
      const cells = match.split("|").filter(Boolean);
      return `<span class="table-row">${cells.map(c => `<span class="table-cell px-2 py-0.5 text-xs">${c.trim()}</span>`).join("")}</span>`;
    })
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/```(\w*)\n([\s\S]*?)```/g, "<pre class='text-xs bg-white/5 rounded p-2 my-1 overflow-x-auto text-white/80'><code>$2</code></pre>")
    .replace(/`(.+?)`/g, "<code class='text-xs bg-white/10 px-1 rounded text-white/80'>$1</code>")
    .replace(/\n/g, "<br>");
  return html;
}

function formatPrice(price) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%231A1A1A'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23555' font-family='Arial,sans-serif' font-size='14'%3ENo image%3C/text%3E%3C/svg%3E";

const ProductCard = memo(({ product }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const rawUrl = getImageUrl(product);
  const imgSrc = rawUrl ? resolveImage(rawUrl) : null;
  const discounted = product.compare_price && product.compare_price > product.price;
  const discountPct = discounted ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0;
  const showPlaceholder = !rawUrl || imgError;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shrink-0 w-[185px] snap-start hover:border-white/30 hover:bg-white/[0.07] transition-all duration-300">
      <div className="relative h-[160px] bg-neutral-900 overflow-hidden">
        {showPlaceholder ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/15 gap-2">
            <ShoppingBag className="w-8 h-8" />
            <span className="text-[10px] tracking-widest uppercase">GymSword</span>
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        {discountPct > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-red-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
            {discountPct}% OFF
          </span>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-[11px] font-semibold text-white/80 tracking-wider uppercase">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <p className="text-[12px] font-medium text-white/90 leading-tight line-clamp-2 min-h-[2rem]">
          {product.name}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-white tracking-tight">{formatPrice(product.price)}</span>
          {discounted && (
            <span className="text-[10px] text-white/40 line-through">{formatPrice(product.compare_price)}</span>
          )}
        </div>
        {product.rating > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={`w-3 h-3 ${star <= Math.round(product.rating) ? "text-yellow-400" : "text-white/20"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[9px] text-white/40">({product.reviews_count || 0})</span>
          </div>
        )}
        <div className="flex gap-1.5 pt-0.5">
          <button onClick={() => navigate(`/product/${product.id}`)}
            className="flex-1 text-[10px] bg-white text-black rounded-lg py-2 font-semibold hover:bg-white/90 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-1">
            <Eye className="w-3 h-3" /> View
          </button>
          <button onClick={() => navigate("/cart")}
            className="flex-1 text-[10px] bg-white/10 text-white/80 rounded-lg py-2 font-medium hover:bg-white/20 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-1">
            <ShoppingBag className="w-3 h-3" /> Cart
          </button>
        </div>
      </div>
    </div>
  );
});
ProductCard.displayName = "ProductCard";

const ProductCarousel = memo(({ products }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState, products]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector("div");
    const w = card ? card.offsetWidth + 12 : 200;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  return (
    <div className="relative group -mx-4">
      {canScrollLeft && (
        <button onClick={() => scroll(-1)}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/80 border border-white/15 flex items-center justify-center text-white/70 hover:bg-white hover:text-black hover:border-white transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm shadow-lg">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}
      {canScrollRight && (
        <button onClick={() => scroll(1)}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/80 border border-white/15 flex items-center justify-center text-white/70 hover:bg-white hover:text-black hover:border-white transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm shadow-lg">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
      <div ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 py-1 snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
});
ProductCarousel.displayName = "ProductCarousel";

const QuickReplyBtn = memo(({ text, onClick }) => {
  const isAction = /^(Contact support|Sign In|Create Account|Yes|No)/.test(text);
  return (
    <button onClick={() => onClick(text)}
      className={`text-xs px-3.5 py-2 rounded-full border transition-all duration-200 whitespace-nowrap ${
        isAction
          ? "border-white/30 bg-white/10 text-white hover:bg-white hover:text-black"
          : "border-white/15 bg-white/5 text-white/70 hover:bg-white hover:text-black hover:border-white"
      }`}>
      {text}
    </button>
  );
});
QuickReplyBtn.displayName = "QuickReplyBtn";

const ChatMessage = memo(({ msg, isUser, onQuickReply }) => {
  const isProducts = msg.type === "products" && msg.products?.length > 0;
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
      <div className={`flex gap-2 ${isUser ? "max-w-[80%]" : "max-w-[calc(100%-1.75rem)]"}`}>
        {!isUser && (
          <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-1 backdrop-blur-sm">
            <Bot className="w-3.5 h-3.5 text-white/80" />
          </div>
        )}
        <div className="space-y-2 min-w-0">
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isUser
                ? "bg-white text-black rounded-br-md"
                : "bg-white/5 backdrop-blur-sm border border-white/10 text-white/90 rounded-bl-md"
            }`}>
            {isUser ? (
              <p>{msg.content}</p>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
            )}
          </div>
          {isProducts && <ProductCarousel products={msg.products} />}
          {!isUser && msg.quick_replies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {msg.quick_replies.map((qr, i) => <QuickReplyBtn key={i} text={qr} onClick={onQuickReply} />)}
            </div>
          )}
          {msg.timestamp && (
            <p className={`text-[10px] text-white/30 ${isUser ? "text-right mr-1" : "ml-1"}`}>
              {formatTimestamp(msg.timestamp)}
            </p>
          )}
        </div>
        {isUser && (
          <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-1">
            <User className="w-3.5 h-3.5 text-white/60" />
          </div>
        )}
      </div>
    </div>
  );
});
ChatMessage.displayName = "ChatMessage";

const TypingDots = memo(() => (
  <div className="flex justify-start animate-in fade-in duration-200">
    <div className="flex gap-2 max-w-[85%]">
      <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-1 backdrop-blur-sm">
        <Bot className="w-3.5 h-3.5 text-white/80" />
      </div>
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  </div>
));
TypingDots.displayName = "TypingDots";

const QUICK_ACTIONS = [
  { label: "New Arrivals", icon: "✨" },
  { label: "Bestsellers", icon: "🔥" },
  { label: "Track Order", icon: "📦" },
  { label: "Size Help", icon: "📏" },
];

const ADMIN_ACTIONS = [
  { label: "Dashboard", icon: "📊" },
  { label: "Today's Sales", icon: "💰" },
  { label: "Low Stock", icon: "⚠️" },
  { label: "Pending Orders", icon: "📋" },
];

export default function ChatBot() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("gs_chat_history");
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length > 0) return parsed; }
    } catch {}
    return [user ? WELCOME_MSG : GUEST_WELCOME];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [error, setError] = useState(null);
  const [listening, setListening] = useState(false);
  const [userSent, setUserSent] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem("gs_chat_history", JSON.stringify(messages.slice(0, 60))); } catch {}
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = useCallback(async (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    setInput("");
    setShowSuggestions(false);
    setError(null);
    setUserSent(true);
    setMessages(prev => [...prev, { role: "user", content: userMsg, timestamp: Date.now() }]);
    setLoading(true);
    try {
      const { data } = await api.post("/ai/chat", { message: userMsg });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply || "I'm not sure how to respond to that. Could you rephrase?",
        timestamp: Date.now(),
        type: data.type || "text",
        products: data.products || null,
        navigation: data.navigation || null,
        quick_replies: data.quick_replies || [],
      }]);
    } catch {
      setError("Connection failed. Tap to retry.");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again or contact support@gymsword.com",
        timestamp: Date.now(), type: "text", isError: true,
      }]);
    } finally { setLoading(false); }
  }, [input, loading]);

  useEffect(() => {
    if (!userSent || messages.length < 2) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "assistant" && lastMsg.navigation?.to) {
      const timer = setTimeout(() => navigate(lastMsg.navigation.to), 1000);
      return () => clearTimeout(timer);
    }
  }, [messages, navigate, userSent]);

  const handleQuickReply = useCallback((text) => sendMessage(text), [sendMessage]);
  const handleKey = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([user ? WELCOME_MSG : GUEST_WELCOME]);
    setShowSuggestions(true);
    setError(null);
    setUserSent(false);
  }, [user]);

  const retryLast = useCallback(() => {
    if (messages.length < 2) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMsg) {
      const idx = messages.findLastIndex(m => m.role === "user");
      setMessages(prev => prev.slice(0, idx));
      sendMessage(lastUserMsg.content);
    }
  }, [messages, sendMessage]);

  const startVoice = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setInput("Voice not supported in this browser");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join("");
      setInput(transcript);
    };
    recognition.onend = () => { setListening(false); };
    recognition.onerror = () => { setListening(false); };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, []);

  const stopVoice = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      if (input.trim()) sendMessage();
    }
  }, [input, sendMessage]);

  const isAdmin = user?.role === "admin";
  const quickActions = isAdmin ? ADMIN_ACTIONS : QUICK_ACTIONS;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-center gap-4">
        {!open && (
          <button onClick={() => setOpen(true)}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300"
            aria-label="Chat with GymSword AI">
            <MessageCircle className="w-6 h-6" />
          </button>
        )}
      </div>

      {open && (
        <div className="fixed bottom-24 right-6 z-[100] w-[420px] max-w-[calc(100vw-2rem)] h-[640px] max-h-[calc(100vh-10rem)] bg-neutral-950/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold tracking-tight">GymSword AI</p>
                <p className="text-white/40 text-[11px]">
                  {loading ? "Thinking..." : user ? `Welcome, ${user.name?.split(" ")[0] || "there"}!` : "Online"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isAdmin && (
                <span className="text-[10px] text-white/40 border border-white/10 rounded px-2 py-0.5">ADMIN</span>
              )}
              <button onClick={clearChat}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors" title="Clear chat">
                <Trash2 className="w-3.5 h-3.5 text-white/40" />
              </button>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 overflow-x-hidden" ref={bottomRef}>
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} msg={msg} isUser={msg.role === "user"} onQuickReply={handleQuickReply} />
            ))}
            {loading && <TypingDots />}
            {showSuggestions && messages.length === 1 && (
              <div className="space-y-3 pt-2">
                <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory -mx-1 px-1 scrollbar-none">
                  {quickActions.map((a) => (
                    <button key={a.label} onClick={() => sendMessage(a.label)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 hover:bg-white/10 hover:border-white/30 transition-all duration-200 whitespace-nowrap shrink-0">
                      <span>{a.icon}</span>
                      <span>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center pt-2">
                <button onClick={retryLast}
                  className="flex items-center gap-2 text-xs text-white/50 bg-white/5 border border-white/10 rounded-full px-4 py-2 hover:bg-white/10 transition-colors">
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 px-4 py-3 bg-neutral-950/80 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <button onClick={listening ? stopVoice : startVoice}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  listening ? "bg-red-500/20 text-red-400" : "hover:bg-white/10 text-white/40"
                }`}
                title={listening ? "Stop" : "Voice input"}>
                {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
                placeholder={listening ? "Listening..." : "Ask about products, orders, or help..."}
                className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30 focus:outline-none"
                disabled={loading || listening} />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center disabled:opacity-30 hover:bg-white/90 transition-colors shrink-0">
                <Send className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
