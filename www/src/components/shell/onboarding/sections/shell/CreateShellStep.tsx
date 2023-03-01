import { Flex } from 'honorable'
import { useContext, useMemo } from 'react'

import { OnboardingContext } from '../../context/onboarding'
import { CreateCloudShellSectionState } from '../../context/types'

import { Summary } from './Summary'
import CreateShell from './CreateShell'

function CreateShellStep({ onBack }) {
  const { section } = useContext(OnboardingContext)
  const isCreating = useMemo(() => section.state === CreateCloudShellSectionState.Creating, [section.state])

  return (
    <Flex
      direction="column"
      gap="medium"
    >
      {!isCreating && <Summary onBack={onBack} />}
      {isCreating && <CreateShell />}
    </Flex>
  )
}

export default CreateShellStep
