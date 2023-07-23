import { Pool } from 'pg'
import { Kysely, Migrator, PostgresDialect } from 'kysely'
import { DatabaseSchema } from './schema'
import { migrationProvider } from './migrations'
import type { Config } from '../config'

export const createDb = ({ database }: Config): Database => {
  const dialect = new PostgresDialect({
    pool: new Pool({
      database: database.name,
      host: database.host,
      user: database.user,
      password: database.password,
      port: database.port,
      max: database.max,
    })
  })
  return new Kysely<DatabaseSchema>({
    // log: ['query'],
    dialect
  })
}

export const migrateToLatest = async (db: Database) => {
  const migrator = new Migrator({ db, provider: migrationProvider })
  const { error } = await migrator.migrateToLatest()
  if (error) throw error
}

export type Database = Kysely<DatabaseSchema>
