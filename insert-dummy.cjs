require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('./prisma/generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.bnmBaseRate.create({
    data: {
      rate: 4.0,
    },
  });
  console.log('Inserted dummy 4.00 rate for testing.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
