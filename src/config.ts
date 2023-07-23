import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { Database } from './db'
import { DidResolver } from '@atproto/did-resolver'

const ALGOS_PATH = path.resolve('./src/algos')

const maybeStr = (val?: string) => {
  if (!val) return undefined
  return val
}

const maybeInt = (val?: string) => {
  if (!val) return undefined
  const int = parseInt(val, 10)
  if (isNaN(int)) return undefined
  return int
}

function loadAvailableAlgos() {
  const algos: { [key: string]: AlgoConfig } = {}
  for (const file of fs.readdirSync(ALGOS_PATH, { withFileTypes: true })) {
    if (file.isDirectory()) {
      const algoPath = path.join(ALGOS_PATH, file.name)
      const { recordName, displayName, description } = require(path.join(algoPath, 'config.json'))
      let avatar: string | null= path.join(algoPath, 'avatar.jpg')
      if (!fs.existsSync(avatar)) {
        avatar = null
      }
      algos[recordName] = {
        recordName,
        displayName,
        description,
        avatar
      }
    }
  }
  return algos
}


export function loadConfig() {
  dotenv.config()
  const hostname = maybeStr(process.env.FEEDGEN_HOSTNAME) ?? 'example.com'
  const serviceDid =
    maybeStr(process.env.FEEDGEN_SERVICE_DID) ?? `did:web:${hostname}`

  if (!process.env.FEEDGEN_HANDLE) {
    throw new Error('Please provide a user handle in the .env file')
  }
  const handle = process.env.FEEDGEN_HANDLE

  if (!process.env.FEEDGEN_PASSWORD) {
    throw new Error('Please provide a user App Password in the .env file')
  }
  const password = process.env.FEEDGEN_PASSWORD

  return {
    port: maybeInt(process.env.FEEDGEN_PORT) ?? 3000,
    listenhost: maybeStr(process.env.FEEDGEN_LISTENHOST) ?? 'localhost',
    database: {
      name: maybeStr(process.env.FEEDGEN_DATABASE_NAME) ?? 'bsky-firehose',
      host: maybeStr(process.env.FEEDGEN_DATABASE_HOST) ?? 'localhost',
      user: maybeStr(process.env.FEEDGEN_DATABASE_USER) ?? 'postgres',
      password: maybeStr(process.env.FEEDGEN_DATABASE_PASSWORD) ?? 'postgres',
      port: maybeInt(process.env.FEEDGEN_DATABASE_PORT) ?? 5432,
      max: maybeInt(process.env.FEEDGEN_DATABASE_MAX) ?? 10
    },
    subscriptionEndpoint:
      maybeStr(process.env.FEEDGEN_SUBSCRIPTION_ENDPOINT) ??
      'wss://bsky.social',
    publisherDid:
      maybeStr(process.env.FEEDGEN_PUBLISHER_DID) ?? 'did:example:alice',
    subscriptionReconnectDelay:
      maybeInt(process.env.FEEDGEN_SUBSCRIPTION_RECONNECT_DELAY) ?? 3000,
    hostname,
    serviceDid,
    feedGen: {
      service: 'https://bsky.social',
      handle,
      password
    },
    algos: loadAvailableAlgos()
  }
}

export type AppContext = {
  db: Database
  didResolver: DidResolver
  cfg: Config
}

export type AlgoConfig = {
  recordName: string
  displayName: string
  description: string
  avatar: string | null
}

export type Config = {
  port: number
  listenhost: string
  hostname: string
  database: {
    name: string
    host: string
    user: string
    password: string
    port: number
    max: number
  }
  subscriptionEndpoint: string
  serviceDid: string
  publisherDid: string
  subscriptionReconnectDelay: number
  feedGen: {
    service: string
    handle: string
    password: string
  }
  algos: { [key: string]: AlgoConfig }
}
