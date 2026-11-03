import { isEmpty } from 'lodash'
import {
  ReactElement,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import LoadingIndicator from '../../utils/LoadingIndicator'

import { Button, Flex, Toast } from '@pluralsh/design-system'

import { Link, Outlet } from 'react-router-dom'

import ConsoleInstancesContext from 'contexts/ConsoleInstancesContext'

import {
  FINISHED_CONSOLE_INSTANCE_KEY,
  FINISHED_LOCAL_CREATE_KEY,
} from 'components/create-cluster/CreateClusterActions'

import styled, { useTheme } from 'styled-components'

import ClustersContext from '../../../contexts/ClustersContext'

import OverviewHeader from '../OverviewHeader'

import CurrentUserContext from 'contexts/CurrentUserContext'

import { PageHeader } from 'components/utils/ProductEmptyState'
import { ConsoleInstanceFragment } from 'generated/graphql'
import {
  CombinedClusterT,
  CombinedClusterType,
} from './all/AllClustersTableCols'
import { ClusterListEmptyState } from './ClusterListEmptyState'
import { ClusterListElement, fromClusterList } from './clusterListUtils'
import {
  ControlPlaneUpsell,
  useControlPlaneUpsellScenario,
} from './ControlPlaneUpsell'

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
  { label: 'control planes', url: '/overview' },
]

export function Clusters(): ReactElement | null {
  const { spacing } = useTheme()
  const [showSupportToast, setShowSupportToast] = useState(false)
  const [showPluralCloudToast, setShowPluralCloudToast] = useState(false)

  const me = useContext(CurrentUserContext)
  const { clusters } = useContext(ClustersContext)
  const { instances } = useContext(ConsoleInstancesContext)
  const upsellScenario = useControlPlaneUpsellScenario()
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
    <WrapperSC>
      {showEmpty ? (
        <ClusterListEmptyState />
      ) : (
        <Flex
          overflow="auto"
          direction="column"
          gap="small"
        >
          <ControlPlaneUpsell
            key={upsellScenario.kind ?? 'none'}
            scenario={upsellScenario}
          />
          <PageHeader title="Control planes">
            <Button
              small
              as={Link}
              to="/create-cluster"
            >
              Create instance
            </Button>
          </PageHeader>
          <OverviewHeader />
          <Suspense fallback={<LoadingIndicator />}>
            <Outlet context={ctx} />
          </Suspense>
        </Flex>
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
    </WrapperSC>
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

  return (
    <Toast
      show={open}
      marginBottom={theme.spacing.xsmall}
      severity="info"
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
        <Button
          as={Link}
          target="_blank"
          rel="noopener noreferrer"
          to="https://www.plural.sh/contact"
          style={{ textDecoration: 'none', color: theme.colors.text }}
        >
          Contact team
        </Button>
      </Flex>
    </Toast>
  )
}

const WrapperSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.xlarge,
  minWidth: 'fit-content',
}))
