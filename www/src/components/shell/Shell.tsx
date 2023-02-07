import React, { useCallback, useEffect, useMemo } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Flex } from 'honorable'
import { Button, LoopingLogo } from '@pluralsh/design-system'

import { CloudShell, RootQueryType } from '../../generated/graphql'
import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'
import { ResponsiveLayoutContentContainer } from '../utils/layout/ResponsiveLayoutContentContainer'

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

function Loading() {
  return (
    <Flex
      grow={1}
      align="center"
      justify="center"
    >
      <LoopingLogo />
    </Flex>
  )
}

const SHELL_POLL_INTERVAL = 5000

function TerminalBootStatus() {
  const { data: { shell } = {}, stopPolling } = useQuery<Pick<RootQueryType, 'shell'>>(CLOUD_SHELL_QUERY, {
    pollInterval: SHELL_POLL_INTERVAL,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    initialFetchPolicy: 'network-only',
  })
  const [setupShell, { error }] = useMutation(SETUP_SHELL_MUTATION)
  const [deleteShell] = useMutation(DELETE_SHELL_MUTATION)
  const loading = useMemo(() => !shell, [shell])
  const isReady = useMemo(() => (shell?.alive ?? false) && !!shell?.status && Object.values(shell.status).every(s => s), [shell])
  const onDelete = useCallback(() => deleteShell().then(() => window.location.reload()), [deleteShell])

  useEffect(() => {
    if (isReady) setupShell()
  }, [isReady, setupShell])

  useEffect(() => {
    if (isReady && !error) stopPolling()
  }, [isReady, error, stopPolling])

  if (loading) {
    return <Loading />
  }

  if (!isReady || error) {
    return (
      <Flex marginTop="xxxlarge">
        <ResponsiveLayoutSpacer />
        <ResponsiveLayoutContentContainer>
          <OnboardingCard mode="Creating">
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
                >Delete shell
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

function Shell() {
  const { data } = useQuery(CLOUD_SHELL_QUERY, { fetchPolicy: 'network-only' })
  const [rebootMutation] = useMutation(REBOOT_SHELL_MUTATION)
  const loading = useMemo(() => !data, [data])
  const hasShell = useMemo(() => !!data?.shell, [data])
  const isAlive = useMemo(() => data?.shell?.alive ?? false, [data?.shell?.alive])

  useEffect(() => {
    if (hasShell && !isAlive) rebootMutation()
  }, [hasShell, isAlive, rebootMutation])

  if (loading) return <Loading />
  if (!hasShell) return <Onboarding />

  return <TerminalBootStatus />
}

export default Shell
