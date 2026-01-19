import { isEmpty } from 'lodash'
import { ReactElement, useContext, useEffect, useMemo, useState } from 'react'

import { Button, Card, Flex, Toast } from '@pluralsh/design-system'

import { Link, Outlet } from 'react-router-dom'

import ConsoleInstancesContext from 'contexts/ConsoleInstancesContext'

import {
  FINISHED_CONSOLE_INSTANCE_KEY,
  FINISHED_LOCAL_CREATE_KEY,
} from 'components/create-cluster/CreateClusterActions'

import styled, { useTheme } from 'styled-components'

import { ToastSeverity } from '@pluralsh/design-system/dist/components/Toast'

import ClustersContext from '../../../contexts/ClustersContext'

import OverviewHeader from '../OverviewHeader'

import CurrentUserContext from 'contexts/CurrentUserContext'

import { StackedText } from 'components/utils/StackedText'
import { Body2P } from 'components/utils/Typography'
import { ConsoleInstanceFragment } from 'generated/graphql'
import {
  CombinedClusterT,
  CombinedClusterType,
} from './all/AllClustersTableCols'
import { ClusterListEmptyState } from './ClusterListEmptyState'
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
  const { spacing, mode } = useTheme()
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
    <WrapperSC>
      <Flex
        width="100%"
        justifyContent="space-between"
      >
        <Flex
          direction="column"
          gap="large"
          alignItems="flex-start"
        >
          <StackedText
            first="Welcome to Plural"
            firstPartialType="title2"
            firstColor="text"
            second="To get started with Plural, create your first management plane."
            secondPartialType="body2"
            gap="small"
            css={{ '& *': { fontWeight: 400, fontFamily: 'Inter' } }}
          />
          {!showEmpty && (
            <Button
              small
              as={Link}
              to="/create-cluster"
            >
              Create new Plural instance
            </Button>
          )}
        </Flex>
        <CopilotCardSC>
          <Button
            small
            as={Link}
            to="https://docs.plural.sh/plural-features/plural-ai"
            style={{
              padding: `0 9px`,
              borderRadius: 6,
              borderColor:
                mode === 'light'
                  ? 'rgba(0, 0, 0, 0.10)'
                  : 'rgba(255, 255, 255, 0.10)',
            }}
            secondary
            endIcon={<PaperplaneIcon />}
          >
            <AgentButtonTextSC>Plural AI</AgentButtonTextSC>
          </Button>
          <Body2P $color="text-xlight">
            Access Plural AI within your Plural Console.
          </Body2P>
        </CopilotCardSC>
      </Flex>
      {showEmpty ? (
        <ClusterListEmptyState />
      ) : (
        <Flex
          overflow="auto"
          direction="column"
          gap="small"
        >
          <OverviewHeader />
          <Outlet context={ctx} />
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

const CopilotCardSC = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: 380,
  gap: theme.spacing.small,
  padding: `${theme.spacing.medium}px ${theme.spacing.large}px`,
  backgroundColor: theme.colors['fill-zero'],
}))

const PaperplaneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
  >
    <path
      d="M10.2918 9.18724H7.48804"
      stroke="white"
      strokeWidth="0.70095"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.10755 13.2744C6.08291 13.3417 6.07949 13.415 6.09776 13.4843C6.11603 13.5536 6.15511 13.6156 6.20973 13.662C6.26434 13.7084 6.33188 13.737 6.40322 13.7438C6.47456 13.7506 6.54629 13.7354 6.60873 13.7002L13.9687 9.4906C14.0235 9.46029 14.0691 9.41586 14.1009 9.36193C14.1327 9.308 14.1495 9.24654 14.1495 9.18393C14.1495 9.12133 14.1327 9.05986 14.1009 9.00593C14.0691 8.952 14.0235 8.90757 13.9687 8.87727L6.60873 4.67814C6.54648 4.64332 6.47509 4.62833 6.40409 4.63516C6.33309 4.64199 6.26587 4.67031 6.2114 4.71636C6.15693 4.7624 6.1178 4.82397 6.09924 4.89284C6.08069 4.9617 6.08358 5.03459 6.10755 5.10177L7.48798 9.18787L6.10755 13.2744Z"
      stroke="#C5C9D3"
      strokeWidth="0.70095"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const AgentButtonTextSC = styled.p(({ theme }) => ({
  margin: 0,
  color: theme.colors['text-light'],
  fontFamily: theme.fontFamilies.sans,
  fontSize: 12.8,
  fontWeight: 300,
  letterSpacing: '0.128px',
}))
