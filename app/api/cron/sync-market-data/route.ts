import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as cheerio from 'cheerio';

export const revalidate = 0;

/**
 * Weekly cron job to scrape the latest Base Rate and Inflation data
 * from the National Bank of Moldova (BNM) website.
 *
 * Schedule: Every Monday at 09:30 (configured in vercel.json)
 */
export async function GET(request: Request) {
  try {
    const results: Record<string, any> = {};

    // ─── 1. Scrape Base Rate from bnm.md/en ───────────────────────────
    try {
      const baseRateRes = await fetch('https://bnm.md/en', {
        next: { revalidate: 0 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PersonalBankerBot/1.0)',
        },
      });

      if (!baseRateRes.ok) throw new Error(`HTTP ${baseRateRes.status}`);
      const baseRateHtml = await baseRateRes.text();
      const $base = cheerio.load(baseRateHtml);

      // The base rate is displayed in the rates section
      const baseRateStr = $base('.view-rates .rate .rate-value')
        .first()
        .text()
        .trim();

      if (baseRateStr) {
        const baseRateVal = parseFloat(baseRateStr.replace('%', '').trim());

        if (!isNaN(baseRateVal)) {
          const now = new Date();
          const normalizedDate = new Date(now.getFullYear(), now.getMonth(), 1);

          await prisma.marketIndicator.upsert({
            where: {
              name_date: {
                name: 'BASE_RATE',
                date: normalizedDate,
              },
            },
            update: { value: baseRateVal },
            create: {
              name: 'BASE_RATE',
              value: baseRateVal,
              date: normalizedDate,
            },
          });

          results.baseRate = {
            success: true,
            value: baseRateVal,
            date: normalizedDate.toISOString(),
          };
        }
      } else {
        results.baseRate = { success: false, error: 'Could not parse rate' };
      }
    } catch (err) {
      console.error('Error scraping base rate:', err);
      results.baseRate = {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }

    // ─── 2. Scrape Inflation from bnm.md/en/content/inflation ─────────
    try {
      const inflationRes = await fetch(
        'https://www.bnm.md/en/content/inflation',
        {
          next: { revalidate: 0 },
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; PersonalBankerBot/1.0)',
          },
        },
      );

      if (!inflationRes.ok) throw new Error(`HTTP ${inflationRes.status}`);
      const inflationHtml = await inflationRes.text();
      const $inf = cheerio.load(inflationHtml);

      // The BNM page contains text like:
      // "in February 2026 was 5,06 percent."
      // We extract both the value AND the month/year it refers to.
      let inflationVal: number | null = null;
      let dataDate: Date | null = null;

      const pageText = $inf('body').text();

      // Primary pattern: "in <Month> <Year> was <value> percent"
      const fullMatch = pageText.match(
        /in\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\s+was\s+(\d+[.,]\d+)\s*percent/i,
      );

      if (fullMatch) {
        const monthNames: Record<string, number> = {
          january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
          july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
        };
        const monthIndex = monthNames[fullMatch[1].toLowerCase()];
        const year = parseInt(fullMatch[2], 10);
        inflationVal = parseFloat(fullMatch[3].replace(',', '.'));
        dataDate = new Date(year, monthIndex, 1);
      }

      // Fallback: try the old "Annual inflation rate ... X.XX%" pattern
      if (inflationVal === null) {
        const inflationMatch = pageText.match(
          /Annual\s+inflation\s+rate[^0-9]*?(\d+[.,]\d+)\s*%/i,
        );
        if (inflationMatch) {
          inflationVal = parseFloat(inflationMatch[1].replace(',', '.'));
        }
      }

      // Last resort fallback: any standalone percentage on the page
      if (inflationVal === null) {
        $inf('text').each((_, el) => {
          const text = $inf(el).text().trim();
          const match = text.match(/^(\d+[.,]\d+)%$/);
          if (match && inflationVal === null) {
            inflationVal = parseFloat(match[1].replace(',', '.'));
          }
        });
      }

      // If we couldn't parse the date from the page, fall back to previous month
      if (dataDate === null) {
        const now = new Date();
        dataDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      }

      if (inflationVal !== null && !isNaN(inflationVal)) {
        await prisma.marketIndicator.upsert({
          where: {
            name_date: {
              name: 'INFLATION',
              date: dataDate,
            },
          },
          update: { value: inflationVal },
          create: {
            name: 'INFLATION',
            value: inflationVal,
            date: dataDate,
          },
        });

        results.inflation = {
          success: true,
          value: inflationVal,
          date: dataDate.toISOString(),
          parsedMonth: dataDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        };
      } else {
        results.inflation = {
          success: false,
          error: 'Could not parse inflation value',
        };
      }
    } catch (err) {
      console.error('Error scraping inflation:', err);
      results.inflation = {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Market data sync error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
