import { ReactElement, useMemo } from 'react'
import { isEmpty } from 'lodash'

import ListCard from '../utils/ListCard'
import { MARKETPLACE_QUERY } from '../marketplace/queries'
import usePaginatedQuery from '../../hooks/usePaginatedQuery'
import LoadingIndicator from '../utils/LoadingIndicator'
import { EmptyListMessage } from '../overview/clusters/misc'

export function ClusterApps(): ReactElement {
  const [
    repos,
    loading,
    hasMore,
    fetchMore,
  ] = usePaginatedQuery(MARKETPLACE_QUERY, { }, data => data.repositories)

  const apps = useMemo(() => repos.filter(({ installation }) => !isEmpty(installation)), [repos])

  if (isEmpty(repos) && loading) return <LoadingIndicator />

  return (
    <ListCard header="Installed apps">
      {!isEmpty(apps)
        ? apps.map(app => <div>{app.name}</div>)
        : <EmptyListMessage>Looks like you haven't installed your first app yet.</EmptyListMessage>}
    </ListCard>
  )
}
