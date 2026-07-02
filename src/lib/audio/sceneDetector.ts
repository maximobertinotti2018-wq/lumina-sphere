/**
 * ========================================
 * DETECTOR DE ESCENA AMBIENTAL
 * ========================================
 * Función pura: dado el texto de la página que se está leyendo, decide qué
 * ambiente sonoro corresponde (lluvia, tensión, viento, mar, fuego) o ninguno.
 *
 * Se hace por palabras clave (es/en) en vez de IA: es instantáneo, gratis y
 * corre en cada cambio de página sin latencia. Función pura → fácil de testear.
 *
 * IMPORTANTE: el match es por PALABRA COMPLETA (\b...\b), no por substring.
 * Con substring, "mar" matcheaba "Marcos", "sea" matcheaba "season" y
 * "wind" matcheaba "window" → falsos positivos. Por eso las listas incluyen
 * las flexiones que nos interesan de forma explícita.
 */

export type AmbientScene = 'rain' | 'tension' | 'wind' | 'sea' | 'fire';

interface SceneRule {
  scene: AmbientScene;
  keywords: string[];
}

// El orden define la prioridad ante empates de conteo.
const RULES: SceneRule[] = [
  {
    scene: 'rain',
    keywords: [
      'lluvia', 'lluvias', 'llueve', 'llovia', 'llovía', 'lloviendo', 'llovio', 'llovió',
      'tormenta', 'tormentas', 'aguacero', 'chaparron', 'chaparrón', 'diluvio', 'temporal',
      'truenos', 'trueno', 'relampago', 'relámpago', 'relampagos', 'relámpagos',
      'rain', 'raining', 'rainy', 'storm', 'storms', 'downpour', 'thunder', 'thunderstorm', 'drizzle',
    ],
  },
  {
    scene: 'tension',
    keywords: [
      'oscuro', 'oscura', 'oscuros', 'oscuras', 'oscuridad', 'oscurecer', 'oscurecia', 'oscurecía',
      'tinieblas', 'penumbra', 'sombra', 'sombras', 'sombrio', 'sombrío',
      'miedo', 'terror', 'panico', 'pánico', 'horror', 'espanto', 'pavor',
      'muerte', 'muerto', 'muerta', 'sangre', 'grito', 'gritos', 'grito',
      'escalofrio', 'escalofrío', 'aterrador', 'aterradora', 'espectro', 'fantasma', 'fantasmas',
      'pesadilla', 'pesadillas', 'siniestro', 'siniestra', 'lugubre', 'lúgubre',
      'dark', 'darkness', 'shadow', 'shadows', 'fear', 'terror', 'dread', 'horror',
      'blood', 'scream', 'screams', 'death', 'dead', 'ghost', 'ghosts', 'nightmare',
      'sinister', 'eerie', 'grim', 'dreadful',
    ],
  },
  {
    scene: 'fire',
    keywords: [
      'fuego', 'fuegos', 'fogata', 'fogatas', 'hoguera', 'hogueras', 'llamas', 'llama',
      'chimenea', 'arder', 'ardia', 'ardía', 'ardiendo', 'incendio', 'incendios',
      'brasas', 'brasa', 'antorcha', 'antorchas', 'crepitar', 'fogon', 'fogón', 'ascuas',
      'fire', 'fires', 'flame', 'flames', 'campfire', 'hearth', 'bonfire', 'blaze',
      'ember', 'embers', 'torch', 'torches', 'burning', 'flickering',
    ],
  },
  {
    scene: 'sea',
    keywords: [
      'mar', 'mares', 'oceano', 'océano', 'oceanos', 'océanos', 'ola', 'olas', 'oleaje',
      'playa', 'playas', 'marea', 'mareas', 'costa', 'costas', 'orilla', 'orillas',
      'espuma', 'acantilado', 'acantilados', 'oleada',
      'sea', 'seas', 'ocean', 'oceans', 'wave', 'waves', 'beach', 'tide', 'tides',
      'shore', 'shores', 'coast', 'seashore', 'surf',
    ],
  },
  {
    scene: 'wind',
    keywords: [
      'viento', 'vientos', 'ventisca', 'vendaval', 'brisa', 'brisas', 'rafaga', 'ráfaga', 'rafagas', 'ráfagas',
      'nieve', 'nevada', 'nevando', 'frio', 'frío', 'helado', 'helada', 'glacial', 'invierno', 'escarcha',
      'wind', 'winds', 'windy', 'breeze', 'gale', 'snow', 'snowing', 'blizzard',
      'frost', 'frozen', 'chill', 'chilly',
    ],
  },
];

/** Minúsculas y sin acentos, para comparar de forma robusta. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

// Precompilamos un regex por escena: \b(kw1|kw2|...)\b, todo normalizado.
const SCENE_PATTERNS: { scene: AmbientScene; regex: RegExp }[] = RULES.map((rule) => {
  const alts = Array.from(new Set(rule.keywords.map((k) => normalize(k))))
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  return { scene: rule.scene, regex: new RegExp(`\\b(?:${alts})\\b`, 'g') };
});

/**
 * Devuelve la escena dominante del texto, o null si no hay señal clara.
 * Cuenta coincidencias de PALABRA COMPLETA por categoría; gana la de mayor
 * conteo, y los empates se resuelven por el orden de RULES.
 */
export function detectScene(text: string): AmbientScene | null {
  if (!text) return null;
  const haystack = normalize(text);

  let best: AmbientScene | null = null;
  let bestCount = 0;

  for (const { scene, regex } of SCENE_PATTERNS) {
    regex.lastIndex = 0;
    const matches = haystack.match(regex);
    const count = matches ? matches.length : 0;
    if (count > bestCount) {
      bestCount = count;
      best = scene;
    }
  }

  return bestCount > 0 ? best : null;
}
