export interface BookSearchResult {
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  isbn?: string;
  publishedYear?: string;
  seriesName?: string;
  seriesIndex?: number;
  sourceIds: {
    google?: string;
    openLibrary?: string;
  };
}

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  try {
    const [googleRes, olRes] = await Promise.all([
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${process.env.GOOGLE_BOOKS_API_KEY}`),
      fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`)
    ]);

    const googleData = await googleRes.json();
    const olData = await olRes.json();

    const results: Map<string, BookSearchResult> = new Map();

    if (olData.docs) {
      olData.docs.forEach((doc: any) => {
        const isbn = doc.isbn?.[0];
        const title = doc.title;
        const author = doc.author_name?.[0] || 'Unknown';
        const key = isbn || `${title.toLowerCase()}-${author.toLowerCase()}`;
        
        // Ensure no missing data causes crashes
        results.set(key, {
          title,
          author,
          coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : undefined,
          isbn,
          publishedYear: doc.first_publish_year?.toString(),
          seriesName: doc.subject?.find((s: string) => s.toLowerCase().includes('series')), // Simplification for series
          sourceIds: {
            openLibrary: doc.key,
          }
        });
      });
    }

    if (googleData.items) {
      googleData.items.forEach((item: any) => {
        const vol = item.volumeInfo;
        const isbn = vol.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13' || i.type === 'ISBN_10')?.identifier;
        const title = vol.title;
        const author = vol.authors?.[0] || 'Unknown';
        const key = isbn || `${title.toLowerCase()}-${author.toLowerCase()}`;

        if (results.has(key)) {
          const existing = results.get(key)!;
          existing.description = existing.description || vol.description;
          existing.coverUrl = existing.coverUrl || vol.imageLinks?.thumbnail;
          existing.sourceIds.google = item.id;
        } else {
          results.set(key, {
            title,
            author,
            coverUrl: vol.imageLinks?.thumbnail?.replace('http:', 'https:'),
            description: vol.description,
            isbn,
            publishedYear: vol.publishedDate?.split('-')[0],
            sourceIds: {
              google: item.id
            }
          });
        }
      });
    }

    return Array.from(results.values()).slice(0, 20);
  } catch (error) {
    console.error('Book search error:', error);
    return [];
  }
}
