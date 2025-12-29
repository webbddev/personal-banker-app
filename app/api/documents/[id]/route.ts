// app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

/**
 * REFACTORED: Next.js 15 requires 'params' to be awaited as a Promise.
 * Also changed 'Request' to 'NextRequest' for better type alignment.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Define params as a Promise
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params promise to get the ID
    const { id } = await context.params;

    // Find the document and verify ownership
    const document = await prisma.document.findUnique({
      where: {
        id: id,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (document.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      // Delete from Vercel Blob Storage
      await del(document.blobUrl);
      console.log('Blob deleted successfully:', document.blobUrl);
    } catch (blobError) {
      // Log but continue; if the blob is already gone, we still want the DB record removed
      console.error(
        'Error deleting blob (continuing with DB deletion):',
        blobError
      );
    }

    // Delete from database
    await prisma.document.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
