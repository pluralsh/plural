import { useRepositoryQuery } from '../../generated/graphql'
import { EmptyListMessage } from '../overview/clusters/misc'
import { GqlError } from '../utils/Alert'
import LoadingIndicator from '../utils/LoadingIndicator'
import { CreateProvider, UpdateProvider } from '../app/oidc/OIDC'

const CONSOLE_APP_NAME = 'console'

export function ClusterOpenIdConnectUsers() {
  const { data, loading, error, refetch } = useRepositoryQuery({
    variables: { name: CONSOLE_APP_NAME },
  })

  if (error)
    return (
      <GqlError
        header="Could not fetch OpenID connect settings"
        error={error}
      />
    )

  if (!data && loading) return <LoadingIndicator />

  const installation = data?.repository?.installation

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
        refetch={refetch}
      />
    )
  }

  return <CreateProvider installation={installation} />
}
