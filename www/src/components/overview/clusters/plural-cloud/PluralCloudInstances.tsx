import { Table, Toast, useSetBreadcrumbs } from '@pluralsh/design-system'

import { useContext, useEffect, useMemo, useState } from 'react'

import ConsoleInstancesContext from 'contexts/ConsoleInstancesContext'

import { useTheme } from 'styled-components'

import { FINISHED_CONSOLE_INSTANCE_KEY } from 'components/create-cluster/CreateClusterActions'

import { ConsoleInstanceStatus } from 'generated/graphql'

import { CLUSTERS_OVERVIEW_BREADCRUMBS } from '../Clusters'

import { cloudInstanceCols } from './CloudInstanceTableCols'
import { useNavigate } from 'react-router-dom'

export const PLURAL_CLOUD_INSTANCES_PATH_ABS = '/overview/clusters/plural-cloud'

export const CLOUD_INSTANCES_BREADCRUMBS = [
  ...CLUSTERS_OVERVIEW_BREADCRUMBS,
  { label: 'plural cloud instances', url: '/overview/clusters/plural-cloud' },
]

export function PluralCloudInstances() {
  useSetBreadcrumbs(CLOUD_INSTANCES_BREADCRUMBS)
  const theme = useTheme()
  const navigate = useNavigate()

  const [showToast, setShowToast] = useState(false)

  const { instances: instancesBase } = useContext(ConsoleInstancesContext)
  const instances = useMemo(
    () =>
      instancesBase.filter(
        (i) => i.status !== ConsoleInstanceStatus.DeploymentDeleted
      ),
    [instancesBase]
  )

  useEffect(() => {
    const id = localStorage.getItem(FINISHED_CONSOLE_INSTANCE_KEY)

    if (id && instances.some((i) => i.id === id)) {
      localStorage.removeItem(FINISHED_CONSOLE_INSTANCE_KEY)
      setShowToast(true)
    }
  }, [instances])

  return (
    <>
      <Table
        data={instances}
        columns={cloudInstanceCols}
        emptyStateProps={{ message: 'No Plural Cloud instances found' }}
        onRowClick={(_, { original }) => original?.id && navigate(original?.id)}
      />
      <Toast
        show={showToast}
        marginBottom={theme.spacing.xsmall}
        severity="success"
        position="bottom"
        onClose={() => setShowToast(false)}
      >
        Your instance was created successfully!
      </Toast>
    </>
  )
}
