import { Table, Toast, useSetBreadcrumbs } from '@pluralsh/design-system'

import { useContext, useEffect, useState } from 'react'

import ConsoleInstancesContext from 'contexts/ConsoleInstancesContext'

import { useTheme } from 'styled-components'

import { FINISHED_CONSOLE_INSTANCE_KEY } from 'components/create-cluster/CreateClusterActions'

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

  const { instances } = useContext(ConsoleInstancesContext)

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
