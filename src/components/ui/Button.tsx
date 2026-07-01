'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  loading,
  ...props
}: ButtonProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 select-none outline-none focus:ring-2 focus:ring-purple-500/50',
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    
    // Variants
    variant === 'primary' && 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    variant === 'outline' && 'border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white',
    variant === 'ghost' && 'hover:bg-white/10 text-white/80 hover:text-white',
    variant === 'secondary' && 'bg-white/10 hover:bg-white/20 text-white',

    // Sizes
    size === 'sm' && 'px-3 py-1.5 text-xs',
    size === 'md' && 'px-4 py-2.5 text-sm',
    size === 'lg' && 'px-6 py-3.5 text-base',
    className
  );

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={baseClasses}
      disabled={disabled}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
