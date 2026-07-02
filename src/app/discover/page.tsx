import { Suspense } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { getNYTBestsellers } from '@/lib/services/nyt';
import { Compass, BookOpen, Download, Library, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { serverT } from '@/lib/i18n/serverT';
import { DiscoverBookActions } from '@/components/discover/DiscoverBookActions';
import { searchOpenAccessBooks } from '@/lib/services/doab';
import { searchBorrowableBooks } from '@/lib/services/internetArchive';

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
            {t('discover.subtitle')}
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
                      <Image src={book.coverUrl} alt={book.title} fill sizes="(max-width: 768px) 45vw, 20vw" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-medium text-sm line-clamp-1 w-full" title={book.title}>{book.title}</h3>
                  <p className="text-white/40 text-xs mt-1 w-full truncate mb-3">{book.author}</p>
                  <DiscoverBookActions
                    book={{
                      title: book.title,
                      author: book.author,
                      coverUrl: book.coverUrl,
                      description: book.description,
                      isbn: book.isbn,
                    }}
                  />
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
  const { searchBooks } = await import('@/lib/services/bookSearch');
  const { findReadableSourcesForQuery, matchReadableSource } = await import('@/lib/services/publicDomain');

  // Todas las fuentes EN PARALELO: catálogo, dominio público (Gutenberg),
  // acceso abierto (DOAB) y préstamo (Internet Archive).
  const [results, gutenbergSources, openAccess, borrowable] = await Promise.all([
    searchBooks(query),
    findReadableSourcesForQuery(query),
    searchOpenAccessBooks(query),
    searchBorrowableBooks(query),
  ]);

  const enriched = results.map((book) => {
    const readable = matchReadableSource(gutenbergSources, book.title, book.author);
    return { ...book, isPublicDomain: !!readable, readable: !!readable, fileUrl: readable };
  });

  if (enriched.length === 0 && openAccess.length === 0 && borrowable.length === 0) {
    return <div className="text-white/60">No encontramos resultados para "{query}".</div>;
  }

  return (
    <div className="space-y-12">
    {enriched.length > 0 && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {enriched.map((book, idx) => (
        <GlassPanel key={idx} variant="strong" className="p-4 flex gap-4 transition-all hover:bg-white/10">
          <div className="relative w-24 h-36 rounded-md overflow-hidden shrink-0 shadow-lg">
            {book.coverUrl ? (
              <Image src={book.coverUrl} alt={book.title} fill sizes="96px" className="object-cover" />
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
              <DiscoverBookActions
                book={{
                  title: book.title,
                  author: book.author,
                  coverUrl: book.coverUrl,
                  description: book.description,
                  isbn: book.isbn,
                  publishedYear: book.publishedYear,
                  seriesName: book.seriesName,
                  seriesIndex: book.seriesIndex,
                  isPublicDomain: book.isPublicDomain,
                  fileUrl: book.fileUrl,
                  sourceIds: book.sourceIds,
                }}
              />
            </div>
          </div>
        </GlassPanel>
      ))}
    </div>
    )}

    {/* Acceso abierto (DOAB): académicos recientes, descargables legal */}
    {openAccess.length > 0 && (
      <section>
        <h2 className="text-2xl font-semibold text-white mb-2 flex items-center gap-2">
          <Download className="w-6 h-6 text-green-400" />
          Acceso abierto · descarga libre
        </h2>
        <p className="text-white/50 text-sm mb-6">
          Libros académicos de acceso abierto (DOAB), muchos recientes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {openAccess.map((book) => (
            <GlassPanel key={book.id} variant="strong" className="p-5 flex flex-col transition-all hover:bg-white/10">
              <h3 className="text-white font-semibold text-lg line-clamp-2">{book.title}</h3>
              <p className="text-white/60 text-sm mb-1">{book.author}</p>
              {book.year && <span className="text-xs text-green-300/80 mb-2">{book.year}</span>}
              {book.description && (
                <p className="text-white/40 text-xs line-clamp-3 mb-4">{book.description}</p>
              )}
              <a
                href={book.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-auto w-full py-2 bg-green-500/20 text-green-300 text-sm rounded-lg hover:bg-green-500/30 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {book.isDirectDownload ? 'Descargar PDF' : 'Ver y descargar'}
              </a>
            </GlassPanel>
          ))}
        </div>
      </section>
    )}

    {/* Internet Archive: préstamo digital controlado */}
    {borrowable.length > 0 && (
      <section>
        <h2 className="text-2xl font-semibold text-white mb-2 flex items-center gap-2">
          <Library className="w-6 h-6 text-amber-400" />
          Para pedir prestado
        </h2>
        <p className="text-white/50 text-sm mb-6">
          Préstamo digital gratuito en Internet Archive (leer online, como en una biblioteca).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {borrowable.map((book) => (
            <GlassPanel key={book.id} variant="strong" className="p-4 flex gap-4 transition-all hover:bg-white/10">
              <div className="relative w-20 h-28 rounded-md overflow-hidden shrink-0 shadow-lg">
                {book.coverUrl ? (
                  <Image src={book.coverUrl} alt={book.title} fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white/20" />
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <h3 className="text-white font-semibold line-clamp-2">{book.title}</h3>
                <p className="text-white/60 text-sm">{book.author}</p>
                {book.year && <span className="text-xs text-white/40 mb-2">{book.year}</span>}
                <a
                  href={book.archiveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto w-full py-2 bg-amber-500/20 text-amber-300 text-sm rounded-lg hover:bg-amber-500/30 transition flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {book.access === 'public' ? 'Leer gratis' : 'Pedir prestado'}
                </a>
              </div>
            </GlassPanel>
          ))}
        </div>
      </section>
    )}
    </div>
  );
}
