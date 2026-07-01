export const moodMap: Record<string, {
  spotifyQueries: string[];
  tmdbGenreIds: number[];
  keywords: string[];
}> = {
  'dark-fantasy': {
    spotifyQueries: ['dark fantasy epic', 'berserk ost', 'dungeon synth'],
    tmdbGenreIds: [14, 27], // Fantasy, Horror
    keywords: ['dark', 'magic', 'monster', 'epic'],
  },
  'cyberpunk': {
    spotifyQueries: ['cyberpunk synthwave', 'dystopian sci-fi', 'darksynth'],
    tmdbGenreIds: [878, 28], // Sci-Fi, Action
    keywords: ['future', 'dystopia', 'hacker', 'neon'],
  },
  'classic': {
    spotifyQueries: ['classical reading', 'piano study', 'orchestral'],
    tmdbGenreIds: [18, 36], // Drama, History
    keywords: ['classic', 'drama', 'period'],
  },
  'romance': {
    spotifyQueries: ['romantic piano', 'lofi love', 'indie romance'],
    tmdbGenreIds: [10749, 35], // Romance, Comedy
    keywords: ['love', 'relationship', 'heartbreak'],
  },
  'mystery': {
    spotifyQueries: ['dark academia', 'mystery suspense', 'noir jazz'],
    tmdbGenreIds: [9648, 53], // Mystery, Thriller
    keywords: ['detective', 'murder', 'secret', 'investigation'],
  },
  'sci-fi': {
    spotifyQueries: ['space ambient', 'sci-fi score', 'electronic ambient'],
    tmdbGenreIds: [878, 12], // Sci-Fi, Adventure
    keywords: ['space', 'alien', 'future', 'universe'],
  },
  'default': {
    spotifyQueries: ['lofi reading', 'ambient focus', 'chill vibes'],
    tmdbGenreIds: [18, 14], // Drama, Fantasy
    keywords: ['journey', 'discovery', 'adventure'],
  }
};
