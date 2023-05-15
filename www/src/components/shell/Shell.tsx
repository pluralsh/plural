import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Flex } from 'honorable'
import { Button, useSetBreadcrumbs } from '@pluralsh/design-system'

import { useSearchParams } from 'react-router-dom'

import isEmpty from 'lodash/isEmpty'

import { CloudShell, Cluster, RootQueryType } from '../../generated/graphql'
import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'
import { ResponsiveLayoutContentContainer } from '../utils/layout/ResponsiveLayoutContentContainer'

import LoadingIndicator from '../utils/LoadingIndicator'

import ImpersonateServiceAccount from '../utils/ImpersonateServiceAccount'

import ClustersContext from '../../contexts/ClustersContext'

import { Onboarding } from './onboarding/Onboarding'
import {
  CLOUD_SHELL_QUERY,
  DELETE_SHELL_MUTATION,
  REBOOT_SHELL_MUTATION,
  SETUP_SHELL_MUTATION,
} from './queries'
import OnboardingCard from './onboarding/OnboardingCard'
import { ShellStatus } from './onboarding/sections/shell/ShellStatus'
import Content from './terminal/Content'

const SHELL_POLL_INTERVAL = 5000

function TerminalBootStatus() {
  const { data: { shell } = {}, stopPolling } = useQuery<
    Pick<RootQueryType, 'shell'>
  >(CLOUD_SHELL_QUERY, {
    pollInterval: SHELL_POLL_INTERVAL,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    initialFetchPolicy: 'network-only',
  })
  const [setupShell, { error, data: bootResult }] =
    useMutation(SETUP_SHELL_MUTATION)
  const [deleteShell] = useMutation(DELETE_SHELL_MUTATION)
  const loading = useMemo(() => !shell, [shell])
  const isReady = useMemo(
    () =>
      (shell?.alive ?? false) &&
      !!shell?.status &&
      Object.values(shell.status).every((s) => s),
    [shell]
  )
  const onDelete = useCallback(
    () => deleteShell().then(() => window.location.reload()),
    [deleteShell]
  )

  useEffect(() => {
    if (isReady) setupShell()
  }, [isReady, setupShell])

  useEffect(() => {
    if (isReady && !error) stopPolling()
  }, [isReady, error, stopPolling])

  if (loading) return <LoadingIndicator />

  if (!isReady || error || !bootResult?.setupShell) {
    return (
      <Flex marginTop="xxxlarge">
        <ResponsiveLayoutSpacer />
        <ResponsiveLayoutContentContainer>
          <OnboardingCard mode="Compact">
            <ShellStatus
              shell={shell as CloudShell}
              error={error}
              loading
            />
            {error && (
              <Flex
                gap="large"
                justify="flex-end"
                borderTop="1px solid border"
                marginTop="medium"
                paddingTop="large"
                paddingBottom="xsmall"
                paddingHorizontal="large"
              >
                <Button
                  onClick={() => onDelete()}
                  destructive
                >
                  Delete shell
                </Button>
              </Flex>
            )}
          </OnboardingCard>
        </ResponsiveLayoutContentContainer>
        <ResponsiveLayoutSpacer />
      </Flex>
    )
  }

  return <Content />
}

const breadcrumbs = [{ label: 'shell', url: '/shell' }]

function Shell() {
  const {
    data,
    loading: loadingShell,
    refetch,
  } = useQuery(CLOUD_SHELL_QUERY, { fetchPolicy: 'no-cache' })
  const [rebootMutation] = useMutation(REBOOT_SHELL_MUTATION)

  useSetBreadcrumbs(breadcrumbs)

  const loading = useMemo(() => !data && loadingShell, [data, loadingShell])
  const hasShell = useMemo(() => !!data?.shell, [data])
  const isAlive = useMemo(
    () => data?.shell?.alive ?? false,
    [data?.shell?.alive]
  )

  const onOnboardingFinish = useCallback(() => refetch(), [refetch])

  useEffect(() => {
    if (hasShell && !isAlive) rebootMutation()
  }, [hasShell, isAlive, rebootMutation])

  if (loading) return <LoadingIndicator />
  if (!hasShell) return <Onboarding onOnboardingFinish={onOnboardingFinish} />

  return <TerminalBootStatus />
}

function getCluster(id: string | null | undefined, clusters: Cluster[]) {
  if (!id) {
    return undefined
  }

  return clusters.find((cl) => cl.id === id)
}

function ImpersonatedShell() {
  const { clusters } = useContext(ClustersContext)
  const [params, setSearchParams] = useSearchParams()
  const clusterId = params.get('cluster')
  const [cluster, setCluster] = useState<Cluster | undefined>(
    !isEmpty(clusters) ? getCluster(clusterId, clusters) : undefined
  )

  useEffect(() => {
    const newCluster = getCluster(clusterId, clusters)

    if (!newCluster) {
      setSearchParams((sp) => {
        sp.delete('cluster')

        return sp
      })
    }
    setCluster(newCluster)
  }, [clusterId, clusters, setSearchParams])

  return (
    <ImpersonateServiceAccount
      id={cluster?.owner?.id}
      skip={!clusterId || !cluster?.owner?.serviceAccount}
    >
      <Shell />
    </ImpersonateServiceAccount>
  )
}

export default ImpersonatedShell
