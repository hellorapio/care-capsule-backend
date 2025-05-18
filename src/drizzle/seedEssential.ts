import { config } from 'dotenv';
config({ path: './.env' });
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { Pool } from 'pg';
import { readFileSync } from 'node:fs';

const medicines = readFileSync('./src/drizzle/seed/medicines.json', 'utf-8');
const medicinesData = JSON.parse(medicines) as [];

const pharmaciesData = [
  {
    name: 'MediCare Pharmacy',
    description:
      'A full-service pharmacy offering prescription medications, health consultations, and a wide range of OTC products.',
    address: '123 Main Street, Centertown, NY 10001',
    phone: '(212) 555-1234',
    email: 'contact@medicare-pharmacy.com',
    image:
      'https://www.enigmaglobal.com/wp-content/uploads/2024/01/Costas-Constantopoulos-Pharmacy-4.jpg',
    isActive: true,
  },
  {
    name: 'HealthFirst Drugstore',
    description:
      'Community-focused pharmacy providing personalized care and a comprehensive selection of health products.',
    address: '45 Park Avenue, Riverdale, CA 90210',
    phone: '(310) 555-2345',
    email: 'info@healthfirstdrugs.com',
    image:
      'https://www.enigmaglobal.com/wp-content/uploads/2024/01/Costas-Constantopoulos-Pharmacy-4.jpg',
    isActive: true,
  },
  {
    name: 'QuickScript Pharmacy',
    description:
      'Specializing in fast prescription fulfillment with drive-through service and 24/7 pharmacist consultations.',
    address: '789 Oak Road, Lakeside, IL 60611',
    phone: '(312) 555-3456',
    email: 'service@quickscript.com',
    image:
      'https://www.enigmaglobal.com/wp-content/uploads/2024/01/Costas-Constantopoulos-Pharmacy-4.jpg',
    isActive: true,
  },
  {
    name: 'Wellness Apothecary',
    description:
      'Holistic pharmacy combining traditional medicine with natural remedies and wellness products.',
    address: '567 Pine Lane, Mountain View, CO 80301',
    phone: '(720) 555-4567',
    email: 'care@wellnessapothecary.com',
    image:
      'https://www.enigmaglobal.com/wp-content/uploads/2024/01/Costas-Constantopoulos-Pharmacy-4.jpg',
    isActive: true,
  },
  {
    name: 'City Center Pharmacy',
    description:
      'Downtown pharmacy offering quick service for busy professionals with online refills and delivery options.',
    address: '321 Downtown Blvd, Metropolis, WA 98101',
    phone: '(206) 555-5678',
    email: 'help@citycenterpharm.com',
    image:
      'https://www.enigmaglobal.com/wp-content/uploads/2024/01/Costas-Constantopoulos-Pharmacy-4.jpg',
    isActive: true,
  },
  {
    name: 'Family Care Drugs',
    description:
      'Family-owned pharmacy serving generations with friendly service and competitive pricing.',
    address: '456 Maple Avenue, Hometown, OH 43215',
    phone: '(614) 555-6789',
    email: 'support@familycaredrugs.com',
    image:
      'https://www.enigmaglobal.com/wp-content/uploads/2024/01/Costas-Constantopoulos-Pharmacy-4.jpg',
    isActive: true,
  },
  {
    name: 'UniHealth Pharmacy',
    description:
      'University-affiliated pharmacy specializing in student health needs and academic community support.',
    address: '101 Campus Drive, College Town, MA 02138',
    phone: '(617) 555-7890',
    email: 'unihealth@college.edu',
    image:
      'https://www.enigmaglobal.com/wp-content/uploads/2024/01/Costas-Constantopoulos-Pharmacy-4.jpg',
    isActive: true,
  },
  {
    name: 'Sunset Boulevard Drugs',
    description:
      'Upscale pharmacy offering premium health products and personalized medication management services.',
    address: '8900 Sunset Blvd, Los Angeles, CA 90069',
    phone: '(323) 555-8901',
    email: 'concierge@sunsetdrugs.com',
    image:
      'https://www.enigmaglobal.com/wp-content/uploads/2024/01/Costas-Constantopoulos-Pharmacy-4.jpg',
    isActive: true,
  },
  {
    name: 'Neighborhood Health Mart',
    description:
      'Local pharmacy focused on community health education and preventative care products.',
    address: '234 Community Way, Pleasantville, TX 75001',
    phone: '(214) 555-9012',
    email: 'hello@neighborhoodhealthmart.com',
    image:
      'https://www.enigmaglobal.com/wp-content/uploads/2024/01/Costas-Constantopoulos-Pharmacy-4.jpg',
    isActive: true,
  },
  {
    name: 'Bayview Pharmacy',
    description:
      'Waterfront pharmacy specializing in travel medicine and vacation health supplies.',
    address: '500 Harbor Drive, Baytown, FL 33139',
    phone: '(305) 555-0123',
    email: 'travel@bayviewpharmacy.com',
    image:
      'https://www.enigmaglobal.com/wp-content/uploads/2024/01/Costas-Constantopoulos-Pharmacy-4.jpg',
    isActive: true,
  },
  {
    name: 'Express Rx',
    description:
      'Streamlined pharmacy experience with automated refill systems and quick pickup options.',
    address: '678 Fast Lane, Speedway, IN 46224',
    phone: '(317) 555-1234',
    email: 'quick@expressrx.com',
    image:
      'https://www.enigmaglobal.com/wp-content/uploads/2024/01/Costas-Constantopoulos-Pharmacy-4.jpg',
    isActive: true,
  },
  {
    name: 'Green Cross Pharmacy',
    description:
      'Eco-friendly pharmacy offering sustainable health products and medication recycling programs.',
    address: '123 Evergreen Way, Portland, OR 97201',
    phone: '(503) 555-2345',
    email: 'eco@greencrosspharm.com',
    image:
      'https://www.enigmaglobal.com/wp-content/uploads/2024/01/Costas-Constantopoulos-Pharmacy-4.jpg',
    isActive: true,
  },
  {
    name: 'Senior Care Pharmacy',
    description:
      'Specialized in geriatric medications and healthcare products with home delivery and medication review services.',
    address: '456 Golden Years Drive, Retirement Valley, AZ 85001',
    phone: '(480) 555-3456',
    email: 'care@seniorcarepharm.com',
    image:
      'https://www.enigmaglobal.com/wp-content/uploads/2024/01/Costas-Constantopoulos-Pharmacy-4.jpg',
    isActive: false,
  },
  {
    name: 'Kids & Family Pharmacy',
    description:
      'Child-friendly pharmacy with pediatric specialists and family health resources.',
    address: '789 Playground Road, Familytown, GA 30301',
    phone: '(404) 555-4567',
    email: 'families@kidspharmacy.com',
    image:
      'https://www.enigmaglobal.com/wp-content/uploads/2024/01/Costas-Constantopoulos-Pharmacy-4.jpg',
    isActive: true,
  },
  {
    name: '24/7 Pharmacy Plus',
    description:
      'Round-the-clock pharmacy services with emergency medication supply and night consultations.',
    address: '365 Nonstop Street, Alwaysopen, NV 89101',
    phone: '(702) 555-5678',
    email: 'anytime@247pharmacyplus.com',
    image:
      'https://www.enigmaglobal.com/wp-content/uploads/2024/01/Costas-Constantopoulos-Pharmacy-4.jpg',
    isActive: true,
  },
];

(async function () {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const transformed = medicinesData.filter(
    (med: { image: string }) => !med.image.startsWith('https://www.makatimed'),
  );

  const db = drizzle(pool, { schema });
  const da = await db
    .insert(schema.medicinesTable)
    .values(transformed)
    .returning();
  const da2 = await db
    .insert(schema.pharmaciesTable)
    .values(pharmaciesData)
    .returning();

  console.log('Pharmacies Seeded:', da2.length);
  console.log('Medicines Seeded:', da.length);
  console.log('Seeding Done');
})().catch(console.error);
