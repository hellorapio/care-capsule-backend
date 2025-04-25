import { config } from 'dotenv';
config({ path: './.env' });
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './schema';

import { Pool } from 'pg';

(async function () {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const db = drizzle(pool, { schema });
  await migrate(db, { migrationsFolder: './src/drizzle/drizzle' });
  console.log('Migration Done');
})().catch(console.error);
