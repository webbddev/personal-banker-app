import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch existing docs (Keep your existing GET logic here)
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json([], { status: 401 });
  const docs = await prisma.document.findMany({ where: { userId } });
  return NextResponse.json(docs);
}

// NEW POST: Save document metadata after successful upload
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { blobUrl, filename, fileType, fileSize } = await request.json();

    const document = await prisma.document.create({
      data: {
        userId,
        blobUrl,
        filename,
        fileType,
        fileSize,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save document' },
      { status: 500 }
    );
  }
}
