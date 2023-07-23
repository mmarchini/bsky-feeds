import {
  OutputSchema as RepoEvent,
  isCommit,
} from '../../gen/lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from '../util/subscription'

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async deletePosts(posts) {
    const postsToDelete = posts.deletes.map((del) => del.uri)
    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
      this.log.info('deleted posts', { postCount: postsToDelete.length })
      this.log.debug({ postsToDelete })
    }
  }

  async createPosts(posts) {
    const postsToCreate = posts.creates
      .filter((create) => {
        if ('reply' in create.record) {
          return false
        }
        if (!create.record.langs?.includes('pt')) {
          return false
        }
        // only non-reply, Portuguese posts
        return true
      })
      .map((create) => {
        return {
          uri: create.uri,
          cid: create.cid,
          replyParent: create.record?.reply?.parent.uri ?? null,
          replyRoot: create.record?.reply?.root.uri ?? null,
          createdAt: new Date(create.record?.createdAt)
        }
      })

    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
      this.log.info('created posts', { postCount: postsToCreate.length })
      this.log.debug({ postsToCreate })
    }
  }

  async deleteLikes(likes) {
    const likesToDelete = likes.deletes.map(({ uri }) => uri)
    if (likesToDelete.length > 0) {
      await this.db
        .deleteFrom('like')
        .where('uri', 'in', likesToDelete)
        .execute()
      this.log.info('deleted likes', { likeCount: likesToDelete.length })
      this.log.debug({ likesToDelete })
    }
  }

  async createLikes(likes) {
    let inserted: any[] = [];
    for (const { uri, record } of likes.creates) {
      const row = { uri, post: record.subject.uri };

      const result = await this.db
        .insertInto('like')
        .columns(['uri', 'post'])
        .expression((eb) =>
          eb.selectFrom('post').select((eb) => [eb.val(uri).as('uri'), 'uri as post']).where('uri', '=', row.post)
        )
        .onConflict((oc) => oc.doNothing())
        .execute()
      if (result?.length) {
        inserted.push({ uri, record })
      }
    }
    if (inserted) {
      this.log.debug('created likes', { likeCount: inserted.length })
      this.log.debug({ likes })
    }
  }

  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return
    const { posts, likes } = await getOpsByType(evt)

    await this.createPosts(posts)
    await this.deletePosts(posts)

    await this.createLikes(likes)
    await this.deleteLikes(likes)
  }
}
