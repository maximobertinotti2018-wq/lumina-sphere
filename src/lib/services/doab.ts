/**
 * DOAB — Directory of Open Access Books.
 * Libros académicos de ACCESO ABIERTO, muchos recientes (2020-2026),
 * descargables 100% legal. API REST de DSpace.
 *
 * Doc del shape (sondeado): cada item trae `name` (título), `handle`,
 * `metadata` (dc.contributor.author/editor, dc.date.issued, abstract) y
 * `bitstreams` (archivos; el PDF cuando está disponible).
 */

export interface OpenAccessBook {
  id: string;
  title: string;
  author: string;
  year?: string;
  description?: string;
  downloadUrl: string; // PDF directo si existe, si no la página oficial del libro
  isDirectDownload: boolean;
}

const BASE = 'https://directory.doabooks.org';

interface DoabMetadata { key: string; value: string }
interface DoabBitstream { name?: string; mimeType?: string; bundleName?: string; retrieveLink?: string }
interface DoabItem {
  uuid: string;
  name: string;
  handle: string;
  metadata?: DoabMetadata[];
  bitstreams?: DoabBitstream[];
}

export async function searchOpenAccessBooks(query: string, limit = 6): Promise<OpenAccessBook[]> {
  try {
    const url = `${BASE}/rest/search?query=${encodeURIComponent(query)}&expand=metadata,bitstreams&limit=${limit}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const items = (await res.json()) as DoabItem[];
    if (!Array.isArray(items)) return [];

    return items.map((item) => {
      const md = item.metadata || [];
      const pick = (key: string) => md.filter((m) => m.key === key).map((m) => m.value);

      const authors = pick('dc.contributor.author');
      const editors = pick('dc.contributor.editor');
      const author =
        (authors.length ? authors : editors).slice(0, 2).join(', ') || 'Varios autores';

      // Buscamos un PDF descargable; si no, caemos a la página oficial del libro.
      const pdf = (item.bitstreams || []).find(
        (b) =>
          b.retrieveLink &&
          (b.mimeType === 'application/pdf' || /\.pdf$/i.test(b.name || '')) &&
          b.bundleName !== 'EXPORT'
      );
      const pageUrl = `${BASE}/handle/${item.handle}`;
      const downloadUrl = pdf?.retrieveLink ? `${BASE}${pdf.retrieveLink}` : pageUrl;

      return {
        id: item.uuid,
        title: item.name,
        author,
        year: pick('dc.date.issued')[0]?.slice(0, 4),
        description: pick('dc.description.abstract')[0],
        downloadUrl,
        isDirectDownload: !!pdf,
      };
    });
  } catch (error) {
    console.error('DOAB error:', error);
    return [];
  }
}
