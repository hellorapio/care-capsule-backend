import { config } from 'dotenv';
config({ path: './.env' });
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './schema';

import { Pool } from 'pg';
import { sql } from 'drizzle-orm';

(async function () {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const db = drizzle(pool, { schema });

  await db.execute(sql`drop schema if exists public cascade`);
  await db.execute(sql`create schema public`);
  await db.execute(sql`drop schema if exists drizzle cascade`);
  
  await migrate(db, { migrationsFolder: './src/drizzle/drizzle' });
  console.log('Migration Done');
})().catch(console.error);
