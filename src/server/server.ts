import http from 'http'
import events from 'events'
import express from 'express'
import type { Logger } from 'pino'
import pinoHttp from 'pino-http'
import { DidResolver, MemoryCache } from '@atproto/did-resolver'
import { createServer } from '../../gen/lexicon'
import feedGeneration from './../methods/feed-generation'
import describeGenerator from './../methods/describe-generator'
import { createDb, Database } from './../db'
import { AppContext, Config } from './../config'
import wellKnown from './../well-known'

export class FeedGenerator {
  public app: express.Application
  public server?: http.Server
  public db: Database
  public cfg: Config

  constructor(
    app: express.Application,
    db: Database,
    cfg: Config,
  ) {
    this.app = app
    this.db = db
    this.cfg = cfg
  }

  static create(cfg: Config, logger: Logger) {
    const app = express()
    const db = createDb(cfg)

    const didCache = new MemoryCache()
    const didResolver = new DidResolver(
      { plcUrl: 'https://plc.directory' },
      didCache,
    )

    const server = createServer({
      validateResponse: true,
      payload: {
        jsonLimit: 100 * 1024, // 100kb
        textLimit: 100 * 1024, // 100kb
        blobLimit: 5 * 1024 * 1024, // 5mb
      },
    })
    const ctx: AppContext = {
      db,
      didResolver,
      cfg,
    }
    feedGeneration(server, ctx)
    describeGenerator(server, ctx)
    app.use(pinoHttp({ logger }))
    app.use(server.xrpc.router)
    app.use(wellKnown(ctx))

    return new FeedGenerator(app, db, cfg)
  }

  async start(): Promise<http.Server> {
    this.server = this.app.listen(this.cfg.port, this.cfg.listenhost)
    await events.once(this.server, 'listening')
    return this.server
  }
}

export default FeedGenerator
