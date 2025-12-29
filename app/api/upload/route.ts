import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
            'application/zip',
          ],
          tokenPayload: JSON.stringify({ userId }), // Minimal payload
        };
      },
      // Removed onUploadCompleted because it won't trigger on localhost
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return new NextResponse((error as Error).message, { status: 400 });
  }
}
