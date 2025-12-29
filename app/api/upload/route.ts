import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  let newDocument: { id: string } | null = null;

  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload ?? '{}');
        const { fileType, fileSize } = payload;

        if (typeof fileType !== 'string' || typeof fileSize !== 'number') {
          throw new Error(
            'fileType and fileSize are required and must be of the correct type'
          );
        }

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/pdf',
            'application/zip',
          ],
          tokenPayload: JSON.stringify({
            userId,
            filename: pathname,
            fileType,
            fileSize,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const payload = JSON.parse(tokenPayload ?? '{}');
          const { userId, filename, fileType, fileSize } = payload;

          if (!userId || !filename || !fileType || !fileSize) {
            throw new Error('Missing required data to create document record.');
          }

          const document = await prisma.document.create({
            data: {
              userId: userId,
              blobUrl: blob.url,
              filename: filename,
              fileType: fileType,
              fileSize: fileSize,
            },
            select: {
              id: true,
            },
          });
          newDocument = document;
        } catch (error) {
          console.error(
            'onUploadCompleted: Error creating document in DB:',
            error
          );
          throw new Error('Could not update database');
        }
      },
    });

    return NextResponse.json({ ...jsonResponse, newDocument });
  } catch (error) {
    const message = (error as Error).message || 'An error occurred';
    return new NextResponse(message, { status: 400 });
  }
}
