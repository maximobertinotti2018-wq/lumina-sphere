import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/security/rateLimit';
import { geminiChat, hasGemini } from '@/lib/ai/gemini';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export async function GET(_request: Request, { params }: { params: { bookId: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { success, retryAfter } = await rateLimit(`vibe_${session.user.id}`, 20, 60000);
  if (!success) {
    return new NextResponse('Too Many Requests', { 
      status: 429, 
      headers: { 'Retry-After': String(retryAfter) } 
    });
  }

  try {
    const bookId = params.bookId;
    const bookRecord = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!bookRecord) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const book = bookRecord as any;

    // Caché: si ya calculamos el vibe de este libro, devolverlo (sin gastar cuota).
    if (book.vibeJson) {
      try {
        return NextResponse.json(JSON.parse(book.vibeJson));
      } catch { /* caché corrupta, recalculamos */ }
    }

    const textToAnalyze = book.fullText
      ? book.fullText.slice(0, 5000) 
      : `${book.title} by ${book.author}. ${book.description || ''}`;

    // Prompt for Gemini
    const prompt = `Analizá el mood, los temas y la atmósfera del siguiente libro.
Sugerí 4 PELÍCULAS y 4 PLAYLISTS que combinen con esa vibra.

REGLAS PARA PELÍCULAS:
- Mezclá clásicos con AL MENOS 2 películas recientes (de los últimos 10 años).
- Que compartan el tono y la atmósfera del libro.

REGLAS PARA PLAYLISTS (música para LEER, ambientación):
- Deben servir para acompañar la lectura: instrumental, ambient, cinematográfica, neoclásica, lo-fi o bandas sonoras.
- PROHIBIDO: música ruidosa, pop/rock con voces fuertes, reggaetón, podcasts o "workout".
- El "playlist_title" tiene que ser un término de búsqueda real para Spotify (ej: "dark academia instrumental", "ambient reading", "cinematic focus", "tense thriller score").

Devolvé SOLO un objeto JSON válido (sin markdown ni backticks) con esta estructura exacta:
{
  "mood": "frase corta en español describiendo la vibra",
  "movies": [
    { "title": "Nombre de la película", "year": "AAAA", "mood_match_reason": "por qué encaja, en español" }
  ],
  "playlists": [
    { "playlist_title": "término de búsqueda para Spotify", "genres": ["genero"] }
  ]
}

Contenido del libro:
${textToAnalyze}`;

    if (!hasGemini()) {
      return NextResponse.json({ error: 'Falta GEMINI_API_KEY en el servidor' }, { status: 500 });
    }

    // geminiChat prueba una cadena de modelos con reintentos: si uno está
    // saturado (503/429), cae al siguiente en vez de fallarle al usuario.
    const responseText =
      (await geminiChat({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        maxOutputTokens: 2048,
      })) || '{}';
    let aiData;
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      aiData = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse Gemini response:", responseText);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const aiMovies: any[] = Array.isArray(aiData.movies) ? aiData.movies : [];
    const aiPlaylists: any[] = Array.isArray(aiData.playlists) ? aiData.playlists : [];

    // Fetch real TMDB data — en paralelo (antes era secuencial, 4 round-trips encadenados).
    const movies = TMDB_API_KEY
      ? (
          await Promise.all(
            aiMovies.map(async (m) => {
              try {
                const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=es-ES&query=${encodeURIComponent(m.title)}`);
                const data = await res.json();
                const tmdb = data.results?.[0];
                if (!tmdb) return null;
                return {
                  id: tmdb.id,
                  title: tmdb.title,
                  posterUrl: tmdb.poster_path ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}` : null,
                  year: tmdb.release_date ? tmdb.release_date.split('-')[0] : m.year,
                  rating: tmdb.vote_average,
                  overview: tmdb.overview || '',
                  reason: m.mood_match_reason,
                };
              } catch {
                return null;
              }
            })
          )
        ).filter(Boolean)
      : [];

    // Fetch real Spotify data — token una vez, búsquedas en paralelo.
    let playlists: any[] = [];
    if (SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET && aiPlaylists.length) {
      try {
        const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'grant_type=client_credentials',
        });
        const tokenData = await tokenRes.json();
        const token = tokenData.access_token;

        if (token) {
          playlists = (
            await Promise.all(
              aiPlaylists.map(async (p) => {
                try {
                  const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(p.playlist_title)}&type=playlist&limit=1`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  const data = await res.json();
                  const item = data.playlists?.items?.[0];
                  if (!item) return null;
                  return {
                    id: item.id,
                    name: item.name,
                    url: item.external_urls?.spotify,
                    imageUrl: item.images?.[0]?.url || null,
                    owner: item.owner?.display_name,
                  };
                } catch {
                  return null;
                }
              })
            )
          ).filter(Boolean);
        }
      } catch {}
    }

    const result = {
      mood: aiData.mood || 'Immersive',
      movies: movies.length > 0 ? movies : aiMovies.map((m: any, i: number) => ({ id: String(i), title: m.title, year: m.year, rating: 0, posterUrl: null, overview: m.mood_match_reason || '', reason: m.mood_match_reason })),
      playlists: playlists.length > 0 ? playlists : aiPlaylists.map((p: any, i: number) => ({ id: String(i), name: p.playlist_title, url: '#', imageUrl: null, owner: 'Unknown' })),
    };

    // Cachear el resultado en el libro (best-effort) para no recalcular.
    try {
      await prisma.book.update({
        where: { id: bookId },
        data: { vibeJson: JSON.stringify(result) } as any,
      });
    } catch (e) {
      console.error('No se pudo cachear el vibe:', e);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Vibe API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
