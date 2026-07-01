export async function findReadableSource(title: string, author: string): Promise<string | null> {
  try {
    const res = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(title + ' ' + author)}`);
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      const book = data.results[0];
      // Looking for epub URL
      const epubFormat = book.formats['application/epub+zip'];
      if (epubFormat) {
        return epubFormat;
      }
    }
    return null;
  } catch (error) {
    console.error('Gutendex error:', error);
    return null;
  }
}
