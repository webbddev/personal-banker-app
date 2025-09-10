
import { NextRequest, NextResponse } from 'next/server';
import { UIMessage, convertToModelMessages, streamText } from 'ai';
import { checkUser } from '@/lib/checkUser';
import { prisma } from '@/lib/prisma';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      model,
      webSearch,
    }: {
      messages: UIMessage[];
      model: string;
      webSearch: boolean;
    } = await req.json();

    const user = await checkUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const userInvestments = await prisma.investment.findMany({
      where: { userId: user.clerkUserId },
      select: {
        organisationName: true,
        investmentAmount: true,
        currency: true,
        interestRate: true,
        investmentType: true,
        expirationDate: true,
      },
    });
    const currentDate = new Date().toDateString();

    const systemPrompt = `You are a personal financial assistant. You are an expert in analyzing investment portfolios and providing financial advice. When asked about the user's investments, use the following data which represents their portfolio: ${JSON.stringify(userInvestments)}
    The current date is ${currentDate}. Use this to answer any time-related questions about the user's investments. In addition to questions about the user's portfolio, you can answer general questions about finance, economics, and banking. For questions that require up-to-date information (like interest rates, market trends, etc.), use your web search capabilities to provide the most current and accurate information.`;

    const result = await streamText({
      model: webSearch ? 'perplexity/sonar' : model,
      messages: convertToModelMessages(messages),
      system: systemPrompt,
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to process chat message',
        details: errorMessage,
      }),
      { status: 500 }
    );
  }
}
