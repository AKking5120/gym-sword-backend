import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    image: "/images/model4.png",
    title: "Cozy Crew Online Exclusive",
    subtitle: "Luxury essentials designed for everyday confidence.",
  },
  {
    image: "/images/modelhero3.png",
    title: "Premium Streetwear Collection",
    subtitle: "Modern silhouettes with elevated comfort.",
  },
  {
    image: "/images/mainbackground.jpeg",
    title: "GymSword Signature Drop",
    subtitle: "Built for performance and premium lifestyle.",
  },
];

const HeroSlider = () => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative overflow-hidden bg-[#ffffff] h-auto lg:h-[720px] flex items-center">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-10 w-full">

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="grid grid-cols-1 lg:grid-cols-[45%_55%] items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >

            {/* LEFT CONTENT */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ duration: 0.5 }}
              className="z-10 px-4 lg:px-10"
            >
              <p className="text-lg text-gray-700 mb-5 tracking-wide">
                Look Exclusive
              </p>

              <h1 className="font-black leading-[0.92] text-[32px] sm:text-[42px] md:text-[52px] lg:text-[62px] xl:text-[72px] tracking-tight max-w-[700px]">
                {slides[index].title}
              </h1>

              <p className="text-gray-600 text-lg mt-6 max-w-[600px]">
                {slides[index].subtitle}
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <button onClick={() => navigate("/shop")} className="bg-black text-white px-8 lg:px-12 py-4 rounded-full font-semibold hover:scale-105 transition">
                  Shop Collection
                </button>

                <button onClick={() => navigate("/signup")} className="border border-black px-8 lg:px-12 py-4 rounded-full hover:bg-black hover:text-white transition">
                  Join Us
                </button>
              </div>
            </motion.div>

            {/* RIGHT IMAGE */}
            <div className="relative flex justify-center lg:justify-end">
              <motion.img
                key={slides[index].image}
                src={slides[index].image}
                alt="GymSword Hero"
                initial={{
                  opacity: 0,
                  x: 100,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: 100,
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.8,
                }}
                className="w-full max-w-[850px] h-[420px] md:h-[520px] lg:h-[700px] object-contain"
              />
            </div>

          </motion.div>
        </AnimatePresence>

        {/* LEFT ARROW */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition"
        >
          <ChevronLeft size={30} />
        </button>

        {/* RIGHT ARROW */}
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition"
        >
          <ChevronRight size={30} />
        </button>

        {/* DOTS */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                index === i
                  ? "w-8 h-3 bg-black"
                  : "w-3 h-3 bg-gray-400"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default HeroSlider;
