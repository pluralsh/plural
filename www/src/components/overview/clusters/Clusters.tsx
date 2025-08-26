import { isEmpty } from 'lodash'
import { ReactElement, useContext, useEffect, useMemo, useState } from 'react'

import { Button, Flex, Toast } from '@pluralsh/design-system'

import { Outlet } from 'react-router-dom'

import ConsoleInstancesContext from 'contexts/ConsoleInstancesContext'

import {
  FINISHED_CONSOLE_INSTANCE_KEY,
  FINISHED_LOCAL_CREATE_KEY,
} from 'components/create-cluster/CreateClusterActions'

import { useTheme } from 'styled-components'

import { ToastSeverity } from '@pluralsh/design-system/dist/components/Toast'

import { useIntercom } from 'react-use-intercom'

import ClustersContext from '../../../contexts/ClustersContext'

import OverviewHeader from '../OverviewHeader'

import CurrentUserContext from 'contexts/CurrentUserContext'
import ClusterListEmptyState from './ClusterListEmptyState'
import ClustersHelpSection from './ClustersHelpSection'

import { ConsoleInstanceFragment } from 'generated/graphql'
import {
  CombinedClusterT,
  CombinedClusterType,
} from './all/AllClustersTableCols'
import { ClusterListElement, fromClusterList } from './clusterListUtils'

export type OverviewContextType = {
  selfHostedClusters: ClusterListElement[]
  cloudInstances: ConsoleInstanceFragment[]
  combinedClusterList: CombinedClusterT[]
}

export const CLUSTERS_ROOT_CRUMB = {
  label: 'clusters',
  url: '/overview/clusters',
}

export const CLUSTERS_OVERVIEW_BREADCRUMBS = [
  { label: 'overview', url: '/overview' },
]

export function Clusters(): ReactElement | null {
  const { spacing } = useTheme()
  const [showSupportToast, setShowSupportToast] = useState(false)
  const [showPluralCloudToast, setShowPluralCloudToast] = useState(false)

  const me = useContext(CurrentUserContext)
  const { clusters } = useContext(ClustersContext)
  const { instances } = useContext(ConsoleInstancesContext)
  const showEmpty = isEmpty(clusters) && isEmpty(instances)

  // checks if clusters are still empty after finishing plural cloud setup
  useEffect(() => {
    if (localStorage.getItem(FINISHED_LOCAL_CREATE_KEY) === 'true') {
      if (isEmpty(clusters)) setShowSupportToast(true)
      localStorage.removeItem(FINISHED_LOCAL_CREATE_KEY)
    }
  }, [clusters])

  // shows a success toast after plural cloud instance is created
  useEffect(() => {
    const id = localStorage.getItem(FINISHED_CONSOLE_INSTANCE_KEY)

    if (id && instances.some((i) => i.id === id)) {
      localStorage.removeItem(FINISHED_CONSOLE_INSTANCE_KEY)
      setShowPluralCloudToast(true)
    }
  }, [instances])

  const ctx: OverviewContextType = useMemo(() => {
    const selfHostedClusters = fromClusterList(clusters, me)
    const cloudInstances = instances
    const combinedClusterList = [
      ...instances.map((instance) => ({
        type: CombinedClusterType.PluralCloud as const,
        id: instance.id,
        name: instance.name,
        status: instance.status,
        owner: instance.owner,
        consoleUrl: instance.url,
      })),
      ...selfHostedClusters.map((cluster) => ({
        type: CombinedClusterType.SelfHosted as const,
        ...cluster,
      })),
    ]

    return {
      selfHostedClusters,
      cloudInstances,
      combinedClusterList,
    }
  }, [clusters, me, instances])

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
          <Outlet context={ctx} />
        </>
      )}
      <ContactSupportToast
        open={showSupportToast}
        onClose={() => setShowSupportToast(false)}
      />
      <Toast
        show={showPluralCloudToast}
        marginBottom={spacing.xsmall}
        severity="success"
        position="bottom"
        onClose={() => setShowPluralCloudToast(false)}
      >
        Your instance was created successfully!
      </Toast>
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
