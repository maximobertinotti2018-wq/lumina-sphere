const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function searchMoviesByVibe(genreIds: number[], _keywords: string[]) {
  if (!TMDB_API_KEY) {
    console.warn("TMDB_API_KEY is not defined");
    return [];
  }

  try {
    const genresStr = genreIds.join('|');
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genresStr}&sort_by=popularity.desc`,
      { next: { revalidate: 86400 } } // Cache for 24h
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.results.slice(0, 6).map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
      overview: movie.overview,
      rating: movie.vote_average,
    }));
  } catch (error) {
    console.error("TMDB error:", error);
    return [];
  }
}
