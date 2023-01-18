import { useMutation, useQuery } from '@apollo/client'
import { Flex } from 'honorable'
import { LoopingLogo } from '@pluralsh/design-system'
import React, { useEffect, useMemo } from 'react'

import { CloudShell, RootQueryType } from '../../generated/graphql'

import { CLOUD_SHELL_QUERY, SETUP_SHELL } from './queries'
import TerminalThemeProvider from './TerminalThemeProvider'
import Shell from './Shell'
import { Onboarding } from './onboarding_v3/Onboarding'
import { SectionKey } from './onboarding_v3/context/types'
import { ShellStatus } from './onboarding_v3/sections/shell/ShellStatus'
import OnboardingCard from './onboarding_v3/OnboardingCard'

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

export function Terminal() {
  const { data } = useQuery<Pick<RootQueryType, 'shell'>>(CLOUD_SHELL_QUERY, {
    pollInterval: 3000,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    initialFetchPolicy: 'network-only',
  })
  const [setupShell, { data: setupShellData, error }] = useMutation(SETUP_SHELL)
  const { shell } = data || {}
  const isReady = useMemo(() => (shell?.alive ?? false) && !!shell?.status && Object.values(shell.status).every(s => s), [shell])

  useEffect(() => {
    if (isReady) setupShell()
  }, [isReady, setupShell])

  if (!shell?.status) {
    return <Loading />
  }

  if (!isReady) {
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

  if (!setupShellData?.setupShell?.id) {
    return <Loading />
  }

  return (
    <TerminalThemeProvider>
      <Shell shell={shell} />
    </TerminalThemeProvider>
  )
}
