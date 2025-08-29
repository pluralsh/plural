import { CurrentUser } from 'contexts/CurrentUserContext'
import { ensureURLValidity } from 'utils/url'
import { ClusterFragment, Provider, Source } from 'generated/graphql'

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
    id?: string
    name?: string
    email?: string
    avatar?: string | null
    hasShell?: boolean | null
  }
  raw: ClusterFragment
}

export function fromClusterList(
  clusters: ClusterFragment[],
  user: CurrentUser
): Array<ClusterListElement> {
  return clusters
    .filter((cluster): cluster is ClusterFragment => !!cluster)
    .map((cluster) => {
      const acked = cluster.queue?.acked
      const deliveryStatuses = cluster.queue?.upgrades?.edges?.map((edge) => {
        const id = edge?.node?.id

        return !!id && !!acked && id <= acked
      })
      const delivered = !!deliveryStatuses && !deliveryStatuses.includes(false)

      return {
        id: cluster.id,
        name: cluster.name,
        provider: cluster.provider,
        source: cluster.source,
        gitUrl: cluster.gitUrl,
        consoleUrl: ensureURLValidity(cluster.consoleUrl),
        pingedAt: cluster.pingedAt,
        accessible:
          cluster.owner?.id === user.id || cluster.owner?.serviceAccount,
        delivered,
        hasDependency: !!cluster.dependency,
        owner: {
          id: cluster.owner?.id,
          name: cluster.owner?.name,
          email: cluster.owner?.email,
          avatar: cluster.owner?.avatar,
          hasShell: cluster.owner?.hasShell,
        },
        raw: cluster,
      }
    })
}
