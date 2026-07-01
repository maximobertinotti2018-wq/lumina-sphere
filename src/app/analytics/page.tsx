import { auth } from '@/lib/auth';
import { getUserStats } from '@/lib/actions/bookActions';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { TrendingUp, BookOpen, BookCheck, AlertCircle } from 'lucide-react';
import { redirect } from 'next/navigation';
import { serverT } from '@/lib/i18n/serverT';

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const statsRes = await getUserStats();
  const stats = statsRes.data || { totalBooks: 0, booksRead: 0, currentlyReading: 0 };
  const t = await serverT();

  return (
    <MainLayout mood="classic">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">{t('analytics.title')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassPanel className="p-6" hover>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">{t('analytics.totalBooks')}</p>
                <p className="text-2xl font-bold text-white">{stats.totalBooks}</p>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6" hover>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <BookCheck className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">{t('analytics.booksRead')}</p>
                <p className="text-2xl font-bold text-white">{stats.booksRead}</p>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6" hover>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">{t('analytics.currentlyReading')}</p>
                <p className="text-2xl font-bold text-white">{stats.currentlyReading}</p>
              </div>
            </div>
          </GlassPanel>
        </div>

        {((session.user as any).subscriptionTier === 'starter') && (
          <GlassPanel className="p-6 mt-8 border-white/30" variant="strong">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-white shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{t('analytics.unlockPro')}</h3>
                <p className="text-white/60 mb-4">
                  {t('analytics.unlockProDesc')}
                </p>
              </div>
            </div>
          </GlassPanel>
        )}
      </div>
    </MainLayout>
  );
}
