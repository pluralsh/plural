import { Flex } from 'honorable'
import { useContext, useMemo } from 'react'

import { OnboardingContext } from '../../context/onboarding'

import Summary from './Summary'
import CreateShell from './CreateShell'

function CreateShellStep({ onBack }) {
  const { section } = useContext(OnboardingContext)
  const isCreating = useMemo(() => section.state === 'Creating', [section])

  return (
    <Flex
      direction="column"
      gap="large"
    >
      {!isCreating && <Summary onBack={onBack} />}
      {isCreating && <CreateShell />}
    </Flex>
  )
}

export default CreateShellStep
