import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', database: 'connected' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: 'error', database: 'disconnected' }, { status: 503 });
  }
}
