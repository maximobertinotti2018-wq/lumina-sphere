'use client';

import { useSession } from 'next-auth/react';
import { DynamicBackground } from '@/components/ui/DynamicBackground';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils/cn';

type AnimeMood = 'berserk' | 'fma' | 'classic';

interface MainLayoutProps {
  children: React.ReactNode;
  mood?: AnimeMood;
  onUpgrade?: () => void;
  onSearch?: (query: string) => void;
  className?: string;
}

export function MainLayout({
  children,
  mood = 'classic',
  onUpgrade,
  onSearch,
  className,
}: MainLayoutProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'User';
  const userAvatar = session?.user?.image || undefined;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <DynamicBackground mood={mood} />

      <Sidebar 
        onUpgrade={onUpgrade}
      />

      <div
        className={cn(
          'min-h-screen transition-all duration-300',
          'lg:ml-[280px]',
          className
        )}
      >
        <Header
          userName={userName}
          userAvatar={userAvatar}
          onSearch={onSearch}
        />

        <main
          className={cn(
            'pt-20',
            'px-6 py-8',
            'min-h-screen',
            'overflow-y-auto',
            'scroll-smooth',
            '[&::-webkit-scrollbar]:w-2',
            '[&::-webkit-scrollbar-track]:bg-white/5',
            '[&::-webkit-scrollbar-thumb]:bg-white/20',
            '[&::-webkit-scrollbar-thumb]:rounded-full',
            '[&::-webkit-scrollbar-thumb:hover]:bg-white/30'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}


