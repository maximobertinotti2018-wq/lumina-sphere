'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils/cn';

import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';

interface HeaderProps {
  userName?: string;
  userAvatar?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function Header({
  userName = 'User',
  userAvatar,
  onSearch,
  className,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();

  // Cerrar el menú de usuario al clickear afuera o con Escape.
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isUserMenuOpen]);

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

            {/* User Avatar + Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen((open) => !open)}
                aria-label="Menú de usuario"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
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

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50"
                  >
                    <GlassPanel variant="strong" className="py-2">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-sm text-white font-medium truncate">{userName}</p>
                        {session?.user?.email && (
                          <p className="text-xs text-white/50 truncate">{session.user.email}</p>
                        )}
                      </div>
                      <Link
                        href="/settings"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        {t('nav.settings') || 'Ajustes'}
                      </Link>
                      <button
                        role="menuitem"
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </GlassPanel>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </GlassPanel>
    </header>
  );
}

