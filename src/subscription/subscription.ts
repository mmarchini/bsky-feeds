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
          indexedAt: new Date().toISOString()
        }
      })

    if (postsToCreate.length > 0) {
      console.log('created some stuff')
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }

  async deleteLikes(likes) {
    const likesToDelete = likes.deletes.map(({ uri }) => uri)
    if (likesToDelete.length > 0) {
      await this.db
        .deleteFrom('like')
        .where('uri', 'in', likesToDelete)
        .execute()
    }
  }

  async createLikes(likes) {
    // const likesToCreate = likes.creates
    //   .map(({ uri, record }) => ())

    for (const { uri, record } of likes.creates) {
      const row = { uri, post: record.subject.uri };

      await this.db
        .insertInto('like')
        .columns(['uri', 'post'])
        .expression((eb) =>
          eb.selectFrom('post').select((eb) => [eb.val(uri).as('uri'), 'uri as post']).where('uri', '=', row.post)
        )
        .execute()
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