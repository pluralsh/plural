import { Provider, Source } from '../../../../generated/graphql'

export type ClusterListElement = {
  id: string
  name: string
  provider: Provider
  source?: Source | null
  pingedAt?: Date | null
  gitUrl?: string | null
  consoleUrl?: string | null
  delivered: boolean
  owner?: {
    name?: string
    email?: string
    avatar?: string | null
    hasShell?: boolean | null
  }
}
