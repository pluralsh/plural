import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Flex } from 'honorable'

import { LoopingLogo } from '../../../../../design-system/src'

import { CloudShell, RootQueryType } from '../../generated/graphql'

import { Onboarding } from './onboarding/Onboarding'
import { CLOUD_SHELL_QUERY, REBOOT_SHELL_MUTATION, SETUP_SHELL } from './queries'

import { SectionKey } from './onboarding/context/types'
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

function TerminalBootStatus() {
  const [validated, setValidated] = useState(false)
  const { data: { shell } = {} } = useQuery<Pick<RootQueryType, 'shell'>>(CLOUD_SHELL_QUERY, {
    pollInterval: 5000,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    initialFetchPolicy: 'network-only',
  })
  const [setupShell, { error }] = useMutation(SETUP_SHELL)
  const loading = useMemo(() => !shell, [shell])
  const isReady = useMemo(() => (shell?.alive ?? false) && !!shell?.status && Object.values(shell.status).every(s => s), [shell])

  useEffect(() => {
    if (isReady) {
      setupShell().finally(() => setValidated(true))
    }
  }, [isReady, setupShell])

  if (loading) {
    return <Loading />
  }

  if (!isReady || !validated || error) {
    return (
      <Onboarding
        active={SectionKey.CREATE_CLOUD_SHELL}
      >
        <OnboardingCard mode="Creating">
          <ShellStatus
            shell={shell as CloudShell}
            error={error}
            loading
          />
        </OnboardingCard>
      </Onboarding>
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
