'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

// Deterministic star positions to avoid hydration mismatch
const STARS = [
  { id: 0,  x: '8%',  y: '18%', size: 18, delay: 0.0, dur: 2.8, opacity: 0.9 },
  { id: 1,  x: '88%', y: '12%', size: 14, delay: 0.5, dur: 3.2, opacity: 0.7 },
  { id: 2,  x: '22%', y: '72%', size: 10, delay: 1.0, dur: 2.5, opacity: 0.6 },
  { id: 3,  x: '72%', y: '65%', size: 16, delay: 0.3, dur: 3.5, opacity: 0.8 },
  { id: 4,  x: '50%', y: '8%',  size: 8,  delay: 0.8, dur: 2.2, opacity: 0.5 },
  { id: 5,  x: '92%', y: '55%', size: 12, delay: 1.4, dur: 3.0, opacity: 0.7 },
  { id: 6,  x: '5%',  y: '45%', size: 10, delay: 0.6, dur: 2.7, opacity: 0.6 },
  { id: 7,  x: '60%', y: '85%', size: 14, delay: 1.1, dur: 3.3, opacity: 0.5 },
  { id: 8,  x: '35%', y: '15%', size: 8,  delay: 0.2, dur: 2.4, opacity: 0.8 },
  { id: 9,  x: '78%', y: '30%', size: 12, delay: 0.9, dur: 2.9, opacity: 0.6 },
  { id: 10, x: '15%', y: '88%', size: 10, delay: 1.3, dur: 3.1, opacity: 0.7 },
  { id: 11, x: '45%', y: '50%', size: 6,  delay: 0.4, dur: 2.6, opacity: 0.4 },
] as const;

/** Decorative floating sparkle stars for the hero section */
export function FloatingStars() {
  const reduced = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {STARS.map((s) => (
        <motion.div
          key={s.id}
          className="absolute text-secondary"
          style={{ left: s.x, top: s.y }}
          animate={reduced ? {} : {
            y: [0, -12, 0],
            opacity: [s.opacity, s.opacity * 0.4, s.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: s.dur,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Four-pointed star shape */}
          <svg
            width={s.size}
            height={s.size}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

export default FloatingStars;
