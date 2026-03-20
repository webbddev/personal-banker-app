// prisma.config.ts (located in your project root)

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    // CLI commands (like migrations) MUST use the direct, non-pooled connection
    // Fallback to DATABASE_URL if DIRECT_DATABASE_URL is not provided (e.g. locally)
    url: env('DIRECT_DATABASE_URL') || env('DATABASE_URL'),
  },
});
