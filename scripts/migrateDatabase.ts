import { createDb, migrateToLatest } from '../src/db'
import { loadConfig } from '../src/config'

const db = createDb(loadConfig())

migrateToLatest(db)
