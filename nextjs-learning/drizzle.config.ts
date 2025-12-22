import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DB_URL) {
  throw new Error('DB_URL environment variable is not set');
}

export default defineConfig({
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_URL,
  },
});

