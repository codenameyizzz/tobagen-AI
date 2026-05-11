/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { HERO_PANORAMA_IMAGES } from "../constants";

const HERO_ROTATION_MS = 5000;

export default function Hero() {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveImageIndex((currentIndex) => (currentIndex + 1) % HERO_PANORAMA_IMAGES.length);
    }, HERO_ROTATION_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-8 pt-20">
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-cyan-300 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-lime-300 rounded-full blur-[110px]"></div>
      </div>

      <div className="absolute inset-x-8 top-32 bottom-12 z-0 rounded-apple-lg overflow-hidden shadow-2xl bg-black">
        {HERO_PANORAMA_IMAGES.map((image, index) => (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            className={`absolute inset-0 w-full h-full object-cover brightness-90 contrast-110 transition-opacity duration-1000 ${
              activeImageIndex === index ? "opacity-100" : "opacity-0"
            }`}
            referrerPolicy="no-referrer"
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10"></div>

        <div className="absolute left-6 right-6 bottom-6 z-10 hidden md:flex gap-3">
          {HERO_PANORAMA_IMAGES.map((image, index) => (
            <button
              key={image.alt}
              type="button"
              onClick={() => setActiveImageIndex(index)}
              aria-label={`Show panorama ${index + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                activeImageIndex === index ? "flex-1 bg-white" : "w-16 bg-white/35 hover:bg-white/55"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl text-center text-white px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-8xl font-semibold tracking-tight mb-8 leading-[1.05]"
        >
          Escape to the <br />
          <span className="text-white/80">Lake of Wonders.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Explore curated journeys across Danau Toba with live panorama-inspired visuals, Batak cultural highlights, and AI-assisted itinerary planning.
        </motion.p>
      </div>
    </section>
  );
}
