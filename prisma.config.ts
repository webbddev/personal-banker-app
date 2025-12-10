// prisma.config.ts (located in your project root)

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // seed: 'tsx prisma/seed.ts', // (Optional) Add this if you have a seed script
  },
  datasource: {
    // URL is now configured here for the CLI to use
    url: env('DATABASE_URL'),
  },
});
