import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function TopCollections() {

  const collections = [
    {
      title: "Joggers",
      image: "/images/joggers.png",
      slug: "joggers",
    },
    {
      title: "Leggings",
      image: "/images/leggies.png",
      slug: "leggings",
    },
    {
      title: "Hoodies",
      image: "/images/hoodie.jpg",
      slug: "hoodies",
    },
    {
      title: "Crop jacket",
      image: "/images/crop-jacket.png",
      slug: "crop-jackets",
    },
    {
      title: "Oversized T-Shirt",
      image: "/images/oversize.png",
      slug: "oversized-t-shirts",
    },
    {
      title: "Sports bra",
      image: "/images/Sport-bra.png",
      slug: "sports-bras",
    },
  ];

  return (

    <section className="w-full bg-[#f3f3f3] py-14 sm:py-16 md:py-20 overflow-hidden">

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-10">

        {/* HEADER */}
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          className="text-center"
        >

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[-1px] md:tracking-[-2px] text-black leading-tight">

            Top Collections

          </h2>

          <p className="mt-4 md:mt-5 text-gray-600 text-sm sm:text-base md:text-lg max-w-[700px] mx-auto leading-relaxed px-2">

            Express your style with our standout collection—
            fashion meets sophistication.

          </p>

        </motion.div>

        {/* COLLECTIONS */}
        <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-10 sm:gap-y-12 gap-x-4 sm:gap-x-6 place-items-center">

          {collections.map((item, index) => (

            <Link key={index} to={`/shop?type=${item.slug}`} className="flex flex-col items-center group cursor-pointer w-full max-w-[180px] no-underline">

              <motion.div
                initial={{
                  opacity: 0,
                  y: 50,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.6,
                }}
                whileHover={{
                  y: -8,
                }}
                className="flex flex-col items-center group cursor-pointer w-full max-w-[180px]"
              >

              {/* IMAGE CIRCLE */}
              <div className="relative w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] md:w-[160px] md:h-[160px] rounded-full bg-[#dddddd] flex items-center justify-center overflow-hidden transition duration-500 group-hover:scale-105 shadow-[0_15px_40px_rgba(0,0,0,0.08)]">

                {/* BLURRED IMAGE BACKGROUND */}
                <div className="absolute inset-0 scale-[1.5] blur-[40px] opacity-80">

                  <img
                    src={item.image}
                    alt="blur"
                    className="w-full h-full object-contain"
                  />

                </div>

                {/* DARK SOFT OVERLAY */}
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[8px]"></div>

                {/* CENTER GLOW */}
                <div className="absolute w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] bg-white/40 rounded-full blur-[50px]"></div>

                {/* IMAGE */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="relative z-10 w-[75px] sm:w-[90px] md:w-[105px] object-contain transition duration-500 group-hover:scale-110 drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]"
                />

              </div>

              {/* TITLE */}
              <h3 className="mt-5 sm:mt-6 md:mt-7 text-[15px] sm:text-[17px] md:text-[20px] font-bold text-black text-center leading-snug px-2">

                {item.title}

              </h3>

              </motion.div>

            </Link>

          ))}

        </div>

      </div>

    </section>
  );
}