import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as cheerio from 'cheerio';

export const revalidate = 0;

/**
 * Daily cron job to scrape the latest GS (State Securities) auction data
 * from the Moldova Ministry of Finance website.
 *
 * Schedule: Daily at 16:00 (configured in vercel.json)
 * Source:   https://mf.gov.md/en/datoria-sectorului-public/piața-primară-a-vms/licitații-vms
 */
export async function GET(request: Request) {
  try {
    const url =
      'https://mf.gov.md/en/datoria-sectorului-public/pia%C8%9Ba-primar%C4%83-a-vms/licita%C8%9Bii-vms';

    const response = await fetch(url, {
      next: { revalidate: 0 },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const rows = $('table.views-table tbody tr');
    let synced = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = $(rows[i]);

      try {
        // ─── Extract raw text from each column ───────────────────────
        const titleRaw = row.find('.views-field-title').text().trim();
        const dateRaw = row
          .find('.views-field-field-data-licitatiei')
          .text()
          .trim();
        const typeRaw = row.find('.views-field-field-tipul-vms').text().trim();
        const maturityRaw = row.find('.views-field-name-i18n').text().trim();
        const rateRaw = row
          .find('.views-field-field-rata-nominala-a-dobinzii')
          .text()
          .trim();

        // Skip rows with no meaningful data
        if (!titleRaw || !dateRaw) {
          skipped++;
          continue;
        }

        // ─── Parse auction date (DD.MM.YYYY → Date) ─────────────────
        const auctionDate = parseDotDate(dateRaw);
        if (!auctionDate) {
          errors.push(`Row ${i}: Could not parse date "${dateRaw}"`);
          skipped++;
          continue;
        }

        // ─── Parse interest rate ("10.05%" → 10.05) ─────────────────
        const interestRate = parseRate(rateRaw);

        // ─── Clean GS type and maturity strings ─────────────────────
        const gsType = typeRaw || 'Unknown';
        const maturity = maturityRaw || 'N/A';

        // ─── Upsert to database ─────────────────────────────────────
        await prisma.bondAuction.upsert({
          where: {
            title_auctionDate: {
              title: titleRaw,
              auctionDate,
            },
          },
          update: {
            gsType,
            maturity,
            interestRate,
          },
          create: {
            title: titleRaw,
            auctionDate,
            gsType,
            maturity,
            interestRate,
          },
        });

        synced++;
      } catch (rowErr) {
        const msg = rowErr instanceof Error ? rowErr.message : String(rowErr);
        errors.push(`Row ${i}: ${msg}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        totalRows: rows.length,
        synced,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error('Auction sync error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────

/**
 * Parse a date string in DD.MM.YYYY format to a JavaScript Date.
 * Returns null if the format doesn't match.
 */
function parseDotDate(str: string): Date | null {
  const match = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Parse a percentage string like "10.05%" or "3,03%" to a float.
 * Returns null if unparseable or empty.
 */
function parseRate(str: string): number | null {
  if (!str) return null;

  // Remove % sign, whitespace, and handle comma decimals
  const cleaned = str.replace(/%/g, '').replace(/,/g, '.').trim();
  if (!cleaned) return null;

  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}
