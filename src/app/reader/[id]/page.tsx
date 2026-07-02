import { notFound, redirect } from 'next/navigation';
import ReaderClient from './ReaderClient';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { ExternalLink, Search, Upload } from 'lucide-react';

export default async function ReaderPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userBook = await prisma.userBook.findUnique({
    where: { userId_bookId: { userId: session.user.id, bookId: params.id } },
    include: { book: true }
  });

  if (!userBook) {
    notFound();
  }

  const { book } = userBook;
  const canRead = book.readable || book.isPublicDomain || !!userBook.ownedFileUrl;

  if (!canRead) {
    let links = null;
    if (book.externalLinks) {
      try { links = JSON.parse(book.externalLinks); } catch(e) {}
    }
    // Búsqueda genérica para conseguir el libro (siempre disponible), así el
    // usuario nunca queda sin ninguna acción cuando el libro no es leíble in-app.
    const searchUrl = `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(`${book.title} ${book.author}`)}`;
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-4 md:p-8 pt-24 text-center space-y-6">
          <GlassPanel variant="strong" className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-white">Este libro todavía no se puede leer en Lumina</h2>
            <p className="text-white/60">
              &ldquo;{book.title}&rdquo; no es de dominio público, así que no podemos mostrar su
              texto acá. Pero podés encontrar dónde conseguirlo, o subir tu propia copia si ya la tenés.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              {links?.google && (
                <a href={links.google} target="_blank" rel="noreferrer">
                  <Button variant="primary">
                    <ExternalLink className="w-4 h-4" /> Comprar
                  </Button>
                </a>
              )}
              <a href={searchUrl} target="_blank" rel="noreferrer">
                <Button variant={links?.google ? 'outline' : 'primary'}>
                  <Search className="w-4 h-4" /> Buscar dónde conseguirlo
                </Button>
              </a>
              <a href="/library">
                <Button variant="ghost">
                  <Upload className="w-4 h-4" /> Subir mi copia
                </Button>
              </a>
            </div>
            <p className="text-white/40 text-sm">
              Tip: en <a href="/discover" className="text-purple-300 hover:underline">Descubrir</a> podés
              filtrar clásicos de dominio público que sí se leen gratis al instante.
            </p>
          </GlassPanel>
        </div>
      </MainLayout>
    );
  }

  return (
    <ReaderClient
      book={book as any}
      userId={session.user.id}
      fileUrl={userBook.ownedFileUrl || book.fileUrl || undefined}
      initialPage={Math.max(1, userBook.currentPage)}
    />
  );
}
