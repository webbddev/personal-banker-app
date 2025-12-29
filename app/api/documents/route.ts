// app/api/documents/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        blobUrl: true,
        filename: true,
        fileType: true,
        fileSize: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
