import { prisma } from './lib/prisma';

async function main() {
  const user = await prisma.user.findFirst();
  console.log('Found user email:', user?.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
