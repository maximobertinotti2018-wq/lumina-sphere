"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addCatalogBook(bookData: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Paywall check: Limit 5 for starter
  const userTier = (session.user as any).subscriptionTier || 'starter';
  if (userTier === 'starter') {
    const bookCount = await prisma.userBook.count({ where: { userId: session.user.id } });
    if (bookCount >= 5) {
      return { success: false, error: "Limit reached. Upgrade to Pro." };
    }
  }

  try {
    // Determine book mood (simplistic random for now or default)
    const mood = "dark-fantasy"; 

    // Upsert Book
    const book = await prisma.book.upsert({
      where: { isbn: bookData.isbn || "unknown-" + Date.now() },
      create: {
        title: bookData.title,
        author: bookData.author,
        coverUrl: bookData.coverUrl,
        description: bookData.description,
        isbn: bookData.isbn,
        publishedDate: bookData.publishedYear,
        source: "catalog",
        mood: mood,
        seriesName: bookData.seriesName,
        seriesIndex: bookData.seriesIndex,
        isPublicDomain: bookData.isPublicDomain || false,
        readable: bookData.readable || false,
        externalLinks: bookData.sourceIds ? JSON.stringify({
          google: bookData.sourceIds.google ? `https://play.google.com/store/books/details?id=${bookData.sourceIds.google}` : undefined
        }) : undefined,
      },
      update: {}
    });

    // Create UserBook
    await prisma.userBook.upsert({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: book.id,
        }
      },
      create: {
        userId: session.user.id,
        bookId: book.id,
        status: "want-to-read",
      },
      update: {}
    });

    revalidatePath('/library');
    return { success: true, bookId: book.id };
  } catch (error: any) {
    console.error("Add Catalog Book Error:", error);
    return { success: false, error: error.message };
  }
}

export async function uploadOwnedBookFile(userBookId: string, _fileDataUrl: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // For local env, we simulate saving to cloud and getting a URL
    // In production, upload fileDataUrl (base64) to S3/R2
    const dummyFileUrl = "https://example.com/user-uploaded-file.epub"; 

    await prisma.userBook.update({
      where: { id: userBookId },
      data: { ownedFileUrl: dummyFileUrl }
    });

    revalidatePath(`/book/${userBookId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { success: false, error: error.message };
  }
}
