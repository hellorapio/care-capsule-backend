import { DrizzleDatabase } from './database.module';
import { AnyPgTable, AnyPgSelect } from 'drizzle-orm/pg-core';
import { count, SQL, eq, sql } from 'drizzle-orm';
import { usersTable } from 'src/drizzle/schema';
import { GetMedicinesDto } from 'src/modules/medicines/dtos/medicine.dto';

export default class DatabaseRepository {
  constructor(
    protected table: AnyPgTable,
    private readonly db: DrizzleDatabase,
  ) {}

  async findFirst(where: SQL): Promise<Record<string, any> | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(where)
      .limit(1);
    return result.length ? result[0] : null;
  }

  async findMany(where: SQL, filter: Record<string, any>) {
    return this.db.select(filter).from(this.table).where(where);
  }

  async findManyWithoutFilter(where: SQL, sort: SQL) {
    return await this.db.select().from(this.table).where(where).orderBy(sort);
  }

  async findAll(
    params: GetMedicinesDto = { page: 1, limit: 10 },
  ): Promise<any> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const data = await this.db
      .select()
      .from(this.table)
      .offset(offset)
      .limit(limit);

    const countResult = await this.db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(this.table);

    const total = Number(countResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findAllWithFilter(
    where: SQL,
    limit: number = 10,
    page: number = 1,
  ): Promise<AnyPgSelect> {
    return {
      data: await this.db
        .select()
        .from(this.table)
        .where(where)
        .limit(limit)
        .offset((page - 1) * limit),
      count: (
        await this.db.select({ count: count() }).from(this.table).where(where)
      )[0].count,
    };
  }

  async findAllWithPhoneFilter(
    phone: string,
    limit: number = 10,
    page: number = 1,
  ): Promise<AnyPgSelect> {
    return {
      data: await this.db
        .select(this.table as any)
        .from(usersTable)
        .where(eq(usersTable.phone, phone))
        .innerJoin(
          this.table,
          eq(usersTable.id, this.table['userId'] as string),
        )
        .limit(limit)
        .offset((page - 1) * limit),
      count: (
        await this.db
          .select({ count: count() })
          .from(usersTable)
          .where(eq(usersTable.phone, phone))
          .innerJoin(
            this.table,
            eq(usersTable.id, this.table['userId'] as string),
          )
      )[0].count,
    };
  }

  async create(data: Record<string, any>): Promise<Record<string, any>> {
    const [created] = await this.db.insert(this.table).values(data).returning();
    return created;
  }

  async createMany(
    data: Record<string, any>[],
  ): Promise<Record<string, any>[]> {
    return await this.db.insert(this.table).values([data]).returning();
  }

  async update(
    where: SQL | undefined,
    data: Record<string, any>,
  ): Promise<Record<string, any>[]> {
    return await this.db.update(this.table).set(data).where(where).returning();
  }

  async delete(where: SQL | undefined): Promise<Record<string, any>[]> {
    return await this.db.delete(this.table).where(where).returning();
  }

  async count(where: SQL): Promise<number> {
    return (
      await this.db.select({ count: count() }).from(this.table).where(where)
    )[0].count;
  }

  async updateById(id: string, data: Record<string, any>) {
    return await this.update(eq(this.table['id'], id), data);
  }

  async deleteById(id: string) {
    return await this.delete(eq(this.table['id'], id));
  }
}
