import { useQuery } from '@apollo/client'
import { Flex } from 'honorable'
import { LoopingLogo } from 'pluralsh-design-system'
import { Navigate } from 'react-router'

import { CLOUD_SHELL_QUERY } from '../queries'

import Terminal from './Terminal'
import TerminalThemeProvider from './TerminalThemeProvider'

function TerminalIndex() {
  const { data } = useQuery(CLOUD_SHELL_QUERY, { pollInterval: 5000, fetchPolicy: 'cache-and-network' })
  const { shell } = data || {}
  const { alive, status } = shell || {}

  if (!status) {
    return (
      <Flex
        flexGrow={1}
        align="center"
        justify="center"
      >
        <LoopingLogo />
      </Flex>
    )
  }

  if (!alive) {
    return (
      <Navigate to="/shell/onboarding" />
    )
  }

  return (
    <TerminalThemeProvider>
      <Terminal shell={shell} />
    </TerminalThemeProvider>
  )
}

export default TerminalIndex
