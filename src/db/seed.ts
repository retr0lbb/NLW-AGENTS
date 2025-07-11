/** biome-ignore-all lint/suspicious/noConsole: dev*/
import { reset, seed } from 'drizzle-seed';
import { db, sql } from './connection.ts';
import { schema } from './schema/index.ts';

async function seedDb() {
  try {
    await reset(db, schema);

    await seed(db, schema).refine((f) => {
      return {
        rooms: {
          count: 20,
          columns: {
            name: f.companyName(),
            description: f.loremIpsum(),
          },
        },
      };
    });
    console.log('Database Seeded without erro');

    sql.end();
  } catch (error) {
    console.error(error);
  }
}
seedDb();
