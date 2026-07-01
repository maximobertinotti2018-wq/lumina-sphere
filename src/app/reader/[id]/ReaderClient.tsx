"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Users, Sparkles } from "lucide-react";
import { ReaderView } from "@/components/reader/ReaderView";
import type { Book } from "@/types";
import { updateProgress } from "@/lib/actions/bookActions";
import { VibePanel } from "@/components/vibe/VibePanel";
import { CompanionBar } from "@/components/companions/CompanionBar";
import { getCharactersForBook } from "@/lib/actions/companionActions";
import { cn } from "@/lib/utils/cn";

type DockTab = "characters" | "vibe" | null;

export default function ReaderClient({ book, fileUrl, initialPage = 1 }: { book: Book, userId?: string, fileUrl?: string, initialPage?: number }) {
  const router = useRouter();

  // Panel activo del dock (uno a la vez → nunca se pisan).
  const [dock, setDock] = useState<DockTab>(null);

  // Personajes: se cargan SOLO al abrir el panel por primera vez (lazy).
  const [characters, setCharacters] = useState<any[]>([]);
  const [charsLoaded, setCharsLoaded] = useState(false);
  const [charsLoading, setCharsLoading] = useState(false);

  useEffect(() => {
    if (dock === "characters" && !charsLoaded && !charsLoading) {
      setCharsLoading(true);
      getCharactersForBook(book.id)
        .then((res) => { if (res.success) setCharacters(res.characters); })
        .catch(() => {})
        .finally(() => { setCharsLoading(false); setCharsLoaded(true); });
    }
  }, [dock, charsLoaded, charsLoading, book.id]);

  // Contexto que recibe el personaje para mantenerse en personaje.
  const bookContext = [
    book.description || "",
    ((book as any).fullText || "").slice(0, 3000),
  ].join("\n").slice(0, 3500);

  const handlePageChange = async (page: number) => {
    // Guardar progreso es best-effort: no debe trabar la lectura si falla.
    try {
      const progress = Math.min(100, (page / (book.pageCount || 100)) * 100);
      await updateProgress(book.id, progress, page);
    } catch {
      /* ignore */
    }
  };

  const handleClose = () => {
    router.push('/library');
  };

  const fullBook = { ...book, fileUrl };

  const toggle = (tab: Exclude<DockTab, null>) =>
    setDock((cur) => (cur === tab ? null : tab));

  const railBtn = (active: boolean) =>
    cn(
      "p-3 rounded-2xl backdrop-blur-md border transition-all shadow-lg",
      active
        ? "bg-purple-600/40 border-purple-400/50 text-white"
        : "bg-white/10 border-white/15 text-white/70 hover:bg-white/20 hover:text-white"
    );

  return (
    <>
      <ReaderView
        book={fullBook as any}
        initialPage={initialPage}
        onPageChange={handlePageChange}
        onClose={handleClose}
      />

      {/* Riel de íconos (izquierda) — abre un panel a la vez */}
      <div className="fixed left-3 top-1/2 -translate-y-1/2 z-[61] flex flex-col gap-2">
        <button
          onClick={() => toggle("characters")}
          className={railBtn(dock === "characters")}
          title="Personajes"
          aria-label="Personajes"
        >
          <Users className="w-5 h-5" />
        </button>
        <button
          onClick={() => toggle("vibe")}
          className={railBtn(dock === "vibe")}
          title="Recomendaciones"
          aria-label="Recomendaciones"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Panel: Personajes */}
      <CompanionBar
        bookTitle={book.title}
        bookContext={bookContext}
        characters={characters}
        loading={charsLoading}
        open={dock === "characters"}
        onClose={() => setDock(null)}
      />

      {/* Panel: Recomendaciones (música + películas) */}
      <VibePanel
        bookId={book.id}
        open={dock === "vibe"}
        onClose={() => setDock(null)}
      />
    </>
  );
}
