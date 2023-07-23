import { InvalidRequestError } from '@atproto/xrpc-server'
import { QueryParams } from '../../../gen/lexicon/types/app/bsky/feed/getFeedSkeleton'
import { AppContext } from '../../config'

// max 15 chars
export const shortname = 'bombando-br'

export const handler = async (ctx: AppContext, params: QueryParams) => {
  let builder = ctx.db
    .selectFrom((eb) => eb
      .selectFrom('post')
      .innerJoin('like', 'post.uri', 'like.post')
      .select(['post.uri as uri', 'post.cid as cid', 'post.createdAt as createdAt', (b) => b.fn.count('like.uri').as('likes')])
      .groupBy('post.uri')
      .orderBy('createdAt', 'desc')
      .orderBy('likes', 'desc')
      .as('post')
      )
    .selectAll()
    .where('post.likes', '>=', 12)
    .limit(params.limit)

  if (params.cursor) {
    const [createdAt, cid] = params.cursor.split('::')
    if (!createdAt || !cid) {
      throw new InvalidRequestError('malformed cursor')
    }
    const timeStr = new Date(parseInt(createdAt, 10))
    builder = builder
      .where('post.createdAt', '<', timeStr)
      // .orWhere((qb) => qb.where('post.indexedAt', '=', timeStr))
      // .where('post.cid', '<', cid)
  }
  const res = await builder.execute()

  const feed = res.map((row) => ({
    post: row.uri,
  }))

  let cursor: string | undefined
  const last = res.at(-1)
  if (last) {
    cursor = `${last.createdAt.getTime()}::${last.cid}`
  }

  return {
    cursor,
    feed,
  }
}
