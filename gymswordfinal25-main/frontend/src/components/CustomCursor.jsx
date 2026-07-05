import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import useCursor, { STATES, SCALES, ROTATIONS } from "@/hooks/useCursor";

const DEFAULT_SIZE = 28;
const HOVER_SIZE = 34;
const GLOW_SIZE = 56;

export default function CustomCursor() {
  const glowRef = useRef(null);
  const rafRef = useRef(null);
  const [ripples, setRipples] = useState([]);

  const { mouseRef, posRef, stateRef, hiddenRef, isTouchDevice, reducedMotion, isTextInput, detect } = useCursor();

  const mvX = useMotionValue(-100);
  const mvY = useMotionValue(-100);
  const mvS = useMotionValue(1);
  const mvR = useMotionValue(0);
  const mvO = useMotionValue(0);
  const mvSize = useMotionValue(DEFAULT_SIZE);

  const smoothX = useSpring(mvX, { stiffness: 180, damping: 20 });
  const smoothY = useSpring(mvY, { stiffness: 180, damping: 20 });
  const smoothS = useSpring(mvS, { stiffness: 400, damping: 30 });
  const smoothR = useSpring(mvR, { stiffness: 300, damping: 25 });
  const smoothO = useSpring(mvO, { stiffness: 200, damping: 20 });

  const cx = useTransform(smoothX, (v) => v - mvSize.get() / 2);
  const cy = useTransform(smoothY, (v) => v - mvSize.get() / 2);

  useEffect(() => {
    if (isTouchDevice || reducedMotion) return;
    document.documentElement.classList.add("gymsword-cursor-active");
    return () => document.documentElement.classList.remove("gymsword-cursor-active");
  }, [isTouchDevice, reducedMotion]);

  useEffect(() => {
    if (isTouchDevice) return;

    const onMove = (e) => {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        mvX.set(e.clientX);
        mvY.set(e.clientY);
        posRef.current.x = e.clientX;
        posRef.current.y = e.clientY;
      }
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      const text = isTextInput(e.target);
      document.documentElement.classList.toggle("gymsword-cursor-active", !text);

      if (stateRef.current !== STATES.CLICK) {
        stateRef.current = text ? STATES.DEFAULT : detect(e.target);
      }
    };

    const onDown = () => {
      if (reducedMotion) return;
      stateRef.current = STATES.CLICK;
      const id = Date.now();
      setRipples((p) => [...p, { id, x: mouseRef.current.x, y: mouseRef.current.y }]);
      setTimeout(() => setRipples((p) => p.filter((r) => r.id !== id)), 700);
      setTimeout(() => {
        if (stateRef.current === STATES.CLICK) stateRef.current = STATES.DEFAULT;
      }, 120);
    };

    const onUp = () => { if (stateRef.current === STATES.CLICK) stateRef.current = STATES.DEFAULT; };
    const onLeave = () => { hiddenRef.current = true; document.documentElement.classList.remove("gymsword-cursor-active"); };
    const onEnter = () => { hiddenRef.current = false; document.documentElement.classList.add("gymsword-cursor-active"); };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [isTouchDevice, reducedMotion, mvX, mvY, isTextInput, detect, mouseRef, posRef, stateRef, hiddenRef]);

  useEffect(() => {
    if (isTouchDevice || reducedMotion) return;

    let isLoading = false;
    const checkLoad = () => {
      isLoading = document.readyState !== "complete" || document.documentElement.hasAttribute("data-cursor-loading");
      document.documentElement.classList.toggle("gymsword-cursor-loading", isLoading);
    };
    const obs = new MutationObserver(checkLoad);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-cursor-loading"] });
    window.addEventListener("gymsword:cursor-loading", (e) => { isLoading = e.detail?.loading ?? isLoading; });
    document.addEventListener("readystatechange", checkLoad);
    checkLoad();

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);

      const st = stateRef.current;
      const ts = st === STATES.CLICK ? SCALES.click : (SCALES[st] || SCALES.default);
      const tr = st === STATES.CLICK ? ROTATIONS.click : (ROTATIONS[st] || ROTATIONS.default);
      const to = (st === STATES.INIT || hiddenRef.current) ? 0 : 1;

      posRef.current.s += (ts - posRef.current.s) * 0.14;
      posRef.current.r += (tr - posRef.current.r) * 0.14;
      posRef.current.o += (to - posRef.current.o) * 0.14;

      mvX.set(mouseRef.current.x);
      mvY.set(mouseRef.current.y);
      mvS.set(posRef.current.s);
      mvR.set(isLoading ? 0 : posRef.current.r);
      mvO.set(Math.min(1, Math.max(0, posRef.current.o)));

      const sz = (st !== STATES.DEFAULT && st !== STATES.INIT && !hiddenRef.current) ? HOVER_SIZE : DEFAULT_SIZE;
      mvSize.set(sz);

      const gg = glowRef.current;
      if (gg) {
        const show = st === STATES.BUTTON || st === STATES.LINK || st === STATES.CLICK;
        gg.style.transform = `translate(${posRef.current.x - GLOW_SIZE / 2}px, ${posRef.current.y - GLOW_SIZE / 2}px) scale(${posRef.current.s * 1.4})`;
        gg.style.opacity = to * (show ? 0.35 : 0);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      obs.disconnect();
    };
  }, [isTouchDevice, reducedMotion, mvX, mvY, mvS, mvR, mvO, mvSize, mouseRef, stateRef, posRef, hiddenRef]);

  if (isTouchDevice || reducedMotion) return null;

  return (
    <>
      <div
        ref={glowRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998]"
        style={{
          width: GLOW_SIZE,
          height: GLOW_SIZE,
          background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.04) 60%, transparent 80%)",
          transition: "opacity 0.2s ease",
        }}
      />
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: cx,
          y: cy,
          scale: smoothS,
          rotate: smoothR,
          opacity: smoothO,
          width: mvSize,
          height: mvSize,
          filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.3)) drop-shadow(0 0 2px rgba(255,255,255,0.15))",
        }}
      >
        <svg id="gymsword-cursor-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="block w-full h-full" style={{ willChange: "transform" }}>
          <defs>
            <linearGradient id="g-blade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4a4a4a"/>
              <stop offset="25%" stopColor="#c8c8c8"/>
              <stop offset="50%" stopColor="#ffffff"/>
              <stop offset="75%" stopColor="#a0a0a0"/>
              <stop offset="100%" stopColor="#3a3a3a"/>
            </linearGradient>
            <linearGradient id="g-metal" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#222222"/>
              <stop offset="50%" stopColor="#5a5a5a"/>
              <stop offset="100%" stopColor="#1a1a1a"/>
            </linearGradient>
            <linearGradient id="g-handle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#333333"/>
              <stop offset="100%" stopColor="#111111"/>
            </linearGradient>
          </defs>
          <g>
            <path d="M14 2 L18 2 L19 17 L16 20 L13 17 Z" fill="url(#g-blade)"/>
            <path d="M14 2 L16 0 L18 2 Z" fill="url(#g-blade)"/>
            <path d="M16 0.5 L16 18.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none"/>
            <rect x="9" y="19" width="14" height="2" rx="0.5" fill="url(#g-metal)"/>
            <rect x="14" y="21" width="4" height="6" rx="0.8" fill="url(#g-handle)"/>
            <rect x="14.5" y="21.5" width="0.8" height="5" rx="0.3" fill="#555" opacity="0.4"/>
            <circle cx="16" cy="28" r="1.5" fill="url(#g-metal)"/>
          </g>
        </svg>
      </motion.div>
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            className="fixed rounded-full border pointer-events-none z-[9997]"
            style={{ left: r.x - 10, top: r.y - 10, width: 20, height: 20, borderColor: "rgba(255,255,255,0.6)" }}
            initial={{ scale: 0.3, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
      <style>{`
        @keyframes gymsword-cursor-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        html.gymsword-cursor-loading #gymsword-cursor-svg {
          animation: gymsword-cursor-spin 1.2s linear infinite;
        }
      `}</style>
    </>
  );
}
