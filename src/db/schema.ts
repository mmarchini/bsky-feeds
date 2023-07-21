export type DatabaseSchema = {
  post: Post
  like: Like
  sub_state: SubState
}

export type Post = {
  uri: string
  cid: string
  replyParent: string | null
  replyRoot: string | null
  indexedAt: string
  author: string
}

export type Like = {
  uri: string
  post: string

}

export type SubState = {
  service: string
  cursor: number
}
