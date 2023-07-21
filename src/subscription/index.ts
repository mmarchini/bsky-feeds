import { FirehoseSubscription } from './subscription'
import { loadConfig } from '../config'
import { createDb } from './../db'

const run = async () => {
  const cfg = loadConfig()
  const db = createDb(cfg.sqliteLocation)
  const firehose = new FirehoseSubscription(db, cfg.subscriptionEndpoint)
  firehose.run(cfg.subscriptionReconnectDelay)
  console.log(
    `🤖 running firehose subscription`,
  )
}

run()

