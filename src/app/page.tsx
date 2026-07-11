import { MainLayout } from '@/components/layout/MainLayout';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { BookOpen, TrendingUp, Heart, Clock } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getUserBooks } from '@/lib/actions/bookActions';
import { STARTER_BOOK_LIMIT } from '@/lib/constants';
import { LandingPage } from '@/components/landing/LandingPage';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';
import { serverT } from '@/lib/i18n/serverT';

export default async function HomePage() {
  const session = await auth();
  // Sin sesión: landing pública que explica la app (antes: página en blanco).
  if (!session?.user?.id) return <LandingPage />;

  const t = await serverT();

  // Una sola query como fuente de verdad: los stats se derivan de acá. Evita
  // el dashboard inconsistente que aparecía cuando getUserBooks y getUserStats
  // se pedían por separado y una fallaba (ej: conexión fría a la DB).
  const booksRes = await getUserBooks();
  const books = booksRes.data || [];

  const readingBooks = books.filter(b => b.status === 'reading');
  const stats = {
    totalBooks: books.length,
    booksRead: books.filter(b => b.status === 'finished').length,
    currentlyReading: readingBooks.length,
    favorites: books.filter(b => b.isFavorite).length,
  };
  const userTier = (session.user as any).subscriptionTier || 'starter';

  return (
    <MainLayout mood="classic">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white">
            {t('home.welcome')}
          </h1>
          <p className="text-xl text-white/60">
            {t('home.subtitle')}
          </p>
        </div>

        {books.length === 0 ? (
          <EmptyState 
            icon={<BookOpen className="w-12 h-12" />}
            title={t('home.empty.title')}
            description={t('home.empty.description')}
            action={{ label: t('library.empty.addFirst'), href: "/library" }}
          />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassPanel variant="default" className="p-6" hover>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalBooks}</p>
                    <p className="text-sm text-white/60">{t('home.stats.inLibrary')}</p>
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel variant="default" className="p-6" hover>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.booksRead}</p>
                    <p className="text-sm text-white/60">{t('home.stats.read')}</p>
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel variant="default" className="p-6" hover>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-pink-500/20">
                    <Heart className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.favorites}
                    </p>
                    <p className="text-sm text-white/60">{t('home.stats.favorites')}</p>
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel variant="default" className="p-6" hover>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <Clock className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.currentlyReading}</p>
                    <p className="text-sm text-white/60">{t('home.stats.reading')}</p>
                  </div>
                </div>
              </GlassPanel>
            </div>

            {/* Currently Reading */}
            {readingBooks.length > 0 && (
              <GlassPanel variant="strong" className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {t('home.currentlyReading')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {readingBooks.slice(0, 3).map((book) => (
                    <Link href={`/reader/${book.id}`} key={book.id}>
                      <GlassPanel variant="default" className="p-4 cursor-pointer" hover>
                        {book.coverUrl ? (
                          <div 
                            className="aspect-[2/3] rounded-lg mb-4 bg-cover bg-center" 
                            style={{ backgroundImage: `url(${book.coverUrl})` }} 
                          />
                        ) : (
                          <div className="aspect-[2/3] bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg mb-4 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                        <h3 className="text-white font-semibold mb-2 line-clamp-1">{book.title}</h3>
                        <p className="text-white/60 text-sm mb-3 line-clamp-1">{book.author}</p>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                            style={{ width: `${book.readingProgress || 0}%` }}
                          />
                        </div>
                      </GlassPanel>
                    </Link>
                  ))}
                </div>
              </GlassPanel>
            )}
          </>
        )}

        {/* Aviso de límite: SOLO cuando el usuario starter llegó de verdad
            al tope de libros. Antes se mostraba "alcanzaste tu límite" a
            usuarios recién registrados con 0 libros. */}
        {userTier === 'starter' && stats.totalBooks >= STARTER_BOOK_LIMIT && (
          <GlassPanel variant="strong" className="p-8 mt-8" isPremium>
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">
                {t('upgrade.title')}
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                {t('upgrade.description')}
              </p>
              <Link href="/library">
                <Button variant="primary" size="lg">
                  {t('common.upgrade')}
                </Button>
              </Link>
            </div>
          </GlassPanel>
        )}
      </div>
    </MainLayout>
  );
}
