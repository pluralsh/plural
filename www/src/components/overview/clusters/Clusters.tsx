import { isEmpty } from 'lodash'
import { ReactElement, useContext, useEffect, useState } from 'react'

import { Button, Flex, Toast } from '@pluralsh/design-system'

import { Outlet } from 'react-router-dom'

import ConsoleInstancesContext from 'contexts/ConsoleInstancesContext'

import { FINISHED_LOCAL_CREATE_KEY } from 'components/create-cluster/CreateClusterActions'

import { useTheme } from 'styled-components'

import { ToastSeverity } from '@pluralsh/design-system/dist/components/Toast'

import { useIntercom } from 'react-use-intercom'

import ClustersContext from '../../../contexts/ClustersContext'

import OverviewHeader from '../OverviewHeader'

import ClusterListEmptyState from './ClusterListEmptyState'
import ClustersHelpSection from './ClustersHelpSection'

export const CLUSTERS_ROOT_CRUMB = {
  label: 'clusters',
  url: '/overview/clusters',
}

export const CLUSTERS_OVERVIEW_BREADCRUMBS = [
  { label: 'overview', url: '/overview' },
]

export function Clusters(): ReactElement | null {
  const [showToast, setShowToast] = useState(false)
  const { clusters } = useContext(ClustersContext)
  const { instances } = useContext(ConsoleInstancesContext)
  const showEmpty = isEmpty(clusters) && isEmpty(instances)

  useEffect(() => {
    if (localStorage.getItem(FINISHED_LOCAL_CREATE_KEY) === 'true') {
      if (isEmpty(clusters)) setShowToast(true)
      localStorage.removeItem(FINISHED_LOCAL_CREATE_KEY)
    }
  }, [clusters])

  return (
    <Flex
      direction="column"
      gap={showEmpty ? 'large' : 'medium'}
      minWidth="fit-content"
      overflow="auto"
    >
      {showEmpty ? (
        <>
          <ClusterListEmptyState />
          <ClustersHelpSection />
        </>
      ) : (
        <>
          <OverviewHeader />
          <Outlet />
        </>
      )}
      <ContactSupportToast
        open={showToast}
        onClose={() => setShowToast(false)}
      />
    </Flex>
  )
}

function ContactSupportToast({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const theme = useTheme()
  const intercom = useIntercom()

  return (
    <Toast
      show={open}
      marginBottom={theme.spacing.xsmall}
      severity={'warning' as ToastSeverity}
      position="bottom"
      closeTimeout={5000}
      onClose={onClose}
    >
      <Flex
        direction="column"
        alignItems="flex-start"
        gap="small"
      >
        <span
          css={{
            ...theme.partials.text.body1Bold,
            color: theme.colors.text,
          }}
        >
          It looks like you still have no clusters deployed.
        </span>
        <span>
          If you had trouble completing the steps to create a cluster, reach out
          to us for support.
        </span>
        <Button onClick={intercom.show}>Contact team</Button>
      </Flex>
    </Toast>
  )
}
