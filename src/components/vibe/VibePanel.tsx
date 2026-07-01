"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Loader2, Music, Film, X, Star } from "lucide-react";

interface VibeData {
  mood: string;
  movies: any[];
  playlists: any[];
}

/**
 * Panel de recomendaciones (controlado por el dock del lector).
 * La IA se llama SOLO cuando el usuario abre el panel (carga diferida).
 */
export function VibePanel({
  bookId,
  open,
  onClose,
}: {
  bookId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [data, setData] = useState<VibeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

  useEffect(() => {
    if (open && !loaded && !loading) {
      setLoading(true);
      fetch(`/api/vibe/${bookId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => { if (j) setData(j); })
        .catch(() => {})
        .finally(() => { setLoading(false); setLoaded(true); });
    }
  }, [open, loaded, loading, bookId]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="fixed left-20 top-24 z-[60] w-[min(22rem,calc(100vw-6rem))] max-h-[80vh] overflow-y-auto"
          >
            <GlassPanel variant="strong" className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Recomendaciones</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="w-7 h-7 text-white/40 animate-spin" />
                  <p className="text-white/40 text-xs">Buscando la vibra del libro...</p>
                </div>
              )}

              {!loading && !data && (
                <p className="text-white/40 text-sm text-center py-8">
                  No se pudieron cargar recomendaciones.
                </p>
              )}

              {!loading && data && (
                <>
                  {data.playlists.length > 0 && (
                    <GlassPanel className="p-4 bg-black/20">
                      <div className="flex items-center gap-2 mb-4">
                        <Music className="w-5 h-5 text-green-400" />
                        <h4 className="text-white font-semibold">Playlists para leer</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {data.playlists.map((p) => (
                          <a
                            key={p.id}
                            href={p.url && p.url !== "#" ? p.url : undefined}
                            target="_blank"
                            rel="noreferrer"
                            className="group relative rounded-xl overflow-hidden aspect-square block bg-gradient-to-br from-purple-500/20 to-blue-500/20"
                          >
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music className="w-8 h-8 text-white/30" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                              <p className="text-white text-sm font-bold truncate">{p.name}</p>
                              <p className="text-white/60 text-xs truncate">por {p.owner}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </GlassPanel>
                  )}

                  {data.movies.length > 0 && (
                    <GlassPanel className="p-4 bg-black/20">
                      <div className="flex items-center gap-2 mb-4">
                        <Film className="w-5 h-5 text-purple-400" />
                        <h4 className="text-white font-semibold">Películas de vibra similar</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {data.movies.slice(0, 4).map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedMovie(m)}
                            className="group relative rounded-xl overflow-hidden aspect-[2/3] bg-white/5 text-left"
                          >
                            {m.posterUrl ? (
                              <img
                                src={m.posterUrl}
                                alt={m.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-8 h-8 text-white/20" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                              <p className="text-white text-sm font-bold leading-tight line-clamp-2 mb-1">{m.title}</p>
                              <p className="text-white/60 text-xs">{m.year}{m.rating ? ` • ⭐ ${Number(m.rating).toFixed(1)}` : ""}</p>
                              <p className="text-purple-300 text-[10px] mt-1">Toca para ver más</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </GlassPanel>
                  )}
                </>
              )}
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de detalle de película (fuera del panel) */}
      {selectedMovie && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedMovie(null)}
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <GlassPanel variant="strong" className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-lg font-bold leading-tight">{selectedMovie.title}</h3>
                  <p className="text-white/50 text-sm flex items-center gap-2 mt-1">
                    {selectedMovie.year}
                    {selectedMovie.rating ? (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-300" /> {Number(selectedMovie.rating).toFixed(1)}
                      </span>
                    ) : null}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-4">
                {selectedMovie.posterUrl && (
                  <img
                    src={selectedMovie.posterUrl}
                    alt={selectedMovie.title}
                    className="w-24 rounded-lg shrink-0 object-cover"
                  />
                )}
                <div className="flex-1 min-w-0 space-y-3">
                  {selectedMovie.overview ? (
                    <p className="text-white/80 text-sm leading-relaxed max-h-48 overflow-y-auto">
                      {selectedMovie.overview}
                    </p>
                  ) : (
                    <p className="text-white/40 text-sm italic">Sin sinopsis disponible.</p>
                  )}
                  {selectedMovie.reason && (
                    <p className="text-purple-300 text-xs italic border-l-2 border-purple-400/40 pl-3">
                      Por qué encaja: {selectedMovie.reason}
                    </p>
                  )}
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>
      )}
    </>
  );
}
