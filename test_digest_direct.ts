import { sendMonthlyDigests } from '@/app/actions/send-reminders';
import { prisma } from '@/lib/prisma';

async function test() {
  console.log(
    'Testing monthly digest logic at time:',
    new Date().toISOString(),
  );
  try {
    const result = await sendMonthlyDigests();
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

test();
