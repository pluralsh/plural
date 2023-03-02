import { Flex } from 'honorable'
import { useContext } from 'react'

import { OnboardingContext } from '../../context/onboarding'
import { CreateCloudShellSectionState } from '../../context/types'

import { Summary } from './Summary'
import CreateShell from './CreateShell'

function CreateShellStep({ onBack }) {
  const { section } = useContext(OnboardingContext)

  return (
    <Flex
      direction="column"
      gap="medium"
    >
      {section.state === CreateCloudShellSectionState.Summary && <Summary onBack={onBack} />}
      {section.state !== CreateCloudShellSectionState.Summary && <CreateShell />}
    </Flex>
  )
}

export default CreateShellStep
