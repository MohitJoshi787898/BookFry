"use client";

import React, { useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { Zap, Sparkles } from "lucide-react";

interface HeroSceneLayeredProps {
  escrowBadge?: string;
  heroRef: React.RefObject<HTMLElement | null>;
}

// Spring physics configurations for multi-layer depth
const BG_SPRING = { stiffness: 45, damping: 18, mass: 1.2 };
const MID_SPRING = { stiffness: 60, damping: 16, mass: 1.0 };
const FORE_SPRING = { stiffness: 85, damping: 14, mass: 0.8 };

export function HeroSceneLayered({
  escrowBadge = "Direct Peer-to-Peer Campus Escrow",
  heroRef,
}: HeroSceneLayeredProps) {
  const reduced = useReducedMotion();

  // Layer 1-2: Background Glow Parallax (4-8px)
  const bgXRaw = useMotionValue(0);
  const bgYRaw = useMotionValue(0);
  const bgX = useSpring(bgXRaw, BG_SPRING);
  const bgY = useSpring(bgYRaw, BG_SPRING);

  // Layer 3-4: Midground Plant & Book Stack (15-25px)
  const midXRaw = useMotionValue(0);
  const midYRaw = useMotionValue(0);
  const midX = useSpring(midXRaw, MID_SPRING);
  const midY = useSpring(midYRaw, MID_SPRING);

  // Layer 5-6: Foreground Fox Mascot (25-40px + 3-5deg tilt)
  const foxXRaw = useMotionValue(0);
  const foxYRaw = useMotionValue(0);
  const foxRotYRaw = useMotionValue(0);
  const foxRotZRaw = useMotionValue(0);
  const foxX = useSpring(foxXRaw, FORE_SPRING);
  const foxY = useSpring(foxYRaw, FORE_SPRING);
  const foxRotY = useSpring(foxRotYRaw, FORE_SPRING);
  const foxRotZ = useSpring(foxRotZRaw, FORE_SPRING);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (reduced || !heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      // Layer 1-2: Subtle background shift
      bgXRaw.set(-nx * 7);
      bgYRaw.set(-ny * 5);

      // Layer 3-4: Midground shift
      midXRaw.set(nx * 18);
      midYRaw.set(ny * 10);

      // The foreground moves furthest, giving the flat illustration a 3D feel.
      foxXRaw.set(nx * 32);
      foxYRaw.set(ny * 16);
      foxRotYRaw.set(nx * 5);
      foxRotZRaw.set(-ny * 2.5);
    },
    [
      reduced,
      heroRef,
      bgXRaw,
      bgYRaw,
      midXRaw,
      midYRaw,
      foxXRaw,
      foxYRaw,
      foxRotYRaw,
      foxRotZRaw,
    ],
  );

  const handleMouseLeave = useCallback(() => {
    bgXRaw.set(0);
    bgYRaw.set(0);
    midXRaw.set(0);
    midYRaw.set(0);
    foxXRaw.set(0);
    foxYRaw.set(0);
    foxRotYRaw.set(0);
    foxRotZRaw.set(0);
  }, [
    bgXRaw,
    bgYRaw,
    midXRaw,
    midYRaw,
    foxXRaw,
    foxYRaw,
    foxRotYRaw,
    foxRotZRaw,
  ]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || reduced) return;
    hero.addEventListener("mousemove", handleMouseMove);
    hero.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      hero.removeEventListener("mousemove", handleMouseMove);
      hero.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [heroRef, handleMouseMove, handleMouseLeave, reduced]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[480px] lg:max-w-[560px] mx-auto select-none">
      {/* ── LAYER 1: Deep Radial Ambient Glow ──────────────────────────────── */}
      <motion.div
        style={reduced ? {} : { x: bgX, y: bgY }}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 z-0 opacity-85"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/bookfry/01_background_glow.png"
          alt=""
          className="h-full w-full object-contain"
        />
      </motion.div>

      {/* ── LAYER 2: Secondary Golden Aura ─────────────────────────────────── */}
      <motion.div
        style={reduced ? {} : { x: bgX, y: bgY }}
        aria-hidden="true"
        className="pointer-events-none absolute top-12 left-8 w-64 h-64 rounded-full bg-[#FFB347]/20 blur-2xl"
      />

      {/* ── LAYER 3: Composite Scene with Independent Layers ───────────────── */}
      <div className="relative w-full aspect-square max-h-[440px] sm:max-h-[500px]">
        {/* Layer 3A: Potted Plant on the Left */}
        <motion.div
          style={reduced ? {} : { x: midX, y: midY }}
          initial={{ opacity: 0, scale: 0.8, x: -30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="absolute -left-2 sm:left-0 bottom-6 sm:bottom-10 w-24 sm:w-32 md:w-36 z-10 drop-shadow-xl"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/bookfry/05_potted_plant.png"
            alt="Reading corner plant"
            draggable={false}
            className="w-full h-auto object-contain"
          />
        </motion.div>

        {/* Layer 3B: Large Stack of Hardcover Books in Center */}
        <motion.div
          style={reduced ? {} : { x: midX, y: midY }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-60 sm:w-72 md:w-80 z-15 drop-shadow-2xl"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/bookfry/03_book_stack_large.png"
            alt="Stack of colorful textbooks"
            draggable={false}
            className="w-full h-auto object-contain"
          />
        </motion.div>

        {/* Layer 3C: Main Fox Mascot sitting on top of books with spring float & eye tracking */}
        <motion.div
          animate={reduced ? {} : { y: [0, -10, 0] }}
          transition={
            reduced
              ? {}
              : {
                  duration: 3.4,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }
          }
          className="absolute left-1/2 -translate-x-1/2 top-0 sm:top-2 w-[270px] sm:w-[330px] md:w-[385px] z-20"
        >
          <motion.div
            style={
              reduced
                ? {}
                : {
                    x: foxX,
                    y: foxY,
                    rotateY: foxRotY,
                    rotateZ: foxRotZ,
                    transformPerspective: 1000,
                  }
            }
            initial={{ opacity: 0, scale: 0.85, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/bookfry/02_fox_reading.png"
              alt="BookFry Mascot Fox reading"
              draggable={false}
              className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)]"
            />
          </motion.div>
        </motion.div>

        {/* Layer 3D: Floating Open Books on the Right */}
        <motion.div
          style={reduced ? {} : { x: foxX, y: foxY }}
          animate={reduced ? {} : { y: [0, -12, 0], rotate: [-2, 2, -2] }}
          transition={
            reduced
              ? {}
              : { duration: 4.2, repeat: Infinity, ease: "easeInOut" }
          }
          className="absolute -right-1 sm:right-1 top-12 sm:top-16 w-20 sm:w-28 z-25 drop-shadow-xl"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/bookfry/06_floating_open_book.png"
            alt="Floating magical books"
            draggable={false}
            className="w-full h-auto object-contain opacity-95"
          />
        </motion.div>

        {/* Layer 3E: Separate mug, particles, and foliage keep the scene dimensional. */}
        <motion.div
          style={reduced ? {} : { x: foxX, y: foxY }}
          className="absolute right-8 sm:right-12 bottom-2 w-14 sm:w-16 z-30 drop-shadow-lg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/bookfry/08_mug.png"
            alt="Warm reading mug"
            draggable={false}
            className="w-full h-auto object-contain"
          />
        </motion.div>



        <motion.div
          style={reduced ? {} : { x: midX, y: midY }}
          aria-hidden="true"
          className="pointer-events-none absolute -right-5 bottom-0 w-24 sm:w-32 z-10 opacity-90"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/bookfry/11_foliage.png"
            alt=""
            className="w-full h-auto object-contain"
          />
        </motion.div>
      </div>

      {/* ── LAYER 4: Floating Escrow Trust Badge ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D2535]/90 border border-white/10 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.4)] text-xs font-extrabold text-[#F8FAFC]"
      >
        <Zap
          className="h-4 w-4 text-[#FF9F2D] animate-bounce"
          aria-hidden="true"
        />
        <span>{escrowBadge}</span>
        <Sparkles className="h-3.5 w-3.5 text-[#FFB347]" aria-hidden="true" />
      </motion.div>
    </div>
  );
}

export default HeroSceneLayered;
