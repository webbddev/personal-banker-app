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

      // The latest inflation value is rendered in the chart/table area.
      // We look for the annual inflation rate text on the page.
      let inflationVal: number | null = null;

      // Try to find from the page text - look for percentage values
      // The BNM inflation page shows "Annual inflation rate" with the latest value
      const pageText = $inf('body').text();
      const inflationMatch = pageText.match(
        /Annual\s+inflation\s+rate[^0-9]*?(\d+[.,]\d+)\s*%/i,
      );
      if (inflationMatch) {
        inflationVal = parseFloat(inflationMatch[1].replace(',', '.'));
      }

      // Fallback: try finding the bold text near the chart
      if (inflationVal === null) {
        $inf('text').each((_, el) => {
          const text = $inf(el).text().trim();
          const match = text.match(/^(\d+[.,]\d+)%$/);
          if (match && inflationVal === null) {
            inflationVal = parseFloat(match[1].replace(',', '.'));
          }
        });
      }

      if (inflationVal !== null && !isNaN(inflationVal)) {
        const now = new Date();
        // Inflation data is typically released for the previous month
        const dataDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

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
