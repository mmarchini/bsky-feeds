import FeedGenerator from './server'
import { createLogger } from '../logger'
import { loadConfig } from '../config'

const run = async () => {
  const logger = createLogger()
  const server = FeedGenerator.create(loadConfig(), logger)
  await server.start()
  console.log(
    `🤖 running feed generator at http://${server.cfg.listenhost}:${server.cfg.port}`,
  )
}

run()
