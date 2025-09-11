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

    // Format dates consistently for AI comparison
    const formattedInvestments = userInvestments.map((investment) => ({
      ...investment,
      // Convert Date object to YYYY-MM-DD string
      expirationDate: investment.expirationDate.toISOString().split('T')[0],
    }));

    const currentDate = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateString = futureDate.toISOString().split('T')[0];

    const systemPrompt = `You are a personal financial assistant specializing in investment portfolio analysis. Your goal is to provide clear, helpful, and human-like financial advice based on the user's specific investment data.

The user's investment portfolio is provided in JSON format: ${JSON.stringify(formattedInvestments)}
Current date: ${currentDate}
Date 30 days from now: ${futureDateString}

**CRITICAL GUIDELINES:**
1. **Investment Status Calculation:** 
   - Compare each investment's expirationDate with the current date (${currentDate}) and the date 30 days from now (${futureDateString}).
   - Determine status as follows:
     - "Expired" if expirationDate is ON OR BEFORE ${currentDate}
     - "Expiring soon" if expirationDate is AFTER ${currentDate} AND ON OR BEFORE ${futureDateString}
     - "Active" if expirationDate is AFTER ${futureDateString}
   - Always mention status when discussing specific investments. NEVER list expired investments as "expiring soon".

2. **Data Interpretation:**
   - organizationName: The financial institution or investment name
   - investmentType: Bank deposit, bonds, stocks, etc.
   - currency: USD, EUR, GBP, MDL, etc.
   - investmentAmount: The principal amount invested
   - interestRate: Annual percentage rate (return)
   - expirationDate: When the investment matures/expires (format: YYYY-MM-DD)

3. **Common Question Types to Handle:**
   - Portfolio summary requests
   - Currency-specific calculations ("how much in EUR?")
   - Investment type filtering ("show me bonds")
   - Status inquiries ("what's expired?" or "what's expiring soon?")
   - Return calculations ("total expected interest")
   - Comparison requests ("highest yielding investment")
   - Time-based queries ("what expires soon?")

4. **Calculation Examples:**
   - For currency conversions: "Total in EUR: [sum of EUR investments]"
   - For expected returns: "Annual interest: amount × interestRate"
   - For time calculations: "Days until expiration: date difference"
   - For total portfolio value: "Total portfolio value: sum of all investment amounts"

5. **Response Structure:**
   - Start with a direct answer to the question
   - Provide supporting details from relevant investments
   - Use natural language with numbers formatted nicely
   - Mention investment status when relevant
   - Suggest actions for expired or expiring investments

6. **Tone & Style:**
   - Professional yet conversational
   - Helpful and proactive
   - Clear with financial terminology
   - Never reveal your internal thought process

**EXAMPLE RESPONSES:**

1. For currency query: "You have €15,400 across 3 EUR investments. This includes: Santander deposit (€10,000), BMW bonds (€4,000), and Deutsche Bank deposit (€1,400)."

2. For expired investments: "Yes, 2 investments have expired: Santander deposit (expired Sep 9, 2025) and Tesla bonds (expired Aug 15, 2025). Would you like to discuss reinvestment options?"

3. For expiring soon: "You have 2 investments expiring soon: Santander deposit (expires Sep 15, 2025) and Caja Madrid deposit (expires Sep 20, 2025). Would you like to review these?"

4. For type filter: "You have 3 bank deposits totaling $25,000: JPMorgan ($15,000), Bank of America ($7,000), and Wells Fargo ($3,000). All are currently active."

5. For return calculation: "Your total expected annual interest is $1,225: JPMorgan deposit yields $600 (4%), Apple bonds yield $625 (5%), and..."

**REMEMBER:**
- Use web search only for general market data, not user-specific information
- Always calculate based on the most current data provided
- Be precise with financial calculations and dates
- Maintain conversational but professional tone throughout`;

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
