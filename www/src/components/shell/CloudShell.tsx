import { useEffect, useState } from 'react'
import { LoopingLogo } from '@pluralsh/design-system'
import { Flex } from 'honorable'
import { useMutation, useQuery } from '@apollo/client'

import { Terminal } from './Terminal'
import { Onboarding } from './onboarding_v3/Onboarding'
import { CLOUD_SHELL_QUERY, REBOOT_SHELL_MUTATION } from './queries'

function CloudShell() {
  const [booting, setBooting] = useState(false)
  const { data: shellData } = useQuery(CLOUD_SHELL_QUERY, { fetchPolicy: 'network-only' })
  const [rebootMutation] = useMutation(REBOOT_SHELL_MUTATION)

  useEffect(() => {
    if (shellData?.shell && !shellData.shell.alive) {
      rebootMutation()
      setBooting(true)
    }
  }, [rebootMutation, shellData])

  if (shellData?.shell?.alive || booting) {
    return (
      <Terminal />
    )
  }

  // Don't show onboarding until we're sure we're not going to load the terminal
  // Showing onboarding will mess with local storage vars needed for first load
  // of the terminal
  if (!shellData) {
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

  return (<Onboarding />)
}

export default CloudShell
