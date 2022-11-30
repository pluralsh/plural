import { useMutation, useQuery } from '@apollo/client'
import { Flex } from 'honorable'
import { Banner, LoopingLogo } from '@pluralsh/design-system'

import { useEffect } from 'react'

import { CLOUD_SHELL_QUERY, SETUP_SHELL } from './queries'

import { ShellStatus } from './onboarding/ShellStatus'
import OnboardingWrapper from './onboarding/OnboardingWrapper'
import { JoinCommunityCard } from './onboarding/JoinCommunityCard'

import TerminalThemeProvider from './TerminalThemeProvider'
import Shell from './Shell'

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

function TerminalWrapper({ shell }) {
  const [mutation, { error, data }] = useMutation(SETUP_SHELL)

  useEffect(() => {
    mutation()
  }, [])

  if (error) {
    return (
      <OnboardingWrapper stepIndex={3}>
        <Banner
          heading="Failed to set up shell"
          severity="error"
        >
          {error.graphQLErrors[0].message}
        </Banner>
        <JoinCommunityCard />
      </OnboardingWrapper>
    )
  }

  if (!data?.id) {
    return <Loading />
  }

  return (
    <TerminalThemeProvider>
      <Shell shell={shell} />
    </TerminalThemeProvider>
  )
}

export function Terminal() {
  const { data } = useQuery(CLOUD_SHELL_QUERY, { pollInterval: 5000, fetchPolicy: 'cache-and-network' })
  const { shell } = data || {}
  const { alive, status } = shell || {}

  if (!status) {
    return <Loading />
  }

  if (!alive) {
    return (
      <OnboardingWrapper stepIndex={3}>
        <ShellStatus shell={shell} />
        <JoinCommunityCard />
      </OnboardingWrapper>
    )
  }

  return <TerminalWrapper shell={shell} />
}
