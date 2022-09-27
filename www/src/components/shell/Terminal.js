import { useQuery } from '@apollo/client'
import { Flex } from 'honorable'
import { LoopingLogo } from 'pluralsh-design-system'

import { CLOUD_SHELL_QUERY } from './queries'

import { ShellStatus } from './onboarding/ShellStatus'
import OnboardingWrapper from './onboarding/OnboardingWrapper'
import { JoinCommunityCard } from './onboarding/JoinCommunityCard'

import TerminalThemeProvider from './TerminalThemeProvider'
import Shell from './Shell'

export function Terminal() {
  const { data } = useQuery(CLOUD_SHELL_QUERY, { pollInterval: 5000, fetchPolicy: 'cache-and-network' })
  const { shell } = data || {}
  const { alive, status } = shell || {}

  if (!status) {
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

  if (!alive) {
    return (
      <OnboardingWrapper stepIndex={3}>
        <ShellStatus shell={shell} />
        <JoinCommunityCard />
      </OnboardingWrapper>
    )
  }

  return (
    <TerminalThemeProvider>
      <Shell shell={shell} />
    </TerminalThemeProvider>
  )
}
