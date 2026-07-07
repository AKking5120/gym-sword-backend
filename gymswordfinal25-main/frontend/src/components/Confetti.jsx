import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#000000", "#ffffff", "#333333", "#666666", "#999999", "#1a1a1a", "#cccccc"];
const SHAPES = ["circle", "square", "line"];

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

function Piece({ id, color, shape, x, delay }) {
  const rotate = randomBetween(0, 720);
  const yEnd = 350 + randomBetween(0, 200);
  const xEnd = x + randomBetween(-120, 120);

  return (
    <motion.div
      key={id}
      className="absolute top-0"
      style={{ left: `${x}%` }}
      initial={{ y: -20, opacity: 1, rotate: 0, scale: 0 }}
      animate={{ y: yEnd, opacity: 0, rotate, scale: 1 }}
      transition={{ duration: 2.5 + randomBetween(0, 1), delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div
        style={{
          width: shape === "line" ? randomBetween(4, 8) : randomBetween(5, 10),
          height: shape === "line" ? randomBetween(16, 24) : randomBetween(5, 10),
          backgroundColor: color,
          borderRadius: shape === "circle" ? "50%" : shape === "square" ? "1px" : "0px",
          opacity: 0.9,
        }}
      />
    </motion.div>
  );
}

export default function Confetti({ duration = 4000 }) {
  const [pieces, setPieces] = useState([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const items = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      x: randomBetween(0, 100),
      delay: randomBetween(0, 0.6),
    }));
    setPieces(items);
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-[300] overflow-hidden">
          {pieces.map((p) => (
            <Piece key={p.id} {...p} />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
