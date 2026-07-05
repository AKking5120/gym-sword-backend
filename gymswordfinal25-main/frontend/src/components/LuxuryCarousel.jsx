import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function LuxuryCarousel({ children, className = "" }) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const container = el.querySelector(":scope > div");
    const firstCard = container?.children?.[0];
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth;
    const gap = parseFloat(getComputedStyle(container).gap) || 24;
    el.scrollBy({
      left: direction === "left" ? -(cardWidth + gap) : cardWidth + gap,
      behavior: "smooth",
    });
  };

  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeftStart.current = trackRef.current.scrollLeft;
    trackRef.current.style.cursor = "grabbing";
    trackRef.current.style.userSelect = "none";
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    trackRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (trackRef.current) {
      trackRef.current.style.cursor = "grab";
      trackRef.current.style.userSelect = "";
    }
  };

  return (
    <div className={`flex items-center gap-4 md:gap-6 ${className}`}>
      {/* LEFT ARROW ZONE */}
      <div className="hidden md:flex flex-shrink-0 w-11 items-center justify-center">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="w-11 h-11 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* PRODUCT VIEWPORT */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="flex-1 min-w-0 overflow-hidden cursor-grab"
      >
        {children}
      </div>

      {/* RIGHT ARROW ZONE */}
      <div className="hidden md:flex flex-shrink-0 w-11 items-center justify-center">
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="w-11 h-11 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}

