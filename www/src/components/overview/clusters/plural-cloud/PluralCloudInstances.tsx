import { Table, useSetBreadcrumbs } from '@pluralsh/design-system'

import { useContext } from 'react'

import ConsoleInstancesContext from 'contexts/ConsoleInstancesContext'

import { CLUSTERS_OVERVIEW_BREADCRUMBS } from '../Clusters'

import { cloudInstanceCols } from './CloudInstanceTableCols'

const breadcrumbs = [
  ...CLUSTERS_OVERVIEW_BREADCRUMBS,
  { label: 'plural-cloud', url: '/overview/clusters/plural-cloud' },
]

export function PluralCloudInstances() {
  useSetBreadcrumbs(breadcrumbs)

  const { instances } = useContext(ConsoleInstancesContext)

  return (
    <Table
      data={instances}
      columns={cloudInstanceCols}
    />
  )
}
