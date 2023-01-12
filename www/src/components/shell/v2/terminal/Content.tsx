import { useQuery } from '@apollo/client'

import { Div, Flex } from 'honorable'

import { LoopingLogo } from '@pluralsh/design-system'

import { Box } from 'grommet'

import useOnboarded from '../../onboarding/useOnboarded'
import OnboardingHeader from '../../onboarding_v3/OnboardingHeader'

import TerminalThemeProvider from '../../TerminalThemeProvider'

import { CLOUD_SHELL_QUERY } from '../../queries'

import Terminal from './Terminal'
import ContentCard from './ContentCard'
import Installer from './installer/Installer'

function Content() {
  const { fresh: isOnboarding } = useOnboarded()

  const { data } = useQuery(CLOUD_SHELL_QUERY, { fetchPolicy: 'network-only' })

  if (!data?.shell?.provider) {
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
          <Installer />
          <TerminalThemeProvider>
            <Terminal shell={data.shell} />
          </TerminalThemeProvider>
        </ContentCard>
      </Flex>
    </Div>
  )
}

export default Content
