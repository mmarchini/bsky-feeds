import { FirehoseSubscription } from './subscription'
import { loadConfig } from '../config'
import { createLogger } from '../logger'
import { createDb } from './../db'

const run = async () => {
  const log = createLogger()
  const cfg = loadConfig()
  const db = createDb(cfg)
  const firehose = new FirehoseSubscription(db, cfg.subscriptionEndpoint, log)
  firehose.run(cfg.subscriptionReconnectDelay)
  log.info(`running firehose subscription`)
}

run()

