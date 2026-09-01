'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';
import { Zap } from 'lucide-react';

interface MascotCompanionProps {
  image: string;
  escrowBadge: string;
  heroRef: React.RefObject<HTMLElement | null>;
}

// ─── Spring Configs ───────────────────────────────────────────────────────────
const BODY_SPRING  = { stiffness: 60,  damping: 14, mass: 1.1 };
const HEAD_SPRING  = { stiffness: 50,  damping: 10, mass: 1.0 };
const EYE_SPRING   = { stiffness: 300, damping: 25, mass: 0.15 };

// Approximate eye positions (as fraction of rendered image width/height).
// Fox sits reading — eyes are roughly upper-centre of the image.
const L_EYE = { x: 0.38, y: 0.26 }; // viewer's left eye
const R_EYE = { x: 0.53, y: 0.26 }; // viewer's right eye
const EYE_R = 4.5; // max px a pupil travels from its resting point

export function MascotCompanion({ image, escrowBadge, heroRef }: MascotCompanionProps) {
  const reduced = useReducedMotion();
  const [isEscaped,    setIsEscaped]    = useState(false);
  const [wasVisible,   setWasVisible]   = useState(false);
  const isEscapedRef = useRef(false);

  // Refs for eye-position calculation in each render mode
  const inlineImgRef = useRef<HTMLImageElement>(null);
  const cornerImgRef = useRef<HTMLImageElement>(null);

  // ── Body parallax ─────────────────────────────────────────────────────────
  const bxRaw = useMotionValue(0);
  const byRaw = useMotionValue(0);
  const bx    = useSpring(bxRaw, BODY_SPRING);
  const by    = useSpring(byRaw, BODY_SPRING);

  // ── Head rotation ("looking" at cursor) ──────────────────────────────────
  const ryRaw = useMotionValue(0); // rotateY — left/right
  const rzRaw = useMotionValue(0); // rotateZ — tilt
  const ry    = useSpring(ryRaw, HEAD_SPRING);
  const rz    = useSpring(rzRaw, HEAD_SPRING);

  // ── Eye pupils ────────────────────────────────────────────────────────────
  const lpxRaw = useMotionValue(0); const lpx = useSpring(lpxRaw, EYE_SPRING);
  const lpyRaw = useMotionValue(0); const lpy = useSpring(lpyRaw, EYE_SPRING);
  const rpxRaw = useMotionValue(0); const rpx = useSpring(rpxRaw, EYE_SPRING);
  const rpyRaw = useMotionValue(0); const rpy = useSpring(rpyRaw, EYE_SPRING);

  // ── Eye-offset calculation ────────────────────────────────────────────────
  const eyeOffset = useCallback(
    (rel: { x: number; y: number }, cx: number, cy: number) => {
      const img = isEscapedRef.current ? cornerImgRef.current : inlineImgRef.current;
      if (!img) return { x: 0, y: 0 };
      const r   = img.getBoundingClientRect();
      const ex  = r.left + rel.x * r.width;
      const ey  = r.top  + rel.y * r.height;
      const dx  = cx - ex;
      const dy  = cy - ey;
      const ang = Math.atan2(dy, dx);
      const d   = Math.min(EYE_R, Math.hypot(dx, dy) * 0.05);
      return { x: Math.cos(ang) * d, y: Math.sin(ang) * d };
    },
    []
  );

  // ── Unified mouse handler ─────────────────────────────────────────────────
  const onMove = useCallback(
    (e: MouseEvent) => {
      if (reduced) return;
      const { clientX: cx, clientY: cy } = e;

      // Body parallax relative to hero section
      const h = heroRef.current;
      if (h && !isEscapedRef.current) {
        const hr = h.getBoundingClientRect();
        const nx = ((cx - hr.left) / hr.width  - 0.5) * 2;
        const ny = ((cy - hr.top)  / hr.height - 0.5) * 2;
        bxRaw.set(nx * 16);
        byRaw.set(ny * 8);
        ryRaw.set(nx * 22);  // head turns up to ±22 deg
        rzRaw.set(-ny * 9);  // head tilts up to ±9 deg
      }

      // Eyes always track
      const l = eyeOffset(L_EYE, cx, cy);
      const r = eyeOffset(R_EYE, cx, cy);
      lpxRaw.set(l.x); lpyRaw.set(l.y);
      rpxRaw.set(r.x); rpyRaw.set(r.y);
    },
    [reduced, heroRef, bxRaw, byRaw, ryRaw, rzRaw, eyeOffset, lpxRaw, lpyRaw, rpxRaw, rpyRaw]
  );

  const onLeave = useCallback(() => {
    bxRaw.set(0); byRaw.set(0);
    ryRaw.set(0); rzRaw.set(0);
    lpxRaw.set(0); lpyRaw.set(0);
    rpxRaw.set(0); rpyRaw.set(0);
  }, [bxRaw, byRaw, ryRaw, rzRaw, lpxRaw, lpyRaw, rpxRaw, rpyRaw]);

  // Hero section listener (inline mode)
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || reduced || isEscaped) return;
    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
    return () => { hero.removeEventListener('mousemove', onMove); hero.removeEventListener('mouseleave', onLeave); };
  }, [heroRef, onMove, onLeave, reduced, isEscaped]);

  // Global listener (corner mode — eyes follow anywhere on page)
  useEffect(() => {
    if (!isEscaped || reduced) return;
    isEscapedRef.current = true;
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); isEscapedRef.current = false; };
  }, [isEscaped, onMove, reduced]);

  // IntersectionObserver — hero enters/leaves viewport
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setWasVisible(true);
        setIsEscaped(false);
        isEscapedRef.current = false;
      } else if (wasVisible) {
        setIsEscaped(true);
        isEscapedRef.current = true;
      }
    }, { threshold: 0.08 });
    obs.observe(hero);
    return () => obs.disconnect();
  }, [heroRef, wasVisible]);

  // ── Shared eye overlay (positioned over the PNG pupils) ──────────────────
  const EyeOverlay = ({ sz }: { sz: number }) => (
    <>
      {/* Left pupil anchor */}
      <div className="absolute pointer-events-none" aria-hidden="true"
        style={{ left: '38%', top: '26%', transform: 'translate(-50%,-50%)' }}>
        <motion.div
          className="rounded-full bg-neutral-900/75"
          aria-hidden="true"
          style={{ x: lpx, y: lpy, width: sz, height: sz }}
        />
      </div>
      {/* Right pupil anchor */}
      <div className="absolute pointer-events-none" aria-hidden="true"
        style={{ left: '53%', top: '26%', transform: 'translate(-50%,-50%)' }}>
        <motion.div
          className="rounded-full bg-neutral-900/75"
          aria-hidden="true"
          style={{ x: rpx, y: rpy, width: sz, height: sz }}
        />
      </div>
    </>
  );

  // ── INLINE HERO MASCOT ────────────────────────────────────────────────────
  const inlineMascot = (
    <div className="relative flex flex-col items-center justify-center w-full">
      {/* Glowing orb behind mascot */}
      <div aria-hidden="true"
        className="pointer-events-none absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-secondary/30 dark:bg-secondary/20 blur-3xl" />
      <div aria-hidden="true"
        className="pointer-events-none absolute w-48 h-48 rounded-full bg-primary/20 dark:bg-primary/40 blur-2xl translate-x-8 -translate-y-4" />

      {/* Idle float wrapper — y keyframe loop */}
      <motion.div
        animate={reduced ? {} : { y: [0, -14, 0] }}
        transition={reduced ? {} : { duration: 3.2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      >
        {/* Cursor tracking wrapper — spring x/y/rotate */}
        <motion.div
          style={reduced ? { perspective: '600px' } : { x: bx, y: by, rotateY: ry, rotateZ: rz, perspective: '600px' }}
          className="relative w-full max-w-[300px] sm:max-w-[380px] lg:max-w-[440px]"
          initial={{ opacity: 0, x: 50, scale: 0.88 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Image container */}
          <div className="relative select-none" style={{ perspective: '600px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={inlineImgRef} src={image}
              alt="BookFry mascot fox reading a book"
              draggable={false}
              className="w-full object-contain drop-shadow-2xl" />
            {!reduced && <EyeOverlay sz={8} />}
          </div>
        </motion.div>
      </motion.div>

      {/* Escrow badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/90 border border-border backdrop-blur-md shadow-md text-xs font-extrabold text-text-primary"
      >
        <Zap className="h-4 w-4 text-secondary animate-bounce" aria-hidden="true" />
        <span>{escrowBadge}</span>
      </motion.div>
    </div>
  );

  // ── CORNER WALKING COMPANION (after scroll) ───────────────────────────────
  const cornerMascot = (
    <AnimatePresence>
      {isEscaped && (
        <motion.div
          key="corner-mascot"
          className="fixed bottom-0 right-4 z-40 w-32 sm:w-44 pointer-events-none select-none"
          aria-hidden="true"
          initial={{ opacity: 0, y: 80, x: 40 }}
          animate={reduced
            ? { opacity: 1, y: 0, x: 0 }
            : {
                opacity: 1,
                x: 0,
                y: [0, -18, 0, -14, 0],
                rotate: [-1, 2, 0, -2, -1],
              }}
          exit={{ opacity: 0, y: 80, x: 40 }}
          transition={reduced
            ? { duration: 0.4 }
            : {
                opacity:  { duration: 0.4 },
                x:        { duration: 0.5, type: 'spring', stiffness: 90 },
                y:        { duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: 0.3 },
                rotate:   { duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: 0.3 },
              }}
        >
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={cornerImgRef} src={image}
              alt=""
              draggable={false}
              className="w-full object-contain drop-shadow-2xl" />
            {!reduced && <EyeOverlay sz={5} />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {inlineMascot}
      {cornerMascot}
    </>
  );
}

export default MascotCompanion;
