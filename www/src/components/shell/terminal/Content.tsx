import { useQuery } from '@apollo/client'
import { Div, Flex } from 'honorable'
import { useMemo } from 'react'
import { LoopingLogo } from '@pluralsh/design-system'

import useOnboarded from '../onboarding/useOnboarded'
import OnboardingHeader from '../onboarding/OnboardingHeader'
import TerminalThemeProvider from '../theme/Provider'
import { CLOUD_SHELL_QUERY } from '../queries'

import Terminal from './Terminal'
import ContentCard from './ContentCard'
import Installer from './installer/Installer'
import { TerminalContext } from './context/terminal'
import { SHELL_CONFIGURATION_QUERY } from './queries'

function Content() {
  const { fresh: isOnboarding } = useOnboarded()

  const { data: { shell } = { shell: undefined } } = useQuery(CLOUD_SHELL_QUERY, { fetchPolicy: 'network-only' })
  const { data: { shellConfiguration } = { shellConfiguration: undefined } } = useQuery(SHELL_CONFIGURATION_QUERY, { skip: !shell, pollInterval: 5000 })
  const context = useMemo(() => ({ shell, configuration: shellConfiguration }), [shell, shellConfiguration])

  if (!shell?.provider) {
    return (
      <Flex
        flexGrow={1}
        align="center"
        justify="center"
        padding="xlarge"
      >
        <LoopingLogo />
      </Flex>
    )
  }

  return (
    <Div height="100%">
      {isOnboarding && <OnboardingHeader />}

      <Flex
        flexGrow={1}
        height="calc(100% - 56px)"
        padding="large"
      >
        <ContentCard>
          <TerminalContext.Provider value={context}>
            <Installer />
            <TerminalThemeProvider>
              <Terminal provider={shell.provider} />
            </TerminalThemeProvider>
          </TerminalContext.Provider>
        </ContentCard>
      </Flex>
    </Div>
  )
}

export default Content
