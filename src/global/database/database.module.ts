import { DynamicModule, Global, Module } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ConfigService } from '@nestjs/config';
import * as schema from './../../drizzle/schema';
import { Pool } from 'pg';

export const DRIZZLE_DB = 'DRIZZLE_DB';
export type DrizzleDatabase = NodePgDatabase<typeof schema>;

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const drizzleProvider = {
      provide: DRIZZLE_DB,
      useFactory: async (config: ConfigService): Promise<DrizzleDatabase> => {
        const pool = new Pool({
          host: config.get<string>('db.host'),
          port: config.get<number>('db.port'),
          user: config.get<string>('db.user'),
          password: config.get<string>('db.pass'),
          database: config.get<string>('db.name'),
        });

        const db = drizzle(pool, { schema });
        try {
          await db.execute('SELECT 1 + 1 AS result');
          return db;
        } catch (error) {
          console.error('Failed to connect to the database:', error);
          throw error;
        }
      },
      inject: [ConfigService],
    };

    return {
      module: DatabaseModule,
      providers: [drizzleProvider],
      exports: [drizzleProvider],
    };
  }
}
