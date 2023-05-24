import { Provider, Source } from '../../../generated/graphql'

export type ClusterListElement = {
  id: string
  name: string
  provider: Provider
  source?: Source | null
  pingedAt?: Date | null
  gitUrl?: string | null
  consoleUrl?: string | null
  accessible?: boolean | null
  delivered: boolean
  hasDependency: boolean
  owner?: {
    name?: string
    email?: string
    avatar?: string | null
    hasShell?: boolean | null
  }
  // Using "any" instead of "Cluster" type as latter causes
  // "Type instantiation is excessively deep and possibly infinite" error
  raw: any
}
