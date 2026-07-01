'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { STARTER_BOOK_LIMIT } from '@/lib/constants';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
// @ts-ignore
import pdf from 'pdf-parse';
// @ts-ignore
import { EPub } from 'epub2';
import { auth } from '@/lib/auth';

interface UploadResult {
  success: boolean;
  data?: any;
  error?: string;
  requiresUpgrade?: boolean;
}

async function canAddBook(userId: string, userTier: string): Promise<boolean> {
  if (userTier === 'pro' || userTier === 'premium') {
    return true;
  }
  const bookCount = await prisma.userBook.count({
    where: { userId },
  });
  return bookCount < STARTER_BOOK_LIMIT;
}

export async function uploadBook(formData: FormData): Promise<UploadResult> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    
    const userTier = (session.user as any).subscriptionTier || 'starter';
    const canAdd = await canAddBook(userId, userTier);
    if (!canAdd) {
      return {
        success: false,
        error: `You've reached your limit. Upgrade to Pro for unlimited books.`,
        requiresUpgrade: true,
      };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Límite de tamaño: el archivo se carga entero en memoria y su texto se
    // guarda en la DB. Sin techo, un archivo enorme puede tumbar el server.
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'El archivo supera el límite de 25 MB.' };
    }

    const mood = (formData.get('mood') as string) || 'classic';
    const titleFromForm = formData.get('title') as string;
    const authorFromForm = formData.get('author') as string;

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name).toLowerCase();
    
    // Create temp file
    const tempDir = os.tmpdir();
    const tempPath = path.join(tempDir, `upload-${Date.now()}${ext}`);
    await fs.writeFile(tempPath, buffer);

    let parsedTitle = titleFromForm || file.name.replace(ext, '');
    let parsedAuthor = authorFromForm || 'Unknown Author';
    let fullText = '';

    try {
      if (ext === '.pdf') {
        const data = await pdf(buffer);
        fullText = data.text;
        if (data.info?.Title && !titleFromForm) parsedTitle = data.info.Title;
        if (data.info?.Author && !authorFromForm) parsedAuthor = data.info.Author;
      } else if (ext === '.epub') {
        const epub = await EPub.createAsync(tempPath);
        if (epub.metadata?.title && !titleFromForm) parsedTitle = epub.metadata.title;
        if (epub.metadata?.creator && !authorFromForm) parsedAuthor = epub.metadata.creator;
        
        // Extract text
        if (epub.flow) {
          for (const chapter of epub.flow) {
            try {
              const text = await epub.getChapterAsync(chapter.id);
              fullText += text.replace(/<[^>]*>?/gm, ' ') + '\n';
            } catch (e) {
              console.warn("Could not read chapter:", chapter.id);
            }
          }
        }
      } else {
        await fs.unlink(tempPath).catch(() => {});
        return { success: false, error: 'Unsupported file format. Use PDF or EPUB.' };
      }
    } catch (parseError) {
      console.error("Error parsing file:", parseError);
      await fs.unlink(tempPath).catch(() => {});
      return { success: false, error: 'Error parsing file content' };
    }

    await fs.unlink(tempPath).catch(() => {});

    const bookData: any = {
      title: parsedTitle.trim() || 'Untitled',
      author: parsedAuthor.trim() || 'Unknown',
      mood,
      source: 'upload',
      language: 'en',
      fullText: fullText, // Guardamos el texto completo para el reader
      fileUrl: file.name,
      readable: true, // El usuario subió su propia copia → leíble in-app
    };

    // Save book
    const book = await prisma.book.create({
      data: bookData,
    });

    await prisma.userBook.create({
      data: {
        userId,
        bookId: book.id,
        status: 'want-to-read',
        readingProgress: 0,
        currentPage: 0,
        currentChapter: 0,
      },
    });

    revalidatePath('/library');
    return { success: true, data: book };

  } catch (error) {
    console.error('Upload book error:', error);
    return { success: false, error: 'Failed to upload book' };
  }
}
