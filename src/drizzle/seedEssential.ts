import { config } from 'dotenv';
config({ path: './.env' });
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { Pool } from 'pg';
import { readFileSync } from 'node:fs';

const medicines = readFileSync('./src/drizzle/seed/medicines.json', 'utf-8');
const medicinesData = JSON.parse(medicines) as [];

(async function () {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const db = drizzle(pool, { schema });
  const da = await db
    .insert(schema.medicinesTable)
    .values(medicinesData)
    .returning();

  console.log('Medicines Seeded:', da.length);
  console.log('Seeding Done');
})().catch(console.error);
