import { Flex } from 'honorable'
import { Button } from '@pluralsh/design-system'
import { useContext, useMemo } from 'react'

import { useSectionState } from '../../context/hooks'
import { CloudType, ConfigureCloudSectionState } from '../../context/types'
import { OnboardingContext } from '../../context/onboarding'

import { WorkspaceConfiguration } from './WorkspaceConfiguration'
import { CreateDemo } from './CreateDemo'

function WorkspaceStep({ onBack, onNext }) {
  const { cloud, valid } = useContext(OnboardingContext)
  const setSectionState = useSectionState()

  const isDemo = useMemo(() => cloud.type === CloudType.Demo, [cloud.type])

  return (
    <>
      {isDemo && (
        <CreateDemo
          onBack={onBack}
          onNext={onNext}
        />
      )}
      {!isDemo && (
        <Flex
          direction="column"
          gap="medium"
        >
          <WorkspaceConfiguration />

          <Flex
            gap="medium"
            justify="space-between"
            borderTop="1px solid border"
            marginTop="xlarge"
            paddingTop="large"
          >
            <Button
              data-phid="back-from-workspace"
              secondary
              onClick={() => {
                onBack()
                if (cloud?.type === CloudType.Cloud) setSectionState(ConfigureCloudSectionState.CloudConfiguration)
              }}
            >Back
            </Button>
            <Button
              data-phid="cont-from-workspace"
              onClick={onNext}
              disabled={!valid}
            >Continue
            </Button>
          </Flex>
        </Flex>
      )}
    </>
  )
}

export default WorkspaceStep
