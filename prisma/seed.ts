import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
// Constantes puras (sin imports), seguras de traer al seed vía ruta relativa.
import { DEMO_EMAIL, DEMO_PASSWORD } from '../src/lib/demo';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Usuario admin por defecto
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@luminasphere.com' },
    update: {},
    create: {
      email: 'admin@luminasphere.com',
      name: 'Admin User',
      hashedPassword,
      subscriptionTier: 'pro',
    },
  });

  // 2. Libros de dominio público (catálogo compartido)
  const booksData = [
    {
      title: 'Dracula',
      author: 'Bram Stoker',
      description: 'A masterpiece of vampire fiction.',
      coverUrl: 'https://covers.openlibrary.org/b/id/10521270-L.jpg',
      isbn: '9780141439846',
      mood: 'dark-fantasy',
      source: 'catalog',
      isPublicDomain: true,
      readable: true,
    },
    {
      title: 'Frankenstein',
      author: 'Mary Shelley',
      description: 'The story of Victor Frankenstein and his monster.',
      coverUrl: 'https://covers.openlibrary.org/b/id/8259443-L.jpg',
      isbn: '9780141439471',
      mood: 'classic',
      source: 'catalog',
      isPublicDomain: true,
      readable: true,
    },
    {
      title: 'The Time Machine',
      author: 'H.G. Wells',
      description: 'A science fiction novella.',
      coverUrl: 'https://covers.openlibrary.org/b/id/10531580-L.jpg',
      isbn: '9780141439976',
      mood: 'sci-fi',
      source: 'catalog',
      isPublicDomain: true,
      readable: true,
    },
  ];

  const books = [] as { id: string; title: string }[];
  for (const bookData of booksData) {
    const book = await prisma.book.upsert({
      where: { isbn: bookData.isbn },
      update: {},
      create: bookData,
    });
    books.push({ id: book.id, title: book.title });
  }

  // 3. Cuenta DEMO pública: entra cualquiera, sin registrarse, y ve una
  //    biblioteca ya armada. Credenciales en src/lib/demo.ts (públicas a propósito).
  const demoPassword = await bcrypt.hash(DEMO_PASSWORD, 12);
  const demo = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      name: 'Visitante Demo',
      hashedPassword: demoPassword,
      subscriptionTier: 'pro', // Pro para que la demo muestre todas las features.
    },
  });

  // 4. Vincular los libros a la biblioteca de la demo con estados variados,
  //    así el dashboard tiene stats reales (leyendo / terminado / por leer).
  const library = [
    { title: 'Dracula', status: 'reading', readingProgress: 42, currentPage: 128, isFavorite: true },
    { title: 'Frankenstein', status: 'finished', readingProgress: 100, currentPage: 280, userRating: 5 },
    { title: 'The Time Machine', status: 'want-to-read', readingProgress: 0, currentPage: 0 },
  ];

  for (const entry of library) {
    const book = books.find((b) => b.title === entry.title);
    if (!book) continue;
    await prisma.userBook.upsert({
      where: { userId_bookId: { userId: demo.id, bookId: book.id } },
      update: {},
      create: {
        userId: demo.id,
        bookId: book.id,
        status: entry.status,
        readingProgress: entry.readingProgress,
        currentPage: entry.currentPage,
        isFavorite: entry.isFavorite ?? false,
        userRating: entry.userRating ?? null,
        startedAt: entry.status !== 'want-to-read' ? new Date() : null,
        finishedAt: entry.status === 'finished' ? new Date() : null,
      },
    });
  }

  // 5. Una nota y un highlight en Dracula, para mostrar esas features en la demo.
  const dracula = books.find((b) => b.title === 'Dracula');
  if (dracula) {
    const existingNote = await prisma.note.findFirst({
      where: { userId: demo.id, bookId: dracula.id },
    });
    if (!existingNote) {
      await prisma.note.create({
        data: {
          userId: demo.id,
          bookId: dracula.id,
          content: 'El diario de Jonathan Harker arranca con una tensión buenísima.',
          pageNumber: 12,
        },
      });
    }
    const existingHighlight = await prisma.highlight.findFirst({
      where: { userId: demo.id, bookId: dracula.id },
    });
    if (!existingHighlight) {
      await prisma.highlight.create({
        data: {
          userId: demo.id,
          bookId: dracula.id,
          text: 'Listen to them, the children of the night. What music they make!',
          pageNumber: 24,
        },
      });
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
