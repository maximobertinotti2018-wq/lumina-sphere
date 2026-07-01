/**
 * ========================================
 * CHARACTER EXTRACTION HELPERS
 * ========================================
 * Funciones para extraer personajes de un libro.
 * 
 * Métodos:
 * 1. Static data (predefined characters)
 * 2. AI extraction (using Claude API)
 * 3. Metadata parsing (from book info)
 */

interface Character {
  id: number;
  name: string;
  role: string;
  avatar: string;
  color: string;
  isPrimary: boolean;
}

// ==========================================
// METHOD 1: STATIC CHARACTER DATABASE
// ==========================================

/**
 * Predefined characters for popular books.
 * Use this for curated character lists.
 */
const CHARACTER_DATABASE: Record<string, Character[]> = {
  'neuromancer': [
    {
      id: 1,
      name: 'Case',
      role: 'Console Cowboy',
      avatar: '🕵️',
      color: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20',
      isPrimary: true,
    },
    {
      id: 2,
      name: 'Molly',
      role: 'Street Samurai',
      avatar: '⚔️',
      color: 'bg-gradient-to-br from-red-500/20 to-pink-500/20',
      isPrimary: false,
    },
    {
      id: 3,
      name: 'Armitage',
      role: 'Mission Leader',
      avatar: '🎭',
      color: 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20',
      isPrimary: false,
    },
    {
      id: 4,
      name: 'Wintermute',
      role: 'AI Entity',
      avatar: '🤖',
      color: 'bg-gradient-to-br from-green-500/20 to-teal-500/20',
      isPrimary: false,
    },
  ],
  'dune': [
    {
      id: 1,
      name: 'Paul Atreides',
      role: 'Duke Heir',
      avatar: '👑',
      color: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
      isPrimary: true,
    },
    {
      id: 2,
      name: 'Lady Jessica',
      role: 'Bene Gesserit',
      avatar: '🔮',
      color: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
      isPrimary: false,
    },
    {
      id: 3,
      name: 'Duncan Idaho',
      role: 'Swordmaster',
      avatar: '⚔️',
      color: 'bg-gradient-to-br from-red-500/20 to-orange-500/20',
      isPrimary: false,
    },
    {
      id: 4,
      name: 'Chani',
      role: 'Fremen Warrior',
      avatar: '🏜️',
      color: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20',
      isPrimary: false,
    },
  ],
  '1984': [
    {
      id: 1,
      name: 'Winston Smith',
      role: 'Ministry Worker',
      avatar: '📝',
      color: 'bg-gradient-to-br from-gray-500/20 to-slate-500/20',
      isPrimary: true,
    },
    {
      id: 2,
      name: 'Julia',
      role: 'Rebel',
      avatar: '❤️',
      color: 'bg-gradient-to-br from-red-500/20 to-pink-500/20',
      isPrimary: false,
    },
    {
      id: 3,
      name: "O'Brien",
      role: 'Inner Party',
      avatar: '👁️',
      color: 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20',
      isPrimary: false,
    },
    {
      id: 4,
      name: 'Big Brother',
      role: 'Leader',
      avatar: '📺',
      color: 'bg-gradient-to-br from-red-500/20 to-gray-500/20',
      isPrimary: false,
    },
  ],
};

/**
 * Get characters from static database
 */
export function getStaticCharacters(bookTitle: string): Character[] {
  const key = bookTitle.toLowerCase().replace(/\s+/g, '-');
  return CHARACTER_DATABASE[key] || getDefaultCharacters();
}

/**
 * Default fallback characters
 */
function getDefaultCharacters(): Character[] {
  return [
    {
      id: 1,
      name: 'Protagonista',
      role: 'Personaje principal',
      avatar: '🎭',
      color: 'bg-gradient-to-br from-purple-500/20 to-blue-500/20',
      isPrimary: true,
    },
    {
      id: 2,
      name: 'Acompañante',
      role: 'Personaje secundario',
      avatar: '🤝',
      color: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
      isPrimary: false,
    },
    {
      id: 3,
      name: 'Antagonista',
      role: 'Fuerza opuesta',
      avatar: '⚡',
      color: 'bg-gradient-to-br from-red-500/20 to-orange-500/20',
      isPrimary: false,
    },
    {
      id: 4,
      name: 'Mentor',
      role: 'Guía',
      avatar: '🧙',
      color: 'bg-gradient-to-br from-green-500/20 to-teal-500/20',
      isPrimary: false,
    },
  ];
}

// ==========================================
// METHOD 2: AI EXTRACTION
// ==========================================

/**
 * Extract characters using AI (Claude API)
 * Use this for dynamic character extraction.
 */
export async function extractCharactersWithAI(
  bookTitle: string,
  bookDescription: string,
  bookGenre?: string
): Promise<Character[]> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Extract the 4 main characters from this book:

Title: ${bookTitle}
Description: ${bookDescription}
Genre: ${bookGenre || 'Unknown'}

Return ONLY a JSON array with exactly 4 characters in this format:
[
  {
    "name": "Character Name",
    "role": "Brief role (2-3 words)",
    "isPrimary": true (only for the main protagonist)
  }
]

Rules:
1. Return exactly 4 characters
2. First character must be the protagonist (isPrimary: true)
3. Role should be 2-3 words max
4. Return ONLY valid JSON, no other text`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('AI extraction failed');
    }

    const data = await response.json();
    const jsonText = data.content[0]?.text || '[]';
    
    // Parse and transform
    const extracted = JSON.parse(jsonText);
    
    return extracted.map((char: any, index: number) => ({
      id: index + 1,
      name: char.name,
      role: char.role,
      avatar: getAvatarForRole(char.role),
      color: getColorForIndex(index),
      isPrimary: char.isPrimary || index === 0,
    }));
  } catch (error) {
    console.error('AI character extraction failed:', error);
    return getDefaultCharacters();
  }
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Get emoji avatar based on role
 */
function getAvatarForRole(role: string): string {
  const roleMap: Record<string, string> = {
    'warrior': '⚔️',
    'knight': '🛡️',
    'mage': '🧙',
    'wizard': '🧙',
    'thief': '🗡️',
    'rogue': '🗡️',
    'priest': '✝️',
    'healer': '💊',
    'king': '👑',
    'queen': '👑',
    'prince': '🤴',
    'princess': '👸',
    'detective': '🕵️',
    'scientist': '🔬',
    'doctor': '👨‍⚕️',
    'teacher': '👨‍🏫',
    'student': '🎓',
    'captain': '⚓',
    'pilot': '✈️',
    'robot': '🤖',
    'ai': '🤖',
    'alien': '👽',
    'dragon': '🐉',
    'vampire': '🧛',
    'werewolf': '🐺',
  };

  const lowerRole = role.toLowerCase();
  for (const [key, emoji] of Object.entries(roleMap)) {
    if (lowerRole.includes(key)) {
      return emoji;
    }
  }

  return '🎭'; // Default
}

/**
 * Get color gradient based on index
 */
function getColorForIndex(index: number): string {
  const colors = [
    'bg-gradient-to-br from-purple-500/20 to-blue-500/20',
    'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    'bg-gradient-to-br from-red-500/20 to-orange-500/20',
    'bg-gradient-to-br from-green-500/20 to-teal-500/20',
  ];
  return colors[index % colors.length] || colors[0] || '';
}

// ==========================================
// METHOD 3: METADATA PARSING
// ==========================================

/**
 * Extract characters from book metadata
 * Use this if your book source provides character data.
 */
export function parseCharactersFromMetadata(metadata: any): Character[] {
  if (!metadata?.characters || !Array.isArray(metadata.characters)) {
    return getDefaultCharacters();
  }

  return metadata.characters.slice(0, 4).map((char: any, index: number) => ({
    id: index + 1,
    name: char.name || 'Unknown',
    role: char.role || 'Character',
    avatar: char.avatar || getAvatarForRole(char.role || ''),
    color: char.color || getColorForIndex(index),
    isPrimary: char.isPrimary || index === 0,
  }));
}

// ==========================================
// MAIN EXPORT
// ==========================================

/**
 * Smart character extraction
 * Tries methods in order: static → AI → default
 */
export async function getBookCharacters(
  bookTitle: string,
  bookDescription?: string,
  bookGenre?: string
): Promise<Character[]> {
  // Try static first (fastest)
  const staticChars = getStaticCharacters(bookTitle);
  if (staticChars.length > 0 && staticChars[0]?.name !== 'Protagonista') {
    return staticChars;
  }

  // Try AI extraction if we have description
  if (bookDescription && process.env.ANTHROPIC_API_KEY) {
    try {
      const aiChars = await extractCharactersWithAI(bookTitle, bookDescription, bookGenre);
      if (aiChars.length > 0) {
        return aiChars;
      }
    } catch (error) {
      console.error('AI extraction failed, falling back to defaults');
    }
  }

  // Fallback to defaults
  return getDefaultCharacters();
}
