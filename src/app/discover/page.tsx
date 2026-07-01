import { Suspense } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { getNYTBestsellers } from '@/lib/services/nyt';
import { Compass, BookOpen, Plus } from 'lucide-react';
import Image from 'next/image';
import { serverT } from '@/lib/i18n/serverT';

export const metadata = {
  title: 'Discover - LuminaSphere',
  description: 'Find new books, public domain classics, and series.',
};

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';
  const isSearch = query.length > 0;
  
  const t = await serverT();

  // Fetch bestsellers if not searching
  const bestsellers = !isSearch ? await getNYTBestsellers() : [];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
        
        {/* Header / Search Area */}
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            {t('discover.title')}
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Explore public domain classics, trending bestsellers, and expand your library.
          </p>
        </div>

        {isSearch ? (
          <Suspense fallback={<div className="text-white/40">Loading search results...</div>}>
            <SearchResults query={query} />
          </Suspense>
        ) : (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-white mt-12 mb-6 flex items-center gap-2">
              <Compass className="w-6 h-6 text-purple-400" />
              {t('discover.trending')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {bestsellers.map((book: any, idx: number) => (
                <GlassPanel key={idx} variant="default" className="p-4 flex flex-col items-center text-center group transition-all hover:bg-white/10 hover:scale-105">
                  <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden mb-4 shadow-xl">
                    {book.coverUrl ? (
                      <Image src={book.coverUrl} alt={book.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-medium text-sm line-clamp-1 w-full" title={book.title}>{book.title}</h3>
                  <p className="text-white/40 text-xs mt-1 w-full truncate">{book.author}</p>
                </GlassPanel>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

async function SearchResults({ query }: { query: string }) {
  const t = await serverT();
  // We can fetch from API route internally or call service directly if we are Server Component
  const { searchBooks } = await import('@/lib/services/bookSearch');
  const { findReadableSource } = await import('@/lib/services/publicDomain');
  
  const results = await searchBooks(query);
  const enriched = await Promise.all(results.map(async (book) => {
    const readable = await findReadableSource(book.title, book.author);
    return { ...book, isPublicDomain: !!readable, readable: !!readable, fileUrl: readable };
  }));

  if (enriched.length === 0) {
    return <div className="text-white/60">No results found for "{query}".</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {enriched.map((book, idx) => (
        <GlassPanel key={idx} variant="strong" className="p-4 flex gap-4 transition-all hover:bg-white/10">
          <div className="relative w-24 h-36 rounded-md overflow-hidden shrink-0 shadow-lg">
            {book.coverUrl ? (
              <Image src={book.coverUrl} alt={book.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white/20" />
              </div>
            )}
          </div>
          <div className="flex flex-col flex-1">
            <h3 className="text-white font-semibold text-lg line-clamp-2">{book.title}</h3>
            <p className="text-white/60 text-sm mb-2">{book.author}</p>
            {book.seriesName && (
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded w-fit mb-2">
                {book.seriesName} {book.seriesIndex ? `#${book.seriesIndex}` : ''}
              </span>
            )}
            <div className="mt-auto">
              {book.isPublicDomain ? (
                <button className="w-full py-2 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4" /> {t('discover.readNow')}
                </button>
              ) : (
                <button className="w-full py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> {t('discover.addToLibrary')}
                </button>
              )}
            </div>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
