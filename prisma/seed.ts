import 'dotenv/config';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as xlsx from 'xlsx';
import * as path from 'path';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Convert an Excel serial date number to a JS Date.
 * Excel serial dates count days since 1900-01-01 (with a leap year bug).
 */
function excelSerialToDate(serial: number): Date {
  // Excel epoch is 1900-01-01, but Excel thinks 1900 is a leap year (it's not).
  // So we subtract 2 days from the serial to account for that.
  const utcDays = Math.floor(serial) - 25569; // 25569 = days between 1900-01-01 and 1970-01-01
  const utcValue = utcDays * 86400 * 1000;
  return new Date(utcValue);
}

/**
 * Parse a date string like "01/12" (MM/YY) into a Date object.
 * The date is set to the first of the month.
 */
function parseInflationDate(dateStr: string): Date | null {
  const parts = dateStr.split('/');
  if (parts.length !== 2) return null;

  const month = parseInt(parts[0], 10);
  const yearShort = parseInt(parts[1], 10);
  if (isNaN(month) || isNaN(yearShort)) return null;

  // Assume 2000+ for years
  const year = yearShort < 100 ? 2000 + yearShort : yearShort;
  return new Date(Date.UTC(year, month - 1, 1)); // First day of the month in UTC
}

/**
 * Parse a comma-separated European decimal value like "6,9" -> 6.9
 */
function parseEuropeanDecimal(val: string | number): number | null {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return null;
  const cleaned = val.replace(',', '.').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

async function seedBaseRates() {
  const filePath = path.join(__dirname, 'data', 'base_rates_history.xls');
  console.log('📊 Reading base rates from:', filePath);

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  // Skip header row (row 0: ["Date", "Base rate", ...])
  let count = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;

    const dateVal = row[0];
    const rateVal = row[1];

    if (typeof dateVal !== 'number' || typeof rateVal !== 'number') continue;

    const date = excelSerialToDate(dateVal);
    if (isNaN(date.getTime())) continue;

    // Normalize to the first of the month for consistent grouping (UTC)
    const normalizedDate = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
    );

    await prisma.marketIndicator.upsert({
      where: {
        name_date: {
          name: 'BASE_RATE',
          date: normalizedDate,
        },
      },
      update: { value: rateVal },
      create: {
        name: 'BASE_RATE',
        value: rateVal,
        date: normalizedDate,
      },
    });
    count++;
  }

  console.log(`✅ Seeded ${count} base rate records.`);
}

async function seedInflation() {
  const filePath = path.join(__dirname, 'data', 'inflation_history.xls');
  console.log('📊 Reading inflation data from:', filePath);

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  // Data starts at row index 4 (after header and empty rows)
  // Format: ["01/12", "6,9"] or ["01/12", "6,9", "5", "6,5", "3,5"]
  let count = 0;
  for (let i = 4; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;

    const dateStr = row[0];
    if (typeof dateStr !== 'string' || !dateStr.includes('/')) continue;

    const date = parseInflationDate(dateStr);
    if (!date || isNaN(date.getTime())) continue;

    const value = parseEuropeanDecimal(row[1]);
    if (value === null) continue;

    await prisma.marketIndicator.upsert({
      where: {
        name_date: {
          name: 'INFLATION',
          date: date,
        },
      },
      update: { value },
      create: {
        name: 'INFLATION',
        value,
        date,
      },
    });
    count++;
  }

  console.log(`✅ Seeded ${count} inflation records.`);
}

async function main() {
  console.log('🌱 Starting market data seed...\n');

  try {
    await seedBaseRates();
    await seedInflation();
    console.log('\n🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
