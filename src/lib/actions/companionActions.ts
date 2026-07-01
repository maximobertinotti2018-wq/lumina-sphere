'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { geminiChat, hasGemini } from '@/lib/ai/gemini';
import { getStaticCharacters } from '@/components/companions/characterExtraction';

interface Character {
  id: number;
  name: string;
  role: string;
  avatar: string;
  color: string;
  isPrimary: boolean;
}

const COLORS = [
  'bg-gradient-to-br from-purple-500/20 to-blue-500/20',
  'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
  'bg-gradient-to-br from-red-500/20 to-orange-500/20',
  'bg-gradient-to-br from-green-500/20 to-teal-500/20',
];

const AVATARS = ['🎭', '🤝', '⚡', '🧙'];

/**
 * Devuelve los personajes principales de un libro.
 * Orden: base estática conocida → extracción con Gemini → fallback genérico.
 */
export async function getCharactersForBook(
  bookId: string
): Promise<{ success: boolean; characters: Character[] }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, characters: [] };

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) return { success: false, characters: [] };

  // 0. Caché: si ya extrajimos personajes antes, devolverlos (sin gastar cuota).
  const cached = (book as any).charactersJson;
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length) {
        return { success: true, characters: parsed };
      }
    } catch { /* caché corrupta, recalculamos */ }
  }

  // 1. Base estática (libros populares conocidos).
  const staticChars = getStaticCharacters(book.title);
  if (staticChars[0]?.name !== 'Protagonista') {
    await saveCharacters(bookId, staticChars);
    return { success: true, characters: staticChars };
  }

  // 2. Extracción con Gemini desde el texto/descripción del libro.
  if (hasGemini()) {
    try {
      const sample = ((book as any).fullText || book.description || '').slice(0, 6000);
      const prompt = `Eres un analista literario. Extrae los 4 personajes principales del libro "${book.title}"${
        book.author ? ` de ${book.author}` : ''
      }.
${sample ? `Fragmento del libro:\n"""${sample}"""\n` : ''}
Devuelve SOLO un array JSON válido (sin markdown, sin texto extra) con este formato exacto:
[{"name":"Nombre del personaje","role":"rol en 2-3 palabras","isPrimary":true}]
Reglas: exactamente 4 personajes reales del libro; el primero es el protagonista (isPrimary true); los demás isPrimary false. Si no encuentras nombres reales, infiere los más probables.`;

      const raw = await geminiChat({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      });

      const start = raw.indexOf('[');
      const end = raw.lastIndexOf(']');
      if (start !== -1 && end !== -1) {
        const parsed = JSON.parse(raw.slice(start, end + 1));
        const chars: Character[] = parsed
          .slice(0, 4)
          .map((c: any, i: number) => ({
            id: i + 1,
            name: String(c.name || '').slice(0, 60) || `Personaje ${i + 1}`,
            role: String(c.role || 'Personaje').slice(0, 40),
            avatar: AVATARS[i % AVATARS.length]!,
            color: COLORS[i % COLORS.length]!,
            isPrimary: !!c.isPrimary || i === 0,
          }));
        if (chars.length) {
          await saveCharacters(bookId, chars);
          return { success: true, characters: chars };
        }
      }
    } catch (e) {
      console.error('Extracción de personajes con Gemini falló:', e);
    }
  }

  // 3. Fallback genérico (NO se cachea, para reintentar cuando haya cuota).
  return { success: true, characters: staticChars };
}

/** Guarda los personajes en la caché del libro (best-effort). */
async function saveCharacters(bookId: string, chars: Character[]): Promise<void> {
  try {
    await prisma.book.update({
      where: { id: bookId },
      data: { charactersJson: JSON.stringify(chars) } as any,
    });
  } catch (e) {
    console.error('No se pudo cachear personajes:', e);
  }
}
