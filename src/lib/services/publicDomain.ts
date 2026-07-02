/**
 * Fuentes de dominio público (Project Gutenberg vía Gutendex).
 *
 * Antes se hacía UNA llamada a Gutendex POR CADA resultado de búsqueda
 * (hasta 20 llamadas → ~9s de espera). Ahora: una sola llamada con el
 * término de búsqueda y matching local por título/autor normalizados.
 */

interface GutendexEntry {
  normTitle: string;
  authorSurnames: string[];
  epubUrl: string;
}

/** Normaliza para comparar: minúsculas, sin acentos ni puntuación. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Una sola búsqueda en Gutendex; devuelve los libros con EPUB disponible.
 * Cacheada 1 hora (misma query = 0 llamadas extra).
 */
export async function findReadableSourcesForQuery(query: string): Promise<GutendexEntry[]> {
  try {
    const res = await fetch(
      `https://gutendex.com/books?search=${encodeURIComponent(query)}`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    if (!Array.isArray(data.results)) return [];

    return data.results
      .map((book: any): GutendexEntry | null => {
        const epubUrl = book.formats?.['application/epub+zip'];
        if (!epubUrl) return null;
        return {
          normTitle: normalize(book.title || ''),
          authorSurnames: (book.authors || []).map((a: any) =>
            normalize(String(a.name || '').split(',')[0] || '')
          ),
          epubUrl,
        };
      })
      .filter(Boolean) as GutendexEntry[];
  } catch (error) {
    console.error('Gutendex error:', error);
    return [];
  }
}

/**
 * Busca la fuente legible para un libro puntual dentro de los resultados
 * ya descargados de Gutendex (matching local, cero llamadas de red).
 */
export function matchReadableSource(
  sources: GutendexEntry[],
  title: string,
  author: string
): string | null {
  const normTitle = normalize(title);
  const authorSurname = normalize(author).split(' ').pop() || '';
  if (!normTitle) return null;

  for (const src of sources) {
    const titleMatches =
      src.normTitle === normTitle ||
      src.normTitle.startsWith(normTitle + ' ') ||
      normTitle.startsWith(src.normTitle + ' ');
    if (!titleMatches) continue;

    // Si tenemos autor, exigimos que coincida algún apellido.
    if (authorSurname && src.authorSurnames.length > 0) {
      const authorMatches = src.authorSurnames.some(
        (s) => s.includes(authorSurname) || authorSurname.includes(s)
      );
      if (!authorMatches) continue;
    }
    return src.epubUrl;
  }
  return null;
}
