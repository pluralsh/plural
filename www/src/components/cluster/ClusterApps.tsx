import { ReactElement } from 'react'

import ListCard from '../utils/ListCard'

type ClusterAppsProps = {clusterId: string}

export function ClusterApps({ clusterId }: ClusterAppsProps): ReactElement {
  return (
    <ListCard header="Installed apps">content</ListCard>
  )
}
