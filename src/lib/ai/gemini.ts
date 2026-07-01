/**
 * ========================================
 * GEMINI CLIENT (Google AI - Free Tier)
 * ========================================
 * Helper liviano para llamar a Gemini 1.5 Flash vía REST.
 * Reutilizado por el chat con personajes y la extracción de personajes.
 * Gratis dentro del free tier (1500 req/día).
 */

// Cadena de modelos: si el primero está saturado (503) o sin cuota (429),
// se prueba el siguiente. Todos gratis.
const MODELS = ['gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

/** ¿Está configurada la key de Gemini? */
export function hasGemini(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Llama a Gemini con un historial de chat opcional + system instruction.
 * Devuelve el texto de la respuesta.
 */
export async function geminiChat(opts: {
  system?: string;
  messages: ChatMsg[];
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY no configurada');

  // Gemini usa 'model' en vez de 'assistant'.
  const contents = opts.messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // El primer turno debe ser 'user'; descartamos saludos iniciales del modelo.
  while (contents.length && contents[0]!.role === 'model') {
    contents.shift();
  }

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.9,
      maxOutputTokens: opts.maxOutputTokens ?? 1024,
    },
  };
  if (opts.system) {
    body.systemInstruction = { parts: [{ text: opts.system }] };
  }

  let lastErr: unknown = null;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(`${BASE}/${model}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        // Saturado o sin cuota → reintentar y luego cambiar de modelo.
        if (res.status === 503 || res.status === 429) {
          lastErr = new Error(`Gemini ${res.status} en ${model}`);
          await sleep(700);
          continue;
        }
        if (!res.ok) {
          lastErr = new Error(`Gemini ${res.status}: ${await res.text()}`);
          break; // probar siguiente modelo
        }

        const data = await res.json();
        const text: string =
          data?.candidates?.[0]?.content?.parts
            ?.map((p: { text?: string }) => p.text || '')
            .join('') || '';
        if (text.trim()) return text.trim();

        lastErr = new Error(`Respuesta vacía de ${model}`);
        break;
      } catch (e) {
        lastErr = e;
        await sleep(400);
      }
    }
  }

  throw lastErr ?? new Error('Gemini no devolvió respuesta');
}
