// app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params promise (Next.js 15 requirement)
    const { id } = await context.params;

    // Find the document and verify ownership in one query
    const document = await prisma.document.findFirst({
      where: {
        id: id,
        userId: userId, // Verify ownership
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete from Vercel Blob Storage first
    try {
      await del(document.blobUrl);
      console.log('✅ Blob deleted:', document.blobUrl);
    } catch (blobError) {
      console.error('⚠️ Blob deletion failed (continuing):', blobError);
      // Continue to delete DB record even if blob deletion fails
    }

    // Delete from database
    await prisma.document.delete({
      where: {
        id: id,
      },
    });

    console.log('✅ Database record deleted:', id);

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
