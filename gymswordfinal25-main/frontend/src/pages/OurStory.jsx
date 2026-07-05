import {
  ArrowRight,
  Dumbbell,
  Crown,
  ShieldCheck,
  Flame,
  Sparkles,
  Quote,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Dumbbell size={28} />,
    title: "Performance Wear",
    desc: "Premium activewear designed for performance, comfort, durability, and confidence.",
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "Mindset Culture",
    desc: "GymSword represents discipline, self-growth, ambition, and modern identity.",
  },
  {
    icon: <Crown size={28} />,
    title: "Luxury Lifestyle",
    desc: "Blending fitness culture with luxury aesthetics to create a premium lifestyle movement.",
  },
  {
    icon: <Flame size={28} />,
    title: "Global Community",
    desc: "A growing movement built for ambitious people who want to rise beyond limits.",
  },
];

export default function OurStory() {
  return (
    <>
      <div className="bg-[#f3f3f3] overflow-hidden text-black">
        {/* HERO SECTION */}
        <section className="relative min-h-screen bg-black overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-[-200px] right-[-150px] w-[550px] h-[550px] bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-120px] left-[-120px] w-[350px] h-[350px] bg-gray-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* LEFT */}
            <motion.div
              initial={{ opacity: 0, x: -70 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-full mb-8">
                <Sparkles size={18} className="text-gray-300" />
                <p className="text-xs md:text-sm uppercase tracking-[4px] text-gray-300 font-semibold">
                  GymSword Lifestyle Movement
                </p>
              </div>

              <h1 className="text-5xl md:text-7xl xl:text-[92px] font-black leading-[0.92] tracking-tight text-white">
                Strength
                <span className="block text-gray-400 mt-2">Meets Identity</span>
              </h1>

              <p className="mt-10 text-gray-300 text-lg md:text-xl leading-9 max-w-2xl">
                GYM SWORD is not just an activewear brand. It is a powerful
                lifestyle movement built for ambitious individuals who believe in
                discipline, confidence, luxury, and self-evolution.
              </p>

              <div className="flex flex-wrap gap-5 mt-12">
                <a
                  href="/shop"
                  className="group bg-white text-black hover:bg-gray-200 transition-all duration-300 px-8 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 hover:scale-105"
                >
                  Explore Collection
                  <ArrowRight
                    size={22}
                    className="group-hover:translate-x-1 transition"
                  />
                </a>
                <a
                  href="/contact"
                  className="border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 px-8 py-5 rounded-2xl font-bold text-lg"
                >
                  Contact Us
                </a>
              </div>
            </motion.div>

            {/* RIGHT SIDE */}
            <motion.div
              initial={{ opacity: 0, x: 70 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-[45px] overflow-hidden">
                <img
                  src="/AboutImagesq.png"
                  alt="GymSword"
                  className="w-full h-[700px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl border border-white/10 rounded-[30px] p-7"
                >
                  <p className="uppercase tracking-[4px] text-gray-300 text-xs font-semibold mb-3">
                    GymSword Philosophy
                  </p>
                  <h3 className="text-white text-3xl md:text-4xl font-black leading-tight">
                    Identity of modern warriors
                  </h3>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* STORY SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-[40px] overflow-hidden shadow-2xl">
                <img
                  src="/about3.png"
                  alt="Founder"
                  className="w-full h-[650px] object-cover hover:scale-105 transition duration-700"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-3 bg-black text-white px-5 py-3 rounded-full mb-8">
                <Quote size={18} />
                <p className="uppercase tracking-[4px] text-xs font-semibold">
                  Founder Story
                </p>
              </div>

              <h2 className="text-4xl md:text-6xl font-black leading-tight mb-8">
                The Story
                <span className="block text-gray-400">
                  Behind GymSword
                </span>
              </h2>

              <p className="text-gray-700 text-lg leading-9 mb-8">
                GYM SWORD was founded by Shivam Singh during his journey as a
                personal trainer at Gold's Gym India. He closely experienced the
                mindset, struggles, ambitions, and discipline of people dedicated
                to fitness and self-improvement.
              </p>

              <p className="text-gray-700 text-lg leading-9 mb-8">
                He noticed a major gap in the fitness industry. Premium
                international gymwear brands offered style and quality, but their
                prices were out of reach for many young athletes and fitness
                enthusiasts.
              </p>

              <p className="text-gray-700 text-lg leading-9">
                Affordable products lacked comfort, durability, performance, and
                identity. Most brands were simply selling gym clothes — not the
                culture, confidence, mindset, and ambition that truly drive people
                in fitness.
              </p>
            </motion.div>
          </div>
        </section>

        {/* VISION + MISSION */}
        <section className="max-w-7xl mx-auto px-6 pb-24 md:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 70 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-[40px] p-10 md:p-14 shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              <p className="uppercase tracking-[4px] text-gray-500 text-sm font-semibold mb-5">
                Our Vision
              </p>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-8">
                Building a
                <span className="block text-gray-400">Global Movement</span>
              </h2>
              <p className="text-gray-700 text-lg leading-9 mb-7">
                Our vision is to build more than just an activewear brand. We aim
                to create a powerful lifestyle movement that represents
                discipline, ambition, confidence, and modern luxury.
              </p>
              <p className="text-gray-700 text-lg leading-9">
                People connect deeply with emotions, mindset, identity, culture,
                and aspiration — and GymSword is built for exactly that
                generation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 70 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative bg-black text-white rounded-[40px] p-10 md:p-14 overflow-hidden shadow-2xl"
            >
              <div className="absolute top-[-80px] right-[-80px] w-[250px] h-[250px] bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <p className="uppercase tracking-[4px] text-gray-400 text-sm font-semibold mb-5">
                  Our Mission
                </p>
                <h2 className="text-4xl md:text-5xl font-black leading-tight mb-8">
                  Performance
                  <span className="block text-gray-400">
                    Meets Lifestyle
                  </span>
                </h2>
                <p className="text-gray-300 text-lg leading-9 mb-7">
                  Our mission is to build a global luxury activewear movement
                  where performance meets lifestyle and discipline becomes
                  identity.
                </p>
                <p className="text-gray-300 text-lg leading-9">
                  GymSword is creating more than apparel — we are building a
                  community driven by strength, confidence, ambition, style, and
                  self-evolution.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="max-w-7xl mx-auto px-6 pb-24 md:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="uppercase tracking-[5px] text-gray-500 text-sm font-semibold mb-5">
              Why GymSword
            </p>
            <h2 className="text-4xl md:text-6xl font-black leading-tight">
              Designed For
              <span className="block text-gray-400 mt-2">
                The Ambitious Generation
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white rounded-[35px] p-8 border border-gray-200 overflow-hidden hover:-translate-y-3 hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-black scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="bg-[#f5f5f5] group-hover:bg-white group-hover:text-black transition-all duration-500 w-fit p-5 rounded-3xl mb-8">
                    {item.icon}
                  </div>
                  <h3 className="text-3xl font-black mb-5 group-hover:text-white transition duration-500">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-300 text-lg leading-8 transition duration-500">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
