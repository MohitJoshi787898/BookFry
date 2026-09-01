'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion, useSpring, useMotionValue } from 'framer-motion';

export function MascotScrollChoreography() {
  const reduced = useReducedMotion();
  const [activePose, setActivePose] = useState<'hidden' | 'floating' | 'pointing'>('hidden');

  // Mouse tracking in floating mode
  const mxRaw = useMotionValue(0);
  const myRaw = useMotionValue(0);
  const mx = useSpring(mxRaw, { stiffness: 90, damping: 15 });
  const my = useSpring(myRaw, { stiffness: 90, damping: 15 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (reduced) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      mxRaw.set(nx * 15);
      myRaw.set(ny * 10);
    },
    [reduced, mxRaw, myRaw]
  );

  useEffect(() => {
    if (reduced) return;
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, reduced]);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;

      // Section-aware pose switching
      if (scrollY < 400) {
        setActivePose('hidden');
      } else if (scrollY >= 400 && scrollY < 1800) {
        // Trending reads / early sections -> Pointing / inviting fox
        setActivePose('pointing');
      } else {
        // Lower sections -> Floating / reading companion
        setActivePose('floating');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (activePose === 'hidden') return null;

  return (
    <AnimatePresence mode="wait">
      {activePose === 'pointing' && (
        <motion.div
          key="pointing-companion"
          initial={{ opacity: 0, x: 70, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 70, y: 30, scale: 0.8 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-28 sm:w-36 md:w-40 pointer-events-none select-none"
          aria-hidden="true"
        >
          {/* Glowing shadow disc */}
          <div className="absolute inset-0 rounded-full bg-[#FF9F2D]/20 blur-xl scale-75" />
          
          <motion.div
            style={reduced ? {} : { x: mx, y: my }}
            animate={reduced ? {} : { y: [0, -8, 0], rotate: [-1, 1, -1] }}
            transition={reduced ? {} : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/bookfry/bookfry-fox-pointing.webp"
              alt=""
              draggable={false}
              className="w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
            />
            {/* Little medium book stack beneath fox */}
            <div className="w-20 sm:w-24 mx-auto -mt-6 opacity-90">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/bookfry/book-stack-medium.webp"
                alt=""
                draggable={false}
                className="w-full h-auto object-contain drop-shadow-md"
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {activePose === 'floating' && (
        <motion.div
          key="floating-companion"
          initial={{ opacity: 0, x: 60, y: 40, scale: 0.85 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, y: 40, scale: 0.85 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-28 sm:w-36 md:w-40 pointer-events-none select-none"
          aria-hidden="true"
        >
          {/* Ambient magical glow */}
          <div className="absolute inset-0 rounded-full bg-[#FFB347]/25 blur-2xl scale-90" />

          <motion.div
            style={reduced ? {} : { x: mx, y: my }}
            animate={reduced ? {} : { y: [0, -12, 0], rotate: [-2, 2, -2] }}
            transition={reduced ? {} : { duration: 4.0, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/bookfry/bookfry-fox-floating.webp"
              alt=""
              draggable={false}
              className="w-full h-auto object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.55)]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MascotScrollChoreography;
