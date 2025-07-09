/** biome-ignore-all lint/suspicious/noConsole: Logging */
import postgres from 'postgres';
import { env } from '../env.js';

let connection: postgres.Sql;

export function requestDatabaseConnection() {
  if (!connection) {
    connection = postgres(env.DATABASE_URL);
    console.log('nao existe conexao com base de dados');
  }
  console.log('existe conn');

  return connection;
}
