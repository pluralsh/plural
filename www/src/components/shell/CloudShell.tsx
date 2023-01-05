import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'

import { LoopingLogo } from '@pluralsh/design-system'

import { Flex } from 'honorable'

import { CLOUD_SHELL_QUERY, REBOOT_SHELL_MUTATION } from './queries'
import { Terminal } from './Terminal'
import { Onboarding } from './onboarding_v3/Onboarding'

function CloudShell() {
  // const location = useLocation()
  // const [section, setSection] = useState<'applications' | 'git'>(location?.state?.step === 1 ? 'git' : 'applications')
  const [created, setCreated] = useState(false)
  const { data: shellData } = useQuery(CLOUD_SHELL_QUERY, { fetchPolicy: 'network-only' })
  const [rebootMutation] = useMutation(REBOOT_SHELL_MUTATION)

  useEffect(() => {
    if (shellData && shellData.shell && !shellData.shell.alive) {
      rebootMutation()
      setCreated(true)
    }
  }, [shellData, rebootMutation])

  if (shellData?.shell?.alive || created) {
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

  return (
    // <OnboardingWrapper
    //   stepIndex={section === 'applications' ? 0 : 1}
    //   onRestart={() => setSection('applications')}
    // >
    //   {section === 'applications' && (
    //     <ApplicationsSelection onNext={() => setSection('git')} />
    //   )}
    //   {section === 'git' && (
    //     <CreateRepositoryCard
    //       data={data}
    //       onPrevious={() => setSection('applications')}
    //     />
    //   )}
    // </OnboardingWrapper>
    <Onboarding />
  )
}

export default CloudShell
