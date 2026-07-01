'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AnimeMood = 'berserk' | 'fma' | 'classic' | 'cyberpunk';

interface DynamicBackgroundProps {
  mood?: AnimeMood;
}

const moodPalettes = {
  classic: {
    base: 'bg-[#0a0712]',
    blobs: [
      'bg-purple-900/30',
      'bg-indigo-950/40',
      'bg-violet-950/20',
      'bg-blue-950/30',
    ],
  },
  berserk: {
    base: 'bg-[#0f0404]',
    blobs: [
      'bg-red-950/30',
      'bg-rose-950/20',
      'bg-neutral-900/40',
      'bg-red-900/10',
    ],
  },
  fma: {
    base: 'bg-[#030a16]',
    blobs: [
      'bg-blue-950/40',
      'bg-slate-900/40',
      'bg-cyan-950/25',
      'bg-amber-950/15', // Alchemy gold glow
    ],
  },
  cyberpunk: {
    base: 'bg-[#06040d]',
    blobs: [
      'bg-fuchsia-950/30',
      'bg-cyan-950/30',
      'bg-violet-950/40',
      'bg-pink-950/10',
    ],
  },
};

export function DynamicBackground({ mood = 'classic' }: DynamicBackgroundProps) {
  const palette = moodPalettes[mood] || moodPalettes.classic;

  return (
    <div className={`fixed inset-0 -z-50 overflow-hidden w-full h-full transition-colors duration-1000 ${palette.base}`}>
      {/* Dynamic ambient blobs */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={mood}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Blob 1 */}
          <motion.div
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -50, 30, 0],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] pointer-events-none ${palette.blobs[0]}`}
          />

          {/* Blob 2 */}
          <motion.div
            animate={{
              x: [0, -60, 40, 0],
              y: [0, 30, -50, 0],
              scale: [1, 0.9, 1.15, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[140px] pointer-events-none ${palette.blobs[1]}`}
          />

          {/* Blob 3 */}
          <motion.div
            animate={{
              x: [0, 30, -30, 0],
              y: [0, 40, 20, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`absolute top-[40%] left-[30%] w-[45vw] h-[45vw] rounded-full blur-[100px] pointer-events-none ${palette.blobs[2]}`}
          />

          {/* Blob 4 */}
          <motion.div
            animate={{
              x: [0, -20, 30, 0],
              y: [0, -30, -10, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`absolute top-[10%] right-[15%] w-[50vw] h-[50vw] rounded-full blur-[110px] pointer-events-none ${palette.blobs[3]}`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Grid overlay for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
      
      {/* Soft Vignette */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none" style={{
        background: 'radial-gradient(circle, transparent 30%, rgba(0,0,0,0.6) 100%)'
      }} />
    </div>
  );
}
