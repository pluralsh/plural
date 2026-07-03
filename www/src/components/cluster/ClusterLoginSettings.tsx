import {
  ClusterConsoleRepositoryFragment,
  useClusterConsoleRepositoryQuery,
} from '../../generated/graphql'
import { EmptyListMessage } from '../overview/clusters/misc'
import { GqlError } from '../utils/Alert'
import LoadingIndicator from '../utils/LoadingIndicator'
import { CreateProvider, UpdateProvider } from '../app/oidc/OIDC'

export function ClusterLoginSettings({
  repository: repositoryProp,
  refetch: refetchProp,
}: {
  repository?: ClusterConsoleRepositoryFragment
  refetch?: () => void
} = {}) {
  const { data, loading, error, refetch } = useClusterConsoleRepositoryQuery({
    skip: !!repositoryProp,
  })
  const repository = repositoryProp ?? data?.repository
  const refetchInstallation = refetchProp ?? refetch

  if (error)
    return (
      <GqlError
        header="Could not fetch login settings"
        error={error}
      />
    )

  if (!repositoryProp && !data && loading) return <LoadingIndicator />

  const installation = repository?.installation

  if (!installation) {
    return (
      <EmptyListMessage>
        Looks like you haven't installed your first app yet.
      </EmptyListMessage>
    )
  }

  if (installation.oidcProvider) {
    return (
      <UpdateProvider
        installation={installation}
        refetch={refetchInstallation}
      />
    )
  }

  return <CreateProvider installation={installation} refetch={refetchInstallation} />
}
