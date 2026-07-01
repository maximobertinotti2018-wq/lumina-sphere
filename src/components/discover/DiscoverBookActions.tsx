'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, Check, Loader2 } from 'lucide-react';
import { addCatalogBook, addPublicDomainBook } from '@/lib/actions/discoverActions';
import { useToastStore } from '@/lib/stores/toastStore';
import { useLanguage } from '@/context/LanguageContext';

export interface DiscoverBook {
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  isbn?: string;
  publishedYear?: string;
  seriesName?: string;
  seriesIndex?: number;
  isPublicDomain?: boolean;
  readable?: boolean;
  fileUrl?: string | null;
  sourceIds?: { google?: string; openLibrary?: string };
}

/**
 * Botones de acción para las cards de Discover.
 * - Dominio público → "Leer ahora": descarga el libro y abre el lector.
 * - Resto → "Agregar a biblioteca": lo suma como "quiero leer".
 */
export function DiscoverBookActions({ book }: { book: DiscoverBook }) {
  const router = useRouter();
  const { t } = useLanguage();
  const addToast = useToastStore((s) => s.addToast);
  const [isPending, setIsPending] = useState(false);
  const [added, setAdded] = useState(false);

  const handleReadNow = async () => {
    setIsPending(true);
    const result = await addPublicDomainBook({ ...book, fileUrl: book.fileUrl || undefined });
    if (result.success && result.bookId) {
      addToast(t('toast.bookAdded') || 'Libro agregado', 'success');
      router.push(`/reader/${result.bookId}`);
    } else {
      addToast(result.error || t('toast.bookAddedError') || 'Error', 'error');
      setIsPending(false);
    }
  };

  const handleAdd = async () => {
    setIsPending(true);
    const result = await addCatalogBook({ ...book, fileUrl: book.fileUrl || undefined });
    setIsPending(false);
    if (result.success) {
      setAdded(true);
      addToast(t('toast.bookAdded') || 'Libro agregado', 'success');
    } else {
      addToast(result.error || t('toast.bookAddedError') || 'Error', 'error');
    }
  };

  if (book.isPublicDomain && book.fileUrl) {
    return (
      <button
        onClick={handleReadNow}
        disabled={isPending}
        className="w-full py-2 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Preparando libro...
          </>
        ) : (
          <>
            <BookOpen className="w-4 h-4" /> {t('discover.readNow')}
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isPending || added}
      className="w-full py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : added ? (
        <>
          <Check className="w-4 h-4 text-green-400" /> En tu biblioteca
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" /> {t('discover.addToLibrary')}
        </>
      )}
    </button>
  );
}
