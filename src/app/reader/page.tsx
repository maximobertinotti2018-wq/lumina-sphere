import { auth } from '@/lib/auth';
import { getUserBooks } from '@/lib/actions/bookActions';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlassPanel } from '@/components/ui/GlassPanel';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { BookOpen } from 'lucide-react';

export default async function ReaderIndexPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const result = await getUserBooks();
  const books = result.data || [];
  
  const readingBooks = books.filter(b => b.status === 'reading' || b.status === 'want-to-read');

  return (
    <MainLayout mood="classic">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">Tus lecturas</h1>
        
        {readingBooks.length === 0 ? (
          <EmptyState 
            icon={<BookOpen className="w-12 h-12" />}
            title="No tienes libros activos"
            description="Agrega un libro en la biblioteca para empezar a leer."
            action={{ label: "Ir a Biblioteca", href: "/library" }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readingBooks.map((book) => (
              <Link href={`/reader/${book.id}`} key={book.id}>
                <GlassPanel hover className="p-4 flex gap-4 items-center">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-16 h-24 object-cover rounded shadow" />
                  ) : (
                    <div className="w-16 h-24 bg-purple-500/20 rounded flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white/50" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{book.title}</h3>
                    <p className="text-white/60 text-sm">{book.author}</p>
                    <p className="text-xs text-blue-400 mt-2">
                      Progreso: {book.readingProgress}%
                    </p>
                  </div>
                </GlassPanel>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
