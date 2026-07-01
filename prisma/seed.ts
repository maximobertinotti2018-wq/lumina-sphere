import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create a default user
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

  // 2. Create 3 mock books (classic, dark fantasy, sci-fi)
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
    }
  ];

  for (const bookData of booksData) {
    await prisma.book.upsert({
      where: { isbn: bookData.isbn },
      update: {},
      create: bookData,
    });
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
