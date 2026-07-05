import { useRef, useCallback } from "react";

const TEXT_TYPES = ["text", "email", "password", "search", "tel", "url", "number", "date", "time"];
const CARD_SEL = "[class*=product-card], [class*=ProductCard], [class*=product-], [class*=card]";
const IMG_SEL = "img, [class*=image], [class*=img-]";

export const STATES = {
  INIT: "init",
  DEFAULT: "default",
  BUTTON: "button",
  CARD: "card",
  LINK: "link",
  IMAGE: "image",
  CLICK: "click",
  LOADING: "loading",
};

export const SCALES = {
  default: 1,
  button: 1.2,
  card: 1.15,
  link: 1.1,
  image: 1.05,
  click: 0.9,
};

export const ROTATIONS = {
  default: 0,
  button: 5,
  card: 2,
  link: 3,
  image: 0,
  click: 12,
};

export default function useCursor() {
  const mouseRef = useRef({ x: -100, y: -100 });
  const posRef = useRef({ x: -100, y: -100, s: 1, r: 0, o: 1 });
  const stateRef = useRef(STATES.INIT);
  const hiddenRef = useRef(true);

  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isTextInput = useCallback((el) => {
    const t = el.tagName?.toLowerCase();
    if (t === "textarea" || el.getAttribute?.("contenteditable") === "true") return true;
    if (t === "input") return TEXT_TYPES.includes((el.getAttribute("type") || "text").toLowerCase());
    return false;
  }, []);

  const detect = useCallback((el) => {
    if (!el || !el.matches) return STATES.DEFAULT;
    if (el.closest?.("button, [role=button], [class*=btn-]")) return STATES.BUTTON;
    if (el.closest?.(CARD_SEL)) return STATES.CARD;
    if (el.closest?.("a, [role=link]")) return STATES.LINK;
    if (el.matches?.(IMG_SEL) || el.closest?.(IMG_SEL)) return STATES.IMAGE;
    if (el.closest?.("nav, header, footer, [class*=nav]")) return STATES.LINK;
    return STATES.DEFAULT;
  }, []);

  return { mouseRef, posRef, stateRef, hiddenRef, isTouchDevice, reducedMotion, isTextInput, detect };
}
