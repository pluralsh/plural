import { Table, useSetBreadcrumbs } from '@pluralsh/design-system'

import { useContext } from 'react'

import ConsoleInstancesContext from 'contexts/ConsoleInstancesContext'

import { CLUSTERS_OVERVIEW_BREADCRUMBS } from '../Clusters'

import { useNavigate } from 'react-router-dom'
import { cloudInstanceCols } from './CloudInstanceTableCols'
import { ConsoleInstanceFragment } from 'generated/graphql'
import { Row } from '@tanstack/react-table'

export const PLURAL_CLOUD_INSTANCES_PATH_ABS = '/overview/clusters/plural-cloud'

export const CLOUD_INSTANCES_BREADCRUMBS = [
  ...CLUSTERS_OVERVIEW_BREADCRUMBS,
  { label: 'plural cloud instances', url: '/overview/clusters/plural-cloud' },
]

export function PluralCloudInstances() {
  useSetBreadcrumbs(CLOUD_INSTANCES_BREADCRUMBS)
  const navigate = useNavigate()

  const { instances } = useContext(ConsoleInstancesContext)

  return (
    <Table
      data={instances}
      columns={cloudInstanceCols}
      emptyStateProps={{ message: 'No Plural Cloud instances found' }}
      onRowClick={(_, { original }: Row<ConsoleInstanceFragment>) =>
        navigate(PLURAL_CLOUD_INSTANCES_PATH_ABS + `/${original.id}`)
      }
    />
  )
}
