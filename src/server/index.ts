import FeedGenerator from './server'
import { loadConfig } from '../config'

const run = async () => {
  const server = FeedGenerator.create(loadConfig())
  await server.start()
  console.log(
    `🤖 running feed generator at http://${server.cfg.listenhost}:${server.cfg.port}`,
  )
}

run()
