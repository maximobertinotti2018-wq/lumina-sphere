'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'strong';
  hover?: boolean;
  isPremium?: boolean;
  children: React.ReactNode;
}

export function GlassPanel({
  variant = 'default',
  hover = false,
  isPremium = false,
  className,
  children,
  ...props
}: GlassPanelProps) {
  const baseClasses = cn(
    'rounded-2xl transition-all duration-300 relative overflow-hidden',
    variant === 'strong' ? 'glass-panel-strong' : 'glass-panel',
    isPremium && 'border border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.15)] bg-gradient-to-b from-yellow-500/5 to-transparent',
    hover && 'hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]',
    className
  );

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className={baseClasses}
        {...(props as any)}
      >
        {isPremium && (
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 blur-xl rounded-full -mr-8 -mt-8 pointer-events-none" />
        )}
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} {...props}>
      {isPremium && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 blur-xl rounded-full -mr-8 -mt-8 pointer-events-none" />
      )}
      {children}
    </div>
  );
}
