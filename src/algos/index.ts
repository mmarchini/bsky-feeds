import { AppContext } from '../config'
import {
  QueryParams,
  OutputSchema as AlgoOutput,
} from '../../gen/lexicon/types/app/bsky/feed/getFeedSkeleton'
import * as bombandoBr from './bombando-br'

type AlgoHandler = (ctx: AppContext, params: QueryParams) => Promise<AlgoOutput>

const algos: Record<string, AlgoHandler> = {
  [bombandoBr.shortname]: bombandoBr.handler,
}

export default algos
