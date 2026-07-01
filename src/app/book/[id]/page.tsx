import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { BookOpen, ExternalLink, Upload } from 'lucide-react';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function BookDetailsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get UserBook details
  const userBook = await prisma.userBook.findUnique({
    where: {
      userId_bookId: {
        userId: session.user.id,
        bookId: params.id,
      }
    },
    include: { book: true }
  });

  if (!userBook) {
    notFound();
  }

  const { book } = userBook;
  const canRead = book.readable || book.isPublicDomain || !!userBook.ownedFileUrl;
  let links = null;
  if (book.externalLinks) {
    try {
      links = JSON.parse(book.externalLinks);
    } catch(e) {}
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto p-4 md:p-8 pt-12 space-y-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="relative w-48 h-72 md:w-64 md:h-96 rounded-xl overflow-hidden shrink-0 shadow-2xl shadow-purple-500/10">
            {book.coverUrl ? (
              <Image src={book.coverUrl} alt={book.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white/20" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold text-white tracking-tight">{book.title}</h1>
            <p className="text-xl text-white/60">{book.author}</p>
            
            {book.seriesName && (
              <div className="bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg w-fit text-sm font-medium">
                {book.seriesName} {book.seriesIndex ? `— Book ${book.seriesIndex}` : ''}
              </div>
            )}

            <p className="text-white/80 leading-relaxed max-w-2xl mt-4">
              {book.description || "Sin descripción disponible."}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {canRead ? (
                <Link href={`/reader/${book.id}`} className="w-fit">
                  <Button variant="primary" className="w-fit">
                    <BookOpen className="w-5 h-5" />
                    Leer Ahora
                  </Button>
                </Link>
              ) : (
                <>
                  {links?.google && (
                    <a href={links.google} target="_blank" rel="noreferrer" className="w-fit">
                      <Button variant="outline" className="w-fit">
                        <ExternalLink className="w-5 h-5" />
                        Comprar / Conseguir
                      </Button>
                    </a>
                  )}
                  <Button variant="ghost" className="w-fit text-white/60 hover:text-white border border-white/10">
                    <Upload className="w-5 h-5" />
                    Subir mi archivo (Próximamente)
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
