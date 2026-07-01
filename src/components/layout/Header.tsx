'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, User, Moon, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils/cn';

import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';

interface HeaderProps {
  userName?: string;
  userAvatar?: string;
  onSearch?: (query: string) => void;
  onThemeToggle?: () => void;
  theme?: 'light' | 'dark';
  className?: string;
}

export function Header({
  userName = 'User',
  userAvatar,
  onSearch,
  onThemeToggle,
  theme = 'dark',
  className,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [hasNotifications] = useState(true);
  const { t } = useLanguage();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
      onSearch?.(searchQuery);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30',
        'lg:left-[280px]',
        'transition-all duration-300',
        className
      )}
    >
      <GlassPanel 
        variant="strong" 
        className="rounded-none border-x-0 border-t-0"
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4">
          <motion.form
            onSubmit={handleSearch}
            className="flex-1 max-w-2xl"
            animate={{
              scale: isFocused ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              
              <input
                type="text"
                placeholder={t('header.searchPlaceholder') || "Search books, authors, genres..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={cn(
                  'w-full pl-12 pr-4 py-3 rounded-xl',
                  'bg-white/5 backdrop-blur-md',
                  'border border-white/10',
                  'text-white placeholder:text-white/40',
                  'transition-all duration-200',
                  'focus:bg-white/10 focus:border-white/30',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/50'
                )}
              />

              {isFocused && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 left-0 right-0 rounded-xl overflow-hidden"
                >
                  <GlassPanel variant="strong">
                    <div className="p-2">
                      <p className="text-xs text-white/40 px-3 py-2">
                        Presioná Enter para buscar
                      </p>
                    </div>
                  </GlassPanel>
                </motion.div>
              )}
            </div>
          </motion.form>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            <button
              onClick={onThemeToggle}
              className={cn(
                'p-2.5 rounded-xl',
                'bg-white/5 backdrop-blur-md',
                'border border-white/10',
                'text-white/60 hover:text-white',
                'hover:bg-white/10 hover:border-white/20',
                'transition-all duration-200'
              )}
            >
              {theme === 'dark' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* Notifications */}
            <button
              className={cn(
                'relative p-2.5 rounded-xl',
                'hidden sm:inline-flex',
                'bg-white/5 backdrop-blur-md',
                'border border-white/10',
                'text-white/60 hover:text-white',
                'hover:bg-white/10 hover:border-white/20',
                'transition-all duration-200'
              )}
            >
              <Bell className="w-5 h-5" />
              
              {hasNotifications && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black"
                />
              )}
            </button>

            {/* User Avatar */}
            <button
              className={cn(
                'flex items-center gap-3 pl-3 pr-4 py-2 rounded-xl',
                'bg-white/5 backdrop-blur-md',
                'border border-white/10',
                'hover:bg-white/10 hover:border-white/20',
                'transition-all duration-200',
                'group'
              )}
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              
              <span className="hidden md:block text-sm text-white/80 group-hover:text-white transition-colors">
                {userName}
              </span>
            </button>
          </div>
        </div>
      </GlassPanel>
    </header>
  );
}

