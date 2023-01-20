import { useQuery } from '@apollo/client'
import { Div, Flex, Span } from 'honorable'
import { useEffect, useMemo, useState } from 'react'
import { Button, LoopingLogo, Modal } from '@pluralsh/design-system'

import useOnboarded from '../hooks/useOnboarded'
import OnboardingHeader from '../onboarding/OnboardingHeader'
import { CLOUD_SHELL_QUERY } from '../queries'

import TerminalThemeProvider from './theme/Provider'
import Terminal from './Terminal'
import ContentCard from './ContentCard'
import Installer from './installer/Installer'
import { State, TerminalContext } from './context/terminal'
import { SHELL_CONFIGURATION_QUERY } from './queries'
import { NextStepsModal } from './NextSteps'

function WelcomeModal() {
  const [open, setOpen] = useState(true)

  return (
    <Modal
      open={open}
      style={{ padding: 0 }}
    >
      <Flex
        direction="column"
        gap="large"
      >
        <Span>Welcome to Plural!</Span>
        <Span>Completing the install wizard will deploy your applications and give you access to your Plural Console.</Span>
        <Button onClick={() => setOpen(false)}>Start Install</Button>
      </Flex>
    </Modal>
  )
}

function Content() {
  const { fresh: isOnboarding } = useOnboarded()
  const [state, setState] = useState(State.New)

  const { data: { shell } = { shell: undefined } } = useQuery(CLOUD_SHELL_QUERY, { fetchPolicy: 'network-only' })
  const { data: { shellConfiguration } = { shellConfiguration: undefined }, stopPolling } = useQuery(SHELL_CONFIGURATION_QUERY, { skip: !shell, pollInterval: 5000 })
  const context = useMemo(() => ({
    shell, configuration: shellConfiguration, state, setState,
  }), [shell, shellConfiguration, state])

  useEffect(() => {
    if (shellConfiguration) stopPolling()
  }, [shellConfiguration, stopPolling])

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
      {isOnboarding && (
        <>
          <OnboardingHeader />
          <WelcomeModal />
        </>
      )}

      <Flex
        flexGrow={1}
        height={isOnboarding ? 'calc(100% - 56px)' : '100%'}
        padding="large"
      >
        <ContentCard>
          <TerminalContext.Provider value={context}>
            <Installer />
            <TerminalThemeProvider>
              <Terminal provider={shell.provider} />
            </TerminalThemeProvider>
            <NextStepsModal />
          </TerminalContext.Provider>
        </ContentCard>
      </Flex>
    </Div>
  )
}

export default Content
