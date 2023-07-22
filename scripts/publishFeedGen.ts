import dotenv from 'dotenv'
import { AtpAgent, BlobRef } from '@atproto/api'
import fs from 'fs/promises'
// import { parseArgs } from 'node:util'
import { ids } from '../gen/lexicon/lexicons'
import { loadConfig } from '../src/config'

async function agentLogin({ feedGen: { service, handle, password }}) {
  const agent = new AtpAgent({ service })
  await agent.login({ identifier: handle, password })

  return agent
}

async function publish(agent: AtpAgent, { recordName, displayName, description, avatar }, { serviceDid }) {
  try {
    await agent.api.app.bsky.feed.describeFeedGenerator()
  } catch (err) {
    throw new Error(
      'The bluesky server is not ready to accept published custom feeds yet',
    )
  }

  let avatarRef: BlobRef | undefined
  if (avatar) {
    let encoding: string
    if (avatar.endsWith('png')) {
      encoding = 'image/png'
    } else if (avatar.endsWith('jpg') || avatar.endsWith('jpeg')) {
      encoding = 'image/jpeg'
    } else {
      throw new Error('expected png or jpeg')
    }
    const img = await fs.readFile(avatar)
    console.log('Uploading avatar')
    const blobRes = await agent.api.com.atproto.repo.uploadBlob(img, {
      encoding,
    })
    console.log('Avatar uploaded')
    avatarRef = blobRes.data.blob
  }

  console.log(`Sending ${recordName}`)
  await agent.api.com.atproto.repo.putRecord({
    repo: agent.session?.did ?? '',
    collection: ids.AppBskyFeedGenerator,
    rkey: recordName,
    record: {
      did: serviceDid,
      displayName: displayName,
      description: description,
      avatar: avatarRef,
      createdAt: new Date().toISOString(),
    },
  })
}

async function unpublish(agent: AtpAgent, { recordName }) {
  console.log(`Deleting ${recordName}`)
  await agent.api.com.atproto.repo.deleteRecord({
    repo: agent.session?.did ?? '',
    collection: ids.AppBskyFeedGenerator,
    rkey: recordName,
  })
}

const commands = {
  publish,
  unpublish
}

const run = async () => {
  dotenv.config()

  const command = process.argv[2]
  if (!Object.keys(commands).includes(command)) {
    console.error(`unknown command ${command}`)
    process.exit(1)
  }

  const algo = process.argv[3]
  const config = loadConfig()

  if (!Object.keys(config.algos).includes(algo)) {
    console.error(`unknown algorithm ${algo}`)
    process.exit(1)
  }

  console.log(`Running ${command} for ${algo}`)
  const agent = await agentLogin(config)
  await commands[command](agent, config.algos[algo], config)
  console.log('All done 🎉')
}

run()
