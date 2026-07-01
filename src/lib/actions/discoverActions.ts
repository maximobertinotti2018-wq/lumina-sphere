"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { STARTER_BOOK_LIMIT } from "@/lib/constants";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
// @ts-ignore
import { EPub } from "epub2";

interface CatalogBookInput {
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  isbn?: string;
  publishedYear?: string;
  seriesName?: string;
  seriesIndex?: number;
  isPublicDomain?: boolean;
  readable?: boolean;
  fileUrl?: string;
  sourceIds?: { google?: string; openLibrary?: string };
}

interface DiscoverResult {
  success: boolean;
  bookId?: string;
  error?: string;
  requiresUpgrade?: boolean;
}

/** ¿Puede el usuario autenticado agregar más libros según su tier? */
async function checkCanAdd(userId: string, userTier: string): Promise<boolean> {
  if (userTier === "pro" || userTier === "premium") return true;
  const bookCount = await prisma.userBook.count({ where: { userId } });
  return bookCount < STARTER_BOOK_LIMIT;
}

/**
 * Agrega un libro del catálogo (Discover) a la biblioteca del usuario,
 * como "quiero leer" con links externos. No descarga contenido.
 */
export async function addCatalogBook(bookData: CatalogBookInput): Promise<DiscoverResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const userTier = (session.user as { subscriptionTier?: string }).subscriptionTier || "starter";
  const canAdd = await checkCanAdd(session.user.id, userTier);
  if (!canAdd) {
    return {
      success: false,
      error: `Llegaste al límite de ${STARTER_BOOK_LIMIT} libros. Pasate a Pro para libros ilimitados.`,
      requiresUpgrade: true,
    };
  }

  if (!bookData.title?.trim()) {
    return { success: false, error: "Falta el título del libro" };
  }

  try {
    const book = await prisma.book.upsert({
      where: { isbn: bookData.isbn || "unknown-" + Date.now() },
      create: {
        title: bookData.title,
        author: bookData.author || "Unknown",
        coverUrl: bookData.coverUrl,
        description: bookData.description,
        isbn: bookData.isbn,
        publishedDate: bookData.publishedYear,
        source: "catalog",
        mood: "dark-fantasy",
        seriesName: bookData.seriesName,
        seriesIndex: bookData.seriesIndex,
        isPublicDomain: bookData.isPublicDomain || false,
        readable: false,
        fileUrl: bookData.fileUrl,
        externalLinks: bookData.sourceIds?.google
          ? JSON.stringify({
              google: `https://play.google.com/store/books/details?id=${bookData.sourceIds.google}`,
            })
          : undefined,
      },
      update: {},
    });

    await prisma.userBook.upsert({
      where: {
        userId_bookId: { userId: session.user.id, bookId: book.id },
      },
      create: {
        userId: session.user.id,
        bookId: book.id,
        status: "want-to-read",
      },
      update: {},
    });

    revalidatePath("/library");
    return { success: true, bookId: book.id };
  } catch (error) {
    console.error("Add Catalog Book Error:", error);
    return { success: false, error: "No se pudo agregar el libro. Probá de nuevo." };
  }
}

const MAX_DOWNLOAD_SIZE = 25 * 1024 * 1024; // 25 MB, mismo tope que la subida manual

/**
 * "Leer ahora" para libros de dominio público: descarga el EPUB (Gutenberg),
 * extrae el texto y deja el libro listo para abrir en el lector.
 */
export async function addPublicDomainBook(bookData: CatalogBookInput): Promise<DiscoverResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!bookData.fileUrl) {
    return { success: false, error: "Este libro no tiene una fuente de lectura disponible." };
  }

  const userTier = (session.user as { subscriptionTier?: string }).subscriptionTier || "starter";
  const canAdd = await checkCanAdd(session.user.id, userTier);
  if (!canAdd) {
    return {
      success: false,
      error: `Llegaste al límite de ${STARTER_BOOK_LIMIT} libros. Pasate a Pro para libros ilimitados.`,
      requiresUpgrade: true,
    };
  }

  try {
    // Si ya tenemos este libro descargado y legible, no lo bajamos de nuevo.
    const existing = await prisma.book.findFirst({
      where: { fileUrl: bookData.fileUrl, readable: true },
    });

    let bookId: string;

    if (existing) {
      bookId = existing.id;
    } else {
      const res = await fetch(bookData.fileUrl);
      if (!res.ok) {
        return { success: false, error: "No pudimos descargar el libro. Probá más tarde." };
      }
      const arrayBuf = await res.arrayBuffer();
      if (arrayBuf.byteLength > MAX_DOWNLOAD_SIZE) {
        return { success: false, error: "El archivo del libro es demasiado grande." };
      }

      // epub2 lee desde un path → archivo temporal.
      const tempPath = path.join(os.tmpdir(), `gutenberg-${Date.now()}.epub`);
      await fs.writeFile(tempPath, Buffer.from(arrayBuf));

      let fullText = "";
      try {
        const epub = await EPub.createAsync(tempPath);
        if (epub.flow) {
          for (const chapter of epub.flow) {
            try {
              const text = await epub.getChapterAsync(chapter.id);
              fullText += text.replace(/<[^>]*>?/gm, " ") + "\n";
            } catch {
              /* capítulo ilegible: seguimos con el resto */
            }
          }
        }
      } catch (parseError) {
        console.error("Error parsing Gutenberg EPUB:", parseError);
        return { success: false, error: "No pudimos leer el archivo del libro." };
      } finally {
        await fs.unlink(tempPath).catch(() => {});
      }

      if (!fullText.trim()) {
        return { success: false, error: "El libro no tiene texto extraíble." };
      }

      const book = await prisma.book.create({
        data: {
          title: bookData.title,
          author: bookData.author || "Unknown",
          coverUrl: bookData.coverUrl,
          description: bookData.description,
          isbn: bookData.isbn,
          publishedDate: bookData.publishedYear,
          source: "gutenberg",
          mood: "dark-fantasy",
          language: "en",
          isPublicDomain: true,
          readable: true,
          fileUrl: bookData.fileUrl,
          fullText,
        },
      });
      bookId = book.id;
    }

    await prisma.userBook.upsert({
      where: {
        userId_bookId: { userId: session.user.id, bookId },
      },
      create: {
        userId: session.user.id,
        bookId,
        status: "reading",
      },
      update: {},
    });

    revalidatePath("/library");
    return { success: true, bookId };
  } catch (error) {
    console.error("Add Public Domain Book Error:", error);
    return { success: false, error: "No se pudo preparar el libro. Probá de nuevo." };
  }
}
