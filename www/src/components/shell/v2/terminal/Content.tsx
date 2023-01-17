import { useQuery } from '@apollo/client'
import { Div, Flex } from 'honorable'
import { LoopingLogo } from '@pluralsh/design-system'

import { useMemo } from 'react'

import useOnboarded from '../../onboarding/useOnboarded'
import OnboardingHeader from '../../onboarding_v3/OnboardingHeader'
import TerminalThemeProvider from '../../TerminalThemeProvider'
import { CLOUD_SHELL_QUERY } from '../../queries'

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
        align="center"
        justify="center"
        borderRight="1px solid border"
        padding="medium"
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
