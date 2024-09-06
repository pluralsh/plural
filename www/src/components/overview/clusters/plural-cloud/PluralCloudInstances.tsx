import { Table, Toast, useSetBreadcrumbs } from '@pluralsh/design-system'

import { useContext, useEffect, useMemo, useState } from 'react'

import ConsoleInstancesContext from 'contexts/ConsoleInstancesContext'

import { useTheme } from 'styled-components'

import { FINISHED_CONSOLE_INSTANCE_KEY } from 'components/create-cluster/CreateClusterActions'

import { ConsoleInstanceStatus } from 'generated/graphql'

import { CLUSTERS_OVERVIEW_BREADCRUMBS } from '../Clusters'

import { cloudInstanceCols } from './CloudInstanceTableCols'

const breadcrumbs = [
  ...CLUSTERS_OVERVIEW_BREADCRUMBS,
  { label: 'plural-cloud', url: '/overview/clusters/plural-cloud' },
]

export function PluralCloudInstances() {
  const theme = useTheme()

  useSetBreadcrumbs(breadcrumbs)
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
