/**
 * Internet Archive vía Open Library.
 * Libros modernos con préstamo digital controlado (leer online un tiempo,
 * estilo biblioteca) o de acceso público. No es descarga libre, pero es
 * legal y suma muchísimos títulos que no están en dominio público.
 *
 * `ebook_access` de Open Library: 'public' | 'borrowable' | 'printdisabled' | 'no_ebook'.
 * El id de Internet Archive (`ia`) arma el link a archive.org.
 */

export interface BorrowableBook {
  id: string;
  title: string;
  author: string;
  year?: string;
  coverUrl?: string;
  archiveUrl: string;
  access: 'public' | 'borrowable';
}

interface OLDoc {
  title: string;
  author_name?: string[];
  ia?: string[];
  ebook_access?: string;
  cover_i?: number;
  first_publish_year?: number;
}

export async function searchBorrowableBooks(query: string, limit = 6): Promise<BorrowableBook[]> {
  try {
    const fields = 'title,author_name,ia,ebook_access,cover_i,first_publish_year';
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20&fields=${fields}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const docs: OLDoc[] = Array.isArray(data.docs) ? data.docs : [];

    const result: BorrowableBook[] = [];
    for (const doc of docs) {
      const access = doc.ebook_access;
      if (access !== 'public' && access !== 'borrowable') continue;
      const iaId = doc.ia?.[0];
      if (!iaId) continue;

      result.push({
        id: iaId,
        title: doc.title,
        author: doc.author_name?.slice(0, 2).join(', ') || 'Autor desconocido',
        year: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
        coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined,
        archiveUrl: `https://archive.org/details/${iaId}`,
        access,
      });
      if (result.length >= limit) break;
    }
    return result;
  } catch (error) {
    console.error('Internet Archive error:', error);
    return [];
  }
}
