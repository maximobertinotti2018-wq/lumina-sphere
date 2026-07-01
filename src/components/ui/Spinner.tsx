'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function Spinner({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="w-full h-full rounded-full border-2 border-white/10 border-t-purple-500"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: 'linear',
        }}
      />
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 z-50 bg-[#0c0914]/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full blur-xl opacity-40 animate-pulse" />
        <Spinner className="w-16 h-16" />
      </div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white/60 text-sm font-medium tracking-wider"
      >
        LOADING SYSTEM...
      </motion.p>
    </div>
  );
}
