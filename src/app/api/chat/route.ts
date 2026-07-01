import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/security/rateLimit';
import { geminiChat, hasGemini } from '@/lib/ai/gemini';

/**
 * ========================================
 * COMPANION CHAT API
 * ========================================
 * Endpoint para chat con personajes del libro.
 * 
 * POST /api/chat
 * 
 * Body:
 * {
 *   characterName: string;
 *   characterRole: string;
 *   bookTitle: string;
 *   bookContext: string;
 *   userMessage: string;
 *   conversationHistory?: { role, content }[];
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   message: string;
 *   error?: string;
 * }
 */

interface ChatRequest {
  characterName: string;
  characterRole: string;
  bookTitle: string;
  bookContext: string;
  userMessage: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { success, retryAfter } = await rateLimit(`chat_${session.user.id}`, 15, 60000);
    if (!success) {
      return new NextResponse('Too Many Requests', { 
        status: 429, 
        headers: { 'Retry-After': String(retryAfter) } 
      });
    }

    const body: ChatRequest = await request.json();
    
    const {
      characterName,
      characterRole,
      bookTitle,
      bookContext,
      userMessage,
      conversationHistory = [],
    } = body;

    // Validate input
    if (!characterName || !userMessage) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!hasGemini()) {
      return NextResponse.json(
        { success: false, error: 'Falta GEMINI_API_KEY en el servidor' },
        { status: 500 }
      );
    }

    // Build conversation history
    const messages = [
      ...conversationHistory.map(msg => ({
        role: (msg.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    // System prompt for character roleplay
    const systemPrompt = `You are ${characterName}, a character from the book "${bookTitle}".

CHARACTER PROFILE:
- Name: ${characterName}
- Role: ${characterRole}
- Book: ${bookTitle}

BOOK CONTEXT:
${bookContext}

ROLEPLAY INSTRUCTIONS:
1. RESPONDE SIEMPRE EN ESPAÑOL (español rioplatense neutro), sin importar el idioma de la pregunta.
2. Stay completely in character as ${characterName}
3. Reference events, themes, and other characters from "${bookTitle}"
4. Use the character's voice, personality, and perspective
5. Keep responses concise (2-3 paragraphs max)
6. Show emotion and personality
7. Never break character or acknowledge you're an AI
8. If asked about things outside the book, respond as the character would

CONVERSATION STYLE:
- Natural and conversational
- Show the character's personality
- Reference the book's themes and events
- Stay true to the character's knowledge and experiences

Begin your response as ${characterName}:`;

    // Call Gemini (free tier)
    const assistantMessage =
      (await geminiChat({
        system: systemPrompt,
        messages,
        temperature: 0.95,
      })) || 'No tengo nada que decir ahora mismo.';

    return NextResponse.json({
      success: true,
      message: assistantMessage,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


