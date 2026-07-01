const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = '';
let tokenExpiration = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiration) return accessToken;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.warn("Spotify credentials are not defined");
    return null;
  }

  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  const data = await response.json();
  if (data.access_token) {
    accessToken = data.access_token;
    tokenExpiration = Date.now() + (data.expires_in - 60) * 1000;
    return accessToken;
  }
  
  return null;
}

export async function searchPlaylistsByVibe(queries: string[]) {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const query = queries[0] || 'lofi reading';
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=4`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      next: { revalidate: 86400 }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.playlists.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      url: item.external_urls.spotify,
      imageUrl: item.images[0]?.url || null,
      owner: item.owner.display_name,
    }));
  } catch (error) {
    console.error("Spotify error:", error);
    return [];
  }
}
