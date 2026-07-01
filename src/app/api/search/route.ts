import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/security/rateLimit';
import { searchBooks } from '@/lib/services/bookSearch';
import { findReadableSource } from '@/lib/services/publicDomain';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { success, retryAfter } = await rateLimit(`search_${session.user.id}`, 30, 60000);
  if (!success) {
    return new NextResponse('Too Many Requests', { 
      status: 429, 
      headers: { 'Retry-After': String(retryAfter) } 
    });
  }

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  
  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  try {
    const results = await searchBooks(q);
    
    // Enrich with public domain readable source
    const enrichedResults = await Promise.all(results.map(async (book) => {
      const readableSource = await findReadableSource(book.title, book.author);
      return {
        ...book,
        isPublicDomain: !!readableSource,
        readable: !!readableSource,
        fileUrl: readableSource,
      };
    }));

    // If query matches a series exactly, we could resolve it, but for now just return results
    return NextResponse.json({ results: enrichedResults });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
