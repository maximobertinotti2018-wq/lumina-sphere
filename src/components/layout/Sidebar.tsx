"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Library, 
  Music, 
  Film, 
  TrendingUp,
  Settings,
  Crown,
  Zap,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

type SubscriptionTier = 'starter' | 'pro' | 'premium';

interface SidebarProps {
  onUpgrade?: () => void;
  className?: string;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string;
  locked?: boolean;
}

export function Sidebar({ 
  onUpgrade,
  className 
}: SidebarProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const userTier = (session?.user as any)?.subscriptionTier || 'starter';

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      icon: <Compass className="w-5 h-5" />,
      label: t('nav.discover') || 'Discover',
      href: '/discover',
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: t('nav.reader') || 'Reader',
      href: '/reader',
    },
    {
      icon: <Library className="w-5 h-5" />,
      label: t('nav.library') || 'Library',
      href: '/library',
    },
    {
      icon: <Music className="w-5 h-5" />,
      label: t('nav.music') || 'Music',
      href: '/music',
      // Music and Movies unlocked for everyone
    },
    {
      icon: <Film className="w-5 h-5" />,
      label: t('nav.movies') || 'Movies',
      href: '/movies',
      // Music and Movies unlocked for everyone
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: t('nav.analytics') || 'Analytics',
      href: '/analytics',
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: t('nav.settings') || 'Settings',
      href: '/settings',
    },
  ];

  const tierInfo = {
    starter: {
      name: 'Starter',
      icon: null,
      color: 'text-gray-400',
      description: 'Free',
    },
    pro: {
      name: 'Pro',
      icon: <Zap className="w-4 h-4" />,
      color: 'text-blue-400',
      description: '$9.99/mo',
    },
    premium: {
      name: 'Premium',
      icon: <Crown className="w-4 h-4" />,
      color: 'text-white',
      description: '$19.99/mo',
    },
  };

  const currentTier = tierInfo[userTier as SubscriptionTier] || tierInfo.starter;

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40',
          'transition-all duration-300 ease-out',
          className
        )}
        animate={{
          width: isCollapsed ? '80px' : '280px',
        }}
      >
        <GlassPanel 
          variant="strong" 
          className="h-full flex flex-col rounded-none border-l-0 border-t-0 border-b-0"
        >
          {/* Logo & Collapse Button */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-xl">Lumina</span>
              </motion.div>
            )}
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-white/60" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-white/60" />
              )}
            </button>
          </div>

          {/* User Status */}
          <div className="p-4 border-b border-white/10">
            <GlassPanel 
              variant="default" 
              className={cn(
                'p-4',
                userTier === 'premium' && 'border-2 border-white/30'
              )}
              isPremium={userTier === 'premium'}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  userTier === 'starter' && 'bg-gray-500/20',
                  userTier === 'pro' && 'bg-blue-500/20',
                  userTier === 'premium' && 'bg-white/10'
                )}>
                  {currentTier.icon || (
                    <span className="text-white/60 text-sm font-bold">
                      {currentTier.name[0]}
                    </span>
                  )}
                </div>
                
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-semibold', currentTier.color)}>
                        {currentTier.name}
                      </span>
                      {userTier === 'premium' && currentTier.icon}
                    </div>
                    <span className="text-xs text-white/40">
                      {currentTier.description}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Upgrade Button — solo donde hay flujo de upgrade real (library) */}
              {userTier !== 'premium' && !isCollapsed && onUpgrade && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-4"
                >
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full relative overflow-hidden"
                    onClick={onUpgrade}
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade
                  </Button>
                </motion.div>
              )}
            </GlassPanel>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.locked ? '#' : item.href}
                onClick={(e) => {
                  if (item.locked) {
                    e.preventDefault();
                    onUpgrade?.();
                  }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl',
                    'transition-all duration-200',
                    'hover:bg-white/10',
                    'group relative',
                    item.locked && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <span className="text-white/70 group-hover:text-white transition-colors">
                    {item.icon}
                  </span>
                  
                  {!isCollapsed && (
                    <>
                      <span className="text-white/80 group-hover:text-white text-sm font-medium flex-1">
                        {item.label}
                      </span>
                      
                      {item.badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                          {item.badge}
                        </span>
                      )}
                      
                      {item.locked && (
                        <span className="text-xs text-white/40">🔒</span>
                      )}
                    </>
                  )}
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-white/10">
              <p className="text-xs text-white/40 text-center">
                LuminaSphere v1.0
              </p>
            </div>
          )}
        </GlassPanel>
      </motion.aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-50 p-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-xl"
      >
        <BookOpen className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-80 z-50"
            >
              <GlassPanel 
                variant="strong" 
                className="h-full flex flex-col rounded-none border-l-0 border-t-0 border-b-0"
              >
                {/* Close Button */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-bold text-xl">Lumina</span>
                  </div>
                  
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                <div className="p-4 border-b border-white/10">
                  <GlassPanel 
                    variant="default" 
                    className="p-4"
                    isPremium={userTier === 'premium'}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        userTier === 'starter' && 'bg-gray-500/20',
                        userTier === 'pro' && 'bg-blue-500/20',
                        userTier === 'premium' && 'bg-white/10'
                      )}>
                        {currentTier.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-sm font-semibold', currentTier.color)}>
                            {currentTier.name}
                          </span>
                        </div>
                        <span className="text-xs text-white/40">
                          {currentTier.description}
                        </span>
                      </div>
                    </div>

                    {userTier !== 'premium' && onUpgrade && (
                      <div className="mt-4">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={onUpgrade}
                        >
                          <Crown className="w-4 h-4" />
                          Upgrade
                        </Button>
                      </div>
                    )}
                  </GlassPanel>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.locked ? '#' : item.href}
                      onClick={(e) => {
                        if (item.locked) {
                          e.preventDefault();
                          onUpgrade?.();
                        } else {
                          setIsMobileOpen(false);
                        }
                      }}
                    >
                      <div
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl',
                          'transition-all duration-200',
                          'hover:bg-white/10',
                          item.locked && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <span className="text-white/70">{item.icon}</span>
                        <span className="text-white/80 text-sm font-medium flex-1">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                            {item.badge}
                          </span>
                        )}
                        {item.locked && <span className="text-xs">🔒</span>}
                      </div>
                    </Link>
                  ))}
                </nav>
              </GlassPanel>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
