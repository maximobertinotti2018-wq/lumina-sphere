export async function getNYTBestsellers() {
  try {
    if (!process.env.NYT_API_KEY) return [];
    
    const res = await fetch(`https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${process.env.NYT_API_KEY}`);
    const data = await res.json();
    
    if (data.results && data.results.books) {
      return data.results.books.map((book: any) => ({
        title: book.title,
        author: book.author,
        coverUrl: book.book_image,
        description: book.description,
        isbn: book.primary_isbn13,
      }));
    }
    return [];
  } catch (error) {
    console.error('NYT API error:', error);
    return [];
  }
}
