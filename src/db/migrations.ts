import { Kysely, Migration, MigrationProvider } from 'kysely'

const migrations: Record<string, Migration> = {}

export const migrationProvider: MigrationProvider = {
  async getMigrations() {
    return migrations
  },
}

migrations['001'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createTable('post')
      .addColumn('uri', 'varchar', (col) => col.primaryKey())
      .addColumn('cid', 'varchar', (col) => col.notNull())
      .addColumn('replyParent', 'varchar')
      .addColumn('replyRoot', 'varchar')
      .addColumn('indexedAt', 'varchar', (col) => col.notNull())
      .execute()
    await db.schema
      .createTable('sub_state')
      .addColumn('service', 'varchar', (col) => col.primaryKey())
      .addColumn('cursor', 'integer', (col) => col.notNull())
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema.dropTable('post').execute()
    await db.schema.dropTable('sub_state').execute()
  },
}

migrations['002'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .alterTable('post')
      .addColumn('likes', 'integer', (col) => col.notNull().defaultTo(0))
      .execute()
  },
}

migrations['003'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .alterTable('post')
      .addColumn('author', 'varchar')
      .execute()

    await db.schema
      .alterTable('post')
      .dropColumn('likes')
      .execute()

    await db.schema
      .createTable('like')
      .addColumn('uri', 'varchar', (col) => col.primaryKey())
      .addColumn('post', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint(
          'post_uri_foreign',
          ['post'],
          'post',
          ['uri'],
          (cb) => cb.onDelete('cascade'))
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema.dropTable('like').execute()
  },
}

migrations['004'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .alterTable('post')
      .dropColumn('indexedAt')
      .execute()

    await db.schema
      .alterTable('post')
      .addColumn('indexedAt', 'timestamp', (col) => col.defaultTo(new Date()))
      .addColumn('createdAt', 'timestamp', (col) => col.notNull())
      .execute()
  }
}
